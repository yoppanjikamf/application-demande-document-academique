"use client";

import Link from "next/link";
import { Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import { loginPortals } from "@/components/landing/login-portals";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const landingNavItems = [
  { href: "/#fonctionnalites", label: "Fonctionnalités" },
  { href: "/#etapes", label: "Étapes" },
  { href: "/#acces", label: "Accès" },
  { href: "/#faq", label: "FAQ" },
] as const;

function NavLink({ href, label, className }: { href: string; label: string; className?: string }) {
  return (
    <Link
      href={href}
      className={cn(
        "text-sm font-medium text-text-3 transition-colors hover:text-obc-800",
        className,
      )}
    >
      {label}
    </Link>
  );
}

export function LandingNavLinks() {
  return (
    <>
      <nav
        className="hidden items-center gap-6 md:flex lg:gap-8"
        aria-label="Sections de la page d'accueil"
      >
        {landingNavItems.map((item) => (
          <NavLink key={item.href} href={item.href} label={item.label} />
        ))}
      </nav>

      <Sheet>
        <SheetTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="md:hidden"
            aria-label="Ouvrir le menu de navigation"
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-[min(100%,280px)]">
          <SheetHeader>
            <SheetTitle className="text-left font-display text-xl">Navigation</SheetTitle>
          </SheetHeader>
          <nav className="mt-6 flex flex-col gap-4" aria-label="Sections mobile">
            {landingNavItems.map((item) => (
              <SheetClose asChild key={item.href}>
                <NavLink
                  href={item.href}
                  label={item.label}
                  className="block rounded-md px-2 py-2 text-base hover:bg-obc-50"
                />
              </SheetClose>
            ))}
            <SheetClose asChild>
              <NavLink
                href="/#probleme"
                label="Problème & solution"
                className="block rounded-md px-2 py-2 text-base hover:bg-obc-50"
              />
            </SheetClose>

            <div className="mt-4 border-t border-[var(--border-token)] pt-4 sm:hidden">
              <p className="px-2 pb-1 text-xs font-semibold uppercase tracking-wide text-text-muted">
                Se connecter en tant que
              </p>
              <div className="flex flex-col">
                {loginPortals.map((portal) => (
                  <SheetClose asChild key={portal.href}>
                    <Link
                      href={portal.href}
                      className="rounded-md px-2 py-2 text-base font-medium text-text-2 hover:bg-obc-50"
                    >
                      {portal.label}
                    </Link>
                  </SheetClose>
                ))}
              </div>
              <SheetClose asChild>
                <Button asChild className="mt-3 w-full justify-start">
                  <Link href="/auth/register">Activer mon compte élève</Link>
                </Button>
              </SheetClose>
            </div>
          </nav>
        </SheetContent>
      </Sheet>
    </>
  );
}
