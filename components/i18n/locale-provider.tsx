"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import type { Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import type { Dictionary } from "@/lib/i18n/types";
import { createTranslator, type TranslationKey, type Translator } from "@/lib/i18n/translate";

type LocaleContextValue = {
  locale: Locale;
  dictionary: Dictionary;
  t: Translator;
  setLocale: (locale: Locale) => void;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({
  locale: initialLocale,
  dictionary: initialDictionary,
  children,
}: {
  locale: Locale;
  dictionary: Dictionary;
  children: React.ReactNode;
}) {
  const [locale, setLocaleState] = useState(initialLocale);
  const [dictionary, setDictionary] = useState(initialDictionary);

  useEffect(() => {
    setLocaleState(initialLocale);
    setDictionary(initialDictionary);
  }, [initialLocale, initialDictionary]);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    setDictionary(getDictionary(next));
    if (typeof document !== "undefined") {
      document.documentElement.lang = next;
    }
  }, []);

  const value = useMemo(
    () => ({
      locale,
      dictionary,
      t: createTranslator(dictionary),
      setLocale,
    }),
    [locale, dictionary, setLocale],
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
