import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { supabaseAdmin } from "@/lib/supabase";
import { fail } from "@/lib/api-response";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = Promise<{ taskId: string }>;

// ============================================================================
// CONSTANTS
// ============================================================================

const SIGNED_URL_TTL_SECONDS = 3600; // 1 jam

// ============================================================================
// GET /api/tasks/[taskId]/download
// ============================================================================

export async function GET(_req: NextRequest, { params }: { params: Params }) {
  try {
    const { taskId } = await params;

    // ---------- Auth ----------
    const session = await getServerSession(authOptions);
    const userId =
      (session?.user as { id?: string } | undefined)?.id ?? null;
    const isAdmin =
      (session?.user as { role?: string } | undefined)?.role === "ADMIN";

    // ---------- Fetch task ----------
    const task = await prisma.documentTask.findUnique({
      where: { id: taskId },
      select: {
        id: true,
        status: true,
        userId: true,
        outputFiles: {
          select: {
            file: {
              select: {
                id: true,
                fileKey: true,
                originalName: true,
                mimeType: true,
                sizeBytes: true,
                expiresAt: true,
              },
            },
          },
        },
      },
    });

    if (!task) {
      return fail("Task tidak ditemukan", 404);
    }

    // ---------- Authorization ----------
    const isOwner = task.userId && userId && task.userId === userId;
    const isGuestTask = !task.userId;
    const isGuestRequester = !userId;

    if (!isAdmin && !isOwner && !(isGuestTask && isGuestRequester)) {
      return fail("Tidak punya akses", 403);
    }

    // ---------- Validate status ----------
    if (task.status !== "COMPLETED") {
      return fail("Task belum selesai", 400);
    }
    if (task.outputFiles.length === 0) {
      return fail("Tidak ada file output", 404);
    }

    // ---------- Filter expired files ----------
    const now = new Date();
    const validFiles = task.outputFiles.filter(
      (o) => o.file.expiresAt > now
    );

    if (validFiles.length === 0) {
      return fail(
        "Semua file output sudah expired. Silakan proses ulang.",
        410
      );
    }

    // ================================================================
    // CASE 1: Single file → redirect ke signed URL dengan opsi download
    // ================================================================
    if (validFiles.length === 1) {
      const file = validFiles[0].file;

      // MENAMBAHKAN { download: file.originalName } AGAR FILE MASUK KE DOWNLOAD MANAGER (Ctrl + J)
      const { data, error } = await supabaseAdmin.storage
        .from(process.env.SUPABASE_BUCKET ?? "beres-files")
        .createSignedUrl(file.fileKey, SIGNED_URL_TTL_SECONDS, {
          download: file.originalName,
        });

      if (error || !data?.signedUrl) {
        console.error("[download] signed URL error:", error);
        return fail("Gagal generate URL download", 500);
      }

      // Redirect dengan 302
      return NextResponse.redirect(data.signedUrl, { status: 302 });
    }

    // ================================================================
    // CASE 2: Multi file → return JSON dengan daftar signed URLs
    // ================================================================
    const files = await Promise.all(
      validFiles.map(async (o) => {
        const { data, error } = await supabaseAdmin.storage
          .from(process.env.SUPABASE_BUCKET ?? "beres-files")
          .createSignedUrl(o.file.fileKey, SIGNED_URL_TTL_SECONDS, {
            download: o.file.originalName,
          });

        return {
          id: o.file.id,
          name: o.file.originalName,
          mimeType: o.file.mimeType,
          sizeBytes: Number(o.file.sizeBytes),
          url: error || !data ? null : data.signedUrl,
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: {
        taskId,
        count: files.length,
        expiresInSeconds: SIGNED_URL_TTL_SECONDS,
        files,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Server error";
    console.error("[tasks.download] error:", err);
    return fail(message, 500);
  }
}