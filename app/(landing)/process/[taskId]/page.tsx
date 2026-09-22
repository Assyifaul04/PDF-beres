// app/(landing)/process/[taskId]/page.tsx
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getToolConfigByType } from "@/lib/tools/config";
import { TaskProgress } from "@/components/process/task-progress";

type Params = Promise<{ taskId: string }>;

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Label heading di atas card, derived dari toolType.
 * Contoh: "HASIL KONVERSI", "HASIL MERGE", dll.
 */
function getCategoryLabel(toolType: string): string {
  // Konversi PDF ↔ Office/Image
  if (toolType.startsWith("PDF_TO_")) return "HASIL KONVERSI";
  if (toolType.endsWith("_TO_PDF")) return "HASIL KONVERSI";

  // Tool spesifik
  switch (toolType) {
    case "MERGE_PDF":
      return "HASIL GABUNGAN";
    case "SPLIT_PDF":
      return "HASIL PEMISAHAN";
    case "COMPRESS_PDF":
      return "HASIL KOMPRES";
    case "ROTATE_PDF":
      return "HASIL ROTASI";
    case "WATERMARK_PDF":
      return "HASIL WATERMARK";
    case "PAGE_NUMBERS":
      return "HASIL NOMOR HALAMAN";
    case "PROTECT_PDF":
      return "HASIL PROTEKSI";
    case "UNLOCK_PDF":
      return "HASIL UNLOCK";
    case "SIGN_PDF":
      return "HASIL TANDA TANGAN";
    case "EDIT_PDF":
      return "HASIL EDIT";
    case "ORGANIZE_PDF":
      return "HASIL ATUR ULANG";
    case "REPAIR_PDF":
      return "HASIL PERBAIKAN";
    default:
      return "HASIL";
  }
}

// ============================================================================
// METADATA
// ============================================================================
export async function generateMetadata({ params }: { params: Params }) {
  const { taskId } = await params;

  const task = await prisma.documentTask.findUnique({
    where: { id: taskId },
    select: { toolType: true },
  });

  const config = task ? getToolConfigByType(task.toolType) : null;

  return {
    title: config
      ? `Memproses ${config.title} | Beres`
      : "Memproses | Beres",
  };
}

// ============================================================================
// PAGE
// ============================================================================
export default async function ProcessPage({
  params,
}: {
  params: Params;
}) {
  const { taskId } = await params;

  // 1. Session — validasi akses
  const session = await getServerSession(authOptions);
  const currentUserId =
    (session?.user as { id?: string } | undefined)?.id ?? null;

  // 2. Fetch task + relasi
  const task = await prisma.documentTask.findUnique({
    where: { id: taskId },
    include: {
      user: {
        select: { id: true, name: true, email: true, plan: true },
      },
      inputFiles: {
        include: { file: true },
        orderBy: { order: "asc" },
      },
      outputFiles: {
        include: { file: true },
      },
    },
  });

  if (!task) notFound();

  // 3. Proteksi akses
  if (task.userId && task.userId !== currentUserId) {
    notFound();
  }

  // 4. Config
  const config = getToolConfigByType(task.toolType);
  const toolTitle = config?.title ?? task.toolType;
  const slug = config?.slug ?? "";

  // 5. Category label
  const categoryLabel = getCategoryLabel(task.toolType);

  // 6. Serialize data
  const initialInputFiles = task.inputFiles.map((input) => ({
    fileId: input.file.id,
    fileKey: input.file.fileKey,
    originalName: input.file.originalName,
    mimeType: input.file.mimeType,
    sizeBytes: input.file.sizeBytes.toString(),
    order: input.order,
  }));

  const initialOutputFiles = task.outputFiles.map((output) => ({
    fileId: output.file.id,
    fileKey: output.file.fileKey,
    originalName: output.file.originalName,
    mimeType: output.file.mimeType,
    sizeBytes: output.file.sizeBytes.toString(),
  }));

  // 7. Render
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
      <TaskProgress
        initialTask={{
          id: task.id,
          toolType: task.toolType,
          status: task.status,
          errorMessage: task.errorMessage,
          settings: task.settings,
          createdAt: task.createdAt.toISOString(),
          completedAt: task.completedAt?.toISOString() ?? null,
          userId: task.userId,
          inputFiles: initialInputFiles,
          outputFiles: initialOutputFiles,
        }}
        toolTitle={toolTitle}
        slug={slug}
        categoryLabel={categoryLabel}
      />
    </div>
  );
}