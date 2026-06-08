"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import {
  ACTIVE_RENDEZ_VOUS_STATUSES,
  endOfDay,
  getAvailableSlots,
  getActiveTimeSlots,
  getDocumentTitle,
  getAppointmentSettings,
  getPickupLocation,
  isBeforeTomorrow,
  isHoliday,
  isWeekend,
  parseDateKey,
  startOfDay,
} from "@/lib/appointment-service";
import { syncDocumentPickupFromExam } from "@/lib/centre-examen-service";
import { getCurrentUser } from "@/lib/auth";
import {
  getAntenneForRegion,
  isDocumentRequestAllowed,
  resolveDocumentRoute,
} from "@/lib/document-routing";
import {
  findLatestDuplicataForDocument,
  getActiveDuplicataForDiplome,
  getDuplicataFee,
  getDuplicataRequestState,
  resolvePickupRouteForDocument,
} from "@/lib/duplicata-service";
import { DUPLICATA_REQUIRED_PIECES, uploadDuplicataPiece } from "@/lib/duplicata-storage";
import {
  notifyAppointmentConfirmed,
  notifyDuplicataRequestRegistered,
  notifyPaymentConfirmed,
} from "@/lib/mail-service";
import { createNotification } from "@/lib/notification-service";
import { prisma } from "@/lib/prisma";
import { reservationSchema } from "@/lib/validations";
import { Prisma, type DiplomePrincipal, type TypeDocument } from "@/lib/generated/prisma/client";

const diplomeValues = ["BEPC", "PROBATOIRE", "BACCALAUREAT"] as const;
const duplicataTargets = ["ORIGINAL", "RELEVE_NOTES"] as const;

function parseDiplome(value: FormDataEntryValue | null): DiplomePrincipal {
  const diplome = String(value ?? "").toUpperCase();
  if (!diplomeValues.includes(diplome as (typeof diplomeValues)[number])) {
    throw new Error("Examen invalide.");
  }

  return diplome as DiplomePrincipal;
}

function parseDuplicataTarget(
  value: FormDataEntryValue | null,
): Extract<TypeDocument, "ORIGINAL" | "RELEVE_NOTES"> {
  const target = String(value ?? "").toUpperCase();
  if (!duplicataTargets.includes(target as (typeof duplicataTargets)[number])) {
    throw new Error("Type de duplicata invalide.");
  }

  return target as Extract<TypeDocument, "ORIGINAL" | "RELEVE_NOTES">;
}

function getDuplicataTitle(
  diplomeType: DiplomePrincipal,
  target: Extract<TypeDocument, "ORIGINAL" | "RELEVE_NOTES">,
) {
  return target === "ORIGINAL"
    ? `Duplicata du diplôme original du ${diplomeType}`
    : `Duplicata du relevé de notes du ${diplomeType}`;
}

