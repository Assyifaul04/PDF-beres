// lib/client/converters/pdf-security.ts
import { PDFDocument } from "pdf-lib";
// ✅ Untuk PROTECT, pakai @cantoo/pdf-lib yang support encryption
import { PDFDocument as PDFDocumentEncrypted } from "@cantoo/pdf-lib";
import type { ConvertInput, ConvertOutput, ProgressCallback } from "./utils";

// ============================================================================
// PROTECT PDF (encrypt dengan password)
// ============================================================================
export async function protectPdf(
  input: ConvertInput,
  settings: Record<string, unknown> | null,
  onProgress?: ProgressCallback
): Promise<ConvertOutput> {
  const userPassword = (settings?.password as string) ?? "";
  const ownerPassword = (settings?.ownerPassword as string) ?? userPassword;

  if (!userPassword) throw new Error("Password wajib diisi");

  onProgress?.(20, "Membaca PDF...");
  const pdf = await PDFDocumentEncrypted.load(input.buffer);

  onProgress?.(60, "Mengenkripsi...");
  const bytes = await pdf.save({
    // @cantoo/pdf-lib encryption options
    userPassword,
    ownerPassword,
    permissions: {
      printing: "highResolution",
      modifying: false,
      copying: false,
      annotating: false,
      fillingForms: false,
      contentAccessibility: true,
      documentAssembly: false,
    },
  } as never);

  return {
    blob: new Blob([bytes as BlobPart], { type: "application/pdf" }),
    fileName: input.name.replace(/\.pdf$/i, "-protected.pdf"),
    mimeType: "application/pdf",
  };
}

// ============================================================================
// UNLOCK PDF (remove password)
// ============================================================================
export async function unlockPdf(
  input: ConvertInput,
  settings: Record<string, unknown> | null,
  onProgress?: ProgressCallback
): Promise<ConvertOutput> {
  const password = (settings?.password as string) ?? "";

  onProgress?.(20, "Membuka PDF...");
  const pdf = await PDFDocumentEncrypted.load(input.buffer, {
    password,
    ignoreEncryption: false,
  });

  // Hapus enkripsi
  const bytes = await pdf.save();

  return {
    blob: new Blob([bytes as BlobPart], { type: "application/pdf" }),
    fileName: input.name.replace(/\.pdf$/i, "-unlocked.pdf"),
    mimeType: "application/pdf",
  };
}