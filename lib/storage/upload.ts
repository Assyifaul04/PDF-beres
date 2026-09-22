// lib/storage/upload.ts
import { supabaseAdmin } from "@/lib/supabase";
import { getSettings } from "@/lib/settings/helpers";
import { prisma } from "@/lib/prisma";

interface UploadParams {
  file: File;
  userId?: string | null;
}

interface UploadResult {
  fileId: string;
  fileKey: string;
  originalName: string;
  sizeBytes: bigint;
  mimeType: string;
}

/**
 * Sanitasi extension — hanya a-z0-9, max 10 char.
 * Fallback ke "bin" kalau kosong/invalid.
 */
function sanitizeExtension(fileName: string): string {
  const parts = fileName.split(".");
  if (parts.length < 2) return "bin";

  const raw = parts.pop() ?? "";
  const clean = raw
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "") // hanya alfanumerik
    .slice(0, 10); // max 10 char

  return clean || "bin";
}

/**
 * Upload file ke Supabase Storage + buat record File di DB.
 */
export async function uploadFileToStorage({
  file,
  userId,
}: UploadParams): Promise<UploadResult> {
  const storage = await getSettings("storage");
  const general = await getSettings("general");
  const retention = await getSettings("retention");

  // ==========================================================================
  // 1. Validasi awal
  // ==========================================================================
  if (!storage.supabaseEnabled) {
    throw new Error("Supabase Storage sedang dinonaktifkan oleh Admin.");
  }

  // ✅ Trim & validate bucket name
  const bucket = (storage.supabaseBucket || "beres-files").trim();

  if (!bucket) {
    throw new Error("Bucket Supabase belum dikonfigurasi.");
  }

  if (!/^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$/.test(bucket)) {
    throw new Error(
      `Nama bucket "${bucket}" tidak valid. Hanya huruf kecil, angka, dan dash (3-63 char).`
    );
  }

  const maxBytes = general.maxUploadMB * 1024 * 1024;
  if (file.size > maxBytes) {
    throw new Error(`File melebihi batas ${general.maxUploadMB} MB.`);
  }

  if (file.size === 0) {
    throw new Error("File kosong.");
  }

  // ==========================================================================
  // 2. Generate fileKey — SANITIZED
  // ==========================================================================
  const today = new Date();
  const dateFolder = `${today.getFullYear()}-${String(
    today.getMonth() + 1
  ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  // ✅ Extension yang sudah disanitasi
  const ext = sanitizeExtension(file.name);

  // ✅ UUID tanpa karakter aneh
  const uniqueId = crypto.randomUUID().replace(/-/g, "");

  // ✅ fileKey: hanya a-z, 0-9, dash, slash, titik
  const fileKey = `${dateFolder}/${uniqueId}.${ext}`;

  // ✅ Validasi fileKey SEBELUM kirim ke Supabase
  if (!/^[a-zA-Z0-9\-_/.]+$/.test(fileKey)) {
    throw new Error(`fileKey tidak valid: ${fileKey}`);
  }

  // ==========================================================================
  // 3. DEBUG LOG (hapus setelah fix)
  // ==========================================================================
  console.log("[upload] ─────────────────────────────────────");
  console.log("[upload] bucket:", JSON.stringify(bucket));
  console.log("[upload] fileKey:", JSON.stringify(fileKey));
  console.log("[upload] originalName:", JSON.stringify(file.name));
  console.log("[upload] mimeType:", JSON.stringify(file.type));
  console.log("[upload] size:", file.size);
  console.log("[upload] supabaseUrl:", process.env.NEXT_PUBLIC_SUPABASE_URL);
  console.log(
    "[upload] serviceKey prefix:",
    process.env.SUPABASE_SERVICE_ROLE_KEY?.slice(0, 20) + "..."
  );

  // ==========================================================================
  // 4. Upload ke Supabase
  // ==========================================================================
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
    .from(bucket)
    .upload(fileKey, buffer, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });

  if (uploadError) {
    // ✅ Log lengkap error object
    console.error("[upload] ❌ Supabase Error:", {
      message: uploadError.message,
      name: uploadError.name,
      bucket,
      fileKey,
      fileSize: file.size,
      mimeType: file.type,
      originalName: file.name,
    });

    throw new Error(`Supabase Upload Error: ${uploadError.message}`);
  }

  console.log("[upload] ✅ Success:", uploadData.path);

  // ==========================================================================
  // 5. Hitung expiresAt
  // ==========================================================================
  const expiresAt = new Date();
  if (userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
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

  // ==========================================================================
  // 6. Buat record File
  // ==========================================================================
  const fileRecord = await prisma.file.create({
    data: {
      userId: userId ?? null,
      originalName: file.name,
      fileKey,
      mimeType: file.type || "application/octet-stream",
      sizeBytes: BigInt(file.size),
      storageProvider: "SUPABASE",
      migrationStatus: "TEMP",
      expiresAt,
    },
  });

  // ==========================================================================
  // 7. Update user.usedBytes
  // ==========================================================================
  if (userId) {
    await prisma.user.update({
      where: { id: userId },
      data: { usedBytes: { increment: BigInt(file.size) } },
    });
  }

  return {
    fileId: fileRecord.id,
    fileKey: fileRecord.fileKey,
    originalName: fileRecord.originalName,
    sizeBytes: fileRecord.sizeBytes,
    mimeType: fileRecord.mimeType,
  };
}