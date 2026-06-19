#!/usr/bin/env node
/**
 * Génère les CSV de démo par région et par organisme (OBC / DECC).
 * Matricules alignés sur le seed soutenance : DEMO2026001–005 (existants), DEMO2026006+ (nouveaux imports).
 * Usage: node scripts/generate-demo-csv-by-region.mjs
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..");
const OUT = join(ROOT, "docs", "csv-demo");

const STUDENT_HEADER =
  "eleve_matricule,eleve_email,eleve_nom,eleve_prenom,eleve_date_naissance,diplome_type,annee_session,centre_examen,region_composition,document_type";
const AVAIL_HEADER = "eleve_matricule,diplome_type,document_type,annee_session";

/** Élèves déjà en base via `npm run seed:soutenance-eleves` (région Centre). */
const DEMO_CENTRE_SEED = [
  {
    matricule: "DEMO2026001",
    email: "francialengambia@gmail.com",
    nom: "NGAMBIA",
    prenom: "Françial",
    dob: "2003-02-14",
  },
  {
    matricule: "DEMO2026002",
    email: "faissayoppanjikam@gmail.com",
    nom: "NJIKAM",
    prenom: "Faïssa",
    dob: "2004-05-20",
  },
  {
    matricule: "DEMO2026003",
    email: "eyaanemesselehelenedoucette@gmail.com",
    nom: "MESSELE",
    prenom: "Doucette",
    dob: "2003-09-08",
  },
  {
    matricule: "DEMO2026004",
    email: "ambiankeu@gmail.com",
    nom: "MBIANKEU",
    prenom: "Anicet",
    dob: "2002-11-27",
  },
  {
    matricule: "DEMO2026005",
    email: "prince.mabengue@facsciences-uy1.cm",
    nom: "MABENGUE",
    prenom: "Prince",
    dob: "2003-07-03",
  },
];

const REGIONS = [
  { region: "Adamaoua", slug: "adamaoua", code: "01" },
  { region: "Centre", slug: "centre", code: "02" },
  { region: "Est", slug: "est", code: "03" },
  { region: "Extreme-Nord", slug: "extreme-nord", code: "04" },
  { region: "Littoral", slug: "littoral", code: "05" },
  { region: "Nord", slug: "nord", code: "06" },
  { region: "Nord-Ouest", slug: "nord-ouest", code: "07" },
  { region: "Ouest", slug: "ouest", code: "08" },
  { region: "Sud", slug: "sud", code: "09" },
  { region: "Sud-Ouest", slug: "sud-ouest", code: "10" },
];

/** Sessions d'examen du seed (examens_valides). */
const SEED_SESSION = {
  BEPC: 2019,
  PROBATOIRE: 2021,
  BACCALAUREAT: 2022,
};

function centreName(region) {
  return `Centre d'examen ${region}`;
}

function writeCsv(relativePath, lines) {
  const fullPath = join(OUT, relativePath);
  mkdirSync(join(fullPath, ".."), { recursive: true });
  writeFileSync(fullPath, lines.join("\n") + "\n", "utf8");
}

function writeRootFile(relativePath, lines) {
  const fullPath = join(ROOT, relativePath);
  mkdirSync(join(fullPath, ".."), { recursive: true });
  writeFileSync(fullPath, lines.join("\n") + "\n", "utf8");
}

function studentRow({ matricule, email, nom, prenom, dob, diplome, session, region, document }) {
  const centre = centreName(region);
  return `${matricule},${email},${nom},${prenom},${dob},${diplome},${session},${centre},${region},${document}`;
}

function availRow(matricule, diplome, document, session, region = "Centre") {
  return `${matricule},${diplome},${document},${session},${region},${centreName(region)}`;
}

function obcStudentsCentre() {
  const region = "Centre";
  return [
    STUDENT_HEADER,
    studentRow({
      matricule: "DEMO2026006",
      email: "demo2026006@example.com",
      nom: "TCHOUA",
      prenom: "Marie",
      dob: "2005-03-18",
      diplome: "PROBATOIRE",
      session: 2025,
      region,
      document: "RELEVE_NOTES",
    }),
    studentRow({
      matricule: "DEMO2026006",
      email: "demo2026006@example.com",
      nom: "TCHOUA",
      prenom: "Marie",
      dob: "2005-03-18",
      diplome: "BACCALAUREAT",
      session: 2025,
      region,
      document: "RELEVE_NOTES",
    }),
    studentRow({
      matricule: "DEMO2026007",
      email: "demo2026007@example.com",
      nom: "FOTSING",
      prenom: "Yannick",
      dob: "2004-09-22",
      diplome: "PROBATOIRE",
      session: 2025,
      region,
      document: "RELEVE_NOTES",
    }),
    studentRow({
      matricule: "DEMO2026008",
      email: "demo2026008@example.com",
      nom: "NANA",
      prenom: "Carine",
      dob: "2003-12-05",
      diplome: "BACCALAUREAT",
      session: 2025,
      region,
      document: "ORIGINAL",
    }),
    studentRow({
      matricule: "DEMO2026008",
      email: "demo2026008@example.com",
      nom: "NANA",
      prenom: "Carine",
      dob: "2003-12-05",
      diplome: "BACCALAUREAT",
      session: 2025,
      region,
      document: "RELEVE_NOTES",
    }),
  ];
}

function obcAvailabilityCentre() {
  const region = "Centre";
  return [
    AVAIL_HEADER,
    availRow("DEMO2026001", "PROBATOIRE", "RELEVE_NOTES", SEED_SESSION.PROBATOIRE, region),
    availRow("DEMO2026001", "BACCALAUREAT", "RELEVE_NOTES", SEED_SESSION.BACCALAUREAT, region),
    availRow("DEMO2026002", "PROBATOIRE", "RELEVE_NOTES", SEED_SESSION.PROBATOIRE, region),
    availRow("DEMO2026003", "BACCALAUREAT", "RELEVE_NOTES", SEED_SESSION.BACCALAUREAT, region),
    availRow("DEMO2026003", "BACCALAUREAT", "ORIGINAL", SEED_SESSION.BACCALAUREAT, region),
    availRow("DEMO2026004", "PROBATOIRE", "RELEVE_NOTES", SEED_SESSION.PROBATOIRE, region),
    availRow("DEMO2026005", "BACCALAUREAT", "RELEVE_NOTES", SEED_SESSION.BACCALAUREAT, region),
    availRow("DEMO2026005", "BACCALAUREAT", "ORIGINAL", SEED_SESSION.BACCALAUREAT, region),
    availRow("DEMO2026006", "PROBATOIRE", "RELEVE_NOTES", 2025, region),
    availRow("DEMO2026007", "PROBATOIRE", "RELEVE_NOTES", 2025, region),
    availRow("DEMO2026008", "BACCALAUREAT", "ORIGINAL", 2025, region),
    availRow("DEMO2026008", "BACCALAUREAT", "RELEVE_NOTES", 2025, region),
  ];
}

function deccStudentsCentre() {
  const region = "Centre";
  return [
    STUDENT_HEADER,
    studentRow({
      matricule: "DEMO2026009",
      email: "demo2026009@example.com",
      nom: "EBOGO",
      prenom: "Judith",
      dob: "2005-06-11",
      diplome: "BEPC",
      session: 2025,
      region,
      document: "ORIGINAL",
    }),
    studentRow({
      matricule: "DEMO2026009",
      email: "demo2026009@example.com",
      nom: "EBOGO",
      prenom: "Judith",
      dob: "2005-06-11",
      diplome: "BEPC",
      session: 2025,
      region,
      document: "RELEVE_NOTES",
    }),
    studentRow({
      matricule: "DEMO2026010",
      email: "demo2026010@example.com",
      nom: "MENGUE",
      prenom: "Patrick",
      dob: "2004-10-03",
      diplome: "BEPC",
      session: 2025,
      region,
      document: "RELEVE_NOTES",
    }),
    studentRow({
      matricule: "DEMO2026011",
      email: "demo2026011@example.com",
      nom: "ONGA",
      prenom: "Berthe",
      dob: "2005-01-25",
      diplome: "BEPC",
      session: 2025,
      region,
      document: "ORIGINAL",
    }),
    studentRow({
      matricule: "DEMO2026011",
      email: "demo2026011@example.com",
      nom: "ONGA",
      prenom: "Berthe",
      dob: "2005-01-25",
      diplome: "BEPC",
      session: 2025,
      region,
      document: "RELEVE_NOTES",
    }),
  ];
}

function deccAvailabilityCentre() {
  const region = "Centre";
  return [
    AVAIL_HEADER,
    availRow("DEMO2026001", "BEPC", "ORIGINAL", SEED_SESSION.BEPC, region),
    availRow("DEMO2026001", "BEPC", "RELEVE_NOTES", SEED_SESSION.BEPC, region),
    availRow("DEMO2026002", "BEPC", "RELEVE_NOTES", SEED_SESSION.BEPC, region),
    availRow("DEMO2026003", "BEPC", "ORIGINAL", SEED_SESSION.BEPC, region),
    availRow("DEMO2026004", "BEPC", "ORIGINAL", SEED_SESSION.BEPC, region),
    availRow("DEMO2026004", "BEPC", "RELEVE_NOTES", SEED_SESSION.BEPC, region),
    availRow("DEMO2026005", "BEPC", "RELEVE_NOTES", SEED_SESSION.BEPC, region),
    availRow("DEMO2026009", "BEPC", "ORIGINAL", 2025, region),
    availRow("DEMO2026009", "BEPC", "RELEVE_NOTES", 2025, region),
    availRow("DEMO2026010", "BEPC", "RELEVE_NOTES", 2025, region),
    availRow("DEMO2026011", "BEPC", "ORIGINAL", 2025, region),
  ];
}

function demoMatriculeForRegion(code, suffix) {
  return `DEMO2026${code}${suffix}`;
}

function obcStudentsRegion({ region, code }) {
  const m1 = demoMatriculeForRegion(code, "06");
  const m2 = demoMatriculeForRegion(code, "07");
  return [
    STUDENT_HEADER,
    studentRow({
      matricule: m1,
      email: `${m1.toLowerCase()}@example.com`,
      nom: "NDONGO",
      prenom: "Alice",
      dob: "2005-03-14",
      diplome: "PROBATOIRE",
      session: 2025,
      region,
      document: "RELEVE_NOTES",
    }),
    studentRow({
      matricule: m2,
      email: `${m2.toLowerCase()}@example.com`,
      nom: "ESSOMBA",
      prenom: "Paul",
      dob: "2004-07-22",
      diplome: "BACCALAUREAT",
      session: 2025,
      region,
      document: "RELEVE_NOTES",
    }),
  ];
}

function obcAvailabilityRegion({ region, code }) {
  const m1 = demoMatriculeForRegion(code, "06");
  const m2 = demoMatriculeForRegion(code, "07");
  return [
    AVAIL_HEADER,
    availRow(m1, "PROBATOIRE", "RELEVE_NOTES", 2025, region),
    availRow(m2, "BACCALAUREAT", "RELEVE_NOTES", 2025, region),
  ];
}

function deccStudentsRegion({ region, code }) {
  const m1 = demoMatriculeForRegion(code, "09");
  return [
    STUDENT_HEADER,
    studentRow({
      matricule: m1,
      email: `${m1.toLowerCase()}@example.com`,
      nom: "MBALLA",
      prenom: "Sylvie",
      dob: "2005-05-01",
      diplome: "BEPC",
      session: 2025,
      region,
      document: "ORIGINAL",
    }),
    studentRow({
      matricule: m1,
      email: `${m1.toLowerCase()}@example.com`,
      nom: "MBALLA",
      prenom: "Sylvie",
      dob: "2005-05-01",
      diplome: "BEPC",
      session: 2025,
      region,
      document: "RELEVE_NOTES",
    }),
  ];
}

function deccAvailabilityRegion({ region, code }) {
  const m1 = demoMatriculeForRegion(code, "09");
  return [
    AVAIL_HEADER,
    availRow(m1, "BEPC", "ORIGINAL", 2025, region),
    availRow(m1, "BEPC", "RELEVE_NOTES", 2025, region),
  ];
}

for (const entry of REGIONS) {
  const isCentre = entry.slug === "centre";

  writeCsv(
    `${entry.slug}/obc/import-eleves-probatoire-bac.csv`,
    isCentre ? obcStudentsCentre() : obcStudentsRegion(entry),
  );
  writeCsv(
    `${entry.slug}/obc/import-disponibilisation-probatoire-bac.csv`,
    isCentre ? obcAvailabilityCentre() : obcAvailabilityRegion(entry),
  );
  writeCsv(
    `${entry.slug}/decc/import-eleves-bepc.csv`,
    isCentre ? deccStudentsCentre() : deccStudentsRegion(entry),
  );
  writeCsv(
    `${entry.slug}/decc/import-disponibilisation-bepc.csv`,
    isCentre ? deccAvailabilityCentre() : deccAvailabilityRegion(entry),
  );
}

writeRootFile("public/templates/obc/import-eleves.csv", obcStudentsCentre().slice(0, 3));
writeRootFile(
  "public/templates/obc/import-disponibilisation.csv",
  obcAvailabilityCentre().slice(0, 4),
);
writeRootFile("public/templates/decc/import-eleves.csv", deccStudentsCentre().slice(0, 3));
writeRootFile(
  "public/templates/decc/import-disponibilisation.csv",
  deccAvailabilityCentre().slice(0, 4),
);

console.log(`CSV générés sous ${OUT} (10 régions × OBC/DECC × 2 types)`);
console.log(
  `Centre — élèves seed : ${DEMO_CENTRE_SEED.map((s) => s.matricule).join(", ")} ; nouveaux OBC : DEMO2026006–008 ; nouveaux DECC : DEMO2026009–011`,
);
