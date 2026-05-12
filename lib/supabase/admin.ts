import { createClient } from "@supabase/supabase-js";

function requiredEnv(name: string) {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Variable d'environnement manquante: ${name}`);
  }

  return value;
}

export function createSupabaseAdminClient() {
  const supabaseUrl = process.env.SUPABASE_URL?.trim() || requiredEnv("NEXT_PUBLIC_SUPABASE_URL");
  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || process.env.SUPABASE_SERVICE_KEY?.trim();

  if (!serviceRoleKey) {
    throw new Error("Variable d'environnement manquante: SUPABASE_SERVICE_ROLE_KEY");
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
