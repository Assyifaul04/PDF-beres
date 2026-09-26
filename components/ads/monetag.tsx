// components/ads/monetag.tsx
"use client";

import Script from "next/script";

export function Monetag() {
  return (
    <Script
      id="monetag-tag"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `(function(s){s.dataset.zone='11901037',s.src='https://nap5k.com/tag.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))`,
      }}
    />
  );
}