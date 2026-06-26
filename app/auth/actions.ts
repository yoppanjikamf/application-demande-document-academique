"use server";

import { z } from "zod";

import { adminMissingRegionMessage, getHomePathForRole } from "@/lib/auth";
import {
  getOrganismeNameById,
  ORGANISME_IDS,
  type OrganismeName,
} from "@/lib/document-routing";
import { notifyAccountActivated } from "@/lib/mail-service";
import { prisma } from "@/lib/prisma";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { signInSchema, signUpSchema } from "@/lib/validations";

function normalizeMatricule(matricule: string) {
  return matricule.trim().toUpperCase();
}

function safeNextPath(next?: string) {
  if (!next?.startsWith("/") || next.startsWith("//")) {
    return "/dashboard";
  }

  return next;
}

function safeAdminNextPath(next?: string) {
  if (!next?.startsWith("/") || next.startsWith("//")) {
    return "/admin";
  }

  if (!next.startsWith("/admin") && next !== "/account") {
    return "/admin";
  }

  return next;
}

function safeAgentCentreNextPath(next?: string) {
  if (!next?.startsWith("/") || next.startsWith("//")) {
    return "/centre-examen";
  }

  if (!next.startsWith("/centre-examen") && next !== "/account") {
    return "/centre-examen";
  }

  return next;
}

function safeNextPathForRole(role: string, next?: string) {
  if (role === "ADMINISTRATEUR") {
    return safeAdminNextPath(next);
  }

  if (role === "AGENT_CENTRE_EXAMEN") {
    return safeAgentCentreNextPath(next);
  }

  return safeNextPath(next);
}

function isTransientDatabaseError(error: unknown) {
  if (!(error instanceof Error)) {
    return false;
  }

  return (
    error.message.includes("Can't reach database server") ||
    error.message.includes("Timed out fetching a new connection from the connection pool") ||
    error.message.includes("P1001") ||
    error.message.includes("P2024")
  );
}

async function withDatabaseRetry<T>(operation: () => Promise<T>) {
  let lastError: unknown;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      if (!isTransientDatabaseError(error) || attempt === 2) {
        throw error;
      }

      await new Promise((resolve) => setTimeout(resolve, 600 * (attempt + 1)));
    }
  }

  throw lastError;
}

async function findSupabaseUserIdByEmail(email: string) {
  const supabaseAdmin = createSupabaseAdminClient();
  const perPage = 1000;

  for (let page = 1; page <= 10; page += 1) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage });

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

async function ensureAdminAuthUser(options: {
  email: string;
  password: string;
  matricule: string;
  nom: string;
  prenom: string;
  organismeId: string | null;
  antenneRegionaleId: string | null;
  authUserId: string | null;
}) {
  const supabaseAdmin = createSupabaseAdminClient();
  const appMetadata = {
    role: "ADMINISTRATEUR",
    matricule: options.matricule,
    organismeId: options.organismeId,
    antenneRegionaleId: options.antenneRegionaleId,
  };
  const userMetadata = {
    matricule: options.matricule,
    nom: options.nom,
    prenom: options.prenom,
  };

  if (options.authUserId) {
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(options.authUserId, {
      email_confirm: true,
      app_metadata: appMetadata,
      user_metadata: userMetadata,
    });

    if (error) {
      throw error;
    }

    return data.user.id;
  }

  const existingAuthUserId = await findSupabaseUserIdByEmail(options.email);
  const payload = {
    password: options.password,
    email_confirm: true,
    app_metadata: appMetadata,
    user_metadata: userMetadata,
  };

  const { data, error } = existingAuthUserId
    ? await supabaseAdmin.auth.admin.updateUserById(existingAuthUserId, payload)
    : await supabaseAdmin.auth.admin.createUser({
        email: options.email,
        ...payload,
      });

  if (error) {
    throw error;
  }

  return data.user.id;
}

async function ensureAgentAuthUser(options: {
  email: string;
  password: string;
  matricule: string;
  nom: string;
  prenom: string;
  centreExamenId: string | null;
  authUserId: string | null;
}) {
  const supabaseAdmin = createSupabaseAdminClient();
  const appMetadata = {
    role: "AGENT_CENTRE_EXAMEN",
    matricule: options.matricule,
    centreExamenId: options.centreExamenId,
  };
  const userMetadata = {
    matricule: options.matricule,
    nom: options.nom,
    prenom: options.prenom,
  };
  const payload = {
    password: options.password,
    email_confirm: true,
    app_metadata: appMetadata,
    user_metadata: userMetadata,
  };

  if (options.authUserId) {
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
      options.authUserId,
      payload,
    );

    if (error) {
      throw error;
    }

    return data.user.id;
  }

  const existingAuthUserId = await findSupabaseUserIdByEmail(options.email);
  const { data, error } = existingAuthUserId
    ? await supabaseAdmin.auth.admin.updateUserById(existingAuthUserId, payload)
    : await supabaseAdmin.auth.admin.createUser({
        email: options.email,
        ...payload,
      });

  if (error) {
    throw error;
  }

  return data.user.id;
}

