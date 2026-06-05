"use client";

import Link from "next/link";
import { Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
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
            <SheetTitle className="font-display text-left text-xl">Navigation</SheetTitle>
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
          </nav>
        </SheetContent>
      </Sheet>
    </>
  );
}
