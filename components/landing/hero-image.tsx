// components/landing/hero-image.tsx
"use client"

import * as React from "react"
import Image from "next/image"
import { useTheme } from "next-themes"

export function HeroImage() {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  // Hindari hydration mismatch dengan menunggu komponen mounted
  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Tampilan placeholder saat loading (tanpa border dan bg)
  if (!mounted) {
    return (
      <div 
        className="lp-rise aspect-[4/3] w-full" 
        style={{ animationDelay: "200ms" }}
      />
    )
  }

  const isDark = resolvedTheme === "dark"
  
  // Tentukan path gambar berdasarkan tema
  const imageSrc = isDark ? "/image/Herohitam.png" : "/image/Heroputih.png"
  const imageAlt = isDark ? "Hero Dark Mode" : "Hero Light Mode"

  return (
    <div 
      className="lp-rise relative w-full transition-all"
      style={{ animationDelay: "200ms" }}
    >
      <Image
        src={imageSrc}
        alt={imageAlt}
        width={800} // Sesuaikan dengan ukuran asli gambar Anda
        height={600} // Sesuaikan dengan ukuran asli gambar Anda
        sizes="(max-width: 768px) 100vw, 50vw"
        // Dihapus: rounded-xl, object-cover agar gambar tampil natural (apa adanya)
        className="w-full h-auto object-contain"
        priority // Muat gambar ini dengan prioritas tinggi karena di atas lipatan (above the fold)
      />
    </div>
  )
}