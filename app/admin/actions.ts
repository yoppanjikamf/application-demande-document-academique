"use server";
import { revalidatePath } from "next/cache";

import { getDocumentTitle, getPickupLocation, OBC_SETTINGS_ID } from "@/lib/appointment-service";
import { getCurrentUser } from "@/lib/auth";
import {
  ORGANISME_IDS,
  canAdminAccessDocument,
  getAdminDocumentScope,
  isDocumentRequestAllowed,
  resolveDocumentRoute,
} from "@/lib/document-routing";
import { syncLatestDuplicataStatus } from "@/lib/duplicata-service";
import { notifyDocumentAvailable, notifyDocumentRetired } from "@/lib/mail-service";
import { prisma } from "@/lib/prisma";
import { adminQuotaSchema, documentStatusUpdateSchema } from "@/lib/validations";
import {
  DiplomePrincipal,
  Role,
  StatutDocument,
  StatutRendezVous,
  TypeDocument,
} from "@/lib/generated/prisma/client";

type CsvRow = Record<string, string>;

function parseCsv(text: string): CsvRow[] {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    return [];
  }

  const headers = lines[0].split(",").map((value) => value.trim());
  return lines.slice(1).map((line) => {
    const values = line.split(",").map((value) => value.trim());
    const row: CsvRow = {};
    headers.forEach((header, index) => {
      row[header] = values[index] ?? "";
    });
    return row;
  });
}

function parseDate(value: string) {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed;
}

function normalize(value: string) {
  return value.trim();
}

function normalizeUpper(value: string) {
  return value.trim().toUpperCase();
}

function assertObcAdmin(user: { role: Role; organismeId: string | null }) {
  if (user.role !== "ADMINISTRATEUR" || user.organismeId !== ORGANISME_IDS.OBC) {
    throw new Error("Outil reserve aux administrateurs OBC.");
  }
}

export async function updateAdminQuotaAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMINISTRATEUR") {
    throw new Error("Accès refusé.");
  }
  assertObcAdmin(user);

  const parsed = adminQuotaSchema.safeParse({
    quotaJournalier: formData.get("quotaJournalier"),
  });

  if (!parsed.success) {
    throw new Error("Quota invalide.");
  }

  const oldSettings = await prisma.parametreRendezVous.findUnique({
    where: { id: OBC_SETTINGS_ID },
  });

  await prisma.parametreRendezVous.upsert({
    where: { id: OBC_SETTINGS_ID },
    update: { quotaJournalier: parsed.data.quotaJournalier },
    create: {
      id: OBC_SETTINGS_ID,
      quotaJournalier: parsed.data.quotaJournalier,
      lieuObc: "Centre de retrait",
    },
  });

  // Créer un log d'audit
  await prisma.auditLog
    .create({
      data: {
        action: "QUOTA_CHANGED",
        resource: "PARAMETER",
        resourceId: OBC_SETTINGS_ID,
        userId: user.id,
        details: JSON.stringify({
          previousQuota: oldSettings?.quotaJournalier || null,
          newQuota: parsed.data.quotaJournalier,
        }),
      },
    })
    .catch((err) => {
      console.error("Failed to create audit log:", err);
    });

  revalidatePath("/admin/rdv-disponibilites");
}

export async function upsertHolidayAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMINISTRATEUR") {
    throw new Error("Accès refusé.");
  }
  assertObcAdmin(user);

  const dateStr = String(formData.get("date") ?? "");
  const nom = String(formData.get("nom") ?? "Jour férié");
  if (!dateStr) {
    throw new Error("Date manquante.");
  }

  const date = new Date(dateStr);
  date.setHours(0, 0, 0, 0);

  await prisma.jourFerie.upsert({
    where: { date },
    update: { nom },
    create: { date, nom, annuel: false },
  });

  revalidatePath("/admin/rdv-disponibilites");
}

export async function deleteHolidayAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMINISTRATEUR") {
    throw new Error("Accès refusé.");
  }
  assertObcAdmin(user);

  const dateStr = String(formData.get("date") ?? "");
  if (!dateStr) {
    throw new Error("Date manquante.");
  }

  const date = new Date(dateStr);
  date.setHours(0, 0, 0, 0);

  await prisma.jourFerie.deleteMany({ where: { date } });
  revalidatePath("/admin/rdv-disponibilites");
}

export async function toggleWeekendBookingsAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMINISTRATEUR") {
    throw new Error("Accès refusé.");
  }
  assertObcAdmin(user);

  const allow = String(formData.get("allow")) === "true";

  await prisma.parametreRendezVous.upsert({
    where: { id: OBC_SETTINGS_ID },
    update: { allowWeekendBookings: allow },
    create: {
      id: OBC_SETTINGS_ID,
      quotaJournalier: 200,
      lieuObc: "Centre de retrait",
      allowWeekendBookings: allow,
    },
  });

  revalidatePath("/admin/rdv-disponibilites");
}

