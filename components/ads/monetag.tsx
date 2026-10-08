// components/ads/monetag.tsx
"use client";

import Script from "next/script";

/**
 * Monetag — Multi-zone
 *
 * Zone 1: In-Page Push    — Zone ID: 11901037
 * Zone 2: Vignette Banner — Zone ID: 11901061
 *
 * ⚠️ Kedua zone di atas HARUS bukan "OnClick Popunder"
 * karena akan melanggar kebijakan Google AdSense.
 */
export function Monetag() {
  return (
    <>
      {/* ✅ In-Page Push — Zone 11901037 */}
      <Script
        id="monetag-inpage"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `(function(s){s.dataset.zone='11901037',s.src='https://nap5k.com/tag.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))`,
        }}
      />

      {/* ✅ Vignette Banner — Zone 11901061 */}
      <Script
        id="monetag-vignette"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `(function(s){s.dataset.zone='11901061',s.src='https://n6wxm.com/vignette.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))`,
        }}
      />
    </>
  );
}