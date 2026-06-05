import type {
  AntenneRegionale,
  DiplomePrincipal,
  Organisme,
  TypeDocument,
} from "@/lib/generated/prisma/client";

export const ORGANISME_IDS = {
  OBC: "org-obc",
  DECC: "org-decc",
} as const;

export const DEFAULT_REGION = "Centre";

const REGIONAL_BASE = [
  { region: "Adamaoua", ville: "Ngaoundere" },
  { region: "Centre", ville: "Yaounde" },
  { region: "Est", ville: "Bertoua" },
  { region: "Extreme-Nord", ville: "Maroua" },
  { region: "Littoral", ville: "Douala" },
  { region: "Nord", ville: "Garoua" },
  { region: "Nord-Ouest", ville: "Bamenda" },
  { region: "Ouest", ville: "Bafoussam" },
  { region: "Sud", ville: "Ebolowa" },
  { region: "Sud-Ouest", ville: "Buea" },
] as const;

function slugifyRegion(region: string) {
  return region.toLowerCase();
}

export const OBC_REGIONAL_ANTENNAS = REGIONAL_BASE.map((item) => ({
  id: `antenne-${slugifyRegion(item.region)}`,
  region: item.region,
  nom: `Antenne regionale OBC ${item.region}`,
  ville: item.ville,
  accessKey: `OBC-${item.region.toUpperCase()}-2026`,
  organismeId: ORGANISME_IDS.OBC,
})) as ReadonlyArray<{
  id: string;
  region: string;
  nom: string;
  ville: string;
  accessKey: string;
  organismeId: string;
}>;

export const DECC_REGIONAL_ANTENNAS = REGIONAL_BASE.map((item) => ({
  id: `antenne-decc-${slugifyRegion(item.region)}`,
  region: item.region,
  nom: `Antenne regionale DECC ${item.region}`,
  ville: item.ville,
  accessKey: `DECC-${item.region.toUpperCase()}-2026`,
  organismeId: ORGANISME_IDS.DECC,
})) as ReadonlyArray<{
  id: string;
  region: string;
  nom: string;
  ville: string;
  accessKey: string;
  organismeId: string;
}>;

export const REGIONAL_ANTENNAS = [...OBC_REGIONAL_ANTENNAS, ...DECC_REGIONAL_ANTENNAS] as const;

export const CENTRES_EXAMEN_REGIONAUX = REGIONAL_BASE.map((item) => ({
  id: `centre-examen-${slugifyRegion(item.region)}`,
  region: item.region,
  nom: `Centre d'examen ${item.region}`,
  ville: item.ville,
})) as ReadonlyArray<{
  id: string;
  region: string;
  nom: string;
  ville: string;
}>;

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

  const found = REGIONAL_BASE.find(
    (antenne) => antenne.region.toLowerCase() === value.toLowerCase(),
  );
  return found?.region ?? value;
}

export function getAntennesForOrganisme(organismeNameOrId: OrganismeName | string) {
  const organismeId =
    organismeNameOrId === "OBC" || organismeNameOrId === "DECC"
      ? ORGANISME_IDS[organismeNameOrId]
      : organismeNameOrId;

  return REGIONAL_ANTENNAS.filter((antenne) => antenne.organismeId === organismeId);
}

export function getAntenneForRegion(
  region?: string | null,
  organismeNameOrId: OrganismeName | string = "OBC",
) {
  const normalized = normalizeRegion(region);
  const antennas = getAntennesForOrganisme(organismeNameOrId);
  return antennas.find((antenne) => antenne.region === normalized) ?? antennas[1] ?? null;
}

export function getAntenneById(id?: string | null) {
  if (!id) {
    return null;
  }

  return REGIONAL_ANTENNAS.find((antenne) => antenne.id === id) ?? null;
}

export function getCentreExamenForRegion(region?: string | null) {
  const normalized = normalizeRegion(region);
  return CENTRES_EXAMEN_REGIONAUX.find((centre) => centre.region === normalized) ?? null;
}

export function isCentreExamenPickupDocument(document: {
  diplomeType: DiplomePrincipal;
  typeDocument: TypeDocument;
}) {
  return resolveDocumentRoute(document).pickupType === "CENTRE_EXAMEN";
}

export function getAntenneByAccessKey(accessKey?: string | null) {
  const normalized = accessKey?.trim();
  if (!normalized) {
    return null;
  }

  return REGIONAL_ANTENNAS.find((antenne) => antenne.accessKey === normalized) ?? null;
}

export function getOrganismeNameById(organismeId?: string | null): OrganismeName | null {
  if (organismeId === ORGANISME_IDS.OBC) {
    return "OBC";
  }

  if (organismeId === ORGANISME_IDS.DECC) {
    return "DECC";
  }

  return null;
}

export function getAdminScopeLabel(admin: {
  organismeId?: string | null;
  antenneRegionaleId?: string | null;
}) {
  const organismeName = getOrganismeNameById(admin.organismeId);
  const region = getAntenneById(admin.antenneRegionaleId)?.region;

  if (organismeName && region) {
    return `${organismeName} - ${region}`;
  }

  return organismeName ?? undefined;
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

  if (
    diplomeType === "PROBATOIRE" &&
    typeDocument === "DUPLICATA" &&
    targetDocument === "ORIGINAL"
  ) {
    return false;
  }

  return true;
}

export function resolveDocumentRoute(document: RoutableDocument): DocumentRoute {
  const organismeName = getOrganismeForDiplome(document.diplomeType);
  const organismeId = ORGANISME_IDS[organismeName];
  const region = normalizeRegion(document.regionComposition);
  const regionalCentre = getCentreExamenForRegion(region);
  const centrePickupLocation =
    regionalCentre?.nom ??
    (document.centreExamen?.trim() || `Centre d'examen ${region}`);
  const isBacDiplome =
    document.diplomeType === "BACCALAUREAT" && document.typeDocument === "ORIGINAL";
  const isBepcDuplicata = document.diplomeType === "BEPC" && document.typeDocument === "DUPLICATA";
  const pickupType: PickupType =
    isBacDiplome || isBepcDuplicata ? "ANTENNE_REGIONALE" : "CENTRE_EXAMEN";
  const antenne = getAntenneForRegion(region, organismeName);
  const antennaLocation = antenne
    ? `${antenne.nom}${antenne.ville ? ` - ${antenne.ville}` : ""}`
    : centrePickupLocation;

  return {
    organismeName,
    organismeId,
    antenneRegionaleId: antenne?.id ?? null,
    pickupType,
    location: pickupType === "ANTENNE_REGIONALE" ? antennaLocation : centrePickupLocation,
    requiresAppointment: document.typeDocument !== "DUPLICATA",
  };
}

export function getAdminDocumentScope(admin: {
  organismeId?: string | null;
  antenneRegionaleId?: string | null;
}) {
  if (!admin.organismeId || !admin.antenneRegionaleId) {
    return { id: "__none__" };
  }

  return {
    organismeId: admin.organismeId,
    antenneRegionaleId: admin.antenneRegionaleId,
  };
}

export function canAdminAccessDocument(
  admin: { organismeId?: string | null; antenneRegionaleId?: string | null },
  document: { organismeId?: string | null; antenneRegionaleId?: string | null },
) {
  if (!admin.organismeId || admin.organismeId !== document.organismeId) {
    return false;
  }

  if (!admin.antenneRegionaleId || document.antenneRegionaleId !== admin.antenneRegionaleId) {
    return false;
  }

  return true;
}
