// components/ads/adsense.tsx
"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

type AdSenseProps = {
  /** Slot ID dari AdSense (angka panjang) */
  slot: string;
  /** Format iklan */
  format?: "auto" | "fluid" | "rectangle";
  /** Layout untuk in-feed / in-article */
  layout?: "in-article" | "in-feed";
  /** Class tambahan */
  className?: string;
};

export function AdSense({
  slot,
  format = "auto",
  layout,
  className = "",
}: AdSenseProps) {
  const pushed = useRef(false);

  useEffect(() => {
    if (pushed.current) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushed.current = true;
    } catch (err) {
      console.error("[AdSense]", err);
    }
  }, []);

  return (
    <ins
      className={`adsbygoogle ${className}`}
      style={{ display: "block" }}
      data-ad-client="ca-pub-2352891869256632"
      data-ad-slot={slot}
      data-ad-format={format}
      data-ad-layout={layout}
      data-full-width-responsive="true"
    />
  );
}