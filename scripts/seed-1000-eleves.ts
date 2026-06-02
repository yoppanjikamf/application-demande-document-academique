import "dotenv/config";

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import {
  DiplomePrincipal,
  PrismaClient,
  Role,
  StatutDocument,
  TypeDocument,
} from "../lib/generated/prisma/client";
import { ORGANISME_IDS, REGIONAL_ANTENNAS, resolveDocumentRoute } from "../lib/document-routing";

type StudentSeed = {
  matricule: string;
  email: string;
  nom: string;
  prenom: string;
  dateNaissance: Date;
  region: string;
  centreExamen: string;
  documents: DocumentSeed[];
};

type DocumentSeed = {
  diplomeType: DiplomePrincipal;
  typeDocument: TypeDocument;
  statut: StatutDocument;
  anneeSession: number;
};

const prisma = new PrismaClient();
const STUDENT_COUNT = 1000;
const STUDENTS_WITHOUT_DOCUMENTS = 10;
const CSV_PATH = path.join(process.cwd(), "docs", "test-data-1000-eleves.csv");
const README_PATH = path.join(process.cwd(), "docs", "test-data-1000-eleves.md");

const REAL_TEST_EMAILS = [
  "faissayoppanjikam@gmail.com",
  "fayellefouedjio@gmail.com",
  "yasminengaballa@gmail.com",
  "francialengambia@gmail.com",
  "yoppanjikamf@gmail.com",
] as const;

