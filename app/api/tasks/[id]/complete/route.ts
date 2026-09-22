// app/api/tasks/[id]/complete/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { supabaseAdmin } from "@/lib/supabase";
import { getSettings } from "@/lib/settings/helpers";
import { ok, fail } from "@/lib/api-response";

type Params = Promise<{ id: string }>;

export const runtime = "nodejs";

export async function POST(req: NextRequest, { params }: { params: Params }) {
  const { id } = await params;

  const task = await prisma.documentTask.findUnique({
    where: { id },
    select: { id: true, userId: true, status: true },
  });

  if (!task) return fail("Task tidak ditemukan", 404);
  if (task.status === "COMPLETED") {
    return ok({ message: "Task sudah selesai" });
  }

  // ✅ Parse multipart form
  const formData = await req.formData();
  const outputFile = formData.get("output") as File | null;
  const errorMessage = formData.get("error") as string | null;

  // Handle error dari client
  if (errorMessage) {
    await prisma.documentTask.update({
      where: { id },
      data: {
        status: "FAILED",
        errorMessage,
        completedAt: new Date(),
      },
    });

    return ok({ success: true, status: "FAILED" });
  }

  if (!outputFile) {
    return fail("Output file tidak ditemukan", 400);
  }

  // Upload output ke Supabase
  const storage = await getSettings("storage");
  const bucket = storage.supabaseBucket || "beres-files";

  const today = new Date();
  const dateFolder = `${today.getFullYear()}-${String(
    today.getMonth() + 1
  ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const ext = outputFile.name.split(".").pop() || "pdf";
  const outputKey = `${dateFolder}/${crypto.randomUUID()}.${ext}`;

  const arrayBuffer = await outputFile.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const { error: uploadError } = await supabaseAdmin.storage
    .from(bucket)
    .upload(outputKey, buffer, {
      contentType: outputFile.type || "application/pdf",
      upsert: false,
    });

  if (uploadError) {
    return fail(`Upload output gagal: ${uploadError.message}`, 500);
  }

  // Hitung expiresAt
  const retention = await getSettings("retention");
  const expiresAt = new Date();

  if (task.userId) {
    const user = await prisma.user.findUnique({
      where: { id: task.userId },
      select: { plan: true },
    });
    const days =
      user?.plan === "PREMIUM"
        ? retention.premiumRetentionDays
        : retention.freeRetentionDays;
    expiresAt.setDate(expiresAt.getDate() + days);
  } else {
    expiresAt.setHours(
      expiresAt.getHours() + retention.anonymousRetentionHours
    );
  }

  // Buat File record
  const fileRecord = await prisma.file.create({
    data: {
      userId: task.userId,
      originalName: outputFile.name,
      fileKey: outputKey,
      mimeType: outputFile.type || "application/pdf",
      sizeBytes: BigInt(buffer.length),
      storageProvider: "SUPABASE",
      migrationStatus: "TEMP",
      expiresAt,
    },
  });

  // Link output ke task
  await prisma.taskOutputFile.create({
    data: {
      taskId: task.id,
      fileId: fileRecord.id,
    },
  });

  // Set COMPLETED
  await prisma.documentTask.update({
    where: { id },
    data: {
      status: "COMPLETED",
      completedAt: new Date(),
      errorMessage: null,
    },
  });

  // Update user taskCount
  if (task.userId) {
    await prisma.user.update({
      where: { id: task.userId },
      data: { taskCount: { increment: 1 } },
    });
  }

  return ok({
    success: true,
    status: "COMPLETED",
    outputFileId: fileRecord.id,
  });
}