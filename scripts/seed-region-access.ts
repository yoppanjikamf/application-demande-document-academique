import "dotenv/config";

import { PrismaClient } from "../lib/generated/prisma/client";
import { ORGANISME_IDS, REGIONAL_ANTENNAS } from "../lib/document-routing";

const prisma = new PrismaClient();

async function main() {
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

  for (const antenna of REGIONAL_ANTENNAS) {
    await prisma.antenneRegionale.upsert({
      where: { id: antenna.id },
      update: {
        nom: antenna.nom,
        region: antenna.region,
        ville: antenna.ville,
        accessKey: antenna.accessKey,
        organismeId: antenna.organismeId,
      },
      create: {
        id: antenna.id,
        nom: antenna.nom,
        region: antenna.region,
        ville: antenna.ville,
        accessKey: antenna.accessKey,
        organismeId: antenna.organismeId,
      },
    });
  }

  const total = await prisma.antenneRegionale.count();
  console.log(`Clés régionales mises à jour: ${total}`);
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
