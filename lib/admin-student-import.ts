import {
  canAdminAccessDocument,
  getAdminDocumentScope,
  isDocumentRequestAllowed,
  resolveDocumentRoute,
} from "@/lib/document-routing";
import { assertDiplomeMatchesAdminOrganisme } from "@/lib/import-organisme-guard";
import { prisma } from "@/lib/prisma";
import type { AuthenticatedUser } from "@/lib/auth";
import {
  DiplomePrincipal,
  Role,
  StatutDocument,
  TypeDocument,
} from "@/lib/generated/prisma/client";

export type StudentImportRow = {
  matricule: string;
  email: string;
  nom: string;
  prenom: string;
  dateNaissance?: Date | null;
  diplomeType?: DiplomePrincipal;
  anneeSession?: number | null;
  centreExamen?: string;
  regionComposition?: string;
  documentType?: TypeDocument;
  documentStatut?: StatutDocument;
};

export type StudentImportResult = {
  eleveId: string;
  documentCreated: boolean;
};

const DOCUMENT_TYPE_ALIASES: Record<string, TypeDocument> = {
  DIPLOME: TypeDocument.ORIGINAL,
  DIPLOME_ORIGINAL: TypeDocument.ORIGINAL,
  ORIGINAL: TypeDocument.ORIGINAL,
  ORIG: TypeDocument.ORIGINAL,
  RELEVE: TypeDocument.RELEVE_NOTES,
  RELEVE_NOTES: TypeDocument.RELEVE_NOTES,
  RELEVE_DE_NOTES: TypeDocument.RELEVE_NOTES,
  DUPLICATA: TypeDocument.DUPLICATA,
  DUPLICATE: TypeDocument.DUPLICATA,
};

const DOCUMENT_STATUS_ALIASES: Record<string, StatutDocument> = {
  DISPONIBLE: StatutDocument.DISPONIBLE,
  AVAILABLE: StatutDocument.DISPONIBLE,
  PAS_DISPONIBLE: StatutDocument.PAS_DISPONIBLE,
  NON_DISPONIBLE: StatutDocument.PAS_DISPONIBLE,
  INDISPONIBLE: StatutDocument.PAS_DISPONIBLE,
  EN_ATTENTE: StatutDocument.PAS_DISPONIBLE,
  RETIRE: StatutDocument.RETIRE,
  RETIREE: StatutDocument.RETIRE,
};

const DIPLOME_ALIASES: Record<string, DiplomePrincipal> = {
  BEPC: DiplomePrincipal.BEPC,
  PROBATOIRE: DiplomePrincipal.PROBATOIRE,
  PROBA: DiplomePrincipal.PROBATOIRE,
  BACCALAUREAT: DiplomePrincipal.BACCALAUREAT,
  BAC: DiplomePrincipal.BACCALAUREAT,
  BACC: DiplomePrincipal.BACCALAUREAT,
};

function normalizeEnumKey(value: string) {
  return value
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/['’]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .toUpperCase();
}

export function parseImportDocumentType(value: string) {
  return DOCUMENT_TYPE_ALIASES[normalizeEnumKey(value)] ?? null;
}

export function parseImportDocumentStatus(value: string) {
  return DOCUMENT_STATUS_ALIASES[normalizeEnumKey(value)] ?? null;
}

export function parseImportDiplomeType(value: string) {
  return DIPLOME_ALIASES[normalizeEnumKey(value)] ?? null;
}

export async function upsertStudentImportRow(
  admin: AuthenticatedUser,
  row: StudentImportRow,
  contextLabel = "Enregistrement",
): Promise<StudentImportResult> {
  const matricule = row.matricule.trim().toUpperCase();
  const email = row.email.trim().toLowerCase();
  const nom = row.nom.trim();
  const prenom = row.prenom.trim();

  if (!matricule || !email || !nom || !prenom) {
    throw new Error(`${contextLabel} : identité élève incomplète (matricule, email, nom, prénom).`);
  }

  const eleve = await prisma.user.upsert({
    where: { matricule },
    update: {
      email,
      nom,
      prenom,
      role: Role.ELEVE,
      nomService: null,
      dateNaissance: row.dateNaissance ?? null,
    },
    create: {
      email,
      matricule,
      nom,
      prenom,
      role: Role.ELEVE,
      dateNaissance: row.dateNaissance ?? null,
    },
  });

  let documentCreated = false;

  if (row.diplomeType) {
    assertDiplomeMatchesAdminOrganisme(admin.organismeId, row.diplomeType, contextLabel);

    const centreExamen = row.centreExamen?.trim() || null;
    const regionComposition = row.regionComposition?.trim() || "Centre";

    await prisma.examenValide.upsert({
      where: {
        eleveId_diplomeType: {
          eleveId: eleve.id,
          diplomeType: row.diplomeType,
        },
      },
      update: {
        centreExamen: centreExamen || undefined,
        regionComposition,
        anneeSession: row.anneeSession ?? undefined,
      },
      create: {
        eleveId: eleve.id,
        diplomeType: row.diplomeType,
        centreExamen,
        regionComposition,
        anneeSession: row.anneeSession ?? null,
      },
    });

    if (row.documentType) {
      const statut = row.documentStatut ?? StatutDocument.PAS_DISPONIBLE;

      if (!isDocumentRequestAllowed(row.diplomeType, row.documentType)) {
        throw new Error(
          `${contextLabel} : le document ${row.documentType} n'est pas autorisé pour ${row.diplomeType}.`,
        );
      }

      const route = resolveDocumentRoute({
        diplomeType: row.diplomeType,
        typeDocument: row.documentType,
        centreExamen,
        regionComposition,
      });

      if (!canAdminAccessDocument(admin, route)) {
        throw new Error(
          `${contextLabel} : document hors de votre antenne régionale (vérifiez region_composition et centre_examen).`,
        );
      }

      await prisma.documentAcademique.upsert({
        where: {
          eleveId_diplomeType_typeDocument: {
            eleveId: eleve.id,
            diplomeType: row.diplomeType,
            typeDocument: row.documentType,
          },
        },
        update: {
          statut,
          centreExamen: centreExamen || undefined,
          regionComposition,
          organismeId: route.organismeId,
          antenneRegionaleId: route.antenneRegionaleId,
          demandeSoumiseAt: new Date(),
        },
        create: {
          eleveId: eleve.id,
          diplomeType: row.diplomeType,
          typeDocument: row.documentType,
          statut,
          centreExamen,
          regionComposition,
          organismeId: route.organismeId,
          antenneRegionaleId: route.antenneRegionaleId,
          demandeSoumiseAt: new Date(),
        },
      });

      documentCreated = true;
    }
  }

  return {
    eleveId: eleve.id,
    documentCreated,
  };
}

export async function getAdminStudentsWhere(admin: {
  organismeId?: string | null;
  antenneRegionaleId?: string | null;
}) {
  const documentScope = getAdminDocumentScope(admin);

  if ("id" in documentScope && documentScope.id === "__none__") {
    return { role: "ELEVE" as const, id: "__none__" };
  }

  const antenne = admin.antenneRegionaleId
    ? await prisma.antenneRegionale.findUnique({
        where: { id: admin.antenneRegionaleId },
        select: { region: true },
      })
    : null;

  const orConditions: Array<Record<string, unknown>> = [
    { documentsAcademique: { some: documentScope } },
  ];

  if (antenne?.region) {
    orConditions.push({
      examensValides: { some: { regionComposition: antenne.region } },
    });
  }

  return {
    role: "ELEVE" as const,
    OR: orConditions,
  };
}
