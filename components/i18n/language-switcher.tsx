"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Languages } from "lucide-react";

import { setLocaleAction } from "@/app/actions/locale";
import { useI18n } from "@/components/i18n/locale-provider";
import type { Locale } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

type LanguageSwitcherProps = {
  compact?: boolean;
  className?: string;
};

export function LanguageSwitcher({ compact = false, className }: LanguageSwitcherProps) {
  const { locale, t } = useI18n();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function switchLocale(nextLocale: Locale) {
    if (nextLocale === locale || pending) {
      return;
    }

    startTransition(async () => {
      await setLocaleAction(nextLocale);
      router.refresh();
    });
  }

  return (
    <div
      className={cn("inline-flex items-center gap-1", className)}
      role="group"
      aria-label={t("common.language")}
    >
      {!compact ? (
        <Languages className="mr-1 hidden h-4 w-4 text-text-3 sm:inline" aria-hidden="true" />
      ) : null}
      {(["fr", "en"] as const).map((item) => (
        <button
          key={item}
          type="button"
          disabled={pending}
          onClick={() => switchLocale(item)}
          className={cn(
            "rounded-md px-2 py-1 text-xs font-semibold transition-colors",
            locale === item
              ? "bg-obc-800 text-white"
              : "border border-[var(--border-token)] bg-surface-0 text-text-2 hover:bg-obc-50",
          )}
          aria-pressed={locale === item}
        >
          {item.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
