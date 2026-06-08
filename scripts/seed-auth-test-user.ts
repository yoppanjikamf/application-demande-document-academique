import "dotenv/config";

import { createClient } from "@supabase/supabase-js";

import { PrismaClient, Role } from "../lib/generated/prisma/client";

const prisma = new PrismaClient();

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function normalizeMatricule(matricule: string) {
  return matricule.trim().toUpperCase();
}

function env(name: string, fallback: string) {
  return process.env[name]?.trim() || fallback;
}

function createSupabaseAdminClient() {
  const supabaseUrl =
    process.env.SUPABASE_URL?.trim() || process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || process.env.SUPABASE_SERVICE_KEY?.trim();

  if (!supabaseUrl || !serviceRoleKey) {
    return null;
  }

  if (serviceRoleKey === process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()) {
    throw new Error("La cle service_role ne doit pas etre la cle anon publique.");
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

async function deleteSupabaseTestUser(email: string) {
  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    console.warn("Supabase service_role absente: seul Prisma sera reinitialise.");
    return;
  }

  const perPage = 1000;

  for (let page = 1; page <= 10; page += 1) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });

    if (error) {
      throw error;
    }

    const found = data.users.find((user) => user.email?.toLowerCase() === email);
    if (found) {
      const { error: deleteError } = await supabase.auth.admin.deleteUser(found.id);
      if (deleteError) {
        throw deleteError;
      }

      return;
    }

    if (data.users.length < perPage) {
      return;
    }
  }

  throw new Error("Impossible de verifier tous les utilisateurs Supabase Auth.");
}

async function main() {
  const email = normalizeEmail(env("TEST_ELEVE_EMAIL", "eleve.test@example.com"));
  const matricule = normalizeMatricule(env("TEST_ELEVE_MATRICULE", "ELEVE001"));
  const nom = env("TEST_ELEVE_NOM", "Test");
  const prenom = env("TEST_ELEVE_PRENOM", "Eleve");

  try {
    await deleteSupabaseTestUser(email);
  } catch (error) {
    console.warn(
      error instanceof Error
        ? `Suppression Supabase Auth ignoree: ${error.message}`
        : "Suppression Supabase Auth ignoree.",
    );
  }

  const user = await prisma.user.upsert({
    where: { matricule },
    update: {
      authUserId: null,
      email,
      nom,
      prenom,
      role: Role.ELEVE,
      nomService: null,
    },
    create: {
      authUserId: null,
      email,
      matricule,
      nom,
      prenom,
      role: Role.ELEVE,
      dateNaissance: new Date("2004-01-15T00:00:00.000Z"),
    },
  });

  console.log("Eleve de test pret pour activation frontend:");
  console.log(`  matricule: ${user.matricule}`);
  console.log(`  email: ${user.email}`);
  console.log("  mot de passe: a choisir dans le formulaire /auth/register");
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
