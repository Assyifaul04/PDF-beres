// app/(landing)/process/[taskId]/page.tsx
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getToolConfigByType } from "@/lib/tools/config";
import { TaskProgress } from "@/components/process/task-progress";

type Params = Promise<{ taskId: string }>;

// ============================================================================
// CATEGORY LABEL
// ============================================================================

function getCategoryLabel(toolType: string): string {
  if (toolType.startsWith("PDF_TO_")) return "HASIL KONVERSI";
  if (toolType.endsWith("_TO_PDF")) return "HASIL KONVERSI";

  const map: Record<string, string> = {
    MERGE_PDF: "HASIL GABUNGAN",
    SPLIT_PDF: "HASIL PEMISAHAN",
    COMPRESS_PDF: "HASIL KOMPRES",
    ROTATE_PDF: "HASIL ROTASI",
    WATERMARK_PDF: "HASIL WATERMARK",
    PAGE_NUMBERS: "HASIL NOMOR HALAMAN",
    PROTECT_PDF: "HASIL PROTEKSI",
    UNLOCK_PDF: "HASIL UNLOCK",
    SIGN_PDF: "HASIL TANDA TANGAN",
    EDIT_PDF: "HASIL EDIT",
    ORGANIZE_PDF: "HASIL ATUR ULANG",
    REPAIR_PDF: "HASIL PERBAIKAN",
    HTML_TO_PDF: "HASIL KONVERSI",
    JPG_TO_PDF: "HASIL KONVERSI",
  };

  return map[toolType] ?? "HASIL";
}

// ============================================================================
// AUTHORIZATION
// ============================================================================

function canAccessTask(params: {
  taskUserId: string | null;
  currentUserId: string | null;
  isAdmin: boolean;
}): boolean {
  const { taskUserId, currentUserId, isAdmin } = params;

  if (isAdmin) return true;

  if (taskUserId && currentUserId) {
    return taskUserId === currentUserId;
  }

  if (!taskUserId && !currentUserId) return true;

  return false;
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
    title: config ? `Memproses ${config.title} | Beres` : "Memproses | Beres",
  };
}

// ============================================================================
// PAGE
// ============================================================================

export default async function ProcessPage({ params }: { params: Params }) {
  const { taskId } = await params;

  const session = await getServerSession(authOptions);
  const currentUserId =
    (session?.user as { id?: string } | undefined)?.id ?? null;
  const isAdmin =
    (session?.user as { role?: string } | undefined)?.role === "ADMIN";

  const task = await prisma.documentTask.findUnique({
    where: { id: taskId },
    include: {
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

  const allowed = canAccessTask({
    taskUserId: task.userId,
    currentUserId,
    isAdmin,
  });

  if (!allowed) notFound();

  const config = getToolConfigByType(task.toolType);
  const toolTitle = config?.title ?? task.toolType;
  const slug = config?.slug ?? "";
  const categoryLabel = getCategoryLabel(task.toolType);

  const initialInputFiles = task.inputFiles.map((input) => ({
    fileId: input.file.id,
    fileKey: input.file.fileKey,
    originalName: input.file.originalName,
    mimeType: input.file.mimeType,
    sizeBytes: input.file.sizeBytes.toString(),
    expiresAt: input.file.expiresAt.toISOString(),
    order: input.order,
  }));

  const initialOutputFiles = task.outputFiles.map((output) => ({
    fileId: output.file.id,
    fileKey: output.file.fileKey,
    originalName: output.file.originalName,
    mimeType: output.file.mimeType,
    sizeBytes: output.file.sizeBytes.toString(),
    expiresAt: output.file.expiresAt.toISOString(),
  }));

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
          updatedAt: task.updatedAt.toISOString(),
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