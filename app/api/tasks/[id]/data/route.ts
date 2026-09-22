// app/api/tasks/[id]/data/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { supabaseAdmin } from "@/lib/supabase";
import { getSettings } from "@/lib/settings/helpers";
import { ok, fail } from "@/lib/api-response";

type Params = Promise<{ id: string }>;

export async function GET(_req: NextRequest, { params }: { params: Params }) {
  const { id } = await params;

  const task = await prisma.documentTask.findUnique({
    where: { id },
    include: {
      inputFiles: {
        include: { file: true },
        orderBy: { order: "asc" },
      },
    },
  });

  if (!task) return fail("Task tidak ditemukan", 404);

  const storage = await getSettings("storage");
  const bucket = storage.supabaseBucket || "beres-files";

  // Generate signed URLs (berlaku 1 jam)
  const inputFiles = await Promise.all(
    task.inputFiles.map(async (input) => {
      const { data, error } = await supabaseAdmin.storage
        .from(bucket)
        .createSignedUrl(input.file.fileKey, 3600);

      if (error || !data) {
        throw new Error(`Gagal generate URL untuk ${input.file.originalName}`);
      }

      return {
        fileId: input.file.id,
        name: input.file.originalName,
        mimeType: input.file.mimeType,
        sizeBytes: input.file.sizeBytes.toString(),
        url: data.signedUrl,
      };
    })
  );

  return ok({
    taskId: task.id,
    toolType: task.toolType,
    status: task.status,
    settings: task.settings,
    inputFiles,
  });
}