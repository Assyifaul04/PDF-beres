// app/api/files/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { supabaseAdmin } from "@/lib/supabase";
import { getSettings } from "@/lib/settings/helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type SessionUserWithId = {
  id?: string;
  role?: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

function guessMimeFromName(name: string): string {
  const ext = name.toLowerCase().split(".").pop() ?? "";
  const map: Record<string, string> = {
    pdf: "application/pdf",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
    gif: "image/gif",
    svg: "image/svg+xml",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    doc: "application/msword",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    xls: "application/vnd.ms-excel",
    csv: "text/csv",
    pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    ppt: "application/vnd.ms-powerpoint",
  };
  return map[ext] ?? "application/octet-stream";
}

async function fetchFileBytes(id: string) {
  const storageSettings = await getSettings("storage");
  if (!storageSettings.supabaseEnabled) {
    return { error: "Storage dinonaktifkan", status: 503 };
  }

  const file = await prisma.file.findUnique({ where: { id } });
  if (!file) {
    return { error: "File tidak ditemukan", status: 404 };
  }

  if (file.expiresAt && new Date(file.expiresAt) < new Date()) {
    return { error: "File expired", status: 410 };
  }

  const bucket = storageSettings.supabaseBucket || "beres-files";
  const { data, error } = await supabaseAdmin.storage
    .from(bucket)
    .download(file.fileKey);

  if (error || !data) {
    return { error: "File tidak ada di storage", status: 404 };
  }

  // ✅ Uint8Array (bukan Buffer) — kompatibel dengan BodyInit Next.js 16
  const bytes = new Uint8Array(await data.arrayBuffer());

  const mimeType =
    file.mimeType && file.mimeType !== "application/octet-stream"
      ? file.mimeType
      : guessMimeFromName(file.originalName);

  return { bytes, mimeType, file, bucket };
}

function buildFileResponse(params: {
  bytes: Uint8Array;
  mimeType: string;
  originalName: string;
  rangeHeader: string | null;
}) {
  const { bytes, mimeType, originalName, rangeHeader } = params;
  const totalSize = bytes.byteLength;
  const safeName = encodeURIComponent(originalName);

  const baseHeaders: Record<string, string> = {
    "Content-Type": mimeType,
    "Content-Disposition": `inline; filename*=UTF-8''${safeName}`,
    "Accept-Ranges": "bytes",
    "X-Content-Type-Options": "nosniff",
    "Cache-Control": "private, no-store, max-age=0",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, HEAD, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Range, Authorization",
    "Access-Control-Expose-Headers":
      "Content-Length, Content-Range, Accept-Ranges",
  };

  // -------- Range request --------
  if (rangeHeader) {
    const match = /bytes=(\d*)-(\d*)/.exec(rangeHeader);
    if (match) {
      const startStr = match[1];
      const endStr = match[2];

      let start = startStr ? parseInt(startStr, 10) : 0;
      let end = endStr ? parseInt(endStr, 10) : totalSize - 1;

      if (isNaN(start) || start < 0) start = 0;
      if (isNaN(end) || end >= totalSize) end = totalSize - 1;
      if (start > end) {
        return new NextResponse(null, {
          status: 416,
          headers: {
            ...baseHeaders,
            "Content-Range": `bytes */${totalSize}`,
          },
        });
      }

      const chunk = bytes.slice(start, end + 1);

      // ✅ Cast ke BodyInit — Uint8Array valid di runtime
      return new NextResponse(chunk as BodyInit, {
        status: 206,
        headers: {
          ...baseHeaders,
          "Content-Length": String(chunk.byteLength),
          "Content-Range": `bytes ${start}-${end}/${totalSize}`,
        },
      });
    }
  }

  return new NextResponse(bytes as BodyInit, {
    status: 200,
    headers: {
      ...baseHeaders,
      "Content-Length": String(totalSize),
    },
  });
}

// ============================================================================
// GET /api/files/[id]
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

    const result = await fetchFileBytes(id);
    if ("error" in result) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: result.status }
      );
    }

    const { bytes, mimeType, file } = result;
    const rangeHeader = req.headers.get("range");

    return buildFileResponse({
      bytes,
      mimeType,
      originalName: file.originalName,
      rangeHeader,
    });
  } catch (err) {
    console.error("[app/api/files/[id]] GET Error:", err);
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

// ============================================================================
// HEAD /api/files/[id]
// ============================================================================
export async function HEAD(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return new NextResponse(null, { status: 400 });
    }

    const result = await fetchFileBytes(id);
    if ("error" in result) {
      return new NextResponse(null, { status: result.status });
    }

    const { bytes, mimeType, file } = result;
    const safeName = encodeURIComponent(file.originalName);

    return new NextResponse(null, {
      status: 200,
      headers: {
        "Content-Type": mimeType,
        "Content-Length": String(bytes.byteLength),
        "Content-Disposition": `inline; filename*=UTF-8''${safeName}`,
        "Accept-Ranges": "bytes",
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "private, no-store, max-age=0",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err) {
    console.error("[app/api/files/[id]] HEAD Error:", err);
    return new NextResponse(null, { status: 500 });
  }
}

// ============================================================================
// DELETE /api/files/[id]
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

    const session = await getServerSession(authOptions);
    const user = session?.user as SessionUserWithId | undefined;
    const userId = user?.id ?? null;

    const file = await prisma.file.findUnique({ where: { id } });
    if (!file) {
      return NextResponse.json(
        { success: true, message: "File sudah tidak ada" },
        { status: 200 }
      );
    }

    if (userId && file.userId && file.userId !== userId) {
      return NextResponse.json(
        { success: false, error: "Akses ditolak" },
        { status: 403 }
      );
    }

    try {
      const storageSettings = await getSettings("storage");
      if (storageSettings.supabaseEnabled) {
        const bucket = storageSettings.supabaseBucket || "beres-files";
        const { error: storageError } = await supabaseAdmin.storage
          .from(bucket)
          .remove([file.fileKey]);
        if (storageError) {
          console.warn("[app/api/files] Gagal hapus:", storageError.message);
        }
      }
    } catch (storageErr) {
      console.warn("[app/api/files] Storage delete error:", storageErr);
    }

    await prisma.file.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: "File berhasil dihapus",
    });
  } catch (err) {
    console.error("[app/api/files/[id]] DELETE Error:", err);
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

// ============================================================================
// OPTIONS
// ============================================================================
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, HEAD, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Range, Authorization",
      "Access-Control-Max-Age": "86400",
    },
  });
}