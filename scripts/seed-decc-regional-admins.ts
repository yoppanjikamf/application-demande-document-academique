import "dotenv/config";

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { PrismaClient, Role } from "../lib/generated/prisma/client";
import { DECC_REGIONAL_ANTENNAS, ORGANISME_IDS, REGIONAL_ANTENNAS } from "../lib/document-routing";
import { createSupabaseAdminClient } from "../lib/supabase/admin";

type RegionalAdminSeed = {
  region: string;
  antenneRegionaleId: string;
  email: string;
  password: string;
  matricule: string;
  nom: string;
  prenom: string;
  nomService: string;
};

const prisma = new PrismaClient();
const DOC_PATH = path.join(process.cwd(), "docs", "admins-decc-regionaux-test.md");

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function normalizeMatricule(matricule: string) {
  return matricule.trim().toUpperCase();
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function compactRegion(value: string) {
  return value.replace(/[^a-zA-Z0-9]/g, "");
}

function buildRegionalAdmins(): RegionalAdminSeed[] {
  return DECC_REGIONAL_ANTENNAS.map((antenne, index) => {
    const regionSlug = slugify(antenne.region);
    const regionCompact = compactRegion(antenne.region);

    return {
      region: antenne.region,
      antenneRegionaleId: antenne.id,
      email: normalizeEmail(`admin.decc.${regionSlug}@example.com`),
      password: `Decc${regionCompact}2026!`,
      matricule: normalizeMatricule(`DECC-${String(index + 1).padStart(2, "0")}-${regionSlug}`),
      nom: "Admin",
      prenom: `DECC ${antenne.region}`,
      nomService: `DECC ${antenne.region}`,
    };
  });
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

async function ensureSupabaseAdmin(input: RegionalAdminSeed) {
  const supabase = createSupabaseAdminClient();
  const existingUserId = await findSupabaseUserIdByEmail(input.email);
  const userAttributes = {
    password: input.password,
    email_confirm: true,
    app_metadata: {
      role: Role.ADMINISTRATEUR,
      matricule: input.matricule,
      organismeId: ORGANISME_IDS.DECC,
      antenneRegionaleId: input.antenneRegionaleId,
    },
    user_metadata: {
      matricule: input.matricule,
      nom: input.nom,
      prenom: input.prenom,
      region: input.region,
    },
  };

  if (existingUserId) {
    const { data, error } = await supabase.auth.admin.updateUserById(
      existingUserId,
      userAttributes,
    );

    if (error) {
      throw error;
    }

    return data.user.id;
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email: input.email,
    ...userAttributes,
  });

  if (error) {
    throw error;
  }

  return data.user.id;
}

async function ensurePrismaAdmin(input: RegionalAdminSeed, authUserId: string) {
  return prisma.user.upsert({
    where: { matricule: input.matricule },
    update: {
      authUserId,
      email: input.email,
      nom: input.nom,
      prenom: input.prenom,
      nomService: input.nomService,
      organismeId: ORGANISME_IDS.DECC,
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
      organismeId: ORGANISME_IDS.DECC,
      antenneRegionaleId: input.antenneRegionaleId,
      role: Role.ADMINISTRATEUR,
    },
  });
}

async function writeCredentialsDoc(admins: RegionalAdminSeed[]) {
  const rows = admins
    .map(
      (admin) =>
        `| ${admin.region} | ${admin.email} | ${admin.password} | ${admin.matricule} | ${admin.antenneRegionaleId} |`,
    )
    .join("\n");

  const content = `# Admins DECC regionaux de test

Ces comptes sont rattaches a l'organisme DECC. Chaque administrateur DECC gere uniquement les demandes BEPC de sa region.

| Region | Email | Mot de passe | Matricule | Antenne |
| --- | --- | --- | --- | --- |
${rows}

## Connexion

Utilise la page \`/auth/login/decc\`. Un admin OBC est bloque sur cette page, meme avec un bon mot de passe.

## Commande

\`\`\`bash
npm run seed:decc-admins
\`\`\`
`;

  await mkdir(path.dirname(DOC_PATH), { recursive: true });
  await writeFile(DOC_PATH, content, "utf8");
}

async function main() {
  const admins = buildRegionalAdmins();
  await ensureOrganismesAndAntennes();

  for (const input of admins) {
    const authUserId = await ensureSupabaseAdmin(input);
    await ensurePrismaAdmin(input, authUserId);
    console.log(`Admin DECC ${input.region} pret: ${input.email} (${input.matricule})`);
  }

  await writeCredentialsDoc(admins);
  console.log(`Fichier genere: ${DOC_PATH}`);
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