const REGIONS = [
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

const SURNAMES = [
  "Abanda",
  "Abega",
  "Abena",
  "Achiri",
  "Akoa",
  "Amadou",
  "Atangana",
  "Awono",
  "Balla",
  "Bamou",
  "Belinga",
  "Biya",
  "Bong",
  "Bouba",
  "Dika",
  "Djibril",
  "Djoumessi",
  "Ebanda",
  "Ekwalla",
  "Eloundou",
  "Emana",
  "Etame",
  "Essama",
  "Fankam",
  "Fofana",
  "Fotso",
  "Fouda",
  "Kamdem",
  "Kana",
  "Kengne",
  "Kouam",
  "Kouemo",
  "Mballa",
  "Mbarga",
  "Mbeng",
  "Mbida",
  "Mbiya",
  "Meka",
  "Meyo",
  "Mfeukeu",
  "Minkoa",
  "Momo",
  "Moukoko",
  "Moundi",
  "Moussa",
  "Nana",
  "Ndongo",
  "Ndzie",
  "Ngalla",
  "Ngando",
  "Ngann",
  "Ngassa",
  "Ngono",
  "Nguefack",
  "Nguemo",
  "Nguimfack",
  "Njikam",
  "Njock",
  "Njoya",
  "Nkeng",
  "Nkodo",
  "Nkou",
  "Nlend",
  "Nsame",
  "Nsangou",
  "Ntonga",
  "Omgba",
  "Owona",
  "Simo",
  "Talla",
  "Tchameni",
  "Tchinda",
  "Tchoumi",
  "Tedom",
  "Tientcheu",
  "Tsafack",
  "Tsala",
  "Wamba",
  "Yemdjo",
] as const;

const FIRST_NAMES = [
  "Aicha",
  "Aissatou",
  "Akim",
  "Alain",
  "Aminatou",
  "Ange",
  "Ariane",
  "Armel",
  "Audrey",
  "Boris",
  "Brenda",
  "Brice",
  "Carine",
  "Cedric",
  "Chancelle",
  "Christian",
  "Claire",
  "Claudia",
  "Daniel",
  "Diane",
  "Divine",
  "Doris",
  "Eliane",
  "Emmanuel",
  "Estelle",
  "Fabrice",
  "Faissa",
  "Fanta",
  "Flore",
  "Franck",
  "Gaelle",
  "Grace",
  "Hermann",
  "Ines",
  "Joel",
  "Jordan",
  "Josiane",
  "Junior",
  "Kevin",
  "Larissa",
  "Loic",
  "Madeleine",
  "Marcel",
  "Marie",
  "Martial",
  "Mireille",
  "Mohamadou",
  "Nadine",
  "Nathalie",
  "Noel",
  "Olivia",
  "Patrick",
  "Pauline",
  "Raissa",
  "Ramses",
  "Rebecca",
  "Roland",
  "Ruth",
  "Samuel",
  "Sandrine",
  "Serge",
  "Solange",
  "Stella",
  "Thierry",
  "Ulrich",
  "Vanessa",
  "Viviane",
  "Yannick",
  "Yasmine",
] as const;

const SCHOOL_PREFIXES = [
  "Lycee Bilingue",
  "Lycee Classique",
  "Lycee Moderne",
  "College Polyvalent",
  "College Adventiste",
  "College Catholique",
  "CES",
  "Lycee Technique",
] as const;

const DOCUMENT_TYPES_BY_DIPLOMA: Record<DiplomePrincipal, TypeDocument[]> = {
  BEPC: ["ORIGINAL", "RELEVE_NOTES", "DUPLICATA"],
  PROBATOIRE: ["RELEVE_NOTES", "DUPLICATA"],
  BACCALAUREAT: ["ORIGINAL", "RELEVE_NOTES", "DUPLICATA"],
};

const STATUSES = ["PAS_DISPONIBLE", "DISPONIBLE", "RETIRE"] as const;

function matriculeFor(index: number) {
  return `ELEVE${String(index).padStart(4, "0")}`;
}

function fakeEmailFor(index: number) {
  return `eleve${String(index).padStart(4, "0")}@example.com`;
}

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

function pickByIndex<const T>(items: readonly T[], index: number, offset = 0) {
  return items[(index + offset) % items.length];
}

function getDiplomaForIndex(index: number): DiplomePrincipal {
  const bucket = index % 100;
  if (bucket < 35) {
    return "BEPC";
  }
  if (bucket < 60) {
    return "PROBATOIRE";
  }
  return "BACCALAUREAT";
}

function buildDocuments(index: number): DocumentSeed[] {
  if (index > STUDENT_COUNT - STUDENTS_WITHOUT_DOCUMENTS) {
    return [];
  }

  if (index <= REAL_TEST_EMAILS.length) {
    const completedDiplomas: DiplomePrincipal[] =
      index <= 3
        ? ["BEPC", "PROBATOIRE", "BACCALAUREAT"]
        : index === 4
          ? ["BEPC", "PROBATOIRE"]
          : ["BEPC"];

    return completedDiplomas.flatMap((diplomeType, diplomaIndex) => {
      const documentTypes: TypeDocument[] =
        diplomeType === "PROBATOIRE" ? ["RELEVE_NOTES"] : ["ORIGINAL", "RELEVE_NOTES"];

      return documentTypes.map((typeDocument, documentIndex) => ({
        diplomeType,
        typeDocument,
        statut: "DISPONIBLE",
        anneeSession: 2021 + diplomaIndex + documentIndex,
      }));
    });
  }

  const diplomeType = getDiplomaForIndex(index);
  const availableTypes = DOCUMENT_TYPES_BY_DIPLOMA[diplomeType];
  const count = Math.min(availableTypes.length, 1 + (index % 3));

  return availableTypes.slice(0, count).map((typeDocument, documentIndex) => ({
    diplomeType,
    typeDocument,
    statut: STATUSES[(index + documentIndex) % STATUSES.length],
    anneeSession: 2020 + ((index + documentIndex) % 6),
  }));
}

function buildStudents() {
  const students: StudentSeed[] = [];

  for (let index = 1; index <= STUDENT_COUNT; index += 1) {
    const region = pickByIndex(REGIONS, index - 1);
    const surname = pickByIndex(SURNAMES, index - 1, Math.floor(index / 7));
    const firstName = pickByIndex(FIRST_NAMES, index - 1, Math.floor(index / 11));
    const schoolPrefix = pickByIndex(SCHOOL_PREFIXES, index - 1);

    students.push({
      matricule: matriculeFor(index),
      email: REAL_TEST_EMAILS[index - 1] ?? fakeEmailFor(index),
      nom: surname.toUpperCase(),
      prenom: firstName,
      dateNaissance: new Date(Date.UTC(2000 + (index % 9), index % 12, 1 + (index % 27))),
      region: region.region,
      centreExamen: `${schoolPrefix} de ${region.ville}`,
      documents: buildDocuments(index),
    });
  }

  return students;
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
        accessKey: antenne.accessKey,
        organismeId: antenne.organismeId,
      },
      create: {
        id: antenne.id,
        nom: antenne.nom,
        region: antenne.region,
        ville: antenne.ville,
        accessKey: antenne.accessKey,
        organismeId: antenne.organismeId,
      },
    });
  }
}

async function resetGeneratedStudents(students: StudentSeed[]) {
  const matricules = students.map((student) => student.matricule);
  const generatedUsers = await prisma.user.findMany({
    where: { matricule: { in: matricules } },
    select: { id: true },
  });
  const generatedUserIds = generatedUsers.map((user) => user.id);

  if (generatedUserIds.length > 0) {
    await resetAcademicData(generatedUserIds);
    await prisma.notification.deleteMany({ where: { userId: { in: generatedUserIds } } });
    await prisma.mailLog.deleteMany({ where: { userId: { in: generatedUserIds } } });
    await prisma.recu.deleteMany({ where: { userId: { in: generatedUserIds } } });
    await prisma.user.deleteMany({ where: { id: { in: generatedUserIds } } });
  }
}

