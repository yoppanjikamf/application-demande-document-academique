import { dictionary as frDictionary } from "@/lib/i18n/dictionaries/fr";

type WidenStrings<T> = T extends string
  ? string
  : T extends readonly (infer U)[]
    ? WidenStrings<U>[]
    : T extends object
      ? { -readonly [K in keyof T]: WidenStrings<T[K]> }
      : T;

export type Dictionary = WidenStrings<typeof frDictionary>;
