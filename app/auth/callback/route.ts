import { NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";

import { createSupabaseServerClient } from "@/lib/supabase/server";

const ALLOWED_NEXT_PATHS = new Set(["/dashboard", "/auth/password/reset"]);

export async function GET(request: Request) {
  const url = new URL(request.url);
  const rawNext = url.searchParams.get("next") ?? "/dashboard";
  const next = ALLOWED_NEXT_PATHS.has(rawNext) ? rawNext : "/dashboard";
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const type = (url.searchParams.get("type") ?? "recovery") as EmailOtpType;
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return NextResponse.redirect(new URL("/auth/login?error=supabase", url.origin));
  }

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      return NextResponse.redirect(new URL("/auth/login?error=callback", url.origin));
    }
  } else if (tokenHash) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type,
    });

    if (error) {
      return NextResponse.redirect(new URL("/auth/login?error=callback", url.origin));
    }
  }

  return NextResponse.redirect(new URL(next, url.origin));
}
