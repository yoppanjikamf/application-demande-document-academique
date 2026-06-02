import { ApiError } from "@/lib/api-utils";
import type { AuthenticatedUser } from "@/lib/auth";
import { endOfDay, startOfDay } from "@/lib/appointment-service";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/lib/generated/prisma/client";

export type AgentAppointmentFilter = "today" | "upcoming" | "processed";

export function normalizeAgentAppointmentFilter(value?: string | null): AgentAppointmentFilter {
  if (value === "upcoming" || value === "processed") {
    return value;
  }

  return "today";
}

export async function getAgentCentreExamen(user: AuthenticatedUser) {
  if (!user.centreExamenId) {
    throw new ApiError("Aucun centre d'examen n'est rattache a ce compte.", 403);
  }

  const centre = await prisma.centreExamen.findUnique({
    where: { id: user.centreExamenId },
  });

  if (!centre) {
    throw new ApiError("Centre d'examen introuvable.", 404);
  }

  return centre;
}

export function getCentreExamenAppointmentWhere(
  centreRegion: string,
  filter: AgentAppointmentFilter,
): Prisma.RendezVousWhereInput {
  const now = new Date();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(now.getDate() - 30);

  const base: Prisma.RendezVousWhereInput = {
    documentId: { not: null },
    document: {
      is: {
        regionComposition: centreRegion,
        typeDocument: { not: "DUPLICATA" },
        NOT: {
          diplomeType: "BACCALAUREAT",
          typeDocument: "ORIGINAL",
        },
      },
    },
  };

  if (filter === "processed") {
    return {
      ...base,
      statut: "HONORE",
      retraitConfirmeAt: { gte: thirtyDaysAgo },
    };
  }

  if (filter === "upcoming") {
    return {
      ...base,
      statut: { in: ["PLANIFIE", "CONFIRME"] },
      dateRdv: { gt: endOfDay(now) },
    };
  }

  return {
    ...base,
    statut: { in: ["PLANIFIE", "CONFIRME"] },
    dateRdv: { gte: startOfDay(now), lte: endOfDay(now) },
  };
}

export function isCentreExamenDocumentEligible(
  document: {
    regionComposition: string | null;
    diplomeType: string;
    typeDocument: string;
  },
  centreRegion: string,
) {
  if (document.regionComposition !== centreRegion) {
    return false;
  }

  if (document.typeDocument === "DUPLICATA") {
    return false;
  }

  return !(document.diplomeType === "BACCALAUREAT" && document.typeDocument === "ORIGINAL");
}
