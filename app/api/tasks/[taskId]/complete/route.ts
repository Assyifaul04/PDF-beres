// app/api/tasks/[taskId]/complete/route.ts
import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { uploadFile } from "@/lib/storage";
import { ok, fail } from "@/lib/api-response";

export const runtime = "nodejs";
export const maxDuration = 60;
export const dynamic = "force-dynamic";

type Params = Promise<{ taskId: string }>;

export async function POST(req: NextRequest, { params }: { params: Params }) {
  try {
    const { taskId } = await params;
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string } | undefined)?.id ?? null;

    // -------- Fetch task --------
    const task = await prisma.documentTask.findUnique({
      where: { id: taskId },
      select: { id: true, userId: true, status: true },
    });

    if (!task) {
      return fail("Task tidak ditemukan", 404);
    }

    // -------- Authorization --------
    if (task.userId && task.userId !== userId) {
      return fail("Tidak punya akses", 403);
    }

    // -------- Parse form data --------
    const formData = await req.formData();
    const errorMsg = formData.get("error") as string | null;
    const output = formData.get("output") as File | null;
    const mimeType =
      (formData.get("mimeType") as string) ?? "application/octet-stream";

    // ================================================================
    // CASE 1: Error report
    // ================================================================
    if (errorMsg) {
      await prisma.documentTask.update({
        where: { id: taskId },
        data: {
          status: "FAILED",
          errorMessage: errorMsg,
          completedAt: new Date(),
        },
      });
      return ok({ status: "FAILED" });
    }

    // ================================================================
    // CASE 2: Success upload
    // ================================================================
    if (!output) {
      return fail("Output file wajib", 400);
    }

    // Cegah double-complete
    if (task.status === "COMPLETED") {
      return fail("Task sudah selesai", 409);
    }

    const arrayBuf = await output.arrayBuffer();
    const buffer = Buffer.from(arrayBuf);
    const finalMime = output.type || mimeType;

    // -------- Upload ke storage --------
    const uploaded = await uploadFile({
      buffer,
      originalName: output.name,
      mimeType: finalMime,
      userId: userId ?? undefined,
    });

    // -------- Insert File + TaskOutputFile (transaction) --------
    const result = await prisma.$transaction(async (tx) => {
      const file = await tx.file.create({
        data: {
          fileKey: uploaded.key,
          originalName: output.name,
          mimeType: finalMime,
          sizeBytes: BigInt(buffer.byteLength),
          userId: userId ?? undefined,
          // expiresAt di-handle oleh @default(dbgenerated(...))
        },
        select: { id: true },
      });

      await tx.taskOutputFile.create({
        data: { taskId, fileId: file.id },
      });

      await tx.documentTask.update({
        where: { id: taskId },
        data: {
          status: "COMPLETED",
          completedAt: new Date(),
          errorMessage: null,
        },
      });

      return file;
    });

    return ok({ fileId: result.id, status: "COMPLETED" });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Server error";
    console.error("[tasks.complete] error:", err);
    return fail(message, 500);
  }
}