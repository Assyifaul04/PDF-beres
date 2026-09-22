// app/api/tasks/[id]/route.ts
import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ok, fail } from "@/lib/api-response";

type Params = Promise<{ id: string }>;

export async function GET(_req: NextRequest, { params }: { params: Params }) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id ?? null;

  const { id } = await params;

  const task = await prisma.documentTask.findUnique({
    where: { id },
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
              originalName: true,
              sizeBytes: true,
              mimeType: true,
            },
          },
        },
      },
      _count: {
        select: {
          inputFiles: true,
          outputFiles: true,
        },
      },
    },
  });

  if (!task) {
    return fail("Task tidak ditemukan", 404);
  }

  // ✅ Kalau task punya user, hanya user itu (atau admin) yang boleh lihat
  if (task.userId && userId && task.userId !== userId) {
    return fail("Tidak punya akses", 403);
  }

  return ok({
    id: task.id,
    toolType: task.toolType,
    status: task.status,
    errorMessage: task.errorMessage,
    settings: task.settings,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
    completedAt: task.completedAt?.toISOString() ?? null,
    outputFiles: task.outputFiles.map((o) => ({
      id: o.file.id,
      originalName: o.file.originalName,
      sizeBytes: o.file.sizeBytes.toString(),
      mimeType: o.file.mimeType,
    })),
    inputCount: task._count.inputFiles,
    outputCount: task._count.outputFiles,
  });
}