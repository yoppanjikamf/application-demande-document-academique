import type { Dictionary } from "@/lib/i18n/types";

type NestedKeyOf<T, Prefix extends string = ""> = T extends string
  ? Prefix extends ""
    ? never
    : Prefix
  : {
      [K in keyof T & string]: NestedKeyOf<T[K], Prefix extends "" ? K : `${Prefix}.${K}`>;
    }[keyof T & string];

export type TranslationKey = NestedKeyOf<Dictionary>;

export function createTranslator(dictionary: Dictionary) {
  return function t(key: TranslationKey, vars?: Record<string, string | number>): string {
    const value = key.split(".").reduce<unknown>((acc, part) => {
      if (acc && typeof acc === "object" && part in acc) {
        return (acc as Record<string, unknown>)[part];
      }
      return undefined;
    }, dictionary);

    let result = typeof value === "string" ? value : key;
    if (vars) {
      for (const [name, replacement] of Object.entries(vars)) {
        result = result.replaceAll(`{${name}}`, String(replacement));
      }
    }
    return result;
  };
}

export type Translator = ReturnType<typeof createTranslator>;
