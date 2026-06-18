import type { Locale } from "@/lib/i18n/config";
import { dictionary as en } from "@/lib/i18n/dictionaries/en";
import { dictionary as fr } from "@/lib/i18n/dictionaries/fr";
import type { Dictionary } from "@/lib/i18n/types";
import { createTranslator } from "@/lib/i18n/translate";

const dictionaries: Record<Locale, Dictionary> = {
  fr: fr as Dictionary,
  en,
};

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}

export function getTranslator(locale: Locale) {
  return createTranslator(getDictionary(locale));
}
