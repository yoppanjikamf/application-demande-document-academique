"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

import { LOCALE_COOKIE, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import type { Dictionary } from "@/lib/i18n/types";
import { createTranslator, type TranslationKey, type Translator } from "@/lib/i18n/translate";

function persistLocaleCookie(locale: Locale) {
  document.cookie = `${LOCALE_COOKIE}=${locale}; Path=/; Max-Age=31536000; SameSite=Lax`;
}

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
  const chosenLocaleRef = useRef<Locale | null>(null);

  useEffect(() => {
    if (chosenLocaleRef.current && chosenLocaleRef.current !== initialLocale) {
      return;
    }
    chosenLocaleRef.current = null;
    setLocaleState(initialLocale);
    setDictionary(initialDictionary);
  }, [initialLocale, initialDictionary]);

  const setLocale = useCallback((next: Locale) => {
    chosenLocaleRef.current = next;
    setLocaleState(next);
    setDictionary(getDictionary(next));
    if (typeof document !== "undefined") {
      document.documentElement.lang = next;
      persistLocaleCookie(next);
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
