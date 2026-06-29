#!/usr/bin/env npx tsx
/**
 * Teste automatiquement les imports CSV admin (OBC + DECC).
 * Usage: npm run test:imports
 */
import "dotenv/config";

import { readFileSync } from "node:fs";
import path from "node:path";

import {
  parseImportDiplomeType,
  parseImportDocumentType,
  upsertStudentImportRow,
  type StudentImportRow,
} from "../lib/admin-student-import";
import { importDocumentAvailabilityFromCsv } from "../lib/document-availability-import";
import type { AuthenticatedUser } from "../lib/auth";
import {
  getCsvValue,
  getRowLabel,
  normalizeCsvText,
  normalizeCsvUpper,
  parseAdminCsv,
  parseCsvDate,
} from "../lib/csv-import-parser";
import { PrismaClient, StatutDocument } from "../lib/generated/prisma/client";

const prisma = new PrismaClient();
const IMPORTS = path.join(process.cwd(), "docs", "imports");

const REQUIRED_STUDENT_FIELDS = [
  "eleve_matricule",
  "eleve_email",
  "eleve_nom",
  "eleve_prenom",
] as const;

type StepResult = {
  label: string;
  ok: boolean;
  detail: string;
  errors?: string[];
};

function readCsv(relativePath: string) {
  const filePath = path.join(IMPORTS, relativePath);
  const content = readFileSync(filePath, "utf8");
  return {
    filePath,
    content,
    lineCount: Math.max(0, content.trim().split("\n").length - 1),
  };
}

function formatAvailabilityResult(result: Awaited<ReturnType<typeof importDocumentAvailabilityFromCsv>>) {
  return `traités=${result.processed}, mis à jour=${result.updated}, créés=${result.created}, déjà dispo=${result.alreadyAvailable}, notifiés=${result.notified}, erreurs=${result.errors.length}`;
}

function formatStudentResult(result: {
  rowsCount: number;
  documentsCount: number;
  studentsCount: number;
  errors: string[];
}) {
  return `lignes=${result.rowsCount}, documents=${result.documentsCount}, élèves=${result.studentsCount}, erreurs=${result.errors.length}`;
}

