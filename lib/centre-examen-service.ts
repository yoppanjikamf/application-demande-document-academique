import { ApiError } from "@/lib/api-utils";
import type { AuthenticatedUser } from "@/lib/auth";
import { endOfDay, startOfDay } from "@/lib/appointment-service";
import {
  getCentreExamenForRegion,
  isCentreExamenPickupDocument,
  normalizeRegion,
} from "@/lib/document-routing";
import { prisma } from "@/lib/prisma";
import type {
  DiplomePrincipal,
  DocumentAcademique,
  Prisma,
  TypeDocument,
} from "@/lib/generated/prisma/client";

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

type CentreExamenScope = {
  nom: string;
  region: string;
};

export function getCentreDocumentWhere(centre: CentreExamenScope): Prisma.DocumentAcademiqueWhereInput {
  const centreName = centre.nom.trim();
  const centreRegion = normalizeRegion(centre.region);

  return {
    // Retraits au centre d'examen : diplome BEPC, releves (BEPC/Probatoire/Bac),
    // hors antenne regionale (diplome original du Bac, tous les duplicatas).
    AND: [
      { typeDocument: { not: "DUPLICATA" } },
      { NOT: { diplomeType: "BACCALAUREAT", typeDocument: "ORIGINAL" } },
      {
        OR: [
          { regionComposition: { equals: centreRegion, mode: "insensitive" } },
          {
            AND: [
              { OR: [{ regionComposition: null }, { regionComposition: "" }] },
              { centreExamen: { equals: centreName, mode: "insensitive" } },
            ],
          },
        ],
      },
    ],
  };
}

export async function syncDocumentPickupFromExam(
  document: Pick<
    DocumentAcademique,
    "id" | "eleveId" | "diplomeType" | "typeDocument" | "centreExamen" | "regionComposition"
  >,
) {
  const exam = await prisma.examenValide.findUnique({
    where: {
      eleveId_diplomeType: {
        eleveId: document.eleveId,
        diplomeType: document.diplomeType,
      },
    },
    select: {
      centreExamen: true,
      regionComposition: true,
    },
  });

  if (!exam) {
    return document;
  }

  const region = normalizeRegion(exam.regionComposition ?? document.regionComposition);
  const regionalCentre = getCentreExamenForRegion(region);
  const isCentrePickup = isCentreExamenPickupDocument({
    diplomeType: document.diplomeType,
    typeDocument: document.typeDocument,
  });

  const centreExamen = isCentrePickup
    ? exam.centreExamen?.trim() || regionalCentre?.nom || document.centreExamen
    : exam.centreExamen?.trim() || document.centreExamen;

  const needsUpdate =
    normalizeRegion(document.regionComposition) !== region ||
    document.centreExamen !== centreExamen;

  if (!needsUpdate) {
    return document;
  }

  return prisma.documentAcademique.update({
    where: { id: document.id },
    data: {
      regionComposition: region,
      centreExamen,
    },
  });
}

export function getCentreExamenAppointmentWhere(
  centre: CentreExamenScope,
  filter: AgentAppointmentFilter,
): Prisma.RendezVousWhereInput {
  const now = new Date();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(now.getDate() - 30);

  const base: Prisma.RendezVousWhereInput = {
    documentId: { not: null },
    document: {
      is: getCentreDocumentWhere(centre),
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
    centreExamen: string | null;
    diplomeType: string;
    typeDocument: string;
  },
  centre: CentreExamenScope,
) {
  // Seuls les retraits au centre d'examen sont confirmes par l'agent. Les
  // retraits en antenne regionale (Bac original, tous les duplicatas) sont exclus.
  if (
    !isCentreExamenPickupDocument({
      diplomeType: document.diplomeType as DiplomePrincipal,
      typeDocument: document.typeDocument as TypeDocument,
    })
  ) {
    return false;
  }

  const documentRegion = normalizeRegion(document.regionComposition);
  const centreRegion = normalizeRegion(centre.region);
  const documentCentre = document.centreExamen?.trim().toLowerCase();
  const centreName = centre.nom.trim().toLowerCase();

  return documentRegion === centreRegion || documentCentre === centreName;
}
