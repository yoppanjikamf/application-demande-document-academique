import "dotenv/config";

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { PrismaClient, Role } from "../lib/generated/prisma/client";
import { CENTRES_EXAMEN_REGIONAUX } from "../lib/document-routing";
import { createSupabaseAdminClient } from "../lib/supabase/admin";

type CentreAgentSeed = {
  region: string;
  centreExamenId: string;
  centreExamenNom: string;
  email: string;
  password: string;
  matricule: string;
  nom: string;
  prenom: string;
  nomService: string;
};

const prisma = new PrismaClient();
const DOC_PATH = path.join(process.cwd(), "docs", "agents-centres-examen-test.md");
const AGENT_PASSWORD = "AgentCentre2026!";

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

function buildCentreAgents(): CentreAgentSeed[] {
  return CENTRES_EXAMEN_REGIONAUX.map((centre, index) => {
    const regionSlug = slugify(centre.region);

    return {
      region: centre.region,
      centreExamenId: centre.id,
      centreExamenNom: centre.nom,
      email: normalizeEmail(`agent.centre.${regionSlug}@example.com`),
      password: AGENT_PASSWORD,
      matricule: normalizeMatricule(`AGENT-CE-${String(index + 1).padStart(2, "0")}-${regionSlug}`),
      nom: "Agent",
      prenom: centre.region,
      nomService: centre.nom,
    };
  });
}

async function ensureCentresExamen() {
  for (const centre of CENTRES_EXAMEN_REGIONAUX) {
    await prisma.centreExamen.upsert({
      where: { id: centre.id },
      update: {
        nom: centre.nom,
        region: centre.region,
        ville: centre.ville,
      },
      create: {
        id: centre.id,
        nom: centre.nom,
        region: centre.region,
        ville: centre.ville,
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

async function ensureSupabaseAgent(input: CentreAgentSeed) {
  const supabase = createSupabaseAdminClient();
  const existingUserId = await findSupabaseUserIdByEmail(input.email);
  const userAttributes = {
    password: input.password,
    email_confirm: true,
    app_metadata: {
      role: Role.AGENT_CENTRE_EXAMEN,
      matricule: input.matricule,
      centreExamenId: input.centreExamenId,
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

async function ensurePrismaAgent(input: CentreAgentSeed, authUserId: string) {
  return prisma.user.upsert({
    where: { matricule: input.matricule },
    update: {
      authUserId,
      email: input.email,
      nom: input.nom,
      prenom: input.prenom,
      nomService: input.nomService,
      role: Role.AGENT_CENTRE_EXAMEN,
      dateNaissance: null,
      organismeId: null,
      antenneRegionaleId: null,
      centreExamenId: input.centreExamenId,
    },
    create: {
      authUserId,
      email: input.email,
      matricule: input.matricule,
      nom: input.nom,
      prenom: input.prenom,
      nomService: input.nomService,
      role: Role.AGENT_CENTRE_EXAMEN,
      centreExamenId: input.centreExamenId,
    },
  });
}

async function writeCredentialsDoc(agents: CentreAgentSeed[]) {
  const rows = agents
    .map(
      (agent) =>
        `| ${agent.region} | ${agent.centreExamenNom} | ${agent.email} | ${agent.password} | ${agent.matricule} |`,
    )
    .join("\n");

  const content = `# Agents Centres d'Examen de test

Ces comptes sont rattaches au role \`AGENT_CENTRE_EXAMEN\`. Chaque agent est lie a un seul centre d'examen et ne voit que les rendez-vous de retrait confirmes pour sa region.

| Region | Centre d'examen | Email | Mot de passe | Matricule |
| --- | --- | --- | --- | --- |
${rows}

## Connexion

Utilise la page \`/auth/login/centre-examen\`.

## Commande

\`\`\`bash
npm run seed:centre-agents
\`\`\`

## Perimetre de test

- L'agent voit uniquement les rendez-vous de son centre.
- L'agent ne voit pas les documents numerises et ne peut pas les telecharger.
- L'agent ne peut ni creer, ni annuler, ni supprimer une demande.
- L'agent peut seulement confirmer le retrait d'un rendez-vous confirme.
- Les retraits deja confirmes restent consultables pendant 30 jours dans l'onglet \`Deja traites\`, puis disparaissent de cette liste sans etre supprimes de l'historique.
`;

  await mkdir(path.dirname(DOC_PATH), { recursive: true });
  await writeFile(DOC_PATH, content, "utf8");
}

async function main() {
  const agents = buildCentreAgents();
  await ensureCentresExamen();

  for (const input of agents) {
    const authUserId = await ensureSupabaseAgent(input);
    await ensurePrismaAgent(input, authUserId);
    console.log(`Agent centre ${input.region} pret: ${input.email} (${input.matricule})`);
  }

  await writeCredentialsDoc(agents);
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
