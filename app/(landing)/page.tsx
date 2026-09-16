// app/(landing)/page.tsx
import Link from "next/link";
import {
  FileText,
  Scissors,
  Minimize2,
  FileImage,
  FileSpreadsheet,
  FileType2,
  Lock,
  RotateCw,
  Droplets,
} from "lucide-react";
import { LandingHero } from "@/components/upload/landing-hero";

const tools = [
  { href: "/merge-pdf", label: "Merge PDF", desc: "Combine multiple PDFs into one", icon: FileText, color: "text-red-500" },
  { href: "/split-pdf", label: "Split PDF", desc: "Separate pages into new files", icon: Scissors, color: "text-orange-500" },
  { href: "/compress-pdf", label: "Compress PDF", desc: "Reduce file size without losing quality", icon: Minimize2, color: "text-green-500" },
  { href: "/pdf-to-jpg", label: "PDF to JPG", desc: "Convert PDF pages to images", icon: FileImage, color: "text-yellow-500" },
  { href: "/pdf-to-excel", label: "PDF to Excel", desc: "Extract tables to spreadsheets", icon: FileSpreadsheet, color: "text-emerald-500" },
  { href: "/pdf-to-word", label: "PDF to Word", desc: "Editable Word documents", icon: FileType2, color: "text-blue-500" },
  { href: "/protect-pdf", label: "Protect PDF", desc: "Encrypt with password", icon: Lock, color: "text-purple-500" },
  { href: "/rotate-pdf", label: "Rotate PDF", desc: "Fix orientation in seconds", icon: RotateCw, color: "text-pink-500" },
  { href: "/watermark-pdf", label: "Watermark PDF", desc: "Add text or image watermark", icon: Droplets, color: "text-cyan-500" },
];

export default function LandingPage() {
  return (
    <>
      {/* Hero + Dropzone */}
      <section className="relative overflow-hidden border-b bg-gradient-to-b from-muted/40 to-background">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <LandingHero />
        </div>
      </section>

      {/* Tools grid */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-center text-3xl font-bold tracking-tight">
          Semua alat yang Anda butuhkan
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-muted-foreground">
          Pilih alat dan mulai dalam hitungan detik.
        </p>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map(({ href, label, desc, icon: Icon, color }) => (
            <Link
              key={href}
              href={href}
              className="group rounded-xl border bg-card p-6 transition-all hover:border-primary/50 hover:shadow-md"
            >
              <Icon className={`h-8 w-8 ${color}`} />
              <h3 className="mt-4 font-semibold group-hover:text-primary">
                {label}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Trust / Features */}
      <section className="border-t bg-muted/30">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-16 sm:grid-cols-3 sm:px-6 lg:px-8">
          {[
            { title: "100% Aman", desc: "File otomatis dihapus setelah 2 jam." },
            { title: "Sangat Cepat", desc: "Diproses di server bertenaga." },
            { title: "Bisa di Mana Saja", desc: "Browser apa pun, perangkat apa pun." },
          ].map((f) => (
            <div key={f.title} className="text-center">
              <h3 className="font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}