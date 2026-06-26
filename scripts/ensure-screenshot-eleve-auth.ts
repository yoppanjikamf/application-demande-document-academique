import "dotenv/config";
import { readFileSync } from "node:fs";
import path from "node:path";

import { PrismaClient } from "../lib/generated/prisma/client";
import { createSupabaseAdminClient } from "../lib/supabase/admin";

const prisma = new PrismaClient();

function env(name: string, fallback: string) {
  return process.env[name]?.trim() || fallback;
}

function loadEnvFile(filePath: string) {
  try {
    const text = readFileSync(filePath, "utf8");
    for (const line of text.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (!(key in process.env)) process.env[key] = value;
    }
  } catch {
    // optional
  }
}

async function findSupabaseUserIdByEmail(email: string) {
  const supabase = createSupabaseAdminClient();
  const perPage = 1000;

  for (let page = 1; page <= 10; page += 1) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
    if (error) throw error;

    const found = data.users.find((user) => user.email?.toLowerCase() === email.toLowerCase());
    if (found) return found.id;
    if (data.users.length < perPage) return null;
  }

  throw new Error("Impossible de parcourir tous les utilisateurs Supabase Auth.");
}

async function main() {
  loadEnvFile(path.join(process.cwd(), ".env.local"));
  loadEnvFile(path.join(process.cwd(), ".env"));

  const matricule = env("SCREENSHOT_ELEVE_MATRICULE", "DEMO2026002").toUpperCase();
  const email = env("SCREENSHOT_ELEVE_EMAIL", "faissayoppanjikam@gmail.com").toLowerCase();
  const password = env("SCREENSHOT_ELEVE_PASSWORD", "DemoScreens2026!");

  const dbUser = await prisma.user.findUnique({
    where: { matricule },
    select: {
      id: true,
      authUserId: true,
      email: true,
      role: true,
      matricule: true,
      nom: true,
      prenom: true,
    },
  });

  if (!dbUser || dbUser.email.toLowerCase() !== email) {
    throw new Error(
      `Élève introuvable pour ${matricule} / ${email}. Lancez npm run seed:soutenance-eleves.`,
    );
  }

  if (dbUser.role !== "ELEVE") {
    throw new Error("Le compte cible n'est pas un élève.");
  }

  const supabase = createSupabaseAdminClient();
  const existingAuthUserId = await findSupabaseUserIdByEmail(email);
  const payload = {
    password,
    email_confirm: true,
    app_metadata: { matricule, role: dbUser.role },
    user_metadata: { matricule, role: dbUser.role },
  };

  const { data, error } = existingAuthUserId
    ? await supabase.auth.admin.updateUserById(existingAuthUserId, payload)
    : await supabase.auth.admin.createUser({ email, ...payload });

  if (error) {
    throw error;
  }

  const authUserId = data.user?.id ?? existingAuthUserId;
  if (!authUserId) {
    throw new Error("Compte Supabase Auth non créé.");
  }

  await prisma.user.update({
    where: { id: dbUser.id },
    data: { authUserId },
  });

  console.log(`Compte capture prêt : ${matricule} (${email})`);
  console.log("Mot de passe : SCREENSHOT_ELEVE_PASSWORD (défaut DemoScreens2026!)");
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
