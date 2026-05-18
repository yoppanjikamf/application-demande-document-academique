"use server";

import { z } from "zod";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { profileUpdateSchema } from "@/lib/validations";

type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;

function parseOptionalDate(value?: string) {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed;
}

export async function updateProfileAction(input: ProfileUpdateInput) {
  const parsed = profileUpdateSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: "Informations invalides." };
  }

  const user = await getCurrentUser();
  if (!user) {
    return { ok: false as const, error: "Connexion requise." };
  }

  const baseData = {
    nom: parsed.data.nom,
    prenom: parsed.data.prenom,
  };

  if (user.role === "ADMINISTRATEUR") {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        ...baseData,
        nomService: parsed.data.nomService?.trim() || null,
        dateNaissance: null,
      },
    });

    return { ok: true as const };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      ...baseData,
      dateNaissance: parseOptionalDate(parsed.data.dateNaissance) ?? null,
      nomService: null,
    },
  });

  return { ok: true as const };
}
