import "dotenv/config";

import { PrismaClient } from "../lib/generated/prisma/client";
import { OBC_REGIONAL_ANTENNAS, ORGANISME_IDS } from "../lib/document-routing";

const prisma = new PrismaClient();

async function main() {
  await prisma.organisme.upsert({
    where: { id: ORGANISME_IDS.OBC },
    update: { nom: "OBC" },
    create: { id: ORGANISME_IDS.OBC, nom: "OBC" },
  });

  for (const antenna of OBC_REGIONAL_ANTENNAS) {
    await prisma.antenneRegionale.upsert({
      where: { id: antenna.id },
      update: {
        nom: antenna.nom,
        region: antenna.region,
        ville: antenna.ville,
        accessKey: antenna.accessKey,
        organismeId: ORGANISME_IDS.OBC,
      },
      create: {
        id: antenna.id,
        nom: antenna.nom,
        region: antenna.region,
        ville: antenna.ville,
        accessKey: antenna.accessKey,
        organismeId: ORGANISME_IDS.OBC,
      },
    });
  }

  const total = await prisma.antenneRegionale.count({ where: { organismeId: ORGANISME_IDS.OBC } });
  console.log(`Clés régionales OBC mises à jour: ${total}`);
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