function receiptNumber() {
  return `REC-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
}

export async function reserverDisponibiliteAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ELEVE") {
    throw new Error("Accès refusé.");
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
  const settings = await getAppointmentSettings();
  if (
    !date ||
    isBeforeTomorrow(date) ||
    (isWeekend(date) && !settings.allowWeekendBookings) ||
    (await isHoliday(date))
  ) {
    throw new Error(
      "Date invalide. Les rendez-vous de retrait doivent être programmés à partir du lendemain.",
    );
  }

  const document = await prisma.documentAcademique.findFirst({
    where: { id: parsed.data.documentId, eleveId: user.id },
  });

  if (!document) {
    throw new Error("Document introuvable.");
  }

  if (document.typeDocument !== "DUPLICATA" && !document.demandeSoumiseAt) {
    throw new Error("Vous devez d'abord enregistrer une demande pour ce document.");
  }

  if (!isDocumentRequestAllowed(document.diplomeType, document.typeDocument)) {
    throw new Error("Ce type de document n'est pas delivre pour cet examen.");
  }

  if (document.typeDocument === "ORIGINAL" && document.statut === "RETIRE") {
    throw new Error("Diplôme déjà retiré. Veuillez faire une demande de duplicata si nécessaire.");
  }

  if (document.statut !== "DISPONIBLE") {
    throw new Error("Ce document n'est pas encore disponible.");
  }

  if (document.typeDocument === "DUPLICATA") {
    const latestDuplicata = await findLatestDuplicataForDocument(document);
    if (latestDuplicata?.statut !== "DISPONIBLE") {
      throw new Error(
        "Votre demande de duplicata est en cours de traitement. Vous pourrez prendre rendez-vous lorsque l'administration aura confirmé que le duplicata est prêt.",
      );
    }
  }

  const route = await resolvePickupRouteForDocument(document);
  if (!route.requiresAppointment) {
    throw new Error(
      "Ce document ne passe pas par un rendez-vous. Suivez les instructions de retrait.",
    );
  }

  const availableSlots = await getAvailableSlots(date);
  const selectedSlot = availableSlots.find((slot) => slot.value === parsed.data.heureRdv);
  if (!selectedSlot || selectedSlot.disabled) {
    throw new Error("Créneau indisponible.");
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

  const syncedDocument = await syncDocumentPickupFromExam(document);
  const location = await getPickupLocation(syncedDocument);
  const commentaire = parsed.data.commentaire?.trim() || "Réservation élève";
  const activeSlots = await getActiveTimeSlots();
  const slotCapacity = Math.max(
    1,
    Math.ceil(settings.quotaJournalier / Math.max(1, activeSlots.length)),
  );

  await prisma.$transaction(
    async (tx) => {
      const [dailyCount, slotCount, concurrentActiveForDocument] = await Promise.all([
        tx.rendezVous.count({
          where: {
            dateRdv: { gte: startOfDay(date), lte: endOfDay(date) },
            statut: { in: [...ACTIVE_RENDEZ_VOUS_STATUSES] },
          },
        }),
        tx.rendezVous.count({
          where: {
            dateRdv: { gte: startOfDay(date), lte: endOfDay(date) },
            heureRdv: parsed.data.heureRdv,
            statut: { in: [...ACTIVE_RENDEZ_VOUS_STATUSES] },
          },
        }),
        tx.rendezVous.findFirst({
          where: {
            documentId: document.id,
            statut: { in: [...ACTIVE_RENDEZ_VOUS_STATUSES] },
          },
          select: { id: true },
        }),
      ]);

      if (concurrentActiveForDocument) {
        throw new Error("Un rendez-vous actif existe déjà pour ce document.");
      }

      if (dailyCount >= settings.quotaJournalier || slotCount >= slotCapacity) {
        throw new Error(
          "Le quota de rendez-vous est atteint pour cette date. Veuillez choisir une autre date ouvrable.",
        );
      }

      await tx.rendezVous.create({
        data: {
          adminId: admin.id,
          eleveId: user.id,
          documentId: document.id,
          dateRdv: date,
          heureRdv: parsed.data.heureRdv,
          lieu: location,
          statut: "PLANIFIE",
          commentaire,
        },
      });
    },
    { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
  );

  await notifyAppointmentConfirmed({
    userId: user.id,
    to: user.email,
    documentTitle: getDocumentTitle(document),
    diplomeType: document.diplomeType,
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
    throw new Error("Accès refusé.");
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
      commentaire: "Annulation élève",
    },
  });

  revalidatePath("/dashboard/rendez-vous");
  revalidatePath("/dashboard/documents");
}

async function registerSchoolDocumentRequest(
  userId: string,
  diplomeType: DiplomePrincipal,
  typeDocument: Extract<TypeDocument, "ORIGINAL" | "RELEVE_NOTES">,
) {
  const exam = await prisma.examenValide.findUnique({
    where: {
      eleveId_diplomeType: {
        eleveId: userId,
        diplomeType,
      },
    },
  });

  if (!exam) {
    throw new Error("Examen introuvable pour cet élève.");
  }

  if (!isDocumentRequestAllowed(diplomeType, typeDocument)) {
    throw new Error("Ce type de document n'est pas disponible pour cet examen.");
  }

  const existing = await prisma.documentAcademique.findUnique({
    where: {
      eleveId_diplomeType_typeDocument: {
        eleveId: userId,
        diplomeType,
        typeDocument,
      },
    },
    select: { demandeSoumiseAt: true },
  });

  if (existing?.demandeSoumiseAt) {
    throw new Error("Une demande est déjà enregistrée pour ce document.");
  }

  const route = resolveDocumentRoute({
    diplomeType,
    typeDocument,
    centreExamen: exam.centreExamen,
    regionComposition: exam.regionComposition,
  });
  const submittedAt = new Date();

  await prisma.documentAcademique.upsert({
    where: {
      eleveId_diplomeType_typeDocument: {
        eleveId: userId,
        diplomeType,
        typeDocument,
      },
    },
    update: {
      centreExamen: exam.centreExamen,
      regionComposition: exam.regionComposition,
      organismeId: route.organismeId,
      antenneRegionaleId: route.antenneRegionaleId,
      demandeSoumiseAt: submittedAt,
    },
    create: {
      eleveId: userId,
      diplomeType,
      typeDocument,
      centreExamen: exam.centreExamen,
      regionComposition: exam.regionComposition,
      organismeId: route.organismeId,
      antenneRegionaleId: route.antenneRegionaleId,
      statut: "PAS_DISPONIBLE",
      demandeSoumiseAt: submittedAt,
    },
  });

  const isOriginal = typeDocument === "ORIGINAL";

  await createNotification({
    userId,
    typeNotification: isOriginal ? "DEMANDE_DIPLOME" : "DEMANDE_RELEVE",
    title: isOriginal ? "Demande de diplôme enregistrée" : "Demande de relevé enregistrée",
    message: isOriginal
      ? "Votre demande de diplôme original a été enregistrée. Vous serez notifié dès sa mise à disposition."
      : "Votre demande de relevé de notes a été enregistrée. Vous serez notifié dès sa mise à disposition dans votre centre d'examen.",
    actionUrl: `/dashboard/documents?exam=${diplomeType}`,
    metadata: {
      diplomeType,
      typeDocument,
    },
  });
}

export async function requestOriginalDiplomaAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ELEVE") {
    throw new Error("Accès refusé.");
  }

  const diplomeType = parseDiplome(formData.get("diplomeType"));
  await registerSchoolDocumentRequest(user.id, diplomeType, "ORIGINAL");

  revalidatePath("/dashboard/documents");
  revalidatePath("/dashboard");
}

export async function requestReleveNotesAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ELEVE") {
    throw new Error("Accès refusé.");
  }

  const diplomeType = parseDiplome(formData.get("diplomeType"));
  await registerSchoolDocumentRequest(user.id, diplomeType, "RELEVE_NOTES");

  revalidatePath("/dashboard/documents");
  revalidatePath("/dashboard");
}

export async function submitDuplicataRequestAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ELEVE") {
    throw new Error("Accès refusé.");
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
    throw new Error("Le Probatoire ne donne pas lieu à la délivrance d'un diplôme.");
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
    throw new Error("Examen introuvable pour cet élève.");
  }

  const activeDuplicataForDiplome = await getActiveDuplicataForDiplome(user.id, diplomeType);
  const requestState = await getDuplicataRequestState(user.id, diplomeType, cibleDocument);
  if (
    activeDuplicataForDiplome &&
    activeDuplicataForDiplome.id !== requestState.activeRequest?.id
  ) {
    throw new Error(
      "Une autre demande de duplicata est déjà en cours pour cet examen. Veuillez attendre sa clôture avant d'en introduire une nouvelle.",
    );
  }

  if (requestState.activeRequest) {
    if (requestState.activeRequest.statut === "DISPONIBLE") {
      throw new Error(
        "Votre duplicata est déjà prêt. Veuillez prendre rendez-vous ou vous présenter au service indiqué.",
      );
    }

    throw new Error("Une demande de duplicata est déjà en cours de traitement pour ce document.");
  }

  if (!requestState.allowed && requestState.nextAllowedAt) {
    throw new Error(
      `Vous avez déjà retiré ce type de duplicata. Une nouvelle demande sera possible à partir du ${requestState.nextAllowedAt.toLocaleDateString("fr-FR")}. Avant ce délai, veuillez vous rapprocher du service concerné.`,
    );
  }

  const pieceFiles = DUPLICATA_REQUIRED_PIECES.map((piece) => {
    const file = formData.get(piece.type);
    if (!(file instanceof File)) {
      throw new Error(`${piece.label}: fichier obligatoire.`);
    }

    return { piece, file };
  });

  const documentTitle = getDuplicataTitle(diplomeType, cibleDocument);
  const duplicataFee = getDuplicataFee(cibleDocument);
  const route = resolveDocumentRoute({
    diplomeType,
    typeDocument: "DUPLICATA",
    centreExamen: parsed.data.centreExamen,
    regionComposition: exam.regionComposition,
  });
  const antenne = route.antenneRegionaleId
    ? getAntenneForRegion(exam.regionComposition, route.organismeName)
    : null;

  const duplicataId = randomUUID();
  const uploadedPieces: Array<Awaited<ReturnType<typeof uploadDuplicataPiece>>> = [];

  try {
    for (const { piece, file } of pieceFiles) {
      uploadedPieces.push(
        await uploadDuplicataPiece({
          userId: user.id,
          duplicataId,
          typePiece: piece.type,
          file,
        }),
      );
    }
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? error.message
        : "Upload des pièces justificatives impossible. Veuillez réessayer.",
    );
  }

  const submittedAt = new Date();

  const { receipt } = await prisma.$transaction(async (tx) => {
    await tx.documentAcademique.upsert({
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
        statut: "PAS_DISPONIBLE",
        demandeSoumiseAt: submittedAt,
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
        demandeSoumiseAt: submittedAt,
      },
    });

    const duplicata = await tx.duplicata.create({
      data: {
        id: duplicataId,
        eleveId: user.id,
        typeDocument: "DUPLICATA",
        nomDuplicata: documentTitle,
        statut: "PAS_DISPONIBLE",
        statutValidation: "SOUMISE",
        regionComposition: exam.regionComposition,
        organismeId: route.organismeId,
        antenneRegionaleId: antenne?.id ?? null,
        intruction: JSON.stringify({
          diplomeType,
          cibleDocument,
          session: parsed.data.session,
          centreExamen: parsed.data.centreExamen,
          motif: parsed.data.motif,
          pieces: DUPLICATA_REQUIRED_PIECES.map((piece) => piece.type),
          montant: duplicataFee,
          lieuRetrait: route.location,
        }),
      },
    });

    await tx.pieceDuplicata.createMany({
      data: uploadedPieces.map((piece, index) => ({
        duplicataId: duplicata.id,
        typePiece: pieceFiles[index].piece.type,
        bucket: piece.bucket,
        path: piece.path,
        fileName: piece.fileName,
        mimeType: piece.mimeType,
        size: piece.size,
      })),
    });

    const payment = await tx.paiement.create({
      data: {
        duplicataId: duplicata.id,
        modePaiment: parsed.data.modePaiement,
        statut: "EFFECTUE",
      },
    });

    const receipt = await tx.recu.create({
      data: {
        numero: receiptNumber(),
        montant: duplicataFee,
        modePaiement: parsed.data.modePaiement,
        commentaire: documentTitle,
        userId: user.id,
        paiementId: payment.id,
      },
    });

    return { receipt };
  });

  await notifyDuplicataRequestRegistered({
    userId: user.id,
    to: user.email,
    documentTitle,
    diplomeType,
  });

  await notifyPaymentConfirmed({
    userId: user.id,
    to: user.email,
    recipientName: `${user.prenom} ${user.nom}`.trim(),
    documentTitle,
    diplomeType,
    paymentMode: parsed.data.modePaiement,
    receiptNumber: receipt.numero,
    amount: receipt.montant,
    paymentDate: receipt.dateEmission,
  });

  revalidatePath("/dashboard/documents");
  revalidatePath("/dashboard/payments");
}
