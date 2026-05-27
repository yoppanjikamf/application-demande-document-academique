import { handleApiError, json } from "@/lib/api-utils";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST() {
  try {
    const supabase = await createSupabaseServerClient();

    if (supabase) {
      await supabase.auth.signOut();
    }

    return json({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
