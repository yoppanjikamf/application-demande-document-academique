import "dotenv/config";

import { PrismaClient, Role } from "../lib/generated/prisma/client";
import { DEFAULT_REGION, OBC_REGIONAL_ANTENNAS, ORGANISME_IDS, normalizeRegion } from "../lib/document-routing";
import { createSupabaseAdminClient } from "../lib/supabase/admin";

type AdminInput = {
  email: string;
  password: string;
  matricule: string;
  nom: string;
  prenom: string;
  nomService: string;
  organismeId: string;
  antenneRegionaleId: string | null;
};

const prisma = new PrismaClient();

function requiredEnv(name: string) {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Variable d'environnement manquante: ${name}`);
  }

  return value;
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function normalizeMatricule(matricule: string) {
  return matricule.trim().toUpperCase();
}

function readAdminInput(): AdminInput {
  const organismeName = (process.env.ADMIN_ORGANISME?.trim().toUpperCase() || "OBC") as "OBC" | "DECC";
  const organismeId = organismeName === "DECC" ? ORGANISME_IDS.DECC : ORGANISME_IDS.OBC;
  const region = normalizeRegion(process.env.ADMIN_ANTENNE_REGION?.trim() || DEFAULT_REGION);
  const antenne = OBC_REGIONAL_ANTENNAS.find((item) => item.region === region) ?? OBC_REGIONAL_ANTENNAS[1];

  return {
    email: normalizeEmail(requiredEnv("ADMIN_EMAIL")),
    password: requiredEnv("ADMIN_PASSWORD"),
    matricule: normalizeMatricule(requiredEnv("ADMIN_MATRICULE")),
    nom: requiredEnv("ADMIN_NOM"),
    prenom: requiredEnv("ADMIN_PRENOM"),
    nomService: process.env.ADMIN_SERVICE?.trim() || organismeName,
    organismeId,
    antenneRegionaleId: organismeName === "OBC" ? antenne.id : null,
  };
}

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

  for (const antenne of OBC_REGIONAL_ANTENNAS) {
    await prisma.antenneRegionale.upsert({
      where: { id: antenne.id },
      update: {
        nom: antenne.nom,
        region: antenne.region,
        ville: antenne.ville,
        organismeId: ORGANISME_IDS.OBC,
      },
      create: {
        id: antenne.id,
        nom: antenne.nom,
        region: antenne.region,
        ville: antenne.ville,
        organismeId: ORGANISME_IDS.OBC,
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

    const found = data.users.find((user) => user.email?.toLowerCase() === email);
    if (found) {
      return found.id;
    }

    if (data.users.length < perPage) {
      return null;
    }
  }

  throw new Error("Impossible de verifier tous les utilisateurs Supabase Auth.");
}

async function ensureSupabaseAdmin(input: AdminInput) {
  const supabase = createSupabaseAdminClient();
  const existingUserId = await findSupabaseUserIdByEmail(input.email);

  if (existingUserId) {
    const { data, error } = await supabase.auth.admin.updateUserById(existingUserId, {
      password: input.password,
      email_confirm: true,
      app_metadata: {
        role: Role.ADMINISTRATEUR,
        matricule: input.matricule,
        organismeId: input.organismeId,
        antenneRegionaleId: input.antenneRegionaleId,
      },
      user_metadata: {
        matricule: input.matricule,
        nom: input.nom,
        prenom: input.prenom,
      },
    });

    if (error) {
      throw error;
    }

    return data.user.id;
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email: input.email,
    password: input.password,
    email_confirm: true,
    app_metadata: {
      role: Role.ADMINISTRATEUR,
      matricule: input.matricule,
      organismeId: input.organismeId,
      antenneRegionaleId: input.antenneRegionaleId,
    },
    user_metadata: {
      matricule: input.matricule,
      nom: input.nom,
      prenom: input.prenom,
    },
  });

  if (error) {
    throw error;
  }

  return data.user.id;
}

async function ensurePrismaAdmin(input: AdminInput, authUserId: string) {
  return prisma.user.upsert({
    where: { matricule: input.matricule },
    update: {
      authUserId,
      email: input.email,
      nom: input.nom,
      prenom: input.prenom,
      nomService: input.nomService,
      organismeId: input.organismeId,
      antenneRegionaleId: input.antenneRegionaleId,
      role: Role.ADMINISTRATEUR,
      dateNaissance: null,
    },
    create: {
      authUserId,
      email: input.email,
      matricule: input.matricule,
      nom: input.nom,
      prenom: input.prenom,
      nomService: input.nomService,
      organismeId: input.organismeId,
      antenneRegionaleId: input.antenneRegionaleId,
      role: Role.ADMINISTRATEUR,
    },
  });
}

async function main() {
  const input = readAdminInput();
  await ensureOrganismesAndAntennes();
  const authUserId = await ensureSupabaseAdmin(input);
  const admin = await ensurePrismaAdmin(input, authUserId);

  console.log(`Administrateur pret: ${admin.email} (${admin.matricule})`);
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
