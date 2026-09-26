// app/api/files/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { supabaseAdmin } from "@/lib/supabase";
import { getSettings } from "@/lib/settings/helpers";

/**
 * Tipe minimal session yang dibutuhkan route ini.
 * Dibuat lokal supaya tidak bergantung sepenuhnya pada augmentasi
 * `next-auth.d.ts` (mencegah TS2339 saat build di Vercel).
 */
type SessionUserWithId = {
  id?: string;
  role?: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

// ============================================================================
// GET /api/files/[id] — Serve file untuk preview/download
// ============================================================================

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "File ID tidak valid" },
        { status: 400 }
      );
    }

    // -------- Cek storage enabled --------
    const storageSettings = await getSettings("storage");
    if (!storageSettings.supabaseEnabled) {
      return NextResponse.json(
        { success: false, error: "Storage dinonaktifkan" },
        { status: 503 }
      );
    }

    // -------- Query DB --------
    const file = await prisma.file.findUnique({ where: { id } });
    if (!file) {
      return NextResponse.json(
        { success: false, error: "File tidak ditemukan" },
        { status: 404 }
      );
    }

    // -------- Cek expired --------
    if (file.expiresAt && new Date(file.expiresAt) < new Date()) {
      return NextResponse.json(
        { success: false, error: "File expired" },
        { status: 410 }
      );
    }

    // -------- Download dari Supabase --------
    const bucket = storageSettings.supabaseBucket || "beres-files";
    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .download(file.fileKey);

    if (error || !data) {
      console.error("[api/files] Supabase download error:", error);
      return NextResponse.json(
        { success: false, error: "File tidak ada di storage" },
        { status: 404 }
      );
    }

    const buffer = Buffer.from(await data.arrayBuffer());

    // ========================================================================
    // ⚠️ HEADER MINIMAL — jangan tambah CORS/Cache-Control yang konflik
    // Cukup Content-Type + Content-Length. Sisanya biarkan Next.js default.
    // ========================================================================
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": file.mimeType || "application/pdf",
        "Content-Length": String(buffer.byteLength),
      },
    });
  } catch (err) {
    console.error("[api/files/[id]] GET Error:", err);
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

// ============================================================================
// DELETE /api/files/[id] — Hapus file dari DB + Supabase Storage
// ============================================================================

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "File ID tidak valid" },
        { status: 400 }
      );
    }

    // -------- Auth --------
    const session = await getServerSession(authOptions);
    const user = session?.user as SessionUserWithId | undefined;
    const userId = user?.id ?? null;

    // -------- Cari file di DB --------
    const file = await prisma.file.findUnique({ where: { id } });

    if (!file) {
      // Idempotent: return 200 agar UI tidak error
      return NextResponse.json(
        { success: true, message: "File sudah tidak ada" },
        { status: 200 }
      );
    }

    // -------- Cek ownership --------
    if (userId && file.userId && file.userId !== userId) {
      return NextResponse.json(
        { success: false, error: "Akses ditolak" },
        { status: 403 }
      );
    }

    // -------- Hapus dari Supabase Storage --------
    try {
      const storageSettings = await getSettings("storage");
      if (storageSettings.supabaseEnabled) {
        const bucket = storageSettings.supabaseBucket || "beres-files";
        const { error: storageError } = await supabaseAdmin.storage
          .from(bucket)
          .remove([file.fileKey]);

        if (storageError) {
          console.warn(
            "[api/files] Gagal hapus dari storage:",
            storageError.message
          );
        }
      }
    } catch (storageErr) {
      console.warn("[api/files] Storage delete error:", storageErr);
    }

    // -------- Hapus dari database --------
    await prisma.file.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: "File berhasil dihapus",
    });
  } catch (err) {
    console.error("[api/files/[id]] DELETE Error:", err);
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

// ============================================================================
// OPTIONS — CORS preflight
// ============================================================================

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, DELETE, HEAD, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Range, Authorization",
      "Access-Control-Max-Age": "86400",
    },
  });
}