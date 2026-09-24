// lib/client/converters.ts
import {
  runPDFTool,
  type PDFTool,
  type FileInput,
  type ProcessOptions,
  type ProcessResult,
} from "@/lib/processors";

// ============================================================================
// TYPES
// ============================================================================

export interface ConverterInput {
  name: string;
  buffer: ArrayBuffer;
}

export interface ConverterOutput {
  blob: Blob;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
}

export type ProgressCallback = (pct: number, message?: string) => void;

// ============================================================================
// CLIENT TOOLS — sinkron dengan lib/processors/constants.ts
// ============================================================================

/**
 * Tool yang AMAN dijalankan di browser (tanpa API key).
 * Tool server-only (Office ↔ PDF via CloudConvert) sudah dipindah ke server.
 */
export const CLIENT_TOOLS: ReadonlySet<PDFTool> = new Set<PDFTool>([
  "MERGE_PDF",
  "SPLIT_PDF",
  "COMPRESS_PDF",
  "ROTATE_PDF",
  "PAGE_NUMBERS",
  "ORGANIZE_PDF",
  "JPG_TO_PDF",
  "PDF_TO_JPG",
  "HTML_TO_PDF",
  "WATERMARK_PDF",
  "SIGN_PDF",
  "EDIT_PDF",
  "PROTECT_PDF",
  "UNLOCK_PDF",
  "REPAIR_PDF",
  // ❌ Server-only (via CloudConvert):
  // WORD_TO_PDF, POWERPOINT_TO_PDF, EXCEL_TO_PDF
  // PDF_TO_WORD, PDF_TO_POWERPOINT, PDF_TO_EXCEL
]);

export function isClientTool(toolType: string): boolean {
  return CLIENT_TOOLS.has(toolType as PDFTool);
}

// ============================================================================
// MAIN CONVERTER
// ============================================================================

export async function convertClientSide(
  toolType: string,
  inputs: ConverterInput[],
  settings: Record<string, unknown> | null,
  onProgress?: ProgressCallback
): Promise<ConverterOutput> {
  // ---- Validasi: pastikan tool memang client-side ----
  if (!isClientTool(toolType)) {
    throw new Error(
      `Tool "${toolType}" hanya bisa diproses di server. Gunakan endpoint /process-server.`
    );
  }

  // ---- Map input → FileInput ----
  const files: FileInput[] = inputs.map((f) => ({
    buffer: f.buffer,
    name: f.name,
    type: guessMimeFromName(f.name),
    size: f.buffer.byteLength,
  }));

  const options = (settings ?? {}) as ProcessOptions;

  // ---- Jalankan processor ----
  const result: ProcessResult = await runPDFTool(toolType as PDFTool, files, {
    ...options,
    onProgress: (pct, msg) => onProgress?.(pct, msg),
  });

  if (!result.files.length) {
    throw new Error("Tidak ada file output dihasilkan");
  }

  // ---- Single output ----
  if (result.files.length === 1) {
    const f = result.files[0];
    const blob = new Blob([f.buffer as BlobPart], { type: f.type });
    return {
      blob,
      fileName: f.name,
      mimeType: f.type,
      sizeBytes: f.size,
    };
  }

  // ---- Multi output → ZIP ----
  const { default: JSZip } = await import("jszip");
  const zip = new JSZip();
  for (const f of result.files) {
    zip.file(f.name, f.buffer as ArrayBuffer);
  }
  const zipBlob = await zip.generateAsync({
    type: "blob",
    compression: "DEFLATE",
    compressionOptions: { level: 6 },
  });

  return {
    blob: zipBlob,
    fileName: `${toolType.toLowerCase()}-results.zip`,
    mimeType: "application/zip",
    sizeBytes: zipBlob.size,
  };
}

// ============================================================================
// HELPERS
// ============================================================================

function guessMimeFromName(name: string): string {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  const map: Record<string, string> = {
    pdf: "application/pdf",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
    gif: "image/gif",
    bmp: "image/bmp",
    tiff: "image/tiff",
    tif: "image/tiff",
    doc: "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ppt: "application/vnd.ms-powerpoint",
    pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    xls: "application/vnd.ms-excel",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    html: "text/html",
    htm: "text/html",
  };
  return map[ext] ?? "application/octet-stream";
}