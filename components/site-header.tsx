import Link from "next/link";

import { getCurrentUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";

export async function SiteHeader() {
  const supabase = await createSupabaseServerClient();
  const user = supabase ? (await supabase.auth.getUser()).data.user : null;
  const dbUser = user ? await getCurrentUser() : null;

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-3 font-semibold tracking-tight text-slate-950">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-blue-700 text-sm font-bold text-white">
            OBC
          </span>
          <span className="hidden sm:block">Documents Academiques</span>
        </Link>
        <nav className="flex items-center gap-2">
          {user ? (
            <>
              {dbUser?.role === "ADMINISTRATEUR" ? (
                <Button asChild variant="ghost">
                  <Link href="/admin">Administration</Link>
                </Button>
              ) : (
                <Button asChild variant="ghost">
                  <Link href="/dashboard">Espace eleve</Link>
                </Button>
              )}
              <Button asChild variant="ghost" className="hidden sm:inline-flex">
                <Link href="/account">Compte</Link>
              </Button>
              <form action="/logout" method="post">
                <Button type="submit" variant="outline">
                  Deconnexion
                </Button>
              </form>
            </>
          ) : (
            <>
              <Button asChild variant="ghost">
                <Link href="/auth/login">Connexion</Link>
              </Button>
              <Button asChild>
                <Link href="/auth/register">Activation</Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
