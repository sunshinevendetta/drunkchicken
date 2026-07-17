export type Locale = "en" | "zh-HK";

export const LOCALE_STORAGE_KEY = "drunkchicken-locale";

export function isLocale(value: string | null): value is Locale {
  return value === "en" || value === "zh-HK";
}
