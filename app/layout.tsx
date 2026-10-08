// app/layout.tsx
import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import "./globals.css";

import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { AuthSessionProvider } from "@/components/providers/session-provider";
import { Monetag } from "@/components/ads/monetag";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://beres-jet.vercel.app"),

  title: {
    default: "Beres — All-in-One PDF Tools",
    template: "%s | Beres",
  },

  description:
    "Beres adalah kumpulan PDF tools online gratis untuk merge, split, compress, convert, dan edit PDF dengan cepat dan mudah.",

  keywords: [
    "PDF tools",
    "PDF tools online",
    "PDF editor",
    "merge PDF",
    "split PDF",
    "compress PDF",
    "convert PDF",
    "edit PDF",
    "PDF gratis",
    "all in one PDF tools",
    "Beres PDF",
  ],

  authors: [{ name: "Beres" }],
  creator: "Beres",
  publisher: "Beres",

  robots: {
    index: true,
    follow: true,
  },

  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "https://beres-jet.vercel.app/",
    siteName: "Beres",
    title: "Beres — All-in-One PDF Tools",
    description:
      "Merge, split, compress, convert, dan edit PDF secara online dengan cepat dan gratis.",
  },

  twitter: {
    card: "summary_large_image",
    title: "Beres — All-in-One PDF Tools",
    description:
      "All-in-One PDF Tools untuk merge, split, compress, convert, dan edit PDF.",
  },

  other: {
    "google-adsense-account": "ca-pub-2352891869256632",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={cn(
        "h-full",
        "antialiased",
        geistSans.variable,
        geistMono.variable,
        inter.variable,
        "font-sans"
      )}
    >
      <head>
        {/* Google AdSense */}
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2352891869256632"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </head>

      <body className="min-h-full flex flex-col bg-background text-foreground">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <AuthSessionProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="light"
              enableSystem={false}
              disableTransitionOnChange
            >
              {children}
            </ThemeProvider>
          </AuthSessionProvider>
        </NextIntlClientProvider>

        {/* Monetag — Zone 11901037 */}
        <Monetag />
      </body>
    </html>
  );
}

