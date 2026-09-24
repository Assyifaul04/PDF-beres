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
  Droplets,
  ArrowRight,
  ShieldCheck,
  Timer,
  MousePointerClick,
  RotateCw, // Sudah dimasukkan ke dalam import Lucide
  type LucideIcon,
} from "lucide-react";
import { getToolConfig } from "@/lib/tools/config";
import { getSettings } from "@/lib/settings/helpers";
import { Reveal } from "./reveal";
import { HeroImage } from "@/components/landing/hero-image"; 

type Tool = { slug: string; icon: LucideIcon };

const groups: { title: string; hint: string; tools: Tool[] }[] = [
  {
    title: "Atur dan perkecil",
    hint: "Susun ulang halaman dan kurangi ukuran berkas.",
    tools: [
      { slug: "merge-pdf", icon: FileText },
      { slug: "split-pdf", icon: Scissors },
      { slug: "rotate-pdf", icon: RotateCw }, 
      { slug: "compress-pdf", icon: Minimize2 },
    ],
  },
  {
    title: "Ubah format",
    hint: "Konversi PDF ke format yang siap diedit.",
    tools: [
      { slug: "pdf-to-word", icon: FileType2 },
      { slug: "pdf-to-excel", icon: FileSpreadsheet },
      { slug: "pdf-to-jpg", icon: FileImage },
    ],
  },
  {
    title: "Amankan dan tandai",
    hint: "Lindungi dokumen dan tegaskan kepemilikan.",
    tools: [
      { slug: "protect-pdf", icon: Lock },
      { slug: "watermark-pdf", icon: Droplets },
    ],
  },
];

const totalTools = groups.reduce((n, g) => n + g.tools.length, 0);

const principles = [
  {
    icon: ShieldCheck,
    title: "Berkas Anda tetap privat",
    desc: "Dokumen diproses secara terisolasi dan dihapus otomatis setelah masa berlaku berakhir.",
  },
  {
    icon: MousePointerClick,
    title: "Tiga langkah, selesai",
    desc: "Pilih alat, unggah berkas, lalu unduh hasilnya. Tanpa pengaturan yang membingungkan.",
  },
  {
    icon: Timer,
    title: "Hasil yang bisa diandalkan",
    desc: "Setiap alat mengerjakan satu tugas, sehingga hasilnya konsisten setiap kali dipakai.",
  },
];

const motionCss = `
@keyframes lp-rise { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: none; } }
@keyframes lp-drift { 0%,100% { transform: translate3d(0,0,0) scale(1); } 50% { transform: translate3d(-3%,4%,0) scale(1.08); } }
.lp-rise { animation: lp-rise .8s cubic-bezier(.2,.7,.2,1) both; }
.lp-drift { animation: lp-drift 14s ease-in-out infinite; }
@media (prefers-reduced-motion: reduce) {
  .lp-rise, .lp-drift { animation: none; }
}
`;

export default async function LandingPage() {
  const general = await getSettings("general");
  const defaultTool = getToolConfig("merge-pdf");

  if (!defaultTool) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-6">
        <p className="text-sm text-muted-foreground">
          Konfigurasi default tidak ditemukan.
        </p>
      </div>
    );
  }

  const stats = [
    { label: "Alat tersedia", value: String(totalTools) },
    { label: "Format didukung", value: "PDF, DOCX, XLSX, JPG" },
    { label: "Batas unggah", value: `${general.maxUploadMB} MB` },
  ];

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: motionCss }} />

      {/* HERO */}
      <section className="relative overflow-hidden border-b bg-background dark:bg-background">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          {/* Aksen blur diubah menjadi merah (red-600) menyesuaikan tema */}
          <div className="lp-drift absolute -right-32 -top-40 h-[34rem] w-[34rem] rounded-full bg-red-600/15 dark:bg-red-500/10 blur-3xl" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.5)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.5)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,#000_30%,transparent_100%)]" />
        </div>

        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16 lg:px-8 lg:py-24">
          <div>
            <h1
              className="lp-rise text-balance text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl text-foreground"
            >
              Semua kebutuhan PDF Anda, dalam satu tempat.
            </h1>
            <p
              className="lp-rise mt-6 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg"
              style={{ animationDelay: "120ms" }}
            >
              Gabungkan, pisahkan, kompres, dan konversi dokumen langsung dari
              browser. Tanpa instalasi.
            </p>

            <div
              className="lp-rise mt-8 flex flex-wrap items-center gap-3"
              style={{ animationDelay: "240ms" }}
            >
              {/* TOMBOL UTAMA (Warna Merah Support Light/Dark) */}
              <Link
                href={`/${defaultTool.slug ?? "merge-pdf"}`}
                className="group inline-flex h-12 items-center gap-2 rounded-lg bg-red-600 dark:bg-red-700 px-6 text-sm font-semibold text-white shadow-md shadow-red-600/25 transition-all hover:-translate-y-0.5 hover:bg-red-700 dark:hover:bg-red-600 hover:shadow-lg hover:shadow-red-600/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none motion-reduce:hover:translate-y-0"
              >
                Gabungkan PDF
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 motion-reduce:transition-none" />
              </Link>
              {/* TOMBOL KEDUA (Outline dengan efek hover Merah) */}
              <Link
                href="#tools"
                className="inline-flex h-12 items-center rounded-lg border border-border bg-background px-6 text-sm font-semibold text-foreground transition-colors hover:border-red-600 hover:text-red-600 hover:bg-red-50 dark:hover:border-red-500 dark:hover:text-red-400 dark:hover:bg-red-950/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                Lihat semua alat
              </Link>
            </div>

            <dl
              className="lp-rise mt-12 grid max-w-xl grid-cols-3 gap-6 border-t border-border pt-6"
              style={{ animationDelay: "360ms" }}
            >
              {stats.map((s) => (
                <div key={s.label} className="flex flex-col-reverse">
                  <dt className="mt-1 text-xs leading-snug text-muted-foreground">
                    {s.label}
                  </dt>
                  <dd className="text-sm font-semibold tabular-nums text-foreground">
                    {s.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <HeroImage />
        </div>
      </section>

      {/* TOOLS */}
      <section
        id="tools"
        className="mx-auto max-w-7xl scroll-mt-20 px-4 py-16 sm:px-6 lg:px-8 lg:py-24"
      >
        <Reveal className="max-w-2xl">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl text-foreground">
            Pilih alat sesuai tujuan Anda
          </h2>
          <p className="mt-3 text-muted-foreground">
            Setiap alat mengerjakan satu tugas dan melakukannya dengan baik.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {groups.map((group, gi) => (
            <Reveal key={group.title} delay={gi * 120} className="flex">
              <div className="flex w-full flex-col overflow-hidden rounded-2xl border border-border bg-card transition-shadow duration-300 hover:shadow-lg hover:shadow-red-600/5 motion-reduce:transition-none">
                <div className="border-b border-border bg-muted/30 px-5 py-4">
                  <h3 className="font-semibold text-foreground">{group.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {group.hint}
                  </p>
                </div>

                <ul className="flex-1 divide-y divide-border">
                  {group.tools.map(({ slug, icon: Icon }) => {
                    const config = getToolConfig(slug);
                    if (!config) return null;

                    return (
                      <li key={slug}>
                        {/* Efek Hover List diubah menjadi Merah */}
                        <Link
                          href={`/${slug}`}
                          className="group relative flex items-start gap-4 px-5 py-4 transition-colors hover:bg-red-600/[0.04] dark:hover:bg-red-500/[0.08] focus-visible:bg-red-600/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-red-600"
                        >
                          <span
                            aria-hidden
                            className="absolute inset-y-0 left-0 w-0.5 origin-center scale-y-0 bg-red-600 dark:bg-red-500 transition-transform duration-300 group-hover:scale-y-100 group-focus-visible:scale-y-100 motion-reduce:transition-none"
                          />
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground/70 transition-all duration-300 group-hover:-rotate-3 group-hover:scale-110 group-hover:bg-red-600 dark:group-hover:bg-red-700 group-hover:text-white motion-reduce:transition-none motion-reduce:group-hover:transform-none">
                            <Icon className="h-5 w-5" />
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="flex items-center justify-between gap-2 text-sm font-semibold text-foreground">
                              <span className="truncate">{config.title}</span>
                              <ArrowRight className="h-4 w-4 shrink-0 -translate-x-1 text-red-600 dark:text-red-500 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100 motion-reduce:transition-none" />
                            </p>
                            <p className="mt-0.5 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                              {config.description}
                            </p>
                          </div>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* PRINSIP */}
      <section className="border-y border-border bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <Reveal>
            <h2 className="max-w-xl text-3xl font-semibold tracking-tight sm:text-4xl text-foreground">
              Dibuat untuk pekerjaan sehari-hari
            </h2>
          </Reveal>

          <div className="mt-12 grid gap-10 sm:grid-cols-3">
            {principles.map(({ icon: Icon, title, desc }, i) => (
              <Reveal key={title} delay={i * 120}>
                {/* Ikon Prinsip diubah warnanya */}
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-600/10 dark:bg-red-500/20 text-red-600 dark:text-red-400">
                  <Icon className="h-6 w-6" />
                </span>
                <h3 className="mt-5 font-semibold text-foreground">{title}</h3>
                <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
                  {desc}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA PENUTUP */}
      <section>
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <Reveal>
            {/* Box CTA diubah menjadi gradient merah / background merah */}
            <div className="relative flex flex-col items-start justify-between gap-8 overflow-hidden rounded-2xl bg-red-600 dark:bg-red-900/40 dark:border dark:border-red-900/50 px-8 py-12 text-white sm:px-12 md:flex-row md:items-center">
              <div
                aria-hidden
                className="lp-drift pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-white/10 dark:bg-red-500/10 blur-2xl"
              />
              <div className="relative max-w-xl">
                <h2 className="text-balance text-3xl font-semibold tracking-tight text-white">
                  Punya dokumen yang perlu dirapikan?
                </h2>
                <p className="mt-3 leading-relaxed text-white/90 dark:text-red-100">
                  Unggah berkas Anda dan selesaikan dalam hitungan menit.
                </p>
              </div>
              {/* Tombol Mulai Sekarang di dalam CTA Penutup */}
              <Link
                href="/merge-pdf"
                className="group relative inline-flex h-12 shrink-0 items-center gap-2 rounded-lg bg-white dark:bg-background px-6 text-sm font-semibold text-red-600 dark:text-red-500 shadow-sm transition-all hover:-translate-y-0.5 hover:bg-gray-50 dark:hover:bg-muted hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-red-600 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
              >
                Mulai sekarang
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 motion-reduce:transition-none" />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}