"use server";

import { z } from "zod";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { reservationSchema } from "@/lib/validations";

const DEFAULT_DAILY_QUOTA = 10;
const DEFAULT_LIEU = "Service OBC";

function startOfDay(date: Date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function endOfDay(date: Date) {
  const copy = new Date(date);
  copy.setHours(23, 59, 59, 999);
  return copy;
}

function isWeekend(date: Date) {
  const day = date.getDay();
  return day === 0 || day === 6;
}

export async function reserverDisponibiliteAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ELEVE") {
    return { ok: false as const, error: "Acces refuse." };
  }

  const parsed = reservationSchema.safeParse({
    dateRdv: formData.get("dateRdv"),
    heureRdv: formData.get("heureRdv"),
    commentaire: formData.get("commentaire"),
  });

  if (!parsed.success) {
    return { ok: false as const, error: "Demande invalide." };
  }

  const date = new Date(parsed.data.dateRdv);
  if (Number.isNaN(date.getTime()) || isWeekend(date)) {
    return { ok: false as const, error: "Date invalide." };
  }

  const commentaire = parsed.data.commentaire?.trim() || "Reservation eleve";

  const admins = await prisma.user.findMany({
    where: { role: "ADMINISTRATEUR" },
    select: { id: true, maxRdvParJour: true },
  });

  if (admins.length === 0) {
    return { ok: false as const, error: "Aucun admin disponible." };
  }

  const dayStart = startOfDay(date);
  const dayEnd = endOfDay(date);

  let chosenAdminId: string | null = null;

  for (const admin of admins) {
    const quota = admin.maxRdvParJour ?? DEFAULT_DAILY_QUOTA;
    const count = await prisma.rendezVous.count({
      where: {
        adminId: admin.id,
        dateRdv: { gte: dayStart, lte: dayEnd },
        statut: { not: "ANNULE" },
      },
    });

    if (count < quota) {
      chosenAdminId = admin.id;
      break;
    }
  }

  if (!chosenAdminId) {
    return { ok: false as const, error: "Jour complet. Choisissez une autre date." };
  }

  await prisma.rendezVous.create({
    data: {
      adminId: chosenAdminId,
      eleveId: user.id,
      dateRdv: date,
      heureRdv: parsed.data.heureRdv,
      lieu: DEFAULT_LIEU,
      commentaire,
    },
  });

  return { ok: true as const };
}

const cancelSchema = z.object({
  rendezVousId: z.string().trim().min(10),
});

export async function annulerRendezVousAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ELEVE") {
    return { ok: false as const, error: "Acces refuse." };
  }

  const parsed = cancelSchema.safeParse({
    rendezVousId: formData.get("rendezVousId"),
  });

  if (!parsed.success) {
    return { ok: false as const, error: "Demande invalide." };
  }

  const rdv = await prisma.rendezVous.findUnique({
    where: { id: parsed.data.rendezVousId },
  });

  if (!rdv || rdv.eleveId !== user.id) {
    return { ok: false as const, error: "Rendez-vous introuvable." };
  }

  await prisma.$transaction(async (tx) => {
    await tx.rendezVous.update({
      where: { id: rdv.id },
      data: { statut: "ANNULE" },
    });

  });

  return { ok: true as const };
}
