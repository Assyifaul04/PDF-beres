// app/api/tasks/route.ts
import { NextRequest } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ok, fail } from "@/lib/api-response";
import { Prisma, ToolType } from "@prisma/client";
import { TOOL_REQUIREMENTS } from "@/lib/processors/constants";

// ==============================================================================
// CONSTANTS
// ==============================================================================

const MAX_FILES_DEFAULT = 50;

// ==============================================================================
// SCHEMA
// ==============================================================================

const settingsSchema = z
  .record(z.string(), z.unknown())
  .nullable()
  .optional()
  .transform((v) =>
    v === null || v === undefined
      ? Prisma.JsonNull
      : (v as Prisma.InputJsonValue)
  );

const createTaskSchema = z.object({
  toolType: z.nativeEnum(ToolType),
  fileIds: z.array(z.string().min(1)).min(1).max(MAX_FILES_DEFAULT),
  settings: settingsSchema,
});

// ==============================================================================
// POST /api/tasks
// ==============================================================================

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string } | undefined)?.id ?? null;

    // -------- Parse body: JSON atau FormData --------
    const contentType = req.headers.get("content-type") ?? "";
    let body: unknown;

    if (contentType.includes("application/json")) {
      body = await req.json();
    } else if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const fileIds = formData.getAll("fileIds").map(String);
      const toolType = String(formData.get("toolType") ?? "");
      const settingsRaw = formData.get("settings");

      let settings: unknown = undefined;
      if (typeof settingsRaw === "string" && settingsRaw.trim()) {
        try {
          settings = JSON.parse(settingsRaw);
        } catch {
          settings = undefined;
        }
      }

      body = { toolType, fileIds, settings };
    } else {
      return fail("Content-Type tidak didukung", 415);
    }

    // -------- Validate schema --------
    const parsed = createTaskSchema.safeParse(body);
    if (!parsed.success) {
      return fail("Data tidak valid", 422, parsed.error.flatten());
    }

    const { toolType, fileIds, settings } = parsed.data;

    // -------- Validasi jumlah file (single source of truth) --------
    const req_ = TOOL_REQUIREMENTS[toolType as keyof typeof TOOL_REQUIREMENTS];
    if (!req_) {
      return fail(`Tool ${toolType} tidak dikenal`, 422);
    }

    // HTML_TO_PDF: tidak butuh file
    if (toolType !== "HTML_TO_PDF") {
      if (fileIds.length < req_.minFiles) {
        return fail(
          `Tool ${toolType} membutuhkan minimal ${req_.minFiles} file`,
          422,
          { minFiles: req_.minFiles, received: fileIds.length }
        );
      }
      if (fileIds.length > req_.maxFiles) {
        return fail(
          `Tool ${toolType} maksimal ${req_.maxFiles} file`,
          422,
          { maxFiles: req_.maxFiles, received: fileIds.length }
        );
      }
    }

    // -------- Validasi duplikat fileIds --------
    const uniqueIds = new Set(fileIds);
    if (uniqueIds.size !== fileIds.length) {
      return fail("fileIds mengandung duplikat", 422);
    }

    // -------- Validasi file ownership + belum expired --------
    const files = await prisma.file.findMany({
      where: {
        id: { in: fileIds },
        ...(userId ? { userId } : {}),
      },
      select: { id: true, expiresAt: true },
    });

    if (files.length !== fileIds.length) {
      return fail("Beberapa file tidak ditemukan atau bukan milik Anda", 404);
    }

    const expired = files.filter((f) => f.expiresAt < new Date());
    if (expired.length > 0) {
      return fail(
        "Beberapa file sudah expired. Silakan upload ulang.",
        410,
        { expiredIds: expired.map((f) => f.id) }
      );
    }

    // -------- Buat DocumentTask (transaction) --------
    const task = await prisma.$transaction(async (tx) => {
      const created = await tx.documentTask.create({
        data: {
          userId,
          toolType,
          status: "PENDING",
          settings,
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

      await tx.systemLog.create({
        data: {
          level: "info",
          action: "task.create",
          message: `Task ${toolType} dibuat dengan ${fileIds.length} file`,
          meta: {
            userId,
            taskId: created.id,
            toolType,
            fileIds,
          } as Prisma.InputJsonValue,
        },
      });

      return created;
    });

    return ok({ taskId: task.id, task }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Gagal membuat task";
    console.error("[tasks.create]", err);
    return fail(message, 500);
  }
}