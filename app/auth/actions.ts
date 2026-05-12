"use server";

import { z } from "zod";

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

function isTransientDatabaseError(error: unknown) {
  if (!(error instanceof Error)) {
    return false;
  }

  return error.message.includes("Can't reach database server") || error.message.includes("P1001");
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

export async function signInAction(input: z.infer<typeof signInSchema> & { next?: string }) {
  const parsed = signInSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: "Informations de connexion invalides." };
  }

  const matricule = normalizeMatricule(parsed.data.matricule);
  const dbUser = await withDatabaseRetry(() =>
    prisma.user.findUnique({
      where: { matricule },
      select: { id: true, authUserId: true, email: true, role: true },
    }),
  );

  if (!dbUser || dbUser.email.toLowerCase() !== parsed.data.email) {
    return { ok: false as const, error: "Matricule ou email incorrect." };
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return { ok: false as const, error: "Configuration Supabase manquante." };
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

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

  return { ok: true as const, redirectTo: safeNextPath(input.next) };
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
      select: { id: true, authUserId: true, email: true, role: true },
    }),
  );

  if (!dbUser || dbUser.email.toLowerCase() !== parsed.data.email) {
    return {
      ok: false as const,
      error: "Aucun eleve ne correspond a ce matricule et cet email.",
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
      error: "Ce compte est deja active. Connectez-vous directement.",
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

  return { ok: true as const, redirectTo: "/dashboard" };
}
