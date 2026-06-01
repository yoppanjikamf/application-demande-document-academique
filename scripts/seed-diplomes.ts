import "dotenv/config";

import {
  PrismaClient,
  Role,
  type DiplomePrincipal,
  type TypeDocument,
} from "../lib/generated/prisma/client";
import { ORGANISME_IDS, REGIONAL_ANTENNAS, resolveDocumentRoute } from "../lib/document-routing";
import { createSupabaseAdminClient } from "../lib/supabase/admin";

const prisma = new PrismaClient();

const TEST_USER = {
  email: "yoppanjikamf@gmail.com",
  password: process.env.TEST_FAIZA_PASSWORD?.trim() || "Faiza2026!",
  matricule: "TEST2026001",
  nom: "NJIKAM",
  prenom: "Faiza",
  dateNaissance: new Date("2005-01-15T00:00:00.000Z"),
};

const EXAMS: Array<{
  diplomeType: DiplomePrincipal;
  anneeSession: number;
  centreExamen: string;
  regionComposition: string;
}> = [
  {
    diplomeType: "BEPC",
    anneeSession: 2020,
    centreExamen: "Lycee de Biyem-Assi",
    regionComposition: "Centre",
  },
  {
    diplomeType: "PROBATOIRE",
    anneeSession: 2022,
    centreExamen: "Lycee General Leclerc",
    regionComposition: "Centre",
  },
  {
    diplomeType: "BACCALAUREAT",
    anneeSession: 2023,
    centreExamen: "Lycee General Leclerc",
    regionComposition: "Centre",
  },
];

const DOCUMENT_TYPES_BY_EXAM: Record<DiplomePrincipal, TypeDocument[]> = {
  BEPC: ["ORIGINAL", "RELEVE_NOTES"],
  PROBATOIRE: ["RELEVE_NOTES"],
  BACCALAUREAT: ["ORIGINAL", "RELEVE_NOTES"],
};

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

async function findSupabaseUserIdByEmail(email: string) {
  const supabase = createSupabaseAdminClient();
  const perPage = 1000;

  for (let page = 1; page <= 10; page += 1) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });

    if (error) {
      throw error;
    }

    const found = data.users.find((user) => user.email?.toLowerCase() === email.toLowerCase());
    if (found) {
      return found.id;
    }

    if (data.users.length < perPage) {
      return null;
    }
  }

  throw new Error("Impossible de verifier tous les utilisateurs Supabase Auth.");
}

async function ensureSupabaseEleve() {
  const supabase = createSupabaseAdminClient();
  const existingUserId = await findSupabaseUserIdByEmail(TEST_USER.email);
  const payload = {
    password: TEST_USER.password,
    email_confirm: true,
    app_metadata: {
      role: Role.ELEVE,
      matricule: TEST_USER.matricule,
    },
    user_metadata: {
      matricule: TEST_USER.matricule,
      nom: TEST_USER.nom,
      prenom: TEST_USER.prenom,
    },
  };

  const { data, error } = existingUserId
    ? await supabase.auth.admin.updateUserById(existingUserId, payload)
    : await supabase.auth.admin.createUser({
        email: TEST_USER.email,
        ...payload,
      });

  if (error) {
    throw error;
  }

  return data.user.id;
}

async function main() {
  await ensureOrganismesAndAntennes();
  const authUserId = await ensureSupabaseEleve();

  const existingByMatricule = await prisma.user.findUnique({
    where: { matricule: TEST_USER.matricule },
    select: { id: true, email: true },
  });
  const existingByEmail = await prisma.user.findUnique({
    where: { email: TEST_USER.email },
    select: { id: true, matricule: true },
  });

  if (
    existingByMatricule &&
    existingByMatricule.email.toLowerCase() !== TEST_USER.email.toLowerCase()
  ) {
    throw new Error(
      `Le matricule ${TEST_USER.matricule} existe deja avec l'email ${existingByMatricule.email}.`,
    );
  }

  const user = existingByEmail
    ? await prisma.user.update({
        where: { id: existingByEmail.id },
        data: {
          authUserId,
          email: TEST_USER.email,
          matricule: TEST_USER.matricule,
          nom: TEST_USER.nom,
          prenom: TEST_USER.prenom,
          role: Role.ELEVE,
          nomService: null,
          dateNaissance: TEST_USER.dateNaissance,
          derniereConnexion: null,
        },
      })
    : await prisma.user.upsert({
        where: { matricule: TEST_USER.matricule },
        update: {
          authUserId,
          email: TEST_USER.email,
          nom: TEST_USER.nom,
          prenom: TEST_USER.prenom,
          role: Role.ELEVE,
          nomService: null,
          dateNaissance: TEST_USER.dateNaissance,
          derniereConnexion: null,
        },
        create: {
          authUserId,
          email: TEST_USER.email,
          matricule: TEST_USER.matricule,
          nom: TEST_USER.nom,
          prenom: TEST_USER.prenom,
          role: Role.ELEVE,
          dateNaissance: TEST_USER.dateNaissance,
        },
      });

  for (const exam of EXAMS) {
    await prisma.examenValide.upsert({
      where: {
        eleveId_diplomeType: {
          eleveId: user.id,
          diplomeType: exam.diplomeType,
        },
      },
      update: {
        anneeSession: exam.anneeSession,
        centreExamen: exam.centreExamen,
        regionComposition: exam.regionComposition,
      },
      create: {
        eleveId: user.id,
        diplomeType: exam.diplomeType,
        anneeSession: exam.anneeSession,
        centreExamen: exam.centreExamen,
        regionComposition: exam.regionComposition,
      },
    });

    for (const typeDocument of DOCUMENT_TYPES_BY_EXAM[exam.diplomeType]) {
      const route = resolveDocumentRoute({
        diplomeType: exam.diplomeType,
        typeDocument,
        centreExamen: exam.centreExamen,
        regionComposition: exam.regionComposition,
      });

      await prisma.documentAcademique.upsert({
        where: {
          eleveId_diplomeType_typeDocument: {
            eleveId: user.id,
            diplomeType: exam.diplomeType,
            typeDocument,
          },
        },
        update: {
          statut: "DISPONIBLE",
          centreExamen: exam.centreExamen,
          regionComposition: exam.regionComposition,
          organismeId: route.organismeId,
          antenneRegionaleId: route.antenneRegionaleId,
        },
        create: {
          eleveId: user.id,
          diplomeType: exam.diplomeType,
          typeDocument,
          statut: "DISPONIBLE",
          centreExamen: exam.centreExamen,
          regionComposition: exam.regionComposition,
          organismeId: route.organismeId,
          antenneRegionaleId: route.antenneRegionaleId,
        },
      });
    }
  }

  console.log("Utilisateur de test pret:");
  console.log(`  Nom: ${TEST_USER.prenom} ${TEST_USER.nom}`);
  console.log(`  Matricule: ${TEST_USER.matricule}`);
  console.log(`  Email: ${TEST_USER.email}`);
  console.log(`  Mot de passe: ${TEST_USER.password}`);
  console.log(`  Examens valides: ${EXAMS.length}`);
  console.log(
    `  Documents disponibles: ${EXAMS.reduce((sum, exam) => sum + DOCUMENT_TYPES_BY_EXAM[exam.diplomeType].length, 0)}`,
  );
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
