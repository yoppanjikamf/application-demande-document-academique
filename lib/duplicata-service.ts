import { prisma } from "@/lib/prisma";
import { resolveDocumentRoute } from "@/lib/document-routing";
import type { DiplomePrincipal, Duplicata, TypeDocument } from "@/lib/generated/prisma/client";

export type DuplicataTarget = Extract<TypeDocument, "ORIGINAL" | "RELEVE_NOTES">;

export type DuplicataInstruction = {
  diplomeType?: DiplomePrincipal;
  cibleDocument?: DuplicataTarget;
  session?: number;
  centreExamen?: string;
  motif?: string;
  justificatif?: string;
};

const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;

function isDuplicataTarget(value: unknown): value is DuplicataTarget {
  return value === "ORIGINAL" || value === "RELEVE_NOTES";
}

function isDiplomePrincipal(value: unknown): value is DiplomePrincipal {
  return value === "BEPC" || value === "PROBATOIRE" || value === "BACCALAUREAT";
}

export function parseDuplicataInstruction(value: string): DuplicataInstruction {
  try {
    const parsed = JSON.parse(value) as Record<string, unknown>;
    return {
      diplomeType: isDiplomePrincipal(parsed.diplomeType) ? parsed.diplomeType : undefined,
      cibleDocument: isDuplicataTarget(parsed.cibleDocument) ? parsed.cibleDocument : undefined,
      session: typeof parsed.session === "number" ? parsed.session : undefined,
      centreExamen: typeof parsed.centreExamen === "string" ? parsed.centreExamen : undefined,
      motif: typeof parsed.motif === "string" ? parsed.motif : undefined,
      justificatif: typeof parsed.justificatif === "string" ? parsed.justificatif : undefined,
    };
  } catch {
    return {};
  }
}

export function isDuplicataForTarget(
  duplicata: Pick<Duplicata, "intruction">,
  diplomeType: DiplomePrincipal,
  target: DuplicataTarget,
) {
  const meta = parseDuplicataInstruction(duplicata.intruction);
  return meta.diplomeType === diplomeType && meta.cibleDocument === target;
}

export function getDuplicataRequestAvailability(lastRetiredAt: Date | null) {
  if (!lastRetiredAt) {
    return { allowed: true as const, nextAllowedAt: null };
  }

  const nextAllowedAt = new Date(lastRetiredAt.getTime() + ONE_YEAR_MS);
  return {
    allowed: Date.now() >= nextAllowedAt.getTime(),
    nextAllowedAt,
  };
}

export async function getLatestDuplicataForTarget(
  eleveId: string,
  diplomeType: DiplomePrincipal,
  target: DuplicataTarget,
) {
  const duplicatas = await prisma.duplicata.findMany({
    where: { eleveId },
    orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
    include: { paiement: { include: { recu: true } } },
  });

  return duplicatas.find((duplicata) => isDuplicataForTarget(duplicata, diplomeType, target)) ?? null;
}

export async function getDuplicataRequestState(
  eleveId: string,
  diplomeType: DiplomePrincipal,
  target: DuplicataTarget,
) {
  const duplicatas = await prisma.duplicata.findMany({
    where: { eleveId },
    orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
  });
  const matching = duplicatas.filter((duplicata) => isDuplicataForTarget(duplicata, diplomeType, target));
  const activeRequest = matching.find((duplicata) => duplicata.statut !== "RETIRE") ?? null;
  const lastRetired = matching.find((duplicata) => duplicata.statut === "RETIRE") ?? null;
  const availability = getDuplicataRequestAvailability(lastRetired?.updatedAt ?? null);

  return {
    activeRequest,
    lastRetired,
    ...availability,
  };
}

export async function getActiveDuplicataForDiplome(eleveId: string, diplomeType: DiplomePrincipal) {
  const duplicatas = await prisma.duplicata.findMany({
    where: {
      eleveId,
      statut: { not: "RETIRE" },
    },
    orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
  });

  return duplicatas.find((duplicata) => {
    const meta = parseDuplicataInstruction(duplicata.intruction);
    return meta.diplomeType === diplomeType;
  }) ?? null;
}

export async function findLatestDuplicataForDocument(document: {
  eleveId: string;
  diplomeType: DiplomePrincipal;
  typeDocument: TypeDocument;
}) {
  if (document.typeDocument !== "DUPLICATA") {
    return null;
  }

  const duplicatas = await prisma.duplicata.findMany({
    where: { eleveId: document.eleveId },
    orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
  });

  return duplicatas.find((duplicata) => {
    const meta = parseDuplicataInstruction(duplicata.intruction);
    return meta.diplomeType === document.diplomeType;
  }) ?? null;
}

export async function resolvePickupRouteForDocument(document: {
  eleveId: string;
  diplomeType: DiplomePrincipal;
  typeDocument: TypeDocument;
  centreExamen?: string | null;
  regionComposition?: string | null;
}) {
  if (document.typeDocument !== "DUPLICATA") {
    return resolveDocumentRoute(document);
  }

  const latestDuplicata = await findLatestDuplicataForDocument(document);
  const meta = latestDuplicata ? parseDuplicataInstruction(latestDuplicata.intruction) : null;

  return resolveDocumentRoute({
    diplomeType: document.diplomeType,
    typeDocument: "RELEVE_NOTES",
    centreExamen: meta?.centreExamen ?? document.centreExamen,
    regionComposition: document.regionComposition,
  });
}

export async function syncLatestDuplicataStatus(document: {
  eleveId: string;
  diplomeType: DiplomePrincipal;
  typeDocument: TypeDocument;
}, statut: "PAS_DISPONIBLE" | "DISPONIBLE" | "RETIRE") {
  const latestDuplicata = await findLatestDuplicataForDocument(document);

  if (!latestDuplicata) {
    return;
  }

  await prisma.duplicata.update({
    where: { id: latestDuplicata.id },
    data: { statut },
  });
}
