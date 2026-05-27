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
import { ApiError, handleApiError, json, parseJson, requireApiUser } from "@/lib/api-utils";
import { resolveDocumentRoute } from "@/lib/document-routing";
import { notifyAppointmentConfirmed } from "@/lib/mail-service";
import { prisma } from "@/lib/prisma";

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

    if (!date || isWeekend(date) || (await isHoliday(date))) {
      throw new ApiError("Date invalide.", 400);
    }

    const document = await prisma.documentAcademique.findFirst({
      where: { id: documentId, eleveId: user.id },
    });

    if (!document) {
      throw new ApiError("Document introuvable.", 404);
    }

    if (document.statut !== "DISPONIBLE") {
      throw new ApiError("Ce document n'est pas encore disponible.", 409);
    }

    const route = resolveDocumentRoute(document);
    if (!route.requiresAppointment) {
      throw new ApiError("Ce document se retire directement au centre d'examen, sans rendez-vous.", 409);
    }

    const availableSlots = await getAvailableSlots(date);
    const selectedSlot = availableSlots.find((slot) => slot.value === input.heureRdv);

    if (!selectedSlot || selectedSlot.disabled) {
      throw new ApiError("Creneau indisponible.", 409);
    }

    const activeForDocument = await prisma.rendezVous.findFirst({
      where: {
        documentId: document.id,
        statut: { in: [...ACTIVE_RENDEZ_VOUS_STATUSES] },
      },
      select: { id: true },
    });

    if (activeForDocument) {
      throw new ApiError("Un rendez-vous actif existe deja pour ce document.", 409);
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

    const location = await getPickupLocation(document);
    const appointment = await prisma.rendezVous.create({
      data: {
        adminId: admin.id,
        eleveId: user.id,
        documentId: document.id,
        dateRdv: date,
        heureRdv: input.heureRdv,
        lieu: location,
        statut: "CONFIRME",
        commentaire: input.commentaire?.trim() || "Reservation eleve",
      },
    });

    await notifyAppointmentConfirmed({
      userId: user.id,
      to: user.email,
      documentTitle: getDocumentTitle(document),
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
