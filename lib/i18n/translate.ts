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
  return function t(key: TranslationKey): string {
    const value = key.split(".").reduce<unknown>((acc, part) => {
      if (acc && typeof acc === "object" && part in acc) {
        return (acc as Record<string, unknown>)[part];
      }
      return undefined;
    }, dictionary);

    return typeof value === "string" ? value : key;
  };
}

export type Translator = ReturnType<typeof createTranslator>;
