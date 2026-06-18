"use client";

import Link from "next/link";
import { Menu } from "lucide-react";

import { useI18n } from "@/components/i18n/locale-provider";
import { Button } from "@/components/ui/button";
import { getLoginPortals } from "@/lib/i18n/login-portals";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

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
  const { t } = useI18n();
  const loginPortals = getLoginPortals(t);

  const landingNavItems = [
    { href: "/#etapes", label: t("nav.steps") },
    { href: "/#acces", label: t("nav.access") },
    { href: "/#faq", label: t("nav.faq") },
    { href: "/#fonctionnalites", label: t("nav.features") },
  ] as const;

  return (
    <>
      <nav
        className="hidden items-center gap-6 md:flex lg:gap-8"
        aria-label={t("nav.homeSections")}
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
            aria-label={t("common.openMenu")}
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-[min(100%,280px)]">
          <SheetHeader>
            <SheetTitle className="text-left font-display text-xl">{t("common.navigation")}</SheetTitle>
          </SheetHeader>
          <nav className="mt-6 flex flex-col gap-4" aria-label={t("nav.mobileNav")}>
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
                label={t("nav.problemSolution")}
                className="block rounded-md px-2 py-2 text-base hover:bg-obc-50"
              />
            </SheetClose>

            <div className="mt-4 border-t border-[var(--border-token)] pt-4 sm:hidden">
              <p className="px-2 pb-1 text-xs font-semibold uppercase tracking-wide text-text-muted">
                {t("common.signInAs")}
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
                  <Link href="/auth/register">{t("common.activateStudentAccount")}</Link>
                </Button>
              </SheetClose>
            </div>
          </nav>
        </SheetContent>
      </Sheet>
    </>
  );
}
