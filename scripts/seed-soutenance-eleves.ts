import "dotenv/config";

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { PrismaClient, Role, type DiplomePrincipal } from "../lib/generated/prisma/client";
import { ORGANISME_IDS, REGIONAL_ANTENNAS } from "../lib/document-routing";

function getPrismaDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    return undefined;
  }

  const url = new URL(databaseUrl);
  url.searchParams.set("connection_limit", "1");
  url.searchParams.set("pool_timeout", "60");

  return url.toString();
}

const prisma = new PrismaClient({ datasourceUrl: getPrismaDatabaseUrl() });

type DemoStudent = {
  matricule: string;
  email: string;
  nom: string;
  prenom: string;
  dateNaissance: Date;
  centreExamen: string;
  regionComposition: string;
};

const DEMO_STUDENTS: DemoStudent[] = [
  {
    matricule: "DEMO2026001",
    email: "francialengambia@gmail.com",
    nom: "NGAMBIA",
    prenom: "Françial",
    dateNaissance: new Date("2003-02-14T00:00:00.000Z"),
    centreExamen: "Centre d'examen Centre",
    regionComposition: "Centre",
  },
  {
    matricule: "DEMO2026002",
    email: "faissayoppanjikam@gmail.com",
    nom: "NJIKAM",
    prenom: "Faïssa",
    dateNaissance: new Date("2004-05-20T00:00:00.000Z"),
    centreExamen: "Centre d'examen Centre",
    regionComposition: "Centre",
  },
  {
    matricule: "DEMO2026003",
    email: "eyaanemesselehelenedoucette@gmail.com",
    nom: "MESSELE",
    prenom: "Doucette",
    dateNaissance: new Date("2003-09-08T00:00:00.000Z"),
    centreExamen: "Centre d'examen Centre",
    regionComposition: "Centre",
  },
  {
    matricule: "DEMO2026004",
    email: "ambiankeu@gmail.com",
    nom: "MBIANKEU",
    prenom: "Anicet",
    dateNaissance: new Date("2002-11-27T00:00:00.000Z"),
    centreExamen: "Centre d'examen Centre",
    regionComposition: "Centre",
  },
  {
    matricule: "DEMO2026005",
    email: "prince.mabengue@facsciences-uy1.cm",
    nom: "MABENGUE",
    prenom: "Prince",
    dateNaissance: new Date("2003-07-03T00:00:00.000Z"),
    centreExamen: "Centre d'examen Centre",
    regionComposition: "Centre",
  },
];

const EXAMS: Array<{ diplomeType: DiplomePrincipal; anneeSession: number }> = [
  { diplomeType: "BEPC", anneeSession: 2019 },
  { diplomeType: "PROBATOIRE", anneeSession: 2021 },
  { diplomeType: "BACCALAUREAT", anneeSession: 2022 },
];

const CSV_PATH = path.join(process.cwd(), "docs", "imports", "eleves-en-base.csv");

function formatDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function csvEscape(value: string | number | null | undefined) {
  const text = value === null || value === undefined ? "" : String(value);
  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

async function ensureOrganismesAndAntennes() {
  await prisma.organisme.upsert({
    where: { id: ORGANISME_IDS.OBC },
    update: { nom: "OBC" },
    create: { id: ORGANISME_IDS.OBC, nom: "OBC" },
  });
  await prisma.organisme.upsert({
    where: { id: ORGANISME_IDS.DECC },
    update: { nom: "DECC" },
    create: { id: ORGANISME_IDS.DECC, nom: "DECC" },
  });

  for (const antenne of REGIONAL_ANTENNAS) {
    await prisma.antenneRegionale.upsert({
      where: { id: antenne.id },
      update: {
        nom: antenne.nom,
        region: antenne.region,
        ville: antenne.ville,
        organismeId: antenne.organismeId,
      },
      create: {
        id: antenne.id,
        nom: antenne.nom,
        region: antenne.region,
        ville: antenne.ville,
        organismeId: antenne.organismeId,
      },
    });
  }
}

async function resetStudents() {
  const studentIdsSql = `select "id" from "users" where "role" = 'ELEVE'`;
  const documentIdsSql = `
    select "documents"."id"
    from "documents"
    where "documents"."eleveId" in (${studentIdsSql})
  `;
  const duplicataIdsSql = `
    select "duplicatas"."id"
    from "duplicatas"
    where "duplicatas"."eleveId" in (${studentIdsSql})
  `;
  const paiementIdsSql = `
    select "paiements"."id"
    from "paiements"
    where "paiements"."documentAcademiqueId" in (${documentIdsSql})
       or "paiements"."duplicataId" in (${duplicataIdsSql})
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
  await prisma.$executeRawUnsafe(`
    delete from "notifications"
    where "userId" in (${studentIdsSql})
  `);
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
  await prisma.$executeRawUnsafe(`delete from "documents" where "id" in (${documentIdsSql})`);
  await prisma.$executeRawUnsafe(`delete from "duplicatas" where "id" in (${duplicataIdsSql})`);
  await prisma.$executeRawUnsafe(
    `delete from "examens_valides" where "eleveId" in (${studentIdsSql})`,
  );
  await prisma.$executeRawUnsafe(`delete from "users" where "id" in (${studentIdsSql})`);
}

async function createDemoStudents() {
  for (const student of DEMO_STUDENTS) {
    const created = await prisma.user.create({
      data: {
        authUserId: null,
        email: student.email.toLowerCase(),
        matricule: student.matricule,
        nom: student.nom,
        prenom: student.prenom,
        role: Role.ELEVE,
        dateNaissance: student.dateNaissance,
        derniereConnexion: null,
        nomService: null,
        organismeId: null,
        antenneRegionaleId: null,
        centreExamenId: null,
      },
    });

    await prisma.examenValide.createMany({
      data: EXAMS.map((exam) => ({
        eleveId: created.id,
        diplomeType: exam.diplomeType,
        anneeSession: exam.anneeSession,
        centreExamen: student.centreExamen,
        regionComposition: student.regionComposition,
      })),
    });
  }
}

async function writeCsv() {
  const header = [
    "matricule",
    "email",
    "nom",
    "prenom",
    "date_naissance",
    "examens_valides",
    "centre_examen",
    "region_composition",
  ];
  const rows = DEMO_STUDENTS.map((student) => [
    student.matricule,
    student.email,
    student.nom,
    student.prenom,
    formatDate(student.dateNaissance),
    EXAMS.map((exam) => `${exam.diplomeType} ${exam.anneeSession}`).join(" / "),
    student.centreExamen,
    student.regionComposition,
  ]);

  await mkdir(path.dirname(CSV_PATH), { recursive: true });
  await writeFile(
    CSV_PATH,
    [header, ...rows].map((row) => row.map(csvEscape).join(",")).join("\n"),
    "utf8",
  );
}

async function main() {
  console.log("Preparation des organismes et antennes...");
  await ensureOrganismesAndAntennes();

  console.log("Suppression des anciens eleves et de leurs demandes...");
  await resetStudents();

  console.log("Creation des 5 eleves de soutenance...");
  await createDemoStudents();
  await writeCsv();

  const [studentCount, examCount, documentCount, duplicataCount, appointmentCount] =
    await Promise.all([
      prisma.user.count({ where: { role: Role.ELEVE } }),
      prisma.examenValide.count(),
      prisma.documentAcademique.count(),
      prisma.duplicata.count(),
      prisma.rendezVous.count(),
    ]);

  console.log("Seed soutenance termine:");
  console.log(`  Eleves: ${studentCount}`);
  console.log(`  Examens valides: ${examCount}`);
  console.log(`  Documents/demandes: ${documentCount}`);
  console.log(`  Duplicatas: ${duplicataCount}`);
  console.log(`  Rendez-vous: ${appointmentCount}`);
  console.log(`  CSV genere: ${CSV_PATH}`);
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
