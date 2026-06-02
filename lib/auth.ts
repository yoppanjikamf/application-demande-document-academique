import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Role } from "@/lib/generated/prisma/client";

export type AuthenticatedUser = {
  authUserId: string;
  id: string;
  email: string;
  matricule: string;
  nom: string;
  prenom: string;
  role: Role;
  nomService: string | null;
  organismeId: string | null;
  antenneRegionaleId: string | null;
  centreExamenId: string | null;
  dateNaissance: Date | null;
};

export function getHomePathForRole(role: Role) {
  if (role === "ADMINISTRATEUR") {
    return "/admin";
  }

  if (role === "AGENT_CENTRE_EXAMEN") {
    return "/centre-examen";
  }

  return "/dashboard";
}

export async function getCurrentUser() {
  const supabase = await createSupabaseServerClient();
  const authUser = supabase ? (await supabase.auth.getUser()).data.user : null;

  if (!authUser) {
    return null;
  }

  const dbUser = await prisma.user.findUnique({
    where: { authUserId: authUser.id },
    select: {
      id: true,
      authUserId: true,
      email: true,
      matricule: true,
      nom: true,
      prenom: true,
      role: true,
      nomService: true,
      organismeId: true,
      antenneRegionaleId: true,
      centreExamenId: true,
      dateNaissance: true,
    },
  });

  if (!dbUser?.authUserId) {
    return null;
  }

  return dbUser as AuthenticatedUser;
}

export async function requireUser(nextPath: string) {
  const user = await getCurrentUser();

  if (!user) {
    redirect(`/auth/login?next=${encodeURIComponent(nextPath)}`);
  }

  return user;
}

export async function requireRole(role: Role, nextPath: string) {
  const user = await requireUser(nextPath);

  if (user.role !== role) {
    redirect(getHomePathForRole(user.role));
  }

  if (
    user.role === "ADMINISTRATEUR" &&
    user.organismeId &&
    !user.antenneRegionaleId &&
    nextPath !== "/auth/admin-region"
  ) {
    redirect(`/auth/admin-region?next=${encodeURIComponent(nextPath)}`);
  }

  return user;
}
