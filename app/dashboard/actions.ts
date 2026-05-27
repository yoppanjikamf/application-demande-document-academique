"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import {
  ACTIVE_RENDEZ_VOUS_STATUSES,
  getAvailableSlots,
  getDocumentTitle,
  getPickupLocation,
  isHoliday,
  isWeekend,
  parseDateKey,
} from "@/lib/appointment-service";
import { getCurrentUser } from "@/lib/auth";
import { getAntenneForRegion, isDocumentRequestAllowed, resolveDocumentRoute } from "@/lib/document-routing";
import { notifyAppointmentConfirmed, notifyDuplicataRequestRegistered } from "@/lib/mail-service";
import { prisma } from "@/lib/prisma";
import { reservationSchema } from "@/lib/validations";
import type { DiplomePrincipal, TypeDocument } from "@/lib/generated/prisma/client";

const DUPLICATA_FEE = 5000;

const diplomeValues = ["BEPC", "PROBATOIRE", "BACCALAUREAT"] as const;
const duplicataTargets = ["ORIGINAL", "RELEVE_NOTES"] as const;

function parseDiplome(value: FormDataEntryValue | null): DiplomePrincipal {
  const diplome = String(value ?? "").toUpperCase();
  if (!diplomeValues.includes(diplome as (typeof diplomeValues)[number])) {
    throw new Error("Examen invalide.");
  }

  return diplome as DiplomePrincipal;
}

function parseDuplicataTarget(value: FormDataEntryValue | null): Extract<TypeDocument, "ORIGINAL" | "RELEVE_NOTES"> {
  const target = String(value ?? "").toUpperCase();
  if (!duplicataTargets.includes(target as (typeof duplicataTargets)[number])) {
    throw new Error("Type de duplicata invalide.");
  }

  return target as Extract<TypeDocument, "ORIGINAL" | "RELEVE_NOTES">;
}

function getDuplicataTitle(diplomeType: DiplomePrincipal, target: Extract<TypeDocument, "ORIGINAL" | "RELEVE_NOTES">) {
  return target === "ORIGINAL"
    ? `Duplicata du diplome original du ${diplomeType}`
    : `Duplicata du releve de notes du ${diplomeType}`;
}

