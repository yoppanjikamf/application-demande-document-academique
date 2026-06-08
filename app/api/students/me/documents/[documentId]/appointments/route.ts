import { z } from "zod";

import {
  ACTIVE_RENDEZ_VOUS_STATUSES,
  endOfDay,
  getAvailableSlots,
  getActiveTimeSlots,
  getAppointmentSettings,
  getDocumentTitle,
  getPickupLocation,
  isBeforeTomorrow,
  isHoliday,
  isWeekend,
  parseDateKey,
  startOfDay,
} from "@/lib/appointment-service";
import { ApiError, handleApiError, json, parseJson, requireApiUser } from "@/lib/api-utils";
import { syncDocumentPickupFromExam } from "@/lib/centre-examen-service";
import {
  findLatestDuplicataForDocument,
  resolvePickupRouteForDocument,
} from "@/lib/duplicata-service";
import { notifyAppointmentConfirmed } from "@/lib/mail-service";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/lib/generated/prisma/client";

const appointmentSchema = z.object({
  dateRdv: z.string().trim().min(8),
  heureRdv: z.string().trim().min(4),
  commentaire: z.string().trim().max(250).optional(),
});

type RouteContext = {
  params: Promise<{ documentId: string }>;
};

export async function POST(request: Request, { params }: RouteContext) {
  try {
    const user = await requireApiUser("ELEVE");
    const { documentId } = await params;
    const input = await parseJson(request, appointmentSchema);
    const date = parseDateKey(input.dateRdv);
    const settings = await getAppointmentSettings();

    if (
      !date ||
      isBeforeTomorrow(date) ||
      (isWeekend(date) && !settings.allowWeekendBookings) ||
      (await isHoliday(date))
    ) {
      throw new ApiError("Date invalide.", 400);
    }

    const document = await prisma.documentAcademique.findFirst({
      where: { id: documentId, eleveId: user.id },
    });

    if (!document) {
      throw new ApiError("Document introuvable.", 404);
    }

    if (document.typeDocument !== "DUPLICATA" && !document.demandeSoumiseAt) {
      throw new ApiError("Vous devez d'abord enregistrer une demande pour ce document.", 409);
    }

    if (document.statut !== "DISPONIBLE") {
      throw new ApiError("Ce document n'est pas encore disponible.", 409);
    }

    if (document.typeDocument === "DUPLICATA") {
      const latestDuplicata = await findLatestDuplicataForDocument(document);
      if (latestDuplicata?.statut !== "DISPONIBLE") {
        throw new ApiError(
          "Votre duplicata n'est pas encore prêt. Vous pourrez prendre rendez-vous lorsque l'administration l'aura confirmé.",
          409,
        );
      }
    }

    const route = await resolvePickupRouteForDocument(document);
    if (!route.requiresAppointment) {
      throw new ApiError("Ce document ne nécessite pas de rendez-vous.", 409);
    }

    const availableSlots = await getAvailableSlots(date);
    const selectedSlot = availableSlots.find((slot) => slot.value === input.heureRdv);

    if (!selectedSlot || selectedSlot.disabled) {
      throw new ApiError("Créneau indisponible.", 409);
    }

    const activeForDocument = await prisma.rendezVous.findFirst({
      where: {
        documentId: document.id,
        statut: { in: [...ACTIVE_RENDEZ_VOUS_STATUSES] },
      },
      select: { id: true },
    });

    if (activeForDocument) {
      throw new ApiError("Un rendez-vous actif existe déjà pour ce document.", 409);
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
      throw new ApiError("Aucun administrateur disponible.", 409);
    }

    const syncedDocument = await syncDocumentPickupFromExam(document);
    const location = await getPickupLocation(syncedDocument);
    const activeSlots = await getActiveTimeSlots();
    const slotCapacity = Math.max(
      1,
      Math.ceil(settings.quotaJournalier / Math.max(1, activeSlots.length)),
    );
    const appointment = await prisma.$transaction(
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
              heureRdv: input.heureRdv,
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
          throw new ApiError("Un rendez-vous actif existe déjà pour ce document.", 409);
        }

        if (dailyCount >= settings.quotaJournalier || slotCount >= slotCapacity) {
          throw new ApiError(
            "Le quota de rendez-vous est atteint pour cette date. Veuillez choisir une autre date ouvrable.",
            409,
          );
        }

        return tx.rendezVous.create({
          data: {
            adminId: admin.id,
            eleveId: user.id,
            documentId: document.id,
            dateRdv: date,
            heureRdv: input.heureRdv,
            lieu: location,
            statut: "PLANIFIE",
            commentaire: input.commentaire?.trim() || "Réservation élève",
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
      time: input.heureRdv,
      location,
      recipientName: `${user.prenom} ${user.nom}`.trim(),
    });

    return json({ appointment }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
