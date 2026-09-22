// app/api/tasks/[id]/download/route.ts
import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { supabaseAdmin } from "@/lib/supabase";
import { fail } from "@/lib/api-response";

type Params = Promise<{ id: string }>;

export async function GET(_req: NextRequest, { params }: { params: Params }) {
  const session = await getServerSession(authOptions);
  const sessionUserId = (session?.user as { id?: string } | undefined)?.id ?? null;

  const { id } = await params;

  const task = await prisma.documentTask.findUnique({
    where: { id },
    include: {
      outputFiles: { include: { file: true } },
    },
  });

  if (!task) return fail("Task tidak ditemukan", 404);
  if (task.status !== "COMPLETED") return fail("Task belum selesai", 400);
  if (task.outputFiles.length === 0) return fail("Tidak ada output", 404);

  // ✅ Cek kepemilikan
  if (task.userId) {
    // Task milik user login — session harus match
    if (task.userId !== sessionUserId) {
      return fail("Tidak punya akses", 403);
    }
  }
  // Kalau task.userId null → anonymous, boleh diakses siapa saja yang punya taskId

  // Kalau 1 file → redirect ke signed URL
  if (task.outputFiles.length === 1) {
    const file = task.outputFiles[0].file;
    const { data, error } = await supabaseAdmin.storage
      .from("beres-files")
      .createSignedUrl(file.fileKey, 3600);

    if (error || !data) return fail("Gagal generate URL", 500);
    return Response.redirect(data.signedUrl);
  }

  // Kalau > 1 file → return list
  const urls = await Promise.all(
    task.outputFiles.map(async (o) => {
      const { data } = await supabaseAdmin.storage
        .from("beres-files")
        .createSignedUrl(o.file.fileKey, 3600);
      return {
        id: o.file.id,
        name: o.file.originalName,
        url: data?.signedUrl ?? null,
      };
    })
  );

  return Response.json({ files: urls });
}