async function resetAcademicData(userIds: string[]) {
  if (userIds.length === 0) {
    return;
  }

  const documents = await prisma.documentAcademique.findMany({
    where: { eleveId: { in: userIds } },
    select: { id: true },
  });
  const documentIds = documents.map((document) => document.id);

  if (documentIds.length > 0) {
    await prisma.rendezVous.deleteMany({
      where: { OR: [{ eleveId: { in: userIds } }, { documentId: { in: documentIds } }] },
    });
    await prisma.releve.deleteMany({ where: { documentAcademiqueId: { in: documentIds } } });
    await prisma.diplome.deleteMany({ where: { documentAcademiqueId: { in: documentIds } } });
    await prisma.paiement.deleteMany({ where: { documentAcademiqueId: { in: documentIds } } });
    await prisma.documentAcademique.deleteMany({ where: { id: { in: documentIds } } });
  } else {
    await prisma.rendezVous.deleteMany({ where: { eleveId: { in: userIds } } });
  }

  const duplicatas = await prisma.duplicata.findMany({
    where: { eleveId: { in: userIds } },
    select: { id: true },
  });
  const duplicataIds = duplicatas.map((duplicata) => duplicata.id);

  if (duplicataIds.length > 0) {
    await prisma.releve.deleteMany({ where: { duplicataId: { in: duplicataIds } } });
    await prisma.diplome.deleteMany({ where: { duplicataId: { in: duplicataIds } } });
    await prisma.paiement.deleteMany({ where: { duplicataId: { in: duplicataIds } } });
    await prisma.duplicata.deleteMany({ where: { id: { in: duplicataIds } } });
  }

  await prisma.examenValide.deleteMany({ where: { eleveId: { in: userIds } } });
}

async function ensureStudents(students: StudentSeed[]) {
  const realEmailStudents = students.slice(0, REAL_TEST_EMAILS.length);
  const generatedStudents = students.slice(REAL_TEST_EMAILS.length);

  for (const student of realEmailStudents) {
    const existingByEmail = await prisma.user.findUnique({
      where: { email: student.email },
      select: { id: true },
    });

    const data = {
      authUserId: null,
      email: student.email,
      matricule: student.matricule,
      nom: student.nom,
      prenom: student.prenom,
      role: Role.ELEVE,
      nomService: null,
      organismeId: null,
      antenneRegionaleId: null,
      dateNaissance: student.dateNaissance,
      derniereConnexion: null,
    };

    if (existingByEmail) {
      await prisma.user.update({ where: { id: existingByEmail.id }, data });
    } else {
      await prisma.user.create({ data });
    }
  }

  for (let index = 0; index < generatedStudents.length; index += 100) {
    const chunk = generatedStudents.slice(index, index + 100);
    await prisma.user.createMany({
      data: chunk.map((student) => ({
        authUserId: null,
        email: student.email,
        matricule: student.matricule,
        nom: student.nom,
        prenom: student.prenom,
        role: Role.ELEVE,
        dateNaissance: student.dateNaissance,
      })),
    });
    console.log(
      `${Math.min(index + chunk.length + realEmailStudents.length, students.length)}/${students.length} eleves crees...`,
    );
  }

  const users = await prisma.user.findMany({
    where: { matricule: { in: students.map((student) => student.matricule) } },
    select: { id: true, matricule: true },
  });

  return new Map(users.map((user) => [user.matricule, user.id]));
}

async function createAcademicData(
  students: StudentSeed[],
  userIdsByMatricule: Map<string, string>,
) {
  const examsData: {
    eleveId: string;
    diplomeType: DiplomePrincipal;
    anneeSession: number;
    centreExamen: string;
    regionComposition: string;
  }[] = [];
  const documentsData: {
    eleveId: string;
    diplomeType: DiplomePrincipal;
    typeDocument: TypeDocument;
    statut: StatutDocument;
    centreExamen: string;
    regionComposition: string;
    organismeId: string;
    antenneRegionaleId: string | null;
  }[] = [];

  for (const student of students) {
    const eleveId = userIdsByMatricule.get(student.matricule);
    if (!eleveId) {
      throw new Error(`Eleve introuvable apres creation: ${student.matricule}`);
    }

    const exams = new Map<DiplomePrincipal, DocumentSeed>();
    student.documents.forEach((document) => exams.set(document.diplomeType, document));
    exams.forEach((exam) => {
      examsData.push({
        eleveId,
        diplomeType: exam.diplomeType,
        anneeSession: exam.anneeSession,
        centreExamen: student.centreExamen,
        regionComposition: student.region,
      });
    });

    for (const document of student.documents) {
      const route = resolveDocumentRoute({
        diplomeType: document.diplomeType,
        typeDocument: document.typeDocument,
        centreExamen: student.centreExamen,
        regionComposition: student.region,
      });
      documentsData.push({
        eleveId,
        diplomeType: document.diplomeType,
        typeDocument: document.typeDocument,
        statut: document.statut,
        centreExamen: student.centreExamen,
        regionComposition: student.region,
        organismeId: route.organismeId,
        antenneRegionaleId: route.antenneRegionaleId,
      });
    }
  }

  for (let index = 0; index < examsData.length; index += 500) {
    const chunk = examsData.slice(index, index + 500);
    await prisma.examenValide.createMany({ data: chunk });
  }

  for (let index = 0; index < documentsData.length; index += 500) {
    const chunk = documentsData.slice(index, index + 500);
    await prisma.documentAcademique.createMany({ data: chunk });
    console.log(
      `${Math.min(index + chunk.length, documentsData.length)}/${documentsData.length} documents crees...`,
    );
  }
}

