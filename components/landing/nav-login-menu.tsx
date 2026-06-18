"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

import { useI18n } from "@/components/i18n/locale-provider";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { getLoginPortals } from "@/lib/i18n/login-portals";

export function NavLoginMenu() {
  const [open, setOpen] = useState(false);
  const { t } = useI18n();
  const loginPortals = getLoginPortals(t);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost">
          {t("common.signIn")}
          <ChevronDown
            className="h-4 w-4 transition-transform data-[state=open]:rotate-180"
            data-state={open ? "open" : "closed"}
            aria-hidden="true"
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-2">
        <p className="px-2 py-1.5 text-xs font-semibold uppercase tracking-wide text-text-muted">
          {t("common.signInAs")}
        </p>
        <div className="grid gap-1">
          {loginPortals.map((portal) => {
            const Icon = portal.icon;
            return (
              <Link
                key={portal.href}
                href={portal.href}
                onClick={() => setOpen(false)}
                className="flex items-start gap-3 rounded-md p-2 transition-[var(--transition-base)] hover:bg-obc-50"
              >
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-obc-50 text-obc-800">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-text-1">{portal.label}</span>
                  <span className="block text-xs text-text-3">{portal.hint}</span>
                </span>
              </Link>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
