import Link from "next/link";
import { cookies } from "next/headers";

import { getCurrentUser, getHomePathForRole } from "@/lib/auth";
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
    <header className="sticky top-0 z-40 border-b border-[#E5E7EB] bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link
          href="/"
          className="flex items-center gap-3 font-semibold tracking-tight text-[#1B4332]"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1B4332] text-sm font-bold text-white shadow-sm">
            OD
          </span>
          <span className="hidden sm:block">OBC/DECC</span>
        </Link>
        <nav className="flex items-center gap-2">
          {dbUser ? (
            <>
              <Button asChild variant="ghost">
                <Link href={getHomePathForRole(dbUser.role)}>
                  {dbUser.role === "ADMINISTRATEUR"
                    ? "Administration"
                    : dbUser.role === "AGENT_CENTRE_EXAMEN"
                      ? "Espace agent"
                      : "Espace élève"}
                </Link>
              </Button>
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
                <Link href="/auth/login">Élève</Link>
              </Button>
              <Button asChild variant="ghost">
                <Link href="/auth/login/obc">OBC</Link>
              </Button>
              <Button asChild variant="ghost">
                <Link href="/auth/login/decc">DECC</Link>
              </Button>
              <Button asChild variant="ghost">
                <Link href="/auth/login/centre-examen">Centre</Link>
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