export async function signInAction(
  input: z.infer<typeof signInSchema> & {
    next?: string;
    loginOrganisme?: OrganismeName;
    loginRole?: "AGENT_CENTRE_EXAMEN";
  },
) {
  const parsed = signInSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: "Informations de connexion invalides." };
  }

  const matricule = normalizeMatricule(parsed.data.matricule);
  const dbUser = await withDatabaseRetry(() =>
    prisma.user.findUnique({
      where: { matricule },
      select: {
        id: true,
        authUserId: true,
        email: true,
        role: true,
        nom: true,
        prenom: true,
        matricule: true,
        organismeId: true,
        antenneRegionaleId: true,
        centreExamenId: true,
      },
    }),
  );

  if (!dbUser || dbUser.email.toLowerCase() !== parsed.data.email) {
    return { ok: false as const, error: "Matricule ou email incorrect." };
  }

  const expectedOrganismeId = input.loginOrganisme ? ORGANISME_IDS[input.loginOrganisme] : null;
  const expectedAgentCentre = input.loginRole === "AGENT_CENTRE_EXAMEN";

  if (expectedAgentCentre && dbUser.role !== "AGENT_CENTRE_EXAMEN") {
    return {
      ok: false as const,
      error: "Cette connexion est reservee aux agents centre d'examen.",
    };
  }

  if (!expectedAgentCentre && dbUser.role === "AGENT_CENTRE_EXAMEN") {
    return { ok: false as const, error: "Utilisez la page de connexion Agent Centre d'Examen." };
  }

  if (dbUser.role === "ADMINISTRATEUR" && !expectedOrganismeId) {
    return { ok: false as const, error: "Utilisez la page de connexion admin OBC ou DECC." };
  }

  if (dbUser.role !== "ADMINISTRATEUR" && expectedOrganismeId) {
    return { ok: false as const, error: "Cette connexion est reservee aux administrateurs." };
  }

  if (expectedOrganismeId && dbUser.organismeId !== expectedOrganismeId) {
    const actual = getOrganismeNameById(dbUser.organismeId) ?? "un autre organisme";
    return {
      ok: false as const,
      error: `Ce compte appartient a ${actual}. Utilisez la bonne page de connexion.`,
    };
  }

  if (dbUser.role === "ADMINISTRATEUR" && !dbUser.antenneRegionaleId) {
    return { ok: false as const, error: adminMissingRegionMessage() };
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return { ok: false as const, error: "Configuration Supabase manquante." };
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error && dbUser.role === "ADMINISTRATEUR") {
    try {
      const authUserId = await ensureAdminAuthUser({
        email: dbUser.email,
        password: parsed.data.password,
        matricule: dbUser.matricule,
        nom: dbUser.nom,
        prenom: dbUser.prenom,
        organismeId: dbUser.organismeId,
        antenneRegionaleId: dbUser.antenneRegionaleId,
        authUserId: dbUser.authUserId,
      });

      if (!dbUser.authUserId || dbUser.authUserId !== authUserId) {
        await withDatabaseRetry(() =>
          prisma.user.update({
            where: { id: dbUser.id },
            data: { authUserId },
          }),
        );
      }

      const retry = await supabase.auth.signInWithPassword({
        email: parsed.data.email,
        password: parsed.data.password,
      });

      if (retry.error) {
        return { ok: false as const, error: "Mot de passe incorrect." };
      }

      if (retry.data.user && dbUser.authUserId !== retry.data.user.id) {
        await withDatabaseRetry(() =>
          prisma.user.update({
            where: { id: dbUser.id },
            data: {
              authUserId: retry.data.user.id,
              derniereConnexion: new Date(),
            },
          }),
        );
      } else {
        await withDatabaseRetry(() =>
          prisma.user.update({
            where: { id: dbUser.id },
            data: { derniereConnexion: new Date() },
          }),
        );
      }

      return {
        ok: true as const,
        redirectTo: input.next
          ? safeNextPathForRole(dbUser.role, input.next)
          : getHomePathForRole(dbUser.role),
      };
    } catch (adminError) {
      return {
        ok: false as const,
        error: adminError instanceof Error ? adminError.message : "Connexion admin impossible.",
      };
    }
  }

  if (error && dbUser.role === "AGENT_CENTRE_EXAMEN" && expectedAgentCentre) {
    try {
      const authUserId = await ensureAgentAuthUser({
        email: dbUser.email,
        password: parsed.data.password,
        matricule: dbUser.matricule,
        nom: dbUser.nom,
        prenom: dbUser.prenom,
        centreExamenId: dbUser.centreExamenId,
        authUserId: dbUser.authUserId,
      });

      if (!dbUser.authUserId || dbUser.authUserId !== authUserId) {
        await withDatabaseRetry(() =>
          prisma.user.update({
            where: { id: dbUser.id },
            data: { authUserId },
          }),
        );
      }

      const retry = await supabase.auth.signInWithPassword({
        email: parsed.data.email,
        password: parsed.data.password,
      });

      if (retry.error) {
        return { ok: false as const, error: "Mot de passe incorrect." };
      }

      if (retry.data.user && dbUser.authUserId !== retry.data.user.id) {
        await withDatabaseRetry(() =>
          prisma.user.update({
            where: { id: dbUser.id },
            data: {
              authUserId: retry.data.user.id,
              derniereConnexion: new Date(),
            },
          }),
        );
      } else {
        await withDatabaseRetry(() =>
          prisma.user.update({
            where: { id: dbUser.id },
            data: { derniereConnexion: new Date() },
          }),
        );
      }

      return {
        ok: true as const,
        redirectTo: input.next
          ? safeNextPathForRole(dbUser.role, input.next)
          : getHomePathForRole(dbUser.role),
      };
    } catch (agentError) {
      return {
        ok: false as const,
        error:
          agentError instanceof Error ? agentError.message : "Connexion agent centre impossible.",
      };
    }
  }

  if (error) {
    return { ok: false as const, error: "Mot de passe incorrect ou compte non active." };
  }

  if (data.user && dbUser.authUserId !== data.user.id) {
    await withDatabaseRetry(() =>
      prisma.user.update({
        where: { id: dbUser.id },
        data: {
          authUserId: data.user.id,
          derniereConnexion: new Date(),
        },
      }),
    );
  } else {
    await withDatabaseRetry(() =>
      prisma.user.update({
        where: { id: dbUser.id },
        data: { derniereConnexion: new Date() },
      }),
    );
  }

  // Créer un log d'audit pour la connexion réussie
  await prisma.auditLog
    .create({
      data: {
        action: "LOGIN",
        resource: "USER",
        resourceId: dbUser.id,
        userId: dbUser.id,
        details: JSON.stringify({
          email: dbUser.email,
          role: dbUser.role,
          timestamp: new Date().toISOString(),
        }),
      },
    })
    .catch((err) => {
      console.error("Failed to create login audit log:", err);
    });

  return {
    ok: true as const,
    redirectTo: input.next
      ? safeNextPathForRole(dbUser.role, input.next)
      : getHomePathForRole(dbUser.role),
  };
}

