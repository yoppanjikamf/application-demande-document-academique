#!/usr/bin/env npx tsx
/**
 * Remet la base en état « démo soutenance » propre :
 * - supprime les élèves @example.com
 * - désactive tous les comptes élèves (authUserId = null)
 * - remet tous les documents à PAS_DISPONIBLE
 * - supprime RDV / paiements / duplicatas liés aux élèves conservés
 * - exporte les CSV d'import depuis la base réelle
 *
 * Usage: npm run reset:imports
 */
import "dotenv/config";

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import {
  PrismaClient,
  Role,
  StatutDocument,
  TypeDocument,
} from "../lib/generated/prisma/client";
import {
  AVAILABILITY_IMPORT_CSV_HEADER,
  STUDENT_IMPORT_CSV_HEADER,
} from "../lib/admin-student-import.constants";
import { createSupabaseAdminClient } from "../lib/supabase/admin";

const prisma = new PrismaClient();
const IMPORTS_DIR = path.join(process.cwd(), "docs", "imports", "centre", "obc");

function isRealStudentEmail(email: string) {
  const normalized = email.trim().toLowerCase();
  return (
    normalized.length > 0 &&
    !normalized.endsWith("@example.com") &&
    !normalized.endsWith("@test.com") &&
    !normalized.endsWith("@localhost")
  );
}

