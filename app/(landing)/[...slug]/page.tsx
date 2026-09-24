// app/(landing)/[...slug]/page.tsx
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getToolConfig } from "@/lib/tools/config";
import { getOutputOptions, getProcessLabel } from "@/lib/tools/output-options";
import { LandingHero } from "@/components/upload/landing-hero";
import { getSettings } from "@/lib/settings/helpers";
import { CaretRightIcon } from "@phosphor-icons/react/dist/ssr";

type Params = Promise<{ slug: string[] }>;

function getLastSegment(slug: string[]): string {
  return slug[slug.length - 1] ?? "";
}

const STEPS = [
  { title: "Unggah file", text: "Pilih atau seret file yang ingin diproses." },
  { title: "Atur opsi", text: "Sesuaikan format keluaran jika perlu." },
  { title: "Proses", text: "Klik tombol proses dan tunggu sebentar." },
  { title: "Unduh hasil", text: "Simpan file hasilnya ke perangkat Anda." },
];

export async function generateMetadata({ params }: { params: Params }) {
  const { slug } = await params;
  const toolSlug = getLastSegment(slug);

  const config = getToolConfig(toolSlug);
  if (config) {
    return {
      title: `${config.title} | Beres`,
      description: config.description,
    };
  }

  const menu = await prisma.toolMenu.findFirst({
    where: { slug: toolSlug, isActive: true },
    select: { title: true, description: true },
  });

  if (!menu) return { title: "Tool tidak ditemukan" };

  return {
    title: `${menu.title} | Beres`,
    description: menu.description ?? "",
  };
}

export default async function ToolPage({ params }: { params: Params }) {
  const { slug } = await params;
  const toolSlug = getLastSegment(slug);

  // 1. Ambil config dari kode
  const config = getToolConfig(toolSlug);
  if (!config) notFound();

  // 2. Ambil menu dari DB (breadcrumb & title override)
  const menu = await prisma.toolMenu.findFirst({
    where: {
      OR: [{ slug: toolSlug }, { toolType: config.toolType }],
      isActive: true,
    },
    include: {
      category: { select: { name: true, slug: true } },
    },
  });

  // 3. Ambil setting admin
  const general = await getSettings("general");
  const maxSize = general.maxUploadMB * 1024 * 1024;

  // 4. Judul & deskripsi
  const title = menu?.title ?? config.title;
  const description = menu?.description ?? config.description;

  // 5. Output options & label
  const outputOptions = getOutputOptions(config.toolType);
  const processLabel = getProcessLabel(config.toolType);

  return (
    <>
      {/* BREADCRUMB */}
      <nav aria-label="Breadcrumb" className="border-b bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ol className="flex flex-wrap items-center gap-1.5 py-3 text-sm">
            <li>
              <Link
                href="/"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                Beranda
              </Link>
            </li>

            <li aria-hidden="true">
              <CaretRightIcon className="h-3 w-3 text-muted-foreground/60" />
            </li>

            {menu?.category && (
              <>
                <li>
                  <span className="text-muted-foreground">
                    {menu.category.name}
                  </span>
                </li>
                <li aria-hidden="true">
                  <CaretRightIcon className="h-3 w-3 text-muted-foreground/60" />
                </li>
              </>
            )}

            <li>
              <span aria-current="page" className="font-medium text-foreground">
                {title}
              </span>
            </li>
          </ol>
        </div>
      </nav>

      {/* HERO */}
      <section className="border-b bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <LandingHero
            slug={config.slug}
            title={title}
            description={description}
            accept={config.accept}
            multiple={config.multiple}
            minFiles={config.minFiles}
            maxFiles={config.maxFiles}
            toolType={config.toolType}
            maxSize={maxSize}
            outputOptions={outputOptions}
            processLabel={processLabel}
          />
        </div>
      </section>

      {/* CARA PAKAI */}
      <section className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
        <h2 className="text-2xl font-bold tracking-tight">
          Cara pakai {title}
        </h2>

        <ol className="mt-8 grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, i) => (
            <li key={step.title} className="border-t-2 border-primary/20 pt-4">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-semibold tabular-nums text-primary-foreground">
                {i + 1}
              </span>
              <h3 className="mt-3 text-sm font-semibold">{step.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {step.text}
              </p>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}