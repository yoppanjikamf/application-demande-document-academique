import type { AntenneRegionale, DiplomePrincipal, Organisme, TypeDocument } from "@/lib/generated/prisma/client";

export const ORGANISME_IDS = {
  OBC: "org-obc",
  DECC: "org-decc",
} as const;

export const DEFAULT_REGION = "Centre";

export const OBC_REGIONAL_ANTENNAS = [
  { id: "antenne-adamaoua", region: "Adamaoua", nom: "Antenne regionale OBC Adamaoua", ville: "Ngaoundere", accessKey: "OBC-ADAMAOUA-2026" },
  { id: "antenne-centre", region: "Centre", nom: "Antenne regionale OBC Centre", ville: "Yaounde", accessKey: "OBC-CENTRE-2026" },
  { id: "antenne-est", region: "Est", nom: "Antenne regionale OBC Est", ville: "Bertoua", accessKey: "OBC-EST-2026" },
  { id: "antenne-extreme-nord", region: "Extreme-Nord", nom: "Antenne regionale OBC Extreme-Nord", ville: "Maroua", accessKey: "OBC-EXTREME-NORD-2026" },
  { id: "antenne-littoral", region: "Littoral", nom: "Antenne regionale OBC Littoral", ville: "Douala", accessKey: "OBC-LITTORAL-2026" },
  { id: "antenne-nord", region: "Nord", nom: "Antenne regionale OBC Nord", ville: "Garoua", accessKey: "OBC-NORD-2026" },
  { id: "antenne-nord-ouest", region: "Nord-Ouest", nom: "Antenne regionale OBC Nord-Ouest", ville: "Bamenda", accessKey: "OBC-NORD-OUEST-2026" },
  { id: "antenne-ouest", region: "Ouest", nom: "Antenne regionale OBC Ouest", ville: "Bafoussam", accessKey: "OBC-OUEST-2026" },
  { id: "antenne-sud", region: "Sud", nom: "Antenne regionale OBC Sud", ville: "Ebolowa", accessKey: "OBC-SUD-2026" },
  { id: "antenne-sud-ouest", region: "Sud-Ouest", nom: "Antenne regionale OBC Sud-Ouest", ville: "Buea", accessKey: "OBC-SUD-OUEST-2026" },
] as const;

export type OrganismeName = keyof typeof ORGANISME_IDS;
export type PickupType = "CENTRE_EXAMEN" | "ANTENNE_REGIONALE";

export type DocumentRoute = {
  organismeName: OrganismeName;
  organismeId: string;
  antenneRegionaleId: string | null;
  pickupType: PickupType;
  location: string;
  requiresAppointment: boolean;
};

type RoutableDocument = {
  diplomeType: DiplomePrincipal;
  typeDocument: TypeDocument;
  centreExamen?: string | null;
  regionComposition?: string | null;
  antenneRegionale?: Pick<AntenneRegionale, "nom" | "ville" | "region"> | null;
  organisme?: Pick<Organisme, "nom"> | null;
};

export function normalizeRegion(region?: string | null) {
  const value = region?.trim();
  if (!value) {
    return DEFAULT_REGION;
  }

  const found = OBC_REGIONAL_ANTENNAS.find((antenne) => antenne.region.toLowerCase() === value.toLowerCase());
  return found?.region ?? value;
}

export function getAntenneForRegion(region?: string | null) {
  const normalized = normalizeRegion(region);
  return OBC_REGIONAL_ANTENNAS.find((antenne) => antenne.region === normalized) ?? OBC_REGIONAL_ANTENNAS[1];
}

export function getAntenneById(id?: string | null) {
  if (!id) {
    return null;
  }

  return OBC_REGIONAL_ANTENNAS.find((antenne) => antenne.id === id) ?? null;
}

export function getAntenneByAccessKey(accessKey?: string | null) {
  const normalized = accessKey?.trim();
  if (!normalized) {
    return null;
  }

  return OBC_REGIONAL_ANTENNAS.find((antenne) => antenne.accessKey === normalized) ?? null;
}

export function getOrganismeForDiplome(diplomeType: DiplomePrincipal): OrganismeName {
  return diplomeType === "BEPC" ? "DECC" : "OBC";
}

export function isDocumentRequestAllowed(
  diplomeType: DiplomePrincipal,
  typeDocument: TypeDocument,
  targetDocument?: Extract<TypeDocument, "ORIGINAL" | "RELEVE_NOTES">,
) {
  if (diplomeType === "PROBATOIRE" && typeDocument === "ORIGINAL") {
    return false;
  }

  if (diplomeType === "PROBATOIRE" && typeDocument === "DUPLICATA" && targetDocument === "ORIGINAL") {
    return false;
  }

  return true;
}

export function resolveDocumentRoute(document: RoutableDocument): DocumentRoute {
  const organismeName = getOrganismeForDiplome(document.diplomeType);
  const organismeId = ORGANISME_IDS[organismeName];
  const centreExamen = document.centreExamen?.trim() || "Centre d'examen";
  const isBacDiplome = document.diplomeType === "BACCALAUREAT" && document.typeDocument === "ORIGINAL";
  const pickupType: PickupType = isBacDiplome ? "ANTENNE_REGIONALE" : "CENTRE_EXAMEN";
  const antenne = organismeName === "OBC" ? getAntenneForRegion(document.regionComposition) : null;
  const antennaLocation = antenne ? `${antenne.nom}${antenne.ville ? ` - ${antenne.ville}` : ""}` : centreExamen;

  return {
    organismeName,
    organismeId,
    antenneRegionaleId: antenne?.id ?? null,
    pickupType,
    location: pickupType === "ANTENNE_REGIONALE" ? antennaLocation : centreExamen,
    requiresAppointment: pickupType === "ANTENNE_REGIONALE",
  };
}

export function getAdminDocumentScope(admin: {
  organismeId?: string | null;
  antenneRegionaleId?: string | null;
}) {
  if (!admin.organismeId) {
    return { id: "__none__" };
  }

  if (admin.organismeId === ORGANISME_IDS.OBC && !admin.antenneRegionaleId) {
    return { id: "__none__" };
  }

  return {
    organismeId: admin.organismeId,
    ...(admin.antenneRegionaleId ? { antenneRegionaleId: admin.antenneRegionaleId } : {}),
  };
}

export function canAdminAccessDocument(
  admin: { organismeId?: string | null; antenneRegionaleId?: string | null },
  document: { organismeId?: string | null; antenneRegionaleId?: string | null },
) {
  if (!admin.organismeId || admin.organismeId !== document.organismeId) {
    return false;
  }

  if (admin.antenneRegionaleId && document.antenneRegionaleId !== admin.antenneRegionaleId) {
    return false;
  }

  return true;
}