function receiptNumber() {
  return `REC-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
}

export async function reserverDisponibiliteAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ELEVE") {
    throw new Error("Acces refuse.");
  }

  const parsed = reservationSchema.safeParse({
    documentId: formData.get("documentId"),
    dateRdv: formData.get("dateRdv"),
    heureRdv: formData.get("heureRdv"),
    commentaire: formData.get("commentaire"),
  });

  if (!parsed.success) {
    throw new Error("Demande invalide.");
  }

  const date = parseDateKey(parsed.data.dateRdv);
  if (!date || isWeekend(date) || (await isHoliday(date))) {
    throw new Error("Date invalide.");
  }

  const document = await prisma.documentAcademique.findFirst({
    where: { id: parsed.data.documentId, eleveId: user.id },
  });

  if (!document) {
    throw new Error("Document introuvable.");
  }

  if (!isDocumentRequestAllowed(document.diplomeType, document.typeDocument)) {
    throw new Error("Ce type de document n'est pas delivre pour cet examen.");
  }

  if (document.typeDocument === "ORIGINAL" && document.statut === "RETIRE") {
    throw new Error(
      "Diplome deja retire. Veuillez faire une demande de duplicata si necessaire.",
    );
  }

  if (document.statut !== "DISPONIBLE") {
    throw new Error("Ce document n'est pas encore disponible.");
  }

  const route = resolveDocumentRoute(document);
  if (!route.requiresAppointment) {
    throw new Error("Ce document se retire directement au centre d'examen, sans rendez-vous.");
  }

  const availableSlots = await getAvailableSlots(date);
  const selectedSlot = availableSlots.find((slot) => slot.value === parsed.data.heureRdv);
  if (!selectedSlot || selectedSlot.disabled) {
    throw new Error("Creneau indisponible.");
  }

  const activeForDocument = await prisma.rendezVous.findFirst({
    where: {
      documentId: document.id,
      statut: { in: [...ACTIVE_RENDEZ_VOUS_STATUSES] },
    },
    select: { id: true },
  });

  if (activeForDocument) {
    redirect(`/dashboard/rendez-vous?documentId=${encodeURIComponent(document.id)}`);
  }

  const admin = await prisma.user.findFirst({
    where: {
      role: "ADMINISTRATEUR",
      organismeId: route.organismeId,
      ...(route.antenneRegionaleId ? { antenneRegionaleId: route.antenneRegionaleId } : {}),
    },
    select: { id: true },
    orderBy: { createdAt: "asc" },
  });

  if (!admin) {
    throw new Error("Aucun administrateur disponible.");
  }

  const location = await getPickupLocation(document);
  const commentaire = parsed.data.commentaire?.trim() || "Reservation eleve";

  await prisma.rendezVous.create({
    data: {
      adminId: admin.id,
      eleveId: user.id,
      documentId: document.id,
      dateRdv: date,
      heureRdv: parsed.data.heureRdv,
      lieu: location,
      statut: "CONFIRME",
      commentaire,
    },
  });

  await notifyAppointmentConfirmed({
    userId: user.id,
    to: user.email,
    documentTitle: getDocumentTitle(document),
    documentType: document.typeDocument,
    date,
    time: parsed.data.heureRdv,
    location,
    recipientName: `${user.prenom} ${user.nom}`.trim(),
  });

  redirect(`/dashboard/rendez-vous?documentId=${encodeURIComponent(document.id)}`);
}

export async function cancelRendezVousAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ELEVE") {
    throw new Error("Acces refuse.");
  }

  const rendezVousId = String(formData.get("rendezVousId") ?? "");
  if (!rendezVousId) {
    throw new Error("Rendez-vous manquant.");
  }

  await prisma.rendezVous.updateMany({
    where: {
      id: rendezVousId,
      eleveId: user.id,
      statut: { in: [...ACTIVE_RENDEZ_VOUS_STATUSES] },
    },
    data: {
      statut: "ANNULE",
      commentaire: "Annulation eleve",
    },
  });

  revalidatePath("/dashboard/rendez-vous");
  revalidatePath("/dashboard/documents");
}

export async function requestReleveNotesAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ELEVE") {
    throw new Error("Acces refuse.");
  }

  const diplomeType = parseDiplome(formData.get("diplomeType"));
  const exam = await prisma.examenValide.findUnique({
    where: {
      eleveId_diplomeType: {
        eleveId: user.id,
        diplomeType,
      },
    },
  });

  if (!exam) {
    throw new Error("Examen non trouve pour cet eleve.");
  }

  await prisma.documentAcademique.upsert({
    where: {
      eleveId_diplomeType_typeDocument: {
        eleveId: user.id,
        diplomeType,
        typeDocument: "RELEVE_NOTES",
      },
    },
    update: {
      centreExamen: exam.centreExamen,
      regionComposition: exam.regionComposition,
      organismeId: resolveDocumentRoute({
        diplomeType,
        typeDocument: "RELEVE_NOTES",
        centreExamen: exam.centreExamen,
        regionComposition: exam.regionComposition,
      }).organismeId,
      antenneRegionaleId: null,
    },
    create: {
      eleveId: user.id,
      diplomeType,
      typeDocument: "RELEVE_NOTES",
      centreExamen: exam.centreExamen,
      regionComposition: exam.regionComposition,
      organismeId: resolveDocumentRoute({
        diplomeType,
        typeDocument: "RELEVE_NOTES",
        centreExamen: exam.centreExamen,
        regionComposition: exam.regionComposition,
      }).organismeId,
      antenneRegionaleId: null,
      statut: "PAS_DISPONIBLE",
    },
  });

  await prisma.notification.create({
    data: {
      userId: user.id,
      typeNotification: "DEMANDE_RELEVE",
      message:
        "Votre demande de releve de notes a ete enregistree. Vous serez notifie des sa mise a disposition dans votre centre d'examen.",
    },
  });

  revalidatePath("/dashboard/documents");
}

export async function submitDuplicataRequestAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ELEVE") {
    throw new Error("Acces refuse.");
  }

  const schema = z.object({
    session: z.coerce.number().int().min(1950).max(new Date().getFullYear()),
    centreExamen: z.string().trim().min(2).max(160),
    motif: z.string().trim().min(5).max(500),
    modePaiement: z.enum(["ORANGEMONEY", "MTNMONEY", "CARTEBANCAIRE"]),
  });

  const diplomeType = parseDiplome(formData.get("diplomeType"));
  const cibleDocument = parseDuplicataTarget(formData.get("cibleDocument"));
  if (!isDocumentRequestAllowed(diplomeType, "DUPLICATA", cibleDocument)) {
    throw new Error("Le Probatoire ne donne pas lieu a un diplome.");
  }

  const parsed = schema.safeParse({
    session: formData.get("session"),
    centreExamen: formData.get("centreExamen"),
    motif: formData.get("motif"),
    modePaiement: formData.get("modePaiement"),
  });

  if (!parsed.success) {
    throw new Error("Formulaire de duplicata invalide.");
  }

  const exam = await prisma.examenValide.findUnique({
    where: {
      eleveId_diplomeType: {
        eleveId: user.id,
        diplomeType,
      },
    },
  });

  if (!exam) {
    throw new Error("Examen non trouve pour cet eleve.");
  }

  const justificatif = formData.get("piecesJustificatives");
  const justificatifName = justificatif instanceof File ? justificatif.name : "";
  const documentTitle = getDuplicataTitle(diplomeType, cibleDocument);
  const route = resolveDocumentRoute({
    diplomeType,
    typeDocument: cibleDocument,
    centreExamen: parsed.data.centreExamen,
    regionComposition: exam.regionComposition,
  });
  const antenne = route.antenneRegionaleId ? getAntenneForRegion(exam.regionComposition) : null;

  await prisma.documentAcademique.upsert({
    where: {
      eleveId_diplomeType_typeDocument: {
        eleveId: user.id,
        diplomeType,
        typeDocument: "DUPLICATA",
      },
    },
    update: {
      centreExamen: parsed.data.centreExamen,
      regionComposition: exam.regionComposition,
      organismeId: route.organismeId,
      antenneRegionaleId: antenne?.id ?? null,
    },
    create: {
      eleveId: user.id,
      diplomeType,
      typeDocument: "DUPLICATA",
      centreExamen: parsed.data.centreExamen,
      regionComposition: exam.regionComposition,
      organismeId: route.organismeId,
      antenneRegionaleId: antenne?.id ?? null,
      statut: "PAS_DISPONIBLE",
    },
  });

  const duplicata = await prisma.duplicata.create({
    data: {
      eleveId: user.id,
      typeDocument: "DUPLICATA",
      nomDuplicata: documentTitle,
      statut: "PAS_DISPONIBLE",
      regionComposition: exam.regionComposition,
      organismeId: route.organismeId,
      antenneRegionaleId: antenne?.id ?? null,
      intruction: JSON.stringify({
        diplomeType,
        cibleDocument,
        session: parsed.data.session,
        centreExamen: parsed.data.centreExamen,
        motif: parsed.data.motif,
        justificatif: justificatifName,
      }),
    },
  });

  const payment = await prisma.paiement.create({
    data: {
      duplicataId: duplicata.id,
      modePaiment: parsed.data.modePaiement,
      statut: "EFFECTUE",
    },
  });

  await prisma.recu.create({
    data: {
      numero: receiptNumber(),
      montant: DUPLICATA_FEE,
      modePaiement: parsed.data.modePaiement,
      commentaire: documentTitle,
      userId: user.id,
      paiementId: payment.id,
    },
  });

  await notifyDuplicataRequestRegistered({
    userId: user.id,
    to: user.email,
    documentTitle,
  });

  revalidatePath("/dashboard/documents");
  revalidatePath("/dashboard/payments");
}
