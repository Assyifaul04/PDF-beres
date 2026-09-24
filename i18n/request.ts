// i18n/request.ts
import { getRequestConfig } from "next-intl/server";
import { cookies, headers } from "next/headers";
import {
  DEFAULT_LOCALE,
  detectLocaleFromHeader,
  isLocale,
  type Locale,
} from "./config";

export const LOCALE_COOKIE = "NEXT_LOCALE";

export default getRequestConfig(async () => {
  // 1) Prioritas: cookie (user override)
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get(LOCALE_COOKIE)?.value;

  let locale: Locale = DEFAULT_LOCALE;

  if (cookieLocale && isLocale(cookieLocale)) {
    locale = cookieLocale;
  } else {
    // 2) Fallback: header Accept-Language
    const headerStore = await headers();
    locale = detectLocaleFromHeader(headerStore.get("accept-language"));
  }

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});