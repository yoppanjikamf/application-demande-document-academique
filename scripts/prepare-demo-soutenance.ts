import "dotenv/config";
import { execSync } from "node:child_process";

import { PrismaClient } from "../lib/generated/prisma/client";

const prisma = new PrismaClient();
const MATRICULE = (process.env.SCREENSHOT_ELEVE_MATRICULE?.trim() || "DEMO2026002").toUpperCase();

async function main() {
  console.log("1/4 — Créneaux RDV…");
  execSync("npm run seed:appointments", { stdio: "inherit" });

  console.log("2/4 — Compte élève Faïssa (auth Supabase)…");
  execSync("tsx scripts/ensure-screenshot-eleve-auth.ts", { stdio: "inherit" });

  const eleve = await prisma.user.findUnique({ where: { matricule: MATRICULE } });
  if (!eleve) {
    throw new Error(`Élève ${MATRICULE} introuvable. Lancez npm run seed:soutenance-eleves.`);
  }

  console.log("3/4 — Réinitialisation RDV et documents de démo…");

  await prisma.rendezVous.deleteMany({ where: { eleveId: eleve.id } });
  await prisma.notification.deleteMany({
    where: { userId: eleve.id, typeNotification: { in: ["DOCUMENT_DISPONIBLE", "RDV_CONFIRME"] } },
  });

  const documents = await prisma.documentAcademique.findMany({ where: { eleveId: eleve.id } });
  for (const doc of documents) {
    await prisma.documentAcademique.update({
      where: { id: doc.id },
      data: {
        statut: "PAS_DISPONIBLE",
        demandeSoumiseAt: null,
      },
    });
  }

  console.log("4/4 — État prêt pour la démo soutenance (3–5 min).");
  console.log(`   Élève : ${MATRICULE}`);
  console.log("   Mot de passe : DemoScreens2026! (ou SCREENSHOT_ELEVE_PASSWORD)");
  console.log("   Flux : demande relevé → admin disponibilise → RDV élève → agent confirme");
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
