import type { AuthenticatedUser } from "@/lib/auth";
import {
  getAdminDocumentScope,
  isDocumentRequestAllowed,
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
import { applyDocumentStatusTransition, assertAdminCanManageDocument } from "@/lib/document-status-transition";
import { prisma } from "@/lib/prisma";
import { Role, StatutDocument, TypeDocument } from "@/lib/generated/prisma/client";

export const AVAILABILITY_IMPORT_REQUIRED_FIELDS: readonly CsvField[] = [
  "eleve_matricule",
  "diplome_type",
  "document_type",
];

export type AvailabilityImportResult = {
  processed: number;
  updated: number;
  alreadyAvailable: number;
  notified: number;
  errors: string[];
};

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

  const documentScope = getAdminDocumentScope(admin);
  const result: AvailabilityImportResult = {
    processed: 0,
    updated: 0,
    alreadyAvailable: 0,
    notified: 0,
    errors: [],
  };

  for (const row of rows) {
    result.processed += 1;

    const matricule = normalizeCsvUpper(getCsvValue(row, "eleve_matricule"));
    const rowLabel = getRowLabel(row, matricule);
    const diplomeValue = getCsvValue(row, "diplome_type");
    const documentTypeValue = getCsvValue(row, "document_type");

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

      const eleve = await prisma.user.findUnique({
        where: { matricule },
        select: { id: true, role: true, email: true, matricule: true },
      });

      if (!eleve || eleve.role !== Role.ELEVE) {
        throw new Error(`${rowLabel} : élève introuvable (${matricule}).`);
      }

      const document = await prisma.documentAcademique.findFirst({
        where: {
          eleveId: eleve.id,
          diplomeType,
          typeDocument: documentType,
          ...documentScope,
        },
        include: {
          eleve: {
            select: { id: true, email: true, matricule: true },
          },
        },
      });

      if (!document) {
        throw new Error(
          `${rowLabel} : document ${documentType} (${diplomeType}) introuvable pour ${matricule}.`,
        );
      }

      assertAdminCanManageDocument(admin, document);

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
    } catch (error) {
      const message = error instanceof Error ? error.message : `${rowLabel} : erreur inconnue.`;
      result.errors.push(message);
    }
  }

  return result;
}