async function importStudentsFromCsv(csvContent: string, admin: AuthenticatedUser) {
  const { rows, missingRequiredFields } = parseAdminCsv(csvContent, REQUIRED_STUDENT_FIELDS);

  if (rows.length === 0) {
    throw new Error("CSV vide ou invalide.");
  }

  if (missingRequiredFields.length > 0) {
    throw new Error(`Colonnes obligatoires manquantes : ${missingRequiredFields.join(", ")}.`);
  }

  let rowsCount = 0;
  let documentsCount = 0;
  const studentMatricules = new Set<string>();
  const errors: string[] = [];

  for (const row of rows) {
    const matricule = normalizeCsvUpper(getCsvValue(row, "eleve_matricule"));
    const rowLabel = getRowLabel(row, matricule);

    try {
      const diplomeValue = getCsvValue(row, "diplome_type");
      const typeDocumentValue = getCsvValue(row, "document_type");
      const sessionValue = getCsvValue(row, "annee_session");
      const parsedSession = sessionValue ? Number(sessionValue) : null;

      const importRow: StudentImportRow = {
        matricule,
        email: normalizeCsvText(getCsvValue(row, "eleve_email")).toLowerCase(),
        nom: normalizeCsvText(getCsvValue(row, "eleve_nom")),
        prenom: normalizeCsvText(getCsvValue(row, "eleve_prenom")),
        dateNaissance: parseCsvDate(getCsvValue(row, "eleve_date_naissance")),
        diplomeType: diplomeValue ? (parseImportDiplomeType(diplomeValue) ?? undefined) : undefined,
        anneeSession:
          parsedSession && !Number.isNaN(parsedSession) ? Math.trunc(parsedSession) : null,
        centreExamen: normalizeCsvText(getCsvValue(row, "centre_examen")) || undefined,
        regionComposition: normalizeCsvText(getCsvValue(row, "region_composition") || "Centre"),
      };

      if (importRow.diplomeType === undefined && diplomeValue) {
        throw new Error(`${rowLabel}: type de diplôme invalide "${diplomeValue}".`);
      }

      if (typeDocumentValue) {
        const type = parseImportDocumentType(typeDocumentValue);
        if (!type) {
          throw new Error(`${rowLabel}: type de document invalide "${typeDocumentValue}".`);
        }
        if (!importRow.diplomeType) {
          throw new Error(
            `${rowLabel}: diplome_type est obligatoire lorsque document_type est renseigné.`,
          );
        }
        importRow.documentType = type;
        importRow.documentStatut = StatutDocument.PAS_DISPONIBLE;
      }

      const result = await upsertStudentImportRow(admin, importRow, rowLabel);
      rowsCount += 1;
      if (matricule) {
        studentMatricules.add(matricule);
      }
      if (result.documentCreated) {
        documentsCount += 1;
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : `${rowLabel} : erreur inconnue.`;
      errors.push(message);
    }
  }

  if (studentMatricules.size === 0) {
    throw new Error(
      errors.length > 0
        ? errors.slice(0, 3).join(" ")
        : "Aucun élève enregistré depuis le CSV.",
    );
  }

  return {
    rowsCount,
    documentsCount,
    studentsCount: studentMatricules.size,
    errors,
  };
}

async function runStep(
  label: string,
  run: () => Promise<{ errors: string[]; summary: string }>,
): Promise<StepResult> {
  console.log(`\n▶ ${label}`);
  try {
    const { errors, summary } = await run();
    const ok = errors.length === 0;
    console.log(ok ? `  ✓ ${summary}` : `  ✗ ${summary}`);
    if (errors.length > 0) {
      for (const err of errors.slice(0, 5)) {
        console.log(`    - ${err}`);
      }
    }
    return { label, ok, detail: summary, errors };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.log(`  ✗ ${message}`);
    return { label, ok: false, detail: message, errors: [message] };
  }
}

async function main() {
  const obcAdmin = await prisma.user.findUnique({ where: { matricule: "ADM-02-CENTRE" } });
  const deccAdmin = await prisma.user.findUnique({ where: { matricule: "DECC-02-CENTRE" } });

  if (!obcAdmin) {
    throw new Error("Admin ADM-02-CENTRE introuvable. Lancez npm run seed:regional-admins.");
  }
  if (!deccAdmin) {
    throw new Error("Admin DECC-02-CENTRE introuvable. Lancez npm run seed:decc-admins.");
  }

  const results: StepResult[] = [];

  results.push(
    await runStep("OBC — disponibilisation", async () => {
      const { content, lineCount } = readCsv("centre/obc/import-disponibilisation.csv");
      const result = await importDocumentAvailabilityFromCsv(content, obcAdmin);
      return {
        errors: result.errors,
        summary: `${lineCount} ligne(s) CSV — ${formatAvailabilityResult(result)}`,
      };
    }),
  );

  results.push(
    await runStep("DECC — disponibilisation", async () => {
      const { content, lineCount } = readCsv("centre/decc/import-disponibilisation.csv");
      if (lineCount === 0) {
        return { errors: [], summary: "CSV vide (aucun BEPC en base)" };
      }
      const result = await importDocumentAvailabilityFromCsv(content, deccAdmin);
      return {
        errors: result.errors,
        summary: `${lineCount} ligne(s) CSV — ${formatAvailabilityResult(result)}`,
      };
    }),
  );

  results.push(
    await runStep("OBC — ajout élèves", async () => {
      const { content, lineCount } = readCsv("centre/obc/import-ajout-eleves.csv");
      const result = await importStudentsFromCsv(content, obcAdmin);
      return {
        errors: result.errors,
        summary: `${lineCount} ligne(s) CSV — ${formatStudentResult(result)}`,
      };
    }),
  );

  results.push(
    await runStep("DECC — ajout élève BEPC", async () => {
      const { content, lineCount } = readCsv("centre/decc/import-ajout-eleves.csv");
      const result = await importStudentsFromCsv(content, deccAdmin);
      return {
        errors: result.errors,
        summary: `${lineCount} ligne(s) CSV — ${formatStudentResult(result)}`,
      };
    }),
  );

  const docs = await prisma.documentAcademique.groupBy({
    by: ["statut"],
    _count: true,
  });
  const eleves = await prisma.user.count({ where: { role: "ELEVE" } });

  console.log("\n── État final ──");
  console.log(`  Élèves en base : ${eleves}`);
  console.log(`  Documents par statut : ${JSON.stringify(docs)}`);

  const failed = results.filter((r) => !r.ok);
  console.log(
    failed.length === 0
      ? "\n✅ Tous les imports ont réussi."
      : `\n❌ ${failed.length} import(s) en échec : ${failed.map((r) => r.label).join(", ")}`,
  );

  if (failed.length > 0) {
    process.exitCode = 1;
  }
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