function buildCsv(students: StudentSeed[]) {
  const header = [
    "eleve_matricule",
    "eleve_email",
    "eleve_password",
    "eleve_nom",
    "eleve_prenom",
    "eleve_date_naissance",
    "diplome_type",
    "centre_examen",
    "region_composition",
    "document_type",
    "document_statut",
    "admin_matricule",
    "rdv_date",
    "rdv_heure",
    "rdv_lieu",
    "rdv_statut",
    "rdv_commentaire",
  ];

  const rows = students.flatMap((student) => {
    if (student.documents.length === 0) {
      return [
        [
          student.matricule,
          student.email,
          "",
          student.nom,
          student.prenom,
          formatDate(student.dateNaissance),
          "",
          "",
          student.region,
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "Eleve sans composition validee",
        ],
      ];
    }

    return student.documents.map((document) => [
      student.matricule,
      student.email,
      "",
      student.nom,
      student.prenom,
      formatDate(student.dateNaissance),
      document.diplomeType,
      student.centreExamen,
      student.region,
      document.typeDocument,
      document.statut,
      "",
      "",
      "",
      "",
      "",
      "Donnees de test 1000 eleves",
    ]);
  });

  return [header, ...rows].map((row) => row.map(csvEscape).join(",")).join("\n");
}

async function writeDocs(students: StudentSeed[]) {
  const documentsCount = students.reduce((sum, student) => sum + student.documents.length, 0);
  const withoutDocumentsCount = students.filter((student) => student.documents.length === 0).length;
  const realRows = students
    .slice(0, REAL_TEST_EMAILS.length)
    .map(
      (student) => `| ${student.matricule} | ${student.email} | ${student.prenom} ${student.nom} |`,
    )
    .join("\n");

  const readme = `# Donnees de test - 1000 eleves

Seed genere pour les tests DR-DOCSCOL.

- Eleves crees en base: ${students.length}
- Eleves avec au moins un document: ${students.length - withoutDocumentsCount}
- Eleves sans document: ${withoutDocumentsCount}
- Documents scolaires crees: ${documentsCount}
- Regions couvertes: ${REGIONS.map((item) => item.region).join(", ")}

## Comptes reels pour activation

Ces comptes existent dans la table \`users\` avec \`authUserId = null\`. Chaque eleve cree son mot de passe depuis \`/auth/register\`.

| Matricule | Email | Nom |
| --- | --- | --- |
${realRows}

## Fichier CSV

\`docs/test-data-1000-eleves.csv\`

## Commande

\`\`\`bash
npm run seed:1000-eleves
\`\`\`
`;

  await mkdir(path.dirname(CSV_PATH), { recursive: true });
  await writeFile(CSV_PATH, buildCsv(students), "utf8");
  await writeFile(README_PATH, readme, "utf8");
}

async function main() {
  const students = buildStudents();
  console.log("Preparation des organismes et antennes...");
  await ensureOrganismesAndAntennes();
  console.log("Nettoyage des anciennes donnees generees...");
  await resetGeneratedStudents(students);

  console.log("Creation des eleves...");
  const userIdsByMatricule = await ensureStudents(students);

  console.log("Nettoyage des documents existants pour les eleves de test...");
  await resetAcademicData([...userIdsByMatricule.values()]);

  console.log("Creation des examens valides et documents...");
  await createAcademicData(students, userIdsByMatricule);

  await writeDocs(students);

  const documentCount = students.reduce((sum, student) => sum + student.documents.length, 0);
  console.log(`Seed termine: ${students.length} eleves, ${documentCount} documents.`);
  console.log(`CSV genere: ${CSV_PATH}`);
  console.log(`Guide genere: ${README_PATH}`);
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
