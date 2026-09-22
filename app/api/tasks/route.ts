// app/api/tasks/route.ts
import { NextRequest } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ok, fail } from "@/lib/api-response";
import { Prisma, ToolType } from "@prisma/client";

// ==============================================================================
// SCHEMA
// ==============================================================================

const createTaskSchema = z.object({
  toolType: z.nativeEnum(ToolType),
  fileIds: z.array(z.string().min(1)).min(1).max(50),

  settings: z
    .object({})
    .passthrough()
    .optional()
    .nullable()
    .transform((v) => (v ?? undefined) as Prisma.InputJsonValue | undefined),
});

// ==============================================================================
// POST /api/tasks
// ==============================================================================

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string } | undefined)?.id ?? null;

    const body = await req.json();
    const parsed = createTaskSchema.safeParse(body);

    if (!parsed.success) {
      return fail("Data tidak valid", 422, parsed.error.flatten());
    }

    const { toolType, fileIds, settings } = parsed.data;

    // ✅ Validasi: semua file harus ada & milik user (kalau login)
    const files = await prisma.file.findMany({
      where: {
        id: { in: fileIds },
        ...(userId ? { userId } : {}),
      },
      select: { id: true },
    });

    if (files.length !== fileIds.length) {
      return fail("Beberapa file tidak ditemukan atau bukan milik Anda", 404);
    }

    // ✅ Buat DocumentTask
    const task = await prisma.documentTask.create({
      data: {
        userId,
        toolType,
        status: "PENDING",
        settings,               // ✅ sudah Prisma.InputJsonValue
        inputFiles: {
          create: fileIds.map((fileId, i) => ({
            fileId,
            order: i,
          })),
        },
      },
      select: {
        id: true,
        status: true,
        toolType: true,
        createdAt: true,
      },
    });

    // ✅ Log
    await prisma.systemLog.create({
      data: {
        level: "info",
        action: "task.create",
        message: `Task ${toolType} dibuat dengan ${fileIds.length} file`,
        meta: {
          userId,
          taskId: task.id,
          toolType,
          fileIds,
        } as Prisma.InputJsonValue,
      },
    });

    return ok({ taskId: task.id, task }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Gagal membuat task";
    console.error("[tasks.create]", err);
    return fail(message, 500);
  }
}