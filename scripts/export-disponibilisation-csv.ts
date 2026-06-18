#!/usr/bin/env npx tsx
/**
 * Exporte un CSV Import A (disponibilisation) depuis la base reelle.
 * Usage: npm run export:disponibilisation-csv
 * Sortie: docs/import-disponibilisation-depuis-bd.csv
 */
import "dotenv/config";

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { PrismaClient, Role, StatutDocument, TypeDocument } from "../lib/generated/prisma/client";

const prisma = new PrismaClient();
const OUT_PATH = path.join(process.cwd(), "docs", "import-disponibilisation-depuis-bd.csv");

async function main() {
  const documents = await prisma.documentAcademique.findMany({
    where: {
      statut: StatutDocument.PAS_DISPONIBLE,
      typeDocument: { not: TypeDocument.DUPLICATA },
      eleve: { role: Role.ELEVE },
    },
    include: {
      eleve: { select: { matricule: true } },
    },
    orderBy: [{ eleve: { matricule: "asc" } }, { diplomeType: "asc" }, { typeDocument: "asc" }],
    take: 50,
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

  const header = "eleve_matricule,diplome_type,document_type,annee_session";
  const rows = documents.map((doc) => {
    const session = sessionByKey.get(`${doc.eleveId}:${doc.diplomeType}`) ?? "";
    return [doc.eleve.matricule, doc.diplomeType, doc.typeDocument, session].join(",");
  });

  await mkdir(path.dirname(OUT_PATH), { recursive: true });
  await writeFile(OUT_PATH, [header, ...rows].join("\n") + "\n", "utf8");

  console.log(`Export termine: ${documents.length} ligne(s) -> ${OUT_PATH}`);
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
