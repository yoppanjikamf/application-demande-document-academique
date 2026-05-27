"use server";
import { revalidatePath } from "next/cache";

import { getDocumentTitle, getPickupLocation, OBC_SETTINGS_ID } from "@/lib/appointment-service";
import { getCurrentUser } from "@/lib/auth";
import { notifyDocumentAvailable, notifyDocumentRetired } from "@/lib/mail-service";
import { prisma } from "@/lib/prisma";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
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

async function findSupabaseUserIdByEmail(email: string) {
  const supabase = createSupabaseAdminClient();
  const perPage = 1000;

  for (let page = 1; page <= 10; page += 1) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });

    if (error) {
      throw error;
    }

    const found = data.users.find((user) => user.email?.toLowerCase() === email);
    if (found) {
      return found.id;
    }

    if (data.users.length < perPage) {
      return null;
    }
  }

  throw new Error("Impossible de verifier tous les utilisateurs Supabase Auth.");
}

async function ensureSupabaseEleve(email: string, password: string, matricule: string) {
  const supabase = createSupabaseAdminClient();
  const existingUserId = await findSupabaseUserIdByEmail(email);
  const payload = {
    password,
    email_confirm: true,
    app_metadata: {
      role: Role.ELEVE,
      matricule,
    },
    user_metadata: {
      matricule,
    },
  };

  const { data, error } = existingUserId
    ? await supabase.auth.admin.updateUserById(existingUserId, payload)
    : await supabase.auth.admin.createUser({
        email,
        ...payload,
      });

  if (error) {
    throw error;
  }

  return data.user.id;
}

export async function updateAdminQuotaAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMINISTRATEUR") {
    throw new Error("Acces refuse.");
  }

  const parsed = adminQuotaSchema.safeParse({
    quotaJournalier: formData.get("quotaJournalier"),
  });

  if (!parsed.success) {
    throw new Error("Quota invalide.");
  }

  await prisma.parametreRendezVous.upsert({
    where: { id: OBC_SETTINGS_ID },
    update: { quotaJournalier: parsed.data.quotaJournalier },
    create: {
      id: OBC_SETTINGS_ID,
      quotaJournalier: parsed.data.quotaJournalier,
      lieuObc: "Centre OBC",
    },
  });

  revalidatePath("/admin/rdv-disponibilites");
}

export async function updateDocumentStatusAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMINISTRATEUR") {
    throw new Error("Acces refuse.");
  }

  const parsed = documentStatusUpdateSchema.safeParse({
    documentId: formData.get("documentId"),
    statut: formData.get("statut"),
  });

  if (!parsed.success) {
    throw new Error("Demande invalide.");
  }

  const document = await prisma.documentAcademique.findUnique({
    where: { id: parsed.data.documentId },
    include: { eleve: true },
  });

  if (!document) {
    throw new Error("Document introuvable.");
  }

  const previousStatus = document.statut;
  const nextStatus = parsed.data.statut;

  await prisma.documentAcademique.update({
    where: { id: document.id },
    data: { statut: nextStatus },
  });

  const documentTitle = getDocumentTitle(document);
  if (previousStatus !== "DISPONIBLE" && nextStatus === "DISPONIBLE") {
    const location = await getPickupLocation(document);
    await notifyDocumentAvailable({
      userId: document.eleve.id,
      to: document.eleve.email,
      documentTitle,
      typeDocument: document.typeDocument,
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
    });
  }

  revalidatePath("/admin/documents");
  revalidatePath("/dashboard/documents");
}

export async function importTestDataAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMINISTRATEUR") {
    throw new Error("Acces refuse.");
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
    const password = normalize(row.eleve_password || "");
    const nom = normalize(row.eleve_nom || "");
    const prenom = normalize(row.eleve_prenom || "");
    const dateNaissance = parseDate(row.eleve_date_naissance || "") ?? undefined;

    if (!matricule || !email || !password || !nom || !prenom) {
      throw new Error("Ligne CSV invalide: donnees eleve manquantes.");
    }

    const authUserId = await ensureSupabaseEleve(email, password, matricule);

    const eleve = await prisma.user.upsert({
      where: { matricule },
      update: {
        authUserId,
        email,
        nom,
        prenom,
        role: Role.ELEVE,
        nomService: null,
        dateNaissance: dateNaissance ?? null,
      },
      create: {
        authUserId,
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

      await prisma.examenValide.upsert({
        where: {
          eleveId_diplomeType: {
            eleveId: eleve.id,
            diplomeType,
          },
        },
        update: { centreExamen: centreExamen || undefined },
        create: {
          eleveId: eleve.id,
          diplomeType,
          centreExamen: centreExamen || null,
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
          centreExamen: type === "RELEVE_NOTES" ? centreExamen || undefined : undefined,
        },
        create: {
          eleveId: eleve.id,
          diplomeType,
          typeDocument: type,
          statut,
          centreExamen: type === "RELEVE_NOTES" ? centreExamen || null : null,
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
    throw new Error("Acces refuse.");
  }

  const rendezVousId = String(formData.get("rendezVousId") ?? "");
  if (!rendezVousId) {
    throw new Error("Rendez-vous manquant.");
  }

  await prisma.rendezVous.update({
    where: { id: rendezVousId },
    data: { statut: "CONFIRME" },
  });

  revalidatePath("/admin/appointments");
  revalidatePath("/admin");
}

export async function cancelAppointmentAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMINISTRATEUR") {
    throw new Error("Acces refuse.");
  }

  const rendezVousId = String(formData.get("rendezVousId") ?? "");
  if (!rendezVousId) {
    throw new Error("Rendez-vous manquant.");
  }

  await prisma.rendezVous.update({
    where: { id: rendezVousId },
    data: {
      statut: "ANNULE",
      commentaire: "Annulation service OBC",
    },
  });

  revalidatePath("/admin/appointments");
  revalidatePath("/admin");
}
