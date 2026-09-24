// i18n/config.ts

export const LOCALES = ["id", "en"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "id";

/** Label + bendera untuk dropdown */
export const LOCALE_META: Record<
  Locale,
  { label: string; nativeLabel: string; flag: string }
> = {
  id: {
    label: "Indonesian",
    nativeLabel: "Bahasa Indonesia",
    flag: "🇮🇩",
  },
  en: {
    label: "English",
    nativeLabel: "English",
    flag: "🇬🇧",
  },
};

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

/**
 * Deteksi locale dari header `Accept-Language` browser.
 * Contoh header: "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7"
 */
export function detectLocaleFromHeader(header: string | null): Locale {
  if (!header) return DEFAULT_LOCALE;

  const parts = header
    .split(",")
    .map((p) => {
      const [tag, q] = p.trim().split(";q=");
      return { tag: tag.trim(), q: q ? parseFloat(q) : 1 };
    })
    .sort((a, b) => b.q - a.q);

  for (const { tag } of parts) {
    const primary = tag.split("-")[0].toLowerCase();
    if (isLocale(primary)) return primary;
  }

  return DEFAULT_LOCALE;
}