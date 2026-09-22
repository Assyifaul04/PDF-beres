// app/api/upload/route.ts
import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ok, fail } from "@/lib/api-response";
import { uploadFileToStorage } from "@/lib/storage/upload";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs"; // butuh Buffer
export const maxDuration = 60; // 60 detik (kalau Vercel Pro)

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string } | undefined)?.id ?? null;

    const formData = await req.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return fail("Tidak ada file yang diunggah", 400);
    }

    // Batasi jumlah file per request
    if (files.length > 20) {
      return fail("Maksimal 20 file per request", 400);
    }

    // Upload semua file secara paralel
    const results = await Promise.all(
      files.map((file) =>
        uploadFileToStorage({
          file,
          userId,
        })
      )
    );

    // Log ke SystemLog
    await prisma.systemLog.create({
      data: {
        level: "info",
        action: "file.upload",
        message: `${files.length} file diunggah${userId ? "" : " (anonymous)"}`,
        meta: {
          userId,
          fileIds: results.map((r) => r.fileId),
          totalSize: results.reduce((sum, r) => sum + Number(r.sizeBytes), 0),
        },
      },
    });

    // Serialize BigInt
    return ok({
      files: results.map((r) => ({
        ...r,
        sizeBytes: r.sizeBytes.toString(),
      })),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload gagal";
    console.error("[upload]", err);
    return fail(message, 500);
  }
}