// app/api/tasks/[taskId]/data/route.ts
import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSignedDownloadUrl } from "@/lib/storage";
import { ok, fail } from "@/lib/api-response";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = Promise<{ taskId: string }>;

const SIGNED_URL_TTL_SECONDS = 10 * 60; // 10 menit

export async function GET(_req: NextRequest, { params }: { params: Params }) {
  try {
    const { taskId } = await params;

    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string } | undefined)?.id ?? null;

    const task = await prisma.documentTask.findUnique({
      where: { id: taskId },
      select: {
        id: true,
        toolType: true,
        settings: true,
        userId: true,
        inputFiles: {
          select: {
            file: {
              select: {
                fileKey: true,
                originalName: true,
                mimeType: true,
                sizeBytes: true,
              },
            },
          },
          orderBy: { order: "asc" },
        },
      },
    });

    if (!task) {
      return fail("Task tidak ditemukan", 404);
    }

    // Authorization
    if (task.userId && task.userId !== userId) {
      return fail("Tidak punya akses", 403);
    }

    // -------- Generate signed URLs --------
    const inputFiles = await Promise.all(
      task.inputFiles.map(async (f) => ({
        name: f.file.originalName,
        url: await getSignedDownloadUrl(f.file.fileKey, SIGNED_URL_TTL_SECONDS),
        mimeType: f.file.mimeType,
        sizeBytes: Number(f.file.sizeBytes),
      }))
    );

    return ok({
      toolType: task.toolType,
      settings: task.settings,
      inputFiles,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Server error";
    console.error("[tasks.data] error:", err);
    return fail(message, 500);
  }
}