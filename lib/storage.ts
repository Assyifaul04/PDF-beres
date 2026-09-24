// lib/storage.ts
import { supabaseAdmin } from "@/lib/supabase";
import { getSettings } from "@/lib/settings/helpers";

// ============================================================================
// CONFIG
// ============================================================================

async function getStorageConfig() {
  const storageSettings = await getSettings("storage");

  if (!storageSettings.supabaseEnabled) {
    throw new Error("Supabase Storage sedang dinonaktifkan oleh Admin.");
  }

  return {
    bucket: storageSettings.supabaseBucket || "beres-files",
  };
}

// ============================================================================
// PUBLIC API — dipakai oleh route handlers
// ============================================================================

export interface UploadFileParams {
  buffer: Buffer;
  originalName: string;
  mimeType: string;
  userId?: string;
}

export interface UploadFileResult {
  key: string;
  url?: string;
  size: number;
}

/**
 * Upload file ke Supabase. Generate fileKey unik.
 */
export async function uploadFile({
  buffer,
  originalName,
  mimeType,
  userId,
}: UploadFileParams): Promise<UploadFileResult> {
  const { bucket } = await getStorageConfig();

  const fileKey = generateFileKey(originalName, userId);

  const { error } = await supabaseAdmin.storage
    .from(bucket)
    .upload(fileKey, buffer, {
      contentType: mimeType,
      upsert: false,
    });

  if (error) {
    throw new Error(`Upload gagal: ${error.message}`);
  }

  return { key: fileKey, size: buffer.byteLength };
}

/**
 * Ambil isi file sebagai Buffer — dipakai oleh processor server-side.
 */
export async function getFileBuffer(fileKey: string): Promise<Buffer> {
  const { bucket } = await getStorageConfig();

  const { data, error } = await supabaseAdmin.storage
    .from(bucket)
    .download(fileKey);

  if (error || !data) {
    throw new Error(`Download gagal: ${error?.message ?? "File tidak ditemukan"}`);
  }

  const arrayBuf = await data.arrayBuffer();
  return Buffer.from(arrayBuf);
}

/**
 * Signed URL untuk download — dipakai oleh client-side processor.
 */
export async function getSignedDownloadUrl(
  fileKey: string,
  expiresInSeconds = 3600
): Promise<string> {
  const { bucket } = await getStorageConfig();

  const { data, error } = await supabaseAdmin.storage
    .from(bucket)
    .createSignedUrl(fileKey, expiresInSeconds);

  if (error || !data) {
    throw new Error(`Signed URL gagal: ${error?.message ?? "Unknown"}`);
  }

  return data.signedUrl;
}

/**
 * Hapus file.
 */
export async function deleteFile(fileKey: string): Promise<void> {
  const { bucket } = await getStorageConfig();

  const { error } = await supabaseAdmin.storage.from(bucket).remove([fileKey]);
  if (error) throw new Error(`Delete gagal: ${error.message}`);
}

/**
 * Signed URL untuk upload dari client (opsional).
 */
export async function getSignedUploadUrl(
  fileKey: string,
  expiresInSeconds = 600
): Promise<{ signedUrl: string; token: string; path: string }> {
  const { bucket } = await getStorageConfig();

  const { data, error } = await supabaseAdmin.storage
    .from(bucket)
    .createSignedUploadUrl(fileKey);

  if (error || !data) {
    throw new Error(`Signed Upload URL gagal: ${error?.message ?? "Unknown"}`);
  }

  return { signedUrl: data.signedUrl, token: data.token, path: data.path };
}

// ============================================================================
// BACKWARD-COMPAT ALIASES (nama lama, agar kode existing tidak rusak)
// ============================================================================

export const uploadToSupabase = (
  fileKey: string,
  buffer: Buffer,
  contentType: string
) =>
  supabaseAdmin.storage
    .from("beres-files") // fallback; lebih baik pakai uploadFile()
    .upload(fileKey, buffer, { contentType, upsert: true });

export const getSupabaseDownloadUrl = getSignedDownloadUrl;
export const deleteFromSupabase = deleteFile;

// ============================================================================
// HELPERS
// ============================================================================

function generateFileKey(originalName: string, userId?: string): string {
  const ts = Date.now();
  const rand = Math.random().toString(36).slice(2, 10);
  const safeName = originalName
    .replace(/[^\w.\-]+/g, "_")
    .slice(-100); // max 100 karakter terakhir
  const owner = userId ?? "guest";
  const date = new Date();
  const yyyy = date.getUTCFullYear();
  const mm = String(date.getUTCMonth() + 1).padStart(2, "0");

  return `${owner}/${yyyy}/${mm}/${ts}-${rand}-${safeName}`;
}

function getBucketPublicUrl(fileKey: string, bucket: string): string {
  const { data } = supabaseAdmin.storage.from(bucket).getPublicUrl(fileKey);
  return data.publicUrl;
}