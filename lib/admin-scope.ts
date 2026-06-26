import type { AuthenticatedUser } from "@/lib/auth";

/** Filtre Prisma : aucun résultat si l'admin n'a pas sélectionné sa région. */
export function getAdminRegionalScope(user: {
  organismeId: string | null;
  antenneRegionaleId: string | null;
}) {
  if (!user.organismeId || !user.antenneRegionaleId) {
    return { id: "__none__" } as const;
  }

  return {
    organismeId: user.organismeId,
    antenneRegionaleId: user.antenneRegionaleId,
  };
}

export function assertAdminRegionalScope(user: AuthenticatedUser) {
  if (user.role !== "ADMINISTRATEUR") {
    throw new Error("Accès refusé.");
  }

  if (!user.organismeId || !user.antenneRegionaleId) {
    throw new Error("Sélection de région requise.");
  }
}
