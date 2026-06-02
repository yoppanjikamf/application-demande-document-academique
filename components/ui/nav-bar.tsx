import Link from "next/link";
import { cookies } from "next/headers";

import { getCurrentUser, getHomePathForRole } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { DocScolLogo } from "@/components/ui/DocScolLogo";

export async function NavBar() {
  const cookieStore = await cookies();
  const hasSupabaseCookie = cookieStore.getAll().some((cookie) => cookie.name.startsWith("sb-"));
  const dbUser = hasSupabaseCookie
    ? await getCurrentUser().catch((error) => {
        console.warn("Unable to load current user in nav bar:", error);
        return null;
      })
    : null;

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border-token)] bg-[rgba(255,255,255,0.9)] backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-8">
        <Link href="/" className="flex items-center gap-3 text-text-1">
          <DocScolLogo variant="full" theme="light" />
        </Link>

        <nav className="flex items-center gap-2">
          {dbUser ? (
            <>
              <Button asChild variant="ghost">
                <Link href={getHomePathForRole(dbUser.role)}>Mon espace</Link>
              </Button>
              <Button asChild variant="outline">
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