export async function updateDocumentStatusAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMINISTRATEUR") {
    throw new Error("Accès refusé.");
  }

  const parsed = documentStatusUpdateSchema.safeParse({
    documentId: formData.get("documentId"),
    statut: formData.get("statut"),
  });

  if (!parsed.success) {
    throw new Error("Demande invalide.");
  }

  const document = await prisma.documentAcademique.findFirst({
    where: { id: parsed.data.documentId, ...getAdminDocumentScope(user) },
    include: { eleve: true },
  });

  if (!document) {
    throw new Error("Document introuvable.");
  }

  if (!isDocumentRequestAllowed(document.diplomeType, document.typeDocument)) {
    throw new Error("Le Probatoire ne donne pas lieu à la délivrance d'un diplôme.");
  }

  const previousStatus = document.statut;
  const nextStatus = parsed.data.statut;

  await prisma.documentAcademique.update({
    where: { id: document.id },
    data: { statut: nextStatus },
  });

  if (document.typeDocument === "DUPLICATA") {
    await syncLatestDuplicataStatus(document, nextStatus);
  }

  // Créer un log d'audit
  await prisma.auditLog
    .create({
      data: {
        action: "DOCUMENT_STATUS_CHANGED",
        resource: "DOCUMENT",
        resourceId: document.id,
        userId: user.id,
        details: JSON.stringify({
          documentId: document.id,
          eleveMatricule: document.eleve.matricule,
          previousStatus: previousStatus,
          newStatus: nextStatus,
          documentType: document.typeDocument,
          diplomeType: document.diplomeType,
        }),
      },
    })
    .catch((err) => {
      console.error("Failed to create audit log:", err);
    });

  const documentTitle = getDocumentTitle(document);
  if (previousStatus !== "DISPONIBLE" && nextStatus === "DISPONIBLE") {
    const location = await getPickupLocation(document);
    await notifyDocumentAvailable({
      userId: document.eleve.id,
      to: document.eleve.email,
      documentTitle,
      typeDocument: document.typeDocument,
      diplomeType: document.diplomeType,
      location,
    });
  }

  if (previousStatus !== "RETIRE" && nextStatus === "RETIRE") {
    await prisma.rendezVous.updateMany({
      where: {
        documentId: document.id,
        statut: { in: ["PLANIFIE", "CONFIRME"] },
      },
      data: { statut: "HONORE" },
    });

    await notifyDocumentRetired({
      userId: document.eleve.id,
      to: document.eleve.email,
      documentTitle,
      diplomeType: document.diplomeType,
    });
  }

  revalidatePath("/admin/documents");
  revalidatePath("/dashboard/documents");
}

