// components/layout/language-switcher.tsx
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Check, ChevronDown, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { LOCALES, LOCALE_META, type Locale } from "@/i18n/config";

// Nama cookie harus sama dengan yang dipakai di i18n/request.ts
const LOCALE_COOKIE = "NEXT_LOCALE";
const ONE_YEAR = 60 * 60 * 24 * 365;

export function LanguageSwitcher() {
  const router = useRouter();
  const currentLocale = useLocale() as Locale;
  const t = useTranslations("languageSwitcher");

  const [open, setOpen] = React.useState(false);
  const [pending, setPending] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  // Tutup saat klik di luar
  React.useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  // Tutup saat Esc
  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  function switchTo(locale: Locale) {
    if (locale === currentLocale) {
      setOpen(false);
      return;
    }
    setPending(true);
    document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=${ONE_YEAR}; samesite=lax`;
    setOpen(false);
    // Refresh supaya server me-render ulang dengan locale baru
    router.refresh();
    // reset pending setelah tick berikutnya
    window.setTimeout(() => setPending(false), 300);
  }

  const current = LOCALE_META[currentLocale];

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={t("label")}
        aria-haspopup="listbox"
        aria-expanded={open}
        disabled={pending}
        className={cn(
          "inline-flex h-9 items-center gap-1.5 rounded-md border px-2.5 text-sm",
          "text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          pending && "opacity-60"
        )}
      >
        <Globe className="h-4 w-4" aria-hidden />
        <span className="hidden text-xs font-medium uppercase sm:inline">
          {currentLocale}
        </span>
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 transition-transform",
            open && "rotate-180"
          )}
          aria-hidden
        />
      </button>

      {open && (
        <div
          role="listbox"
          aria-label={t("label")}
          className={cn(
            "absolute right-0 z-50 mt-2 w-52 overflow-hidden rounded-lg border bg-popover shadow-lg",
            "animate-in fade-in-0 zoom-in-95"
          )}
        >
          <ul className="p-1">
            {LOCALES.map((locale) => {
              const meta = LOCALE_META[locale];
              const active = locale === currentLocale;
              return (
                <li key={locale}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={active}
                    onClick={() => switchTo(locale)}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm",
                      "transition-colors hover:bg-muted",
                      active && "bg-muted/60"
                    )}
                  >
                    <span aria-hidden className="text-base leading-none">
                      {meta.flag}
                    </span>
                    <span className="flex-1">
                      <span className="block font-medium">
                        {meta.nativeLabel}
                      </span>
                      <span className="block text-[11px] text-muted-foreground">
                        {meta.label}
                      </span>
                    </span>
                    {active && (
                      <Check className="h-4 w-4 text-primary" aria-hidden />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}