#!/usr/bin/env npx tsx
/**
 * Exporte un CSV disponibilisation depuis la base réelle.
 * Usage: npm run export:disponibilisation-csv
 */
import "dotenv/config";

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { PrismaClient, Role, TypeDocument } from "../lib/generated/prisma/client";
import { AVAILABILITY_IMPORT_CSV_HEADER } from "../lib/admin-student-import.constants";

const prisma = new PrismaClient();
const OUT_PATH = path.join(
  process.cwd(),
  "docs",
  "imports",
  "centre",
  "obc",
  "import-disponibilisation.csv",
);

async function main() {
  const documents = await prisma.documentAcademique.findMany({
    where: {
      typeDocument: { not: TypeDocument.DUPLICATA },
      eleve: { role: Role.ELEVE },
    },
    include: {
      eleve: { select: { matricule: true, email: true } },
    },
    orderBy: [{ eleve: { matricule: "asc" } }, { diplomeType: "asc" }, { typeDocument: "asc" }],
  });

  const exams = await prisma.examenValide.findMany({
    where: {
      eleveId: { in: documents.map((d) => d.eleveId) },
    },
    select: { eleveId: true, diplomeType: true, anneeSession: true },
  });

  const sessionByKey = new Map(
    exams.map((e) => [`${e.eleveId}:${e.diplomeType}`, e.anneeSession ?? ""]),
  );

  const rows = documents
    .filter((doc) => !doc.eleve.email.endsWith("@example.com"))
    .map((doc) => {
      const session = sessionByKey.get(`${doc.eleveId}:${doc.diplomeType}`) ?? "";
      return [doc.eleve.matricule, doc.diplomeType, doc.typeDocument, session].join(",");
    });

  await mkdir(path.dirname(OUT_PATH), { recursive: true });
  await writeFile(OUT_PATH, [AVAILABILITY_IMPORT_CSV_HEADER, ...rows].join("\n") + "\n", "utf8");

  console.log(`Export termine: ${rows.length} ligne(s) -> ${OUT_PATH}`);
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