export async function signUpAction(input: z.infer<typeof signUpSchema>) {
  const parsed = signUpSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: "Informations d'inscription invalides." };
  }

  const matricule = normalizeMatricule(parsed.data.matricule);
  const dbUser = await withDatabaseRetry(() =>
    prisma.user.findUnique({
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
    }),
  );

  if (!dbUser || dbUser.email.toLowerCase() !== parsed.data.email) {
    return {
      ok: false as const,
      error: "Aucun élève ne correspond à ce matricule et à cet email.",
    };
  }

  if (dbUser.role !== "ELEVE") {
    return {
      ok: false as const,
      error: "Les comptes administrateurs sont crees manuellement.",
    };
  }

  if (dbUser.authUserId) {
    return {
      ok: false as const,
      error: "Ce compte est déjà activé. Connectez-vous directement.",
    };
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return { ok: false as const, error: "Configuration Supabase manquante." };
  }

  const supabaseAdmin = createSupabaseAdminClient();
  const existingAuthUserId = await findSupabaseUserIdByEmail(parsed.data.email);
  const userPayload = {
    password: parsed.data.password,
    email_confirm: true,
    app_metadata: {
      matricule,
      role: dbUser.role,
    },
    user_metadata: {
      matricule,
      role: dbUser.role,
    },
  };

  const { data, error } = existingAuthUserId
    ? await supabaseAdmin.auth.admin.updateUserById(existingAuthUserId, userPayload)
    : await supabaseAdmin.auth.admin.createUser({
        email: parsed.data.email,
        ...userPayload,
      });

  if (error) {
    return { ok: false as const, error: error.message };
  }

  const user = data.user;
  if (user) {
    await withDatabaseRetry(() =>
      prisma.user.update({
        where: { id: dbUser.id },
        data: {
          authUserId: user.id,
          email: parsed.data.email,
          derniereConnexion: new Date(),
        },
      }),
    );
  }

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (signInError) {
    return {
      ok: false as const,
      error: "Compte active, mais connexion automatique impossible. Connectez-vous manuellement.",
    };
  }

  await notifyAccountActivated({
    userId: dbUser.id,
    to: parsed.data.email,
    recipientName: `${dbUser.prenom} ${dbUser.nom}`.trim(),
    matricule: dbUser.matricule,
  }).catch((error) => {
    console.error("Failed to send account activation welcome message:", error);
  });

  return { ok: true as const, redirectTo: "/dashboard" };
}
