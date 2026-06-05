import Link from "next/link";
import { cookies } from "next/headers";

import { LandingNavLinks } from "@/components/landing/landing-nav-links";
import { NavLoginMenu } from "@/components/landing/nav-login-menu";
import { getCurrentUser, getHomePathForRole } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { DocScolLogo } from "@/components/ui/DocScolLogo";
import { NavUserMenu } from "@/components/ui/nav-user-menu";

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
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-2 px-4 sm:gap-3 lg:px-8">
        <Link href="/" className="flex min-w-0 shrink items-center gap-3 text-text-1">
          <DocScolLogo variant="full" theme="light" />
        </Link>

        {!dbUser ? (
          <div className="flex flex-1 justify-center">
            <LandingNavLinks />
          </div>
        ) : (
          <div className="flex-1" />
        )}

        <nav className="flex shrink-0 items-center gap-2">
          {dbUser ? (
            <NavUserMenu homePath={getHomePathForRole(dbUser.role)} />
          ) : (
            <>
              <div className="hidden sm:block">
                <NavLoginMenu />
              </div>
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
