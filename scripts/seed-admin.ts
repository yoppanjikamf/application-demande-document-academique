import "dotenv/config";

import { PrismaClient, Role } from "../lib/generated/prisma/client";
import { createSupabaseAdminClient } from "../lib/supabase/admin";

type AdminInput = {
  email: string;
  password: string;
  matricule: string;
  nom: string;
  prenom: string;
  nomService: string;
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
  return {
    email: normalizeEmail(requiredEnv("ADMIN_EMAIL")),
    password: requiredEnv("ADMIN_PASSWORD"),
    matricule: normalizeMatricule(requiredEnv("ADMIN_MATRICULE")),
    nom: requiredEnv("ADMIN_NOM"),
    prenom: requiredEnv("ADMIN_PRENOM"),
    nomService: requiredEnv("ADMIN_SERVICE"),
  };
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
      role: Role.ADMINISTRATEUR,
    },
  });
}

async function main() {
  const input = readAdminInput();
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
