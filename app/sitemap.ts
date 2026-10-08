// app/sitemap.ts
import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://beres-jet.vercel.app/",
      lastModified: "2026-10-09",
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}