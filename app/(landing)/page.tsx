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
import { getToolConfig } from "@/lib/tools/config";
import { getSettings } from "@/lib/settings/helpers";

const tools = [
  { slug: "merge-pdf", icon: FileText, color: "text-red-500" },
  { slug: "split-pdf", icon: Scissors, color: "text-orange-500" },
  { slug: "compress-pdf", icon: Minimize2, color: "text-green-500" },
  { slug: "pdf-to-jpg", icon: FileImage, color: "text-yellow-500" },
  { slug: "pdf-to-excel", icon: FileSpreadsheet, color: "text-emerald-500" },
  { slug: "pdf-to-word", icon: FileType2, color: "text-blue-500" },
  { slug: "protect-pdf", icon: Lock, color: "text-purple-500" },
  { slug: "rotate-pdf", icon: RotateCw, color: "text-pink-500" },
  { slug: "watermark-pdf", icon: Droplets, color: "text-cyan-500" },
];

export default async function LandingPage() {
  // ✅ Ambil setting admin
  const general = await getSettings("general");
  const maxSize = general.maxUploadMB * 1024 * 1024;

  // ✅ Default hero pakai merge-pdf
  const defaultTool = getToolConfig("merge-pdf");

  // Guard — jangan crash kalau config hilang
  if (!defaultTool) {
    return <div className="p-6">Config default tidak ditemukan</div>;
  }

  return (
    <>
      {/* Hero + Dropzone */}
      <section className="relative overflow-hidden border-b bg-gradient-to-b from-muted/40 to-background">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <LandingHero
            slug={defaultTool.slug}
            title="Setiap alat PDF dalam satu tempat"
            description="Gabungkan, pisahkan, kompres, konversi, dan edit PDF secara online — gratis, cepat, dan aman."
            accept={defaultTool.accept}
            multiple={defaultTool.multiple}
            minFiles={defaultTool.minFiles}
            maxFiles={defaultTool.maxFiles}
            toolType={defaultTool.toolType}
            maxSize={maxSize}
          />
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
          {tools.map(({ slug, icon: Icon, color }) => {
            const config = getToolConfig(slug);
            if (!config) return null;

            return (
              <Link
                key={slug}
                href={`/${slug}`}
                className="group rounded-xl border bg-card p-6 transition-all hover:border-primary/50 hover:shadow-md"
              >
                <Icon className={`h-8 w-8 ${color}`} />
                <h3 className="mt-4 font-semibold group-hover:text-primary">
                  {config.title}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {config.description}
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Trust */}
      <section className="border-t bg-muted/30">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-16 sm:grid-cols-3 sm:px-6 lg:px-8">
          {[
            { title: "100% Aman", desc: "File otomatis dihapus setelah 2 jam." },
            { title: "Sangat Cepat", desc: "Diproses di server bertenaga." },
            {
              title: "Bisa di Mana Saja",
              desc: "Browser apa pun, perangkat apa pun.",
            },
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