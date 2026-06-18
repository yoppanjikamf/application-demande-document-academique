#!/usr/bin/env node
/**
 * Génère les CSV de démo par région et par organisme (OBC / DECC).
 * Usage: node scripts/generate-demo-csv-by-region.mjs
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..");
const OUT = join(ROOT, "docs", "csv-demo");

const STUDENT_HEADER =
  "eleve_matricule,eleve_email,eleve_nom,eleve_prenom,eleve_date_naissance,diplome_type,annee_session,centre_examen,region_composition,document_type";
const AVAIL_HEADER = "eleve_matricule,diplome_type,document_type,annee_session";

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

function obcStudentsCentre() {
  return [
    STUDENT_HEADER,
    "ELEVE9001,eleve9001@example.com,NGONO,Claire,2005-04-12,PROBATOIRE,2025,Centre d'examen Centre,Centre,RELEVE_NOTES",
    "ELEVE9001,eleve9001@example.com,NGONO,Claire,2005-04-12,BACCALAUREAT,2025,Centre d'examen Centre,Centre,RELEVE_NOTES",
    "ELEVE9002,eleve9002@example.com,FOUDA,Samuel,2004-08-20,PROBATOIRE,2025,Centre d'examen Centre,Centre,RELEVE_NOTES",
    "ELEVE9003,eleve9003@example.com,MBALLA,Estelle,2003-11-15,BACCALAUREAT,2025,Centre d'examen Centre,Centre,ORIGINAL",
    "ELEVE9003,eleve9003@example.com,MBALLA,Estelle,2003-11-15,BACCALAUREAT,2025,Centre d'examen Centre,Centre,RELEVE_NOTES",
    "ELEVE9004,eleve9004@example.com,NJOCK,Brice,2005-06-30,PROBATOIRE,2025,Centre d'examen Centre,Centre,RELEVE_NOTES",
    "ELEVE9004,eleve9004@example.com,NJOCK,Brice,2005-06-30,BACCALAUREAT,2025,Centre d'examen Centre,Centre,RELEVE_NOTES",
    "ELEVE9005,eleve9005@example.com,KAMGA,Thierry,2004-02-18,PROBATOIRE,2025,Centre d'examen Centre,Centre,RELEVE_NOTES",
  ];
}

function obcAvailabilityCentre() {
  return [
    AVAIL_HEADER,
    "DEMO2026002,PROBATOIRE,RELEVE_NOTES,2021",
    "DEMO2026003,BACCALAUREAT,RELEVE_NOTES,2022",
    "DEMO2026004,PROBATOIRE,RELEVE_NOTES,2021",
    "DEMO2026005,BACCALAUREAT,ORIGINAL,2022",
    "DEMO2026001,PROBATOIRE,RELEVE_NOTES,2021",
    "DEMO2026001,BACCALAUREAT,RELEVE_NOTES,2022",
  ];
}

function deccStudentsCentre() {
  return [
    STUDENT_HEADER,
    "ELEVE9101,eleve9101@example.com,ATANG,Grace,2005-02-08,BEPC,2025,Centre d'examen Centre,Centre,ORIGINAL",
    "ELEVE9101,eleve9101@example.com,ATANG,Grace,2005-02-08,BEPC,2025,Centre d'examen Centre,Centre,RELEVE_NOTES",
    "ELEVE9102,eleve9102@example.com,BILONG,Emmanuel,2004-11-19,BEPC,2025,Centre d'examen Centre,Centre,RELEVE_NOTES",
  ];
}

function deccAvailabilityCentre() {
  return [
    AVAIL_HEADER,
    "DEMO2026001,BEPC,ORIGINAL,2019",
    "DEMO2026001,BEPC,RELEVE_NOTES,2019",
    "DEMO2026002,BEPC,RELEVE_NOTES,2019",
    "DEMO2026003,BEPC,ORIGINAL,2019",
    "DEMO2026004,BEPC,ORIGINAL,2019",
    "DEMO2026004,BEPC,RELEVE_NOTES,2019",
    "DEMO2026005,BEPC,RELEVE_NOTES,2019",
  ];
}

function obcStudentsRegion({ region, code }) {
  const centre = centreName(region);
  const m1 = `ELEVE${code}001`;
  const m2 = `ELEVE${code}002`;
  return [
    STUDENT_HEADER,
    `${m1},${m1.toLowerCase()}@example.com,NDONGO,Alice,2005-03-14,PROBATOIRE,2025,${centre},${region},RELEVE_NOTES`,
    `${m2},${m2.toLowerCase()}@example.com,ESSOMBA,Paul,2004-07-22,BACCALAUREAT,2025,${centre},${region},RELEVE_NOTES`,
  ];
}

function obcAvailabilityRegion({ region, code }) {
  const m1 = `ELEVE${code}001`;
  const m2 = `ELEVE${code}002`;
  return [
    AVAIL_HEADER,
    `${m1},PROBATOIRE,RELEVE_NOTES,2025`,
    `${m2},BACCALAUREAT,RELEVE_NOTES,2025`,
  ];
}

function deccStudentsRegion({ region, code }) {
  const centre = centreName(region);
  const m1 = `ELEVE${code}101`;
  return [
    STUDENT_HEADER,
    `${m1},${m1.toLowerCase()}@example.com,MBALLA,Sylvie,2005-05-01,BEPC,2025,${centre},${region},ORIGINAL`,
    `${m1},${m1.toLowerCase()}@example.com,MBALLA,Sylvie,2005-05-01,BEPC,2025,${centre},${region},RELEVE_NOTES`,
  ];
}

function deccAvailabilityRegion({ region, code }) {
  const m1 = `ELEVE${code}101`;
  return [AVAIL_HEADER, `${m1},BEPC,ORIGINAL,2025`, `${m1},BEPC,RELEVE_NOTES,2025`];
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

// Modèles publics téléchargeables depuis l'UI admin
writeRootFile("public/templates/obc/import-eleves.csv", obcStudentsCentre().slice(0, 3));
writeRootFile(
  "public/templates/obc/import-disponibilisation.csv",
  obcAvailabilityCentre().slice(0, 3),
);
writeRootFile("public/templates/decc/import-eleves.csv", deccStudentsCentre().slice(0, 3));
writeRootFile(
  "public/templates/decc/import-disponibilisation.csv",
  deccAvailabilityCentre().slice(0, 3),
);

console.log(`CSV générés sous ${OUT} (10 régions × OBC/DECC × 2 types)`);
