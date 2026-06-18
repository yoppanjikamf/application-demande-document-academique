import type { AuthenticatedUser } from "@/lib/auth";
import {
  canAdminAccessDocument,
  getCentreExamenForRegion,
  isDocumentRequestAllowed,
  resolveDocumentRoute,
} from "@/lib/document-routing";
import {
  getCsvValue,
  getRowLabel,
  normalizeCsvUpper,
  parseAdminCsv,
  type CsvField,
  CSV_FIELD_LABELS,
} from "@/lib/csv-import-parser";
import {
  parseImportDiplomeType,
  parseImportDocumentType,
} from "@/lib/admin-student-import";
import { assertDiplomeMatchesAdminOrganisme } from "@/lib/import-organisme-guard";
import { applyDocumentStatusTransition, assertAdminCanManageDocument } from "@/lib/document-status-transition";
import { prisma } from "@/lib/prisma";
import {
  DiplomePrincipal,
  Role,
  StatutDocument,
  TypeDocument,
} from "@/lib/generated/prisma/client";

export const AVAILABILITY_IMPORT_REQUIRED_FIELDS: readonly CsvField[] = [
  "eleve_matricule",
  "diplome_type",
  "document_type",
];

export type AvailabilityImportResult = {
  processed: number;
  created: number;
  updated: number;
  alreadyAvailable: number;
  notified: number;
  errors: string[];
  warnings: string[];
};

type EleveRef = {
  id: string;
  email: string;
  matricule: string;
};

function parseOptionalSession(value: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }
  const parsed = Number(trimmed);
  return Number.isNaN(parsed) ? null : Math.trunc(parsed);
}

async function ensureDocumentForAvailabilityImport({
  admin,
  eleve,
  diplomeType,
  documentType,
  anneeSession,
  regionFromCsv,
  centreFromCsv,
  rowLabel,
}: {
  admin: AuthenticatedUser;
  eleve: EleveRef;
  diplomeType: DiplomePrincipal;
  documentType: TypeDocument;
  anneeSession: number | null;
  regionFromCsv: string;
  centreFromCsv: string;
  rowLabel: string;
}) {
  const antenne = admin.antenneRegionaleId
    ? await prisma.antenneRegionale.findUnique({
        where: { id: admin.antenneRegionaleId },
        select: { region: true },
      })
    : null;

  const existingExam = await prisma.examenValide.findUnique({
    where: {
      eleveId_diplomeType: {
        eleveId: eleve.id,
        diplomeType,
      },
    },
  });

  const regionComposition =
    regionFromCsv.trim() || existingExam?.regionComposition || antenne?.region || "Centre";
  const regionalCentre = getCentreExamenForRegion(regionComposition);
  const centreExamen =
    centreFromCsv.trim() ||
    existingExam?.centreExamen ||
    regionalCentre?.nom ||
    `Centre d'examen ${regionComposition}`;
  const sessionYear = anneeSession ?? existingExam?.anneeSession ?? null;

  await prisma.examenValide.upsert({
    where: {
      eleveId_diplomeType: {
        eleveId: eleve.id,
        diplomeType,
      },
    },
    update: {
      centreExamen,
      regionComposition,
      ...(sessionYear !== null ? { anneeSession: sessionYear } : {}),
    },
    create: {
      eleveId: eleve.id,
      diplomeType,
      centreExamen,
      regionComposition,
      anneeSession: sessionYear,
    },
  });

  const route = resolveDocumentRoute({
    diplomeType,
    typeDocument: documentType,
    centreExamen,
    regionComposition,
  });

  if (!canAdminAccessDocument(admin, route)) {
    throw new Error(
      `${rowLabel} : document hors de votre périmètre (${route.organismeName} — utilisez l'admin ${route.organismeName} de la région).`,
    );
  }

  return prisma.documentAcademique.create({
    data: {
      eleveId: eleve.id,
      diplomeType,
      typeDocument: documentType,
      statut: StatutDocument.PAS_DISPONIBLE,
      centreExamen,
      regionComposition,
      organismeId: route.organismeId,
      antenneRegionaleId: route.antenneRegionaleId,
      demandeSoumiseAt: new Date(),
    },
    include: {
      eleve: {
        select: { id: true, email: true, matricule: true },
      },
    },
  });
}

