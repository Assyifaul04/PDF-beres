// app/api/tasks/[taskId]/route.ts
import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ok, fail } from "@/lib/api-response";

// ⚠️ PENTING: nama param sama dengan nama folder → [taskId]
type Params = Promise<{ taskId: string }>;

// ============================================================================
// HELPER: Authorization
// ============================================================================

function canAccessTask(params: {
  taskUserId: string | null;
  currentUserId: string | null;
  isAdmin: boolean;
}): boolean {
  const { taskUserId, currentUserId, isAdmin } = params;

  // Admin selalu boleh
  if (isAdmin) return true;

  // Task milik user → hanya owner
  if (taskUserId && currentUserId) {
    return taskUserId === currentUserId;
  }

  // Task guest + requester guest → allow
  if (!taskUserId && !currentUserId) return true;

  // Sisanya: tolak
  return false;
}

// ============================================================================
// GET
// ============================================================================

export async function GET(_req: NextRequest, { params }: { params: Params }) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string } | undefined)?.id ?? null;
    const isAdmin =
      (session?.user as { role?: string } | undefined)?.role === "ADMIN";

    const { taskId } = await params;

    if (!taskId) {
      return fail("taskId wajib", 400);
    }

    const task = await prisma.documentTask.findUnique({
      where: { id: taskId },
      select: {
        id: true,
        toolType: true,
        status: true,
        errorMessage: true,
        settings: true,
        createdAt: true,
        updatedAt: true,
        completedAt: true,
        userId: true,
        outputFiles: {
          select: {
            file: {
              select: {
                id: true,
                fileKey: true,
                originalName: true,
                sizeBytes: true,
                mimeType: true,
                expiresAt: true,
              },
            },
          },
        },
        inputFiles: {
          select: {
            order: true,
            file: {
              select: {
                id: true,
                fileKey: true,
                originalName: true,
                sizeBytes: true,
                mimeType: true,
                expiresAt: true,
              },
            },
          },
          orderBy: { order: "asc" },
        },
        _count: {
          select: { inputFiles: true, outputFiles: true },
        },
      },
    });

    if (!task) {
      return fail("Task tidak ditemukan", 404);
    }

    // -------- Authorization --------
    const allowed = canAccessTask({
      taskUserId: task.userId,
      currentUserId: userId,
      isAdmin,
    });

    if (!allowed) {
      return fail("Tidak punya akses", 403);
    }

    // -------- Response --------
    return ok({
      id: task.id,
      toolType: task.toolType,
      status: task.status,
      errorMessage: task.errorMessage,
      settings: task.settings,
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString(),
      completedAt: task.completedAt?.toISOString() ?? null,
      userId: task.userId,

      // Sesuai tipe OutputFileInfo
      outputFiles: task.outputFiles.map((o) => ({
        fileId: o.file.id,
        fileKey: o.file.fileKey,
        originalName: o.file.originalName,
        mimeType: o.file.mimeType,
        sizeBytes: o.file.sizeBytes.toString(),
        expiresAt: o.file.expiresAt.toISOString(),
      })),

      // Sesuai tipe InputFileInfo
      inputFiles: task.inputFiles.map((i) => ({
        fileId: i.file.id,
        fileKey: i.file.fileKey,
        originalName: i.file.originalName,
        mimeType: i.file.mimeType,
        sizeBytes: i.file.sizeBytes.toString(),
        expiresAt: i.file.expiresAt.toISOString(),
        order: i.order,
      })),

      inputCount: task._count.inputFiles,
      outputCount: task._count.outputFiles,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Server error";
    console.error("[tasks.get] error:", err);
    return fail(message, 500);
  }
}