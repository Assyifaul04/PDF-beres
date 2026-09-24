// components/layout/footer.tsx
import Link from "next/link";
import Image from "next/image";
import { ShieldCheck } from "lucide-react";
import { BackToTop } from "./back-to-top";

const columns: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Alat",
    links: [
      { label: "Gabungkan PDF", href: "/merge-pdf" },
      { label: "Pisahkan PDF", href: "/split-pdf" },
      { label: "Kompres PDF", href: "/compress-pdf" },
      { label: "PDF ke Word", href: "/pdf-to-word" },
      { label: "Lindungi PDF", href: "/protect-pdf" },
    ],
  },
  {
    title: "Perusahaan",
    links: [
      { label: "Tentang", href: "/about" },
      { label: "Harga", href: "/pricing" },
      { label: "Kontak", href: "/contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Kebijakan privasi", href: "/privacy" },
      { label: "Syarat dan ketentuan", href: "/terms" },
    ],
  },
];

// Garis bawah yang tumbuh dari kiri saat hover atau fokus
const linkClass =
  "relative inline-block w-fit rounded-sm py-0.5 transition-colors hover:text-foreground focus-visible:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 after:absolute after:inset-x-0 after:bottom-0 after:h-px after:origin-left after:scale-x-0 after:bg-primary after:transition-transform after:duration-300 hover:after:scale-x-100 focus-visible:after:scale-x-100 motion-reduce:transition-none motion-reduce:after:transition-none";

export function Footer() {
  return (
    <footer className="relative border-t bg-muted/30">
      {/* Garis aksen tipis di tepi atas */}
      <div
        aria-hidden
        className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent"
      />

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1fr] lg:gap-12">
          <div className="max-w-sm">
            <Link
              href="/"
              aria-label="Beres, ke beranda"
              className="inline-block rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <Image
                src="/image/Logo Beres.png"
                alt="Beres"
                width={120}
                height={40}
                className="h-9 w-auto object-contain"
              />
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Semua alat PDF dalam satu tempat. Gratis, cepat, dan aman.
            </p>
            <p className="mt-5 inline-flex items-center gap-2 rounded-full border bg-background px-3 py-1.5 text-xs text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5 text-primary" />
              Berkas dihapus otomatis setelah diproses
            </p>
          </div>

          {columns.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <h4 className="text-sm font-semibold">{col.title}</h4>
              <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className={linkClass}>
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-12 flex flex-col-reverse items-start justify-between gap-4 border-t pt-6 sm:flex-row sm:items-center">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Beres. Hak cipta dilindungi.
          </p>

          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500/60 [animation-duration:2.4s] motion-reduce:hidden" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            Semua layanan berjalan normal
          </p>
        </div>
      </div>

      <BackToTop />
    </footer>
  );
}