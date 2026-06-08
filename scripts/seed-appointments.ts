import "dotenv/config";

import { PrismaClient } from "../lib/generated/prisma/client";

const prisma = new PrismaClient();

function toDateAtMidnight(value: string) {
  const d = new Date(value);
  d.setHours(0, 0, 0, 0);
  return d;
}

async function main() {
  // Paramètres globaux
  const settings = {
    id: "GLOBAL",
    quotaJournalier: 200,
    lieuObc: "Centre de retrait",
  };

  await prisma.parametreRendezVous.upsert({
    where: { id: settings.id },
    update: { quotaJournalier: settings.quotaJournalier, lieuObc: settings.lieuObc },
    create: settings,
  });

  // Créneaux horaires par défaut (skipDuplicates via createMany)
  const slots = [
    { heureDebut: "08:00", heureFin: "10:00", actif: true },
    { heureDebut: "10:00", heureFin: "12:00", actif: true },
    { heureDebut: "14:00", heureFin: "16:00", actif: true },
  ];

  await prisma.creneauHoraire.createMany({ data: slots, skipDuplicates: true });

  // Jours fériés par défaut (annuel flag pour certains)
  const holidays = [
    {
      date: toDateAtMidnight(`${new Date().getFullYear()}-01-01`),
      nom: "Jour de l'an",
      annuel: true,
    },
    {
      date: toDateAtMidnight(`${new Date().getFullYear()}-05-01`),
      nom: "Fête du Travail",
      annuel: true,
    },
    {
      date: toDateAtMidnight(`${new Date().getFullYear()}-05-20`),
      nom: "Fête Nationale",
      annuel: true,
    },
    {
      date: toDateAtMidnight(`${new Date().getFullYear()}-08-15`),
      nom: "Assomption",
      annuel: true,
    },
    { date: toDateAtMidnight(`${new Date().getFullYear()}-12-25`), nom: "Noël", annuel: true },
  ];

  // createMany with skipDuplicates to avoid duplicate unique date entries
  await prisma.jourFerie.createMany({ data: holidays, skipDuplicates: true });

  const totalSlots = await prisma.creneauHoraire.count();
  const totalHolidays = await prisma.jourFerie.count();

  console.log(`Paramètres RDV mis à jour (id=${settings.id}).`);
  console.log(`Créneaux en base: ${totalSlots}`);
  console.log(`Jours fériés en base: ${totalHolidays}`);
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
