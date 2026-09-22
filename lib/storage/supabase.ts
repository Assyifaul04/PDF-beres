import { supabaseAdmin } from "@/lib/supabase";
import { getSettings } from "@/lib/settings/helpers";

async function getStorageConfig() {
  const storageSettings = await getSettings("storage");
  
  if (!storageSettings.supabaseEnabled) {
    throw new Error("Supabase Storage sedang dinonaktifkan oleh Admin.");
  }

  return {
    bucket: storageSettings.supabaseBucket || "beres-files",
  };
}

export async function uploadToSupabase(
  fileKey: string,
  buffer: Buffer,
  contentType: string
) {
  const { bucket } = await getStorageConfig();

  const { data, error } = await supabaseAdmin.storage
    .from(bucket)
    .upload(fileKey, buffer, {
      contentType,
      upsert: true,
    });

  if (error) throw new Error(`Supabase Upload Error: ${error.message}`);
  return data;
}

export async function getSupabaseDownloadUrl(
  fileKey: string,
  expiresInSeconds: number = 3600
) {
  const { bucket } = await getStorageConfig();

  const { data, error } = await supabaseAdmin.storage
    .from(bucket)
    .createSignedUrl(fileKey, expiresInSeconds);

  if (error) throw new Error(`Supabase Signed URL Error: ${error.message}`);
  return data.signedUrl;
}

export async function deleteFromSupabase(fileKey: string) {
  const { bucket } = await getStorageConfig();

  const { data, error } = await supabaseAdmin.storage
    .from(bucket)
    .remove([fileKey]);

  if (error) throw new Error(`Supabase Delete Error: ${error.message}`);
  return data;
}