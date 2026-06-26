import "dotenv/config";
import { readFileSync } from "node:fs";
import path from "node:path";

import { importDocumentAvailabilityFromCsv } from "../lib/document-availability-import";
import { PrismaClient } from "../lib/generated/prisma/client";

const prisma = new PrismaClient();

const MATRICULE = (process.env.SCREENSHOT_ELEVE_MATRICULE?.trim() || "DEMO2026002").toUpperCase();
const CSV_PATH = path.join(
  process.cwd(),
  "docs/imports/centre/obc/import-disponibilisation.csv",
);

async function main() {
  const admin = await prisma.user.findUnique({
    where: { matricule: "ADM-02-CENTRE" },
  });

  if (!admin) {
    throw new Error("Admin ADM-02-CENTRE introuvable. Lancez npm run seed:regional-admins.");
  }

  const csv = readFileSync(CSV_PATH, "utf8");
  const lines = csv.split("\n");
  const filtered = lines.filter((line, index) => index === 0 || line.startsWith(`${MATRICULE},`));

  if (filtered.length < 2) {
    throw new Error(`Aucune ligne CSV pour ${MATRICULE} dans ${CSV_PATH}.`);
  }

  const result = await importDocumentAvailabilityFromCsv(filtered.join("\n"), admin);
  console.log(
    `Disponibilisation ${MATRICULE}: traités=${result.processed}, créés=${result.created}, mis à jour=${result.updated}`,
  );
  if (result.errors.length > 0) {
    console.warn(result.errors.join("\n"));
  }

  const eleve = await prisma.user.findUnique({ where: { matricule: MATRICULE } });
  if (!eleve) return;

  const existingNotification = await prisma.notification.findFirst({
    where: { userId: eleve.id, typeNotification: "DOCUMENT_DISPONIBLE" },
  });

  if (!existingNotification) {
    await prisma.notification.create({
      data: {
        userId: eleve.id,
        typeNotification: "DOCUMENT_DISPONIBLE",
        title: "Document disponible",
        message: "Votre relevé de notes est disponible. Consultez vos instructions de retrait.",
        metadata: { source: "memoire-screenshots" },
      },
    });
    console.log("Notification de démo créée pour les captures.");
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