function csvEscape(value: string | number | null | undefined) {
  const text = value === null || value === undefined ? "" : String(value);
  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

function formatDate(date: Date | null | undefined) {
  if (!date) {
    return "";
  }
  return date.toISOString().slice(0, 10);
}

async function deleteSupabaseAuthUser(authUserId: string | null | undefined) {
  if (!authUserId) {
    return;
  }

  try {
    const supabase = createSupabaseAdminClient();
    await supabase.auth.admin.deleteUser(authUserId);
  } catch (error) {
    console.warn(
      `Supabase: impossible de supprimer ${authUserId}:`,
      error instanceof Error ? error.message : error,
    );
  }
}

async function purgeStudentData(studentIds: string[]) {
  if (studentIds.length === 0) {
    return;
  }

  const studentIdsSql = studentIds.map((id) => `'${id}'`).join(", ");
  const documentIdsSql = `
    select "id" from "documents"
    where "eleveId" in (${studentIdsSql})
  `;
  const duplicataIdsSql = `
    select "id" from "duplicatas"
    where "eleveId" in (${studentIdsSql})
  `;
  const paiementIdsSql = `
    select "id" from "paiements"
    where "documentAcademiqueId" in (${documentIdsSql})
       or "duplicataId" in (${duplicataIdsSql})
  `;

  await prisma.$executeRawUnsafe(`
    delete from "rendez_vous"
    where "eleveId" in (${studentIdsSql})
       or "documentId" in (${documentIdsSql})
  `);
  await prisma.$executeRawUnsafe(`
    delete from "recus"
    where "userId" in (${studentIdsSql})
       or "paiementId" in (${paiementIdsSql})
  `);
  await prisma.$executeRawUnsafe(`delete from "mail_logs" where "userId" in (${studentIdsSql})`);
  await prisma.$executeRawUnsafe(`delete from "notifications" where "userId" in (${studentIdsSql})`);
  await prisma.$executeRawUnsafe(`
    delete from "pieces_duplicata"
    where "duplicataId" in (${duplicataIdsSql})
  `);
  await prisma.$executeRawUnsafe(`
    delete from "releves"
    where "documentAcademiqueId" in (${documentIdsSql})
       or "duplicataId" in (${duplicataIdsSql})
  `);
  await prisma.$executeRawUnsafe(`
    delete from "diplomes"
    where "documentAcademiqueId" in (${documentIdsSql})
       or "duplicataId" in (${duplicataIdsSql})
  `);
  await prisma.$executeRawUnsafe(`delete from "paiements" where "id" in (${paiementIdsSql})`);
  await prisma.$executeRawUnsafe(`delete from "documents" where "eleveId" in (${studentIdsSql})`);
  await prisma.$executeRawUnsafe(`delete from "duplicatas" where "eleveId" in (${studentIdsSql})`);
  await prisma.$executeRawUnsafe(`delete from "examens_valides" where "eleveId" in (${studentIdsSql})`);
  await prisma.$executeRawUnsafe(`delete from "users" where "id" in (${studentIdsSql})`);
}

async function resetKeptStudents(studentIds: string[]) {
  if (studentIds.length === 0) {
    return;
  }

  const authUsers = await prisma.user.findMany({
    where: { id: { in: studentIds }, authUserId: { not: null } },
    select: { authUserId: true },
  });

  for (const row of authUsers) {
    await deleteSupabaseAuthUser(row.authUserId);
  }

  await prisma.user.updateMany({
    where: { id: { in: studentIds } },
    data: { authUserId: null, derniereConnexion: null },
  });

  const documentIdsSql = `
    select "id" from "documents"
    where "eleveId" in (${studentIds.map((id) => `'${id}'`).join(", ")})
  `;
  const duplicataIdsSql = `
    select "id" from "duplicatas"
    where "eleveId" in (${studentIds.map((id) => `'${id}'`).join(", ")})
  `;
  const paiementIdsSql = `
    select "id" from "paiements"
    where "documentAcademiqueId" in (${documentIdsSql})
       or "duplicataId" in (${duplicataIdsSql})
  `;

  await prisma.$executeRawUnsafe(`
    delete from "rendez_vous"
    where "eleveId" in (${studentIds.map((id) => `'${id}'`).join(", ")})
       or "documentId" in (${documentIdsSql})
  `);
  await prisma.$executeRawUnsafe(`
    delete from "recus"
    where "userId" in (${studentIds.map((id) => `'${id}'`).join(", ")})
       or "paiementId" in (${paiementIdsSql})
  `);
  await prisma.$executeRawUnsafe(`
    delete from "notifications"
    where "userId" in (${studentIds.map((id) => `'${id}'`).join(", ")})
  `);
  await prisma.$executeRawUnsafe(`delete from "paiements" where "id" in (${paiementIdsSql})`);
  await prisma.$executeRawUnsafe(`delete from "duplicatas" where "eleveId" in (${studentIds.map((id) => `'${id}'`).join(", ")})`);

  await prisma.documentAcademique.updateMany({
    where: { eleveId: { in: studentIds } },
    data: {
      statut: StatutDocument.PAS_DISPONIBLE,
      demandeSoumiseAt: null,
      paiementId: null,
      releveId: null,
      diplomeId: null,
    },
  });
}

async function exportImportsFromDatabase() {
  const students = await prisma.user.findMany({
    where: { role: Role.ELEVE },
    include: {
      documentsAcademique: {
        where: { typeDocument: { not: TypeDocument.DUPLICATA } },
        orderBy: [{ diplomeType: "asc" }, { typeDocument: "asc" }],
      },
      examensValides: true,
    },
    orderBy: { matricule: "asc" },
  });

  const disponibilisationRows: string[] = [];
  for (const student of students) {
    for (const doc of student.documentsAcademique) {
      const exam = student.examensValides.find((e) => e.diplomeType === doc.diplomeType);
      disponibilisationRows.push(
        [
          csvEscape(student.matricule),
          csvEscape(doc.diplomeType),
          csvEscape(doc.typeDocument),
          csvEscape(exam?.anneeSession ?? ""),
        ].join(","),
      );
    }
  }

  const ajoutRows = [
    [
      "DEMO2026006",
      "nouvel.eleve6@facsciences-uy1.cm",
      "TCHOUA",
      "Marie",
      "2005-03-18",
      "PROBATOIRE",
      "2025",
      "Centre d'examen Centre",
      "Centre",
      "RELEVE_NOTES",
    ],
    [
      "DEMO2026007",
      "nouvel.eleve7@facsciences-uy1.cm",
      "NDONGO",
      "Alice",
      "2005-03-14",
      "BACCALAUREAT",
      "2025",
      "Centre d'examen Centre",
      "Centre",
      "RELEVE_NOTES",
    ],
  ].map((row) => row.map(csvEscape).join(","));

  const elevesReferenceRows = students.map((student) => {
    const examLabels = student.examensValides
      .map((exam) => `${exam.diplomeType} ${exam.anneeSession ?? ""}`.trim())
      .join(" / ");
    const centre = student.examensValides[0]?.centreExamen ?? "";
    const region = student.examensValides[0]?.regionComposition ?? "";
    return [
      csvEscape(student.matricule),
      csvEscape(student.email),
      csvEscape(student.nom),
      csvEscape(student.prenom),
      csvEscape(formatDate(student.dateNaissance)),
      csvEscape(examLabels),
      csvEscape(centre),
      csvEscape(region),
    ].join(",");
  });

  await mkdir(IMPORTS_DIR, { recursive: true });
  await mkdir(path.join(process.cwd(), "public", "templates", "obc"), { recursive: true });

  const disponibilisationPath = path.join(IMPORTS_DIR, "import-disponibilisation.csv");
  const ajoutPath = path.join(IMPORTS_DIR, "import-ajout-eleves.csv");
  const referencePath = path.join(process.cwd(), "docs", "imports", "eleves-en-base.csv");
  const templateDispo = path.join(process.cwd(), "public", "templates", "obc", "import-disponibilisation.csv");
  const templateAjout = path.join(process.cwd(), "public", "templates", "obc", "import-eleves.csv");

  const disponibilisationContent = [AVAILABILITY_IMPORT_CSV_HEADER, ...disponibilisationRows].join("\n") + "\n";
  const ajoutContent = [STUDENT_IMPORT_CSV_HEADER, ...ajoutRows].join("\n") + "\n";
  const referenceHeader =
    "matricule,email,nom,prenom,date_naissance,examens_valides,centre_examen,region_composition";
  const referenceContent = [referenceHeader, ...elevesReferenceRows].join("\n") + "\n";

  await writeFile(disponibilisationPath, disponibilisationContent, "utf8");
  await writeFile(ajoutPath, ajoutContent, "utf8");
  await writeFile(referencePath, referenceContent, "utf8");
  await writeFile(templateDispo, disponibilisationContent, "utf8");
  await writeFile(templateAjout, [STUDENT_IMPORT_CSV_HEADER, ajoutRows[0] ?? ""].join("\n") + "\n", "utf8");

  return {
    students: students.length,
    disponibilisationLines: disponibilisationRows.length,
    ajoutLines: ajoutRows.length,
    disponibilisationPath,
    ajoutPath,
    referencePath,
  };
}

async function main() {
  const allStudents = await prisma.user.findMany({
    where: { role: Role.ELEVE },
    select: { id: true, matricule: true, email: true, authUserId: true },
  });

  const toDelete = allStudents.filter((student) => !isRealStudentEmail(student.email));
  const toKeep = allStudents.filter((student) => isRealStudentEmail(student.email));

  console.log(`Élèves en base : ${allStudents.length}`);
  console.log(`  → conservés (email réel) : ${toKeep.length}`);
  console.log(`  → supprimés (email démo) : ${toDelete.length}`);

  if (toDelete.length > 0) {
    await purgeStudentData(toDelete.map((student) => student.id));
  }

  if (toKeep.length > 0) {
    await resetKeptStudents(toKeep.map((student) => student.id));
  }

  const exportResult = await exportImportsFromDatabase();

  const docStats = await prisma.documentAcademique.groupBy({ by: ["statut"], _count: true });
  const activated = await prisma.user.count({
    where: { role: Role.ELEVE, authUserId: { not: null } },
  });

  console.log("\nÉtat final :");
  console.log(`  Élèves actifs (auth) : ${activated}`);
  console.log(`  Documents par statut :`, docStats);
  console.log(`  Disponibilisation : ${exportResult.disponibilisationLines} ligne(s) → ${exportResult.disponibilisationPath}`);
  console.log(`  Ajout élèves : ${exportResult.ajoutLines} ligne(s) exemple → ${exportResult.ajoutPath}`);
  console.log(`  Référence élèves en base → ${exportResult.referencePath}`);
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
