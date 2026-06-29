import "dotenv/config";
import { execSync } from "node:child_process";

import { PrismaClient } from "../lib/generated/prisma/client";
import { importDocumentAvailabilityFromCsv } from "../lib/document-availability-import";
import { readFileSync } from "node:fs";
import path from "node:path";

const prisma = new PrismaClient();
const MATRICULE = (process.env.SCREENSHOT_ELEVE_MATRICULE?.trim() || "DEMO2026002").toUpperCase();

function nextWeekdayDate() {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  date.setHours(0, 0, 0, 0);
  while (date.getDay() === 0 || date.getDay() === 6) {
    date.setDate(date.getDate() + 1);
  }
  return date;
}

async function main() {
  console.log("=== Préparation état vidéo démo ===\n");

  execSync("npm run reset:imports", { stdio: "inherit" });
  execSync("tsx scripts/ensure-screenshot-eleve-auth.ts", { stdio: "inherit" });

  const admin = await prisma.user.findUnique({ where: { matricule: "ADM-02-CENTRE" } });
  const eleve = await prisma.user.findUnique({ where: { matricule: MATRICULE } });

  if (!admin || !eleve) {
    throw new Error("Admin OBC ou élève demo introuvable.");
  }

  const csvPath = path.join(process.cwd(), "docs/imports/centre/obc/import-disponibilisation.csv");
  const csv = readFileSync(csvPath, "utf8");
  const lines = csv.split("\n");
  const filtered = lines.filter((line, i) => i === 0 || line.startsWith(`${MATRICULE},`));
  await importDocumentAvailabilityFromCsv(filtered.join("\n"), admin);

  const doc = await prisma.documentAcademique.findFirst({
    where: {
      eleveId: eleve.id,
      statut: "DISPONIBLE",
      typeDocument: "RELEVE_NOTES",
    },
  });

  if (!doc) {
    throw new Error("Aucun document DISPONIBLE pour l'élève après import.");
  }

  await prisma.rendezVous.deleteMany({ where: { eleveId: eleve.id } });

  const rdvDate = nextWeekdayDate();
  await prisma.rendezVous.create({
    data: {
      dateRdv: rdvDate,
      heureRdv: "10:00",
      lieu: "Centre d'examen Centre",
      statut: "PLANIFIE",
      commentaire: "RDV demo video soutenance",
      adminId: admin.id,
      eleveId: eleve.id,
      documentId: doc.id,
    },
  });

  console.log("\n✓ État prêt pour la vidéo :");
  console.log(`  Élève ${MATRICULE} — document DISPONIBLE + RDV ${rdvDate.toLocaleDateString("fr-FR")} 10:00`);
  console.log("  Mot de passe élève : DemoScreens2026! (via ensure-screenshot-eleve-auth)");
  console.log("  Agent verra le RDV dans « À venir » sur /centre-examen");
  console.log("\n  Avant d'enregistrer : ouvrez le site 2 min dans le navigateur (réveille Vercel).");
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
