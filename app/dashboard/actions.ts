"use server";

import { redirect } from "next/navigation";

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
import { notifyAppointmentConfirmed } from "@/lib/mail-service";
import { prisma } from "@/lib/prisma";
import { reservationSchema } from "@/lib/validations";

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

  if (document.statut !== "DISPONIBLE") {
    throw new Error("Ce document n'est pas encore disponible.");
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
    where: { role: "ADMINISTRATEUR" },
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
    date,
    time: parsed.data.heureRdv,
    location,
  });

  redirect(`/dashboard/rendez-vous?documentId=${encodeURIComponent(document.id)}`);
}
