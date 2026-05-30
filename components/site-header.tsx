import Link from "next/link";
import { cookies } from "next/headers";

import { getCurrentUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";

export async function SiteHeader() {
  const cookieStore = await cookies();
  const hasSupabaseCookie = cookieStore.getAll().some((cookie) => cookie.name.startsWith("sb-"));
  const dbUser = hasSupabaseCookie
    ? await getCurrentUser().catch((error) => {
        console.warn("Unable to load current user in site header:", error);
        return null;
      })
    : null;

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link
          href="/"
          className="flex items-center gap-3 font-semibold tracking-tight text-slate-950"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-blue-700 text-sm font-bold text-white">
            DR
          </span>
          <span className="hidden sm:block">DR-DOCSCOL</span>
        </Link>
        <nav className="flex items-center gap-2">
          {dbUser ? (
            <>
              {dbUser?.role === "ADMINISTRATEUR" ? (
                <Button asChild variant="ghost">
                  <Link href="/admin">Administration</Link>
                </Button>
              ) : (
                <Button asChild variant="ghost">
                  <Link href="/dashboard">Espace élève</Link>
                </Button>
              )}
              <Button asChild variant="ghost" className="hidden sm:inline-flex">
                <Link href="/account">Compte</Link>
              </Button>
              <form action="/logout" method="post">
                <Button type="submit" variant="outline">
                  Déconnexion
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