export async function importDocumentAvailabilityFromCsv(
  csvContent: string,
  admin: AuthenticatedUser,
): Promise<AvailabilityImportResult> {
  if (admin.role !== Role.ADMINISTRATEUR) {
    throw new Error("Accès refusé.");
  }

  const { rows, missingRequiredFields } = parseAdminCsv(
    csvContent,
    AVAILABILITY_IMPORT_REQUIRED_FIELDS,
  );

  if (rows.length === 0) {
    throw new Error("CSV vide ou invalide.");
  }

  if (missingRequiredFields.length > 0) {
    const missingLabels = missingRequiredFields.map((field) => CSV_FIELD_LABELS[field]).join(", ");
    throw new Error(`Colonnes obligatoires non reconnues : ${missingLabels}.`);
  }

  const result: AvailabilityImportResult = {
    processed: 0,
    created: 0,
    updated: 0,
    alreadyAvailable: 0,
    notified: 0,
    errors: [],
    warnings: [],
  };

  for (const row of rows) {
    result.processed += 1;

    const matricule = normalizeCsvUpper(getCsvValue(row, "eleve_matricule"));
    const rowLabel = getRowLabel(row, matricule);
    const diplomeValue = getCsvValue(row, "diplome_type");
    const documentTypeValue = getCsvValue(row, "document_type");
    const anneeSession = parseOptionalSession(getCsvValue(row, "annee_session"));
    const regionFromCsv = getCsvValue(row, "region_composition");
    const centreFromCsv = getCsvValue(row, "centre_examen");

    try {
      if (!matricule) {
        throw new Error(`${rowLabel} : matricule manquant.`);
      }

      const diplomeType = parseImportDiplomeType(diplomeValue);
      if (!diplomeType) {
        throw new Error(`${rowLabel} : type de diplôme invalide "${diplomeValue}".`);
      }

      const documentType = parseImportDocumentType(documentTypeValue);
      if (!documentType) {
        throw new Error(`${rowLabel} : type de document invalide "${documentTypeValue}".`);
      }

      if (documentType === TypeDocument.DUPLICATA) {
        throw new Error(
          `${rowLabel} : les duplicatas ne sont pas disponibilisés via cette importation.`,
        );
      }

      if (!isDocumentRequestAllowed(diplomeType, documentType)) {
        throw new Error(
          `${rowLabel} : le document ${documentType} n'est pas autorisé pour ${diplomeType}.`,
        );
      }

      assertDiplomeMatchesAdminOrganisme(admin.organismeId, diplomeType, rowLabel);

      const eleve = await prisma.user.findUnique({
        where: { matricule },
        select: { id: true, role: true, email: true, matricule: true },
      });

      if (!eleve || eleve.role !== Role.ELEVE) {
        throw new Error(`${rowLabel} : élève introuvable (${matricule}).`);
      }

      let document = await prisma.documentAcademique.findFirst({
        where: {
          eleveId: eleve.id,
          diplomeType,
          typeDocument: documentType,
        },
        include: {
          eleve: {
            select: { id: true, email: true, matricule: true },
          },
        },
      });

      if (!document) {
        document = await ensureDocumentForAvailabilityImport({
          admin,
          eleve,
          diplomeType,
          documentType,
          anneeSession,
          regionFromCsv,
          centreFromCsv,
          rowLabel,
        });
        result.created += 1;
      } else {
        assertAdminCanManageDocument(admin, document);
      }

      if (document.statut === StatutDocument.DISPONIBLE) {
        result.alreadyAvailable += 1;
        continue;
      }

      if (document.statut === StatutDocument.RETIRE) {
        throw new Error(`${rowLabel} : document déjà retiré, disponibilisation impossible.`);
      }

      const transition = await applyDocumentStatusTransition({
        document,
        nextStatus: StatutDocument.DISPONIBLE,
        adminUserId: admin.id,
      });

      result.updated += 1;
      if (transition.notified) {
        result.notified += 1;
      }
      if (transition.emailWarning) {
        result.warnings.push(`${rowLabel} : ${transition.emailWarning}`);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : `${rowLabel} : erreur inconnue.`;
      result.errors.push(message);
    }
  }

  return result;
}
