"use client";

import { createContext, useContext, useMemo } from "react";

import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/types";
import { createTranslator, type TranslationKey, type Translator } from "@/lib/i18n/translate";

type LocaleContextValue = {
  locale: Locale;
  dictionary: Dictionary;
  t: Translator;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({
  locale,
  dictionary,
  children,
}: {
  locale: Locale;
  dictionary: Dictionary;
  children: React.ReactNode;
}) {
  const value = useMemo(
    () => ({
      locale,
      dictionary,
      t: createTranslator(dictionary),
    }),
    [locale, dictionary],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useI18n() {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error("useI18n must be used within LocaleProvider");
  }
  return context;
}

export function useOptionalI18n() {
  return useContext(LocaleContext);
}

export type { TranslationKey };
