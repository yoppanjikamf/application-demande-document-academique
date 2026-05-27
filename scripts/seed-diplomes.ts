import "dotenv/config";
import { PrismaClient, DiplomePrincipal, StatutDocument } from "../lib/generated/prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Find or create the test student
  const user = await prisma.user.upsert({
    where: { matricule: "ELEVE001" },
    update: {},
    create: {
      authUserId: null,
      email: "eleve.test@example.com",
      matricule: "ELEVE001",
      nom: "Test",
      prenom: "Eleve",
      role: "ELEVE",
      dateNaissance: new Date("2004-01-15"),
    },
  });

  const diplomes: DiplomePrincipal[] = ["BEPC", "PROBATOIRE", "BACCALAUREAT"];

  for (const d of diplomes) {
    await prisma.documentAcademique.upsert({
      where: {
        eleveId_diplomeType_typeDocument: {
          eleveId: user.id,
          diplomeType: d,
          typeDocument: "ORIGINAL",
        },
      },
      update: {},
      create: {
        eleveId: user.id,
        diplomeType: d,
        typeDocument: "ORIGINAL",
        statut: "DISPONIBLE",
        centreExamen: "Centre OBC",
      },
    });
  }

  console.log("Diplômes de test créés pour l’élève", user.matricule);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
