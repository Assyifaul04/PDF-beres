// app/api/tasks/[taskId]/process-server/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { runPDFToolServer } from "@/lib/processors/index.server";
import { getFileBuffer, uploadFile } from "@/lib/storage";
import { isServerOnlyTool } from "@/lib/processors/constants";
import { toBuffer } from "@/lib/processors/server/utils";
import type { PDFTool, ProcessOptions, ProgressFn } from "@/lib/processors";
import { Prisma } from "@prisma/client";

// ============================================================================
// RUNTIME CONFIG
// ============================================================================

export const runtime = "nodejs";
export const maxDuration = 300;
export const dynamic = "force-dynamic";

// ============================================================================
// CONSTANTS
// ============================================================================

const JOB_TIMEOUT_MS = 5 * 60_000; // 5 menit

// ============================================================================
// POST /api/tasks/[taskId]/process-server
// ============================================================================

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const { taskId } = await params;

    // ---------- Auth ----------
    const session = await getServerSession(authOptions);
    const userId =
      (session?.user as { id?: string } | undefined)?.id ?? null;

    // ---------- Fetch task ----------
    const task = await prisma.documentTask.findUnique({
      where: { id: taskId },
      select: {
        id: true,
        toolType: true,
        status: true,
        userId: true,
        settings: true,
      },
    });

    if (!task) {
      return NextResponse.json(
        { success: false, error: "Task tidak ditemukan" },
        { status: 404 }
      );
    }

    // ---------- Authorization ----------
    if (task.userId && task.userId !== userId) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    // ---------- Validasi tool ----------
    const toolType = task.toolType as PDFTool;
    if (!isServerOnlyTool(toolType)) {
      return NextResponse.json(
        {
          success: false,
          error: `Tool ${toolType} bukan server-only. Gunakan endpoint client-side.`,
        },
        { status: 400 }
      );
    }

    // ---------- Idempotency guard ----------
    if (task.status === "PROCESSING") {
      return NextResponse.json(
        { success: false, error: "Task sedang diproses" },
        { status: 409 }
      );
    }
    if (task.status === "COMPLETED" || task.status === "FAILED") {
      return NextResponse.json(
        { success: false, error: "Task sudah selesai" },
        { status: 409 }
      );
    }

    // ---------- Atomic transition: PENDING → PROCESSING ----------
    const updated = await prisma.documentTask.updateMany({
      where: { id: taskId, status: "PENDING" },
      data: { status: "PROCESSING" },
    });

    if (updated.count === 0) {
      return NextResponse.json(
        { success: false, error: "Task sudah diambil proses lain" },
        { status: 409 }
      );
    }

    // ---------- Fire-and-forget ----------
    void withTimeout(
      runServerJob(taskId, toolType, task.settings),
      JOB_TIMEOUT_MS
    ).catch(async (e: unknown) => {
      console.error("[process-server] error:", e);
      const message = e instanceof Error ? e.message : "Server error (unknown)";

      try {
        await prisma.documentTask.update({
          where: { id: taskId },
          data: {
            status: "FAILED",
            errorMessage: message,
            completedAt: new Date(),
          },
        });

        // Audit log
        await prisma.systemLog.create({
          data: {
            level: "error",
            action: "task.process.failed",
            message: `Task ${taskId} gagal: ${message}`,
            meta: {
              taskId,
              toolType,
              error: message,
            } as Prisma.InputJsonValue,
          },
        });
      } catch (updateErr) {
        console.error(
          "[process-server] gagal update status FAILED:",
          updateErr
        );
      }
    });

    return NextResponse.json({ success: true, data: { taskId } });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Server error";
    console.error("[process-server] outer error:", err);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

// ============================================================================
// BACKGROUND JOB
// ============================================================================

async function runServerJob(
  taskId: string,
  toolType: PDFTool,
  settings: unknown
): Promise<void> {
  // ---------- 1. Fetch task + input files ----------
  const task = await prisma.documentTask.findUnique({
    where: { id: taskId },
    include: {
      inputFiles: {
        include: { file: true },
        orderBy: { order: "asc" },
      },
    },
  });

  if (!task) {
    throw new Error(`Task ${taskId} tidak ditemukan`);
  }

  // ---------- 2. Download input dari storage ----------
  const files = await Promise.all(
    task.inputFiles.map(async (f) => {
      const buf = await getFileBuffer(f.file.fileKey);
      return {
        buffer: buf,
        name: f.file.originalName,
        type: f.file.mimeType,
        size: Number(f.file.sizeBytes),
      };
    })
  );

  if (!files.length) {
    throw new Error("Tidak ada file input");
  }

  // ---------- 3. Jalankan processor ----------
  const options = (settings ?? {}) as ProcessOptions;

  // ✅ FIX: options di posisi ke-3, onProgress di posisi ke-4
  const onProgress: ProgressFn = (pct, msg) => {
    console.log(`[process-server] ${taskId} — ${pct}% ${msg ?? ""}`);
  };

  const result = await runPDFToolServer(toolType, files, options, onProgress);

  if (!result.files.length) {
    throw new Error("Processor tidak menghasilkan output");
  }

  // ---------- 4. Simpan semua output (transaction per file) ----------
  for (const out of result.files) {
    const buffer = toBuffer(out.buffer);

    const uploaded = await uploadFile({
      buffer,
      originalName: out.name,
      mimeType: out.type,
      userId: task.userId ?? undefined,
    });

    await prisma.$transaction(async (tx) => {
      const fileRecord = await tx.file.create({
        data: {
          fileKey: uploaded.key,
          originalName: out.name,
          mimeType: out.type,
          sizeBytes: BigInt(buffer.byteLength),
          userId: task.userId ?? undefined,
          // expiresAt auto via @default(dbgenerated(...))
        },
        select: { id: true },
      });

      await tx.taskOutputFile.create({
        data: { taskId, fileId: fileRecord.id },
      });
    });
  }

  // ---------- 5. Tandai selesai ----------
  await prisma.documentTask.update({
    where: { id: taskId },
    data: {
      status: "COMPLETED",
      completedAt: new Date(),
      errorMessage: null,
    },
  });

  // ---------- 6. Audit log sukses ----------
  await prisma.systemLog.create({
    data: {
      level: "info",
      action: "task.process.completed",
      message: `Task ${taskId} (${toolType}) selesai dengan ${result.files.length} output`,
      meta: {
        taskId,
        toolType,
        outputCount: result.files.length,
      } as Prisma.InputJsonValue,
    },
  });
}

// ============================================================================
// HELPERS
// ============================================================================

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(
        () => reject(new Error(`Job timeout setelah ${ms / 1000}s`)),
        ms
      )
    ),
  ]);
}