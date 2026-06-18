"use client";

import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";

import { useI18n } from "@/components/i18n/locale-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { MORE_SECTION_HASHES } from "@/components/landing/landing-sticky-nav";

type LandingMoreSectionsProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
};

export function LandingMoreSections({ open, onOpenChange, children }: LandingMoreSectionsProps) {
  const { t } = useI18n();

  useEffect(() => {
    function maybeOpenFromHash() {
      if (MORE_SECTION_HASHES.has(window.location.hash)) {
        onOpenChange(true);
      }
    }

    maybeOpenFromHash();
    window.addEventListener("hashchange", maybeOpenFromHash);
    return () => window.removeEventListener("hashchange", maybeOpenFromHash);
  }, [onOpenChange]);

  return (
    <section id="voir-plus" className="border-y border-[var(--border-token)] bg-surface-1 py-14 lg:py-16">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-display text-2xl text-text-1 sm:text-3xl">{t("landing.voirPlus.title")}</h2>
          <p className="mt-3 text-base leading-7 text-text-3">{t("landing.voirPlus.description")}</p>
          <Button
            type="button"
            variant={open ? "outline" : "default"}
            className="mt-6"
            onClick={() => onOpenChange(!open)}
            aria-expanded={open}
            aria-controls="landing-more-content"
          >
            {open ? t("landing.voirPlus.collapse") : t("landing.voirPlus.expand")}
            <ChevronDown
              className={cn("h-4 w-4 transition-transform duration-300", open && "rotate-180")}
              aria-hidden="true"
            />
          </Button>
        </div>

        <div
          id="landing-more-content"
          className={cn(
            "grid transition-[grid-template-rows,opacity] duration-500 ease-out",
            open ? "mt-12 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
          )}
        >
          <div className="overflow-hidden">
            <div className="space-y-0">{children}</div>
          </div>
        </div>
      </div>
    </section>
  );
}