export async function importTestDataAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMINISTRATEUR") {
    throw new Error("Accès refusé.");
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    throw new Error("Fichier CSV manquant.");
  }

  const content = await file.text();
  const rows = parseCsv(content);

  if (rows.length === 0) {
    throw new Error("CSV vide ou invalide.");
  }

  for (const row of rows) {
    const matricule = normalizeUpper(row.eleve_matricule || "");
    const email = normalize(row.eleve_email || "").toLowerCase();
    const nom = normalize(row.eleve_nom || "");
    const prenom = normalize(row.eleve_prenom || "");
    const dateNaissance = parseDate(row.eleve_date_naissance || "") ?? undefined;

    if (!matricule || !email || !nom || !prenom) {
      throw new Error("Ligne CSV invalide : données élève manquantes.");
    }

    const eleve = await prisma.user.upsert({
      where: { matricule },
      update: {
        email,
        nom,
        prenom,
        role: Role.ELEVE,
        nomService: null,
        dateNaissance: dateNaissance ?? null,
      },
      create: {
        email,
        matricule,
        nom,
        prenom,
        role: Role.ELEVE,
        dateNaissance: dateNaissance ?? null,
      },
    });

    const typeDocument = normalizeUpper(row.document_type || "");
    const statutDocument = normalizeUpper(row.document_statut || "PAS_DISPONIBLE");
    const diplomeValue = normalizeUpper(row.diplome_type || row.diplome || "BACCALAUREAT");
    const centreExamen = normalize(row.centre_examen || "");
    const regionComposition = normalize(row.region_composition || row.region || "Centre");
    let importedDocumentId: string | null = null;

    if (typeDocument) {
      const normalizedType =
        typeDocument === "DIPLOME"
          ? "ORIGINAL"
          : typeDocument === "RELEVE"
            ? "RELEVE_NOTES"
            : typeDocument;
      const normalizedStatus =
        statutDocument === "EN_ATTENTE" || statutDocument === "NON_DISPONIBLE"
          ? "PAS_DISPONIBLE"
          : statutDocument;
      const type = TypeDocument[normalizedType as keyof typeof TypeDocument];
      const statut = StatutDocument[normalizedStatus as keyof typeof StatutDocument];
      const diplomeType = DiplomePrincipal[diplomeValue as keyof typeof DiplomePrincipal];

      if (!type || !statut || !diplomeType) {
        throw new Error(`Type ou statut de document invalide pour ${matricule}.`);
      }

      if (!isDocumentRequestAllowed(diplomeType, type)) {
        throw new Error(`Le document ${type} n'est pas autorisé pour ${diplomeType}.`);
      }

      const route = resolveDocumentRoute({
        diplomeType,
        typeDocument: type,
        centreExamen,
        regionComposition,
      });

      if (!canAdminAccessDocument(user, route)) {
        throw new Error(
          "Vous ne pouvez pas importer une demande d'un autre organisme ou d'une autre antenne.",
        );
      }

      await prisma.examenValide.upsert({
        where: {
          eleveId_diplomeType: {
            eleveId: eleve.id,
            diplomeType,
          },
        },
        update: { centreExamen: centreExamen || undefined, regionComposition },
        create: {
          eleveId: eleve.id,
          diplomeType,
          centreExamen: centreExamen || null,
          regionComposition,
        },
      });

      await prisma.documentAcademique.upsert({
        where: {
          eleveId_diplomeType_typeDocument: {
            eleveId: eleve.id,
            diplomeType,
            typeDocument: type,
          },
        },
        update: {
          statut,
          centreExamen: centreExamen || undefined,
          regionComposition,
          organismeId: route.organismeId,
          antenneRegionaleId: route.antenneRegionaleId,
        },
        create: {
          eleveId: eleve.id,
          diplomeType,
          typeDocument: type,
          statut,
          centreExamen: centreExamen || null,
          regionComposition,
          organismeId: route.organismeId,
          antenneRegionaleId: route.antenneRegionaleId,
        },
      });

      const document = await prisma.documentAcademique.findUnique({
        where: {
          eleveId_diplomeType_typeDocument: {
            eleveId: eleve.id,
            diplomeType,
            typeDocument: type,
          },
        },
        select: { id: true },
      });

      if (!document) {
        throw new Error(`Document introuvable apres import pour ${matricule}.`);
      }

      await prisma.documentAcademique.update({
        where: { id: document.id },
        data: {
          statut,
        },
      });
      importedDocumentId = document.id;
    }

    const adminMatricule = normalizeUpper(row.admin_matricule || "");
    const rdvDate = parseDate(row.rdv_date || "");
    const rdvHeure = normalize(row.rdv_heure || "");
    const rdvLieu = normalize(row.rdv_lieu || "");
    const rdvStatutValue = normalizeUpper(row.rdv_statut || "PLANIFIE");

    if (adminMatricule && rdvDate && rdvHeure && rdvLieu) {
      const admin = await prisma.user.findUnique({ where: { matricule: adminMatricule } });
      if (!admin) {
        throw new Error(`Admin introuvable pour matricule ${adminMatricule}.`);
      }

      if (importedDocumentId) {
        const importedDocument = await prisma.documentAcademique.findUnique({
          where: { id: importedDocumentId },
          select: { organismeId: true, antenneRegionaleId: true },
        });

        if (importedDocument && !canAdminAccessDocument(admin, importedDocument)) {
          throw new Error(`Admin ${adminMatricule} non autorise pour ce document.`);
        }
      }

      const rdvStatut = StatutRendezVous[rdvStatutValue as keyof typeof StatutRendezVous];
      if (!rdvStatut) {
        throw new Error(`Statut RDV invalide pour ${matricule}.`);
      }

      const commentaire = normalize(row.rdv_commentaire || "Import CSV");

      if (rdvStatut !== "ANNULE") {
        await prisma.rendezVous.create({
          data: {
            adminId: admin.id,
            eleveId: eleve.id,
            documentId: importedDocumentId,
            dateRdv: rdvDate,
            heureRdv: rdvHeure,
            lieu: rdvLieu,
            statut: rdvStatut,
            commentaire,
          },
        });
      }
    }
  }

  revalidatePath("/admin/documents");
  revalidatePath("/admin");
}

export async function confirmAppointmentAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMINISTRATEUR") {
    throw new Error("Accès refusé.");
  }
  assertObcAdmin(user);

  const rendezVousId = String(formData.get("rendezVousId") ?? "");
  if (!rendezVousId) {
    throw new Error("Rendez-vous manquant.");
  }

  await prisma.rendezVous.updateMany({
    where: { id: rendezVousId, document: { is: getAdminDocumentScope(user) } },
    data: { statut: "CONFIRME" },
  });

  revalidatePath("/admin/appointments");
  revalidatePath("/admin");
}

export async function cancelAppointmentAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMINISTRATEUR") {
    throw new Error("Accès refusé.");
  }
  assertObcAdmin(user);

  const rendezVousId = String(formData.get("rendezVousId") ?? "");
  if (!rendezVousId) {
    throw new Error("Rendez-vous manquant.");
  }

  await prisma.rendezVous.updateMany({
    where: { id: rendezVousId, document: { is: getAdminDocumentScope(user) } },
    data: {
      statut: "ANNULE",
      commentaire: "Annulation par le service administratif",
    },
  });

  revalidatePath("/admin/appointments");
  revalidatePath("/admin");
}
