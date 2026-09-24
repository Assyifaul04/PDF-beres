// lib/processors/constants.ts
import type { PDFTool, ServerOnlyTool, ClientTool } from './types';

export const PDF_MIME = 'application/pdf' as const;
export const MAX_FILE_SIZE = 100 * 1024 * 1024;
export const MAX_TOTAL_SIZE = 500 * 1024 * 1024;
export const MAX_FILES = 50;
export const MIN_FILES = 1;

export const IMAGE_MIMES = [
  'image/jpeg', 'image/jpg', 'image/png', 'image/webp',
  'image/gif', 'image/bmp', 'image/tiff',
] as const;

export type ImageMime = (typeof IMAGE_MIMES)[number];

export interface ToolRequirement {
  minFiles: number;
  maxFiles: number;
  serverOnly: boolean;
  timeoutMs?: number;
}

export const TOOL_REQUIREMENTS: Record<PDFTool, ToolRequirement> = {
  // ---------- Client-side ----------
  MERGE_PDF:         { minFiles: 2, maxFiles: 50, serverOnly: false },
  SPLIT_PDF:         { minFiles: 1, maxFiles: 1,  serverOnly: false },
  COMPRESS_PDF:      { minFiles: 1, maxFiles: 1,  serverOnly: false },
  ROTATE_PDF:        { minFiles: 1, maxFiles: 1,  serverOnly: false },
  PAGE_NUMBERS:      { minFiles: 1, maxFiles: 1,  serverOnly: false },
  ORGANIZE_PDF:      { minFiles: 1, maxFiles: 1,  serverOnly: false },
  JPG_TO_PDF:        { minFiles: 1, maxFiles: 50, serverOnly: false },
  PDF_TO_JPG:        { minFiles: 1, maxFiles: 1,  serverOnly: false },
  HTML_TO_PDF:       { minFiles: 0, maxFiles: 0,  serverOnly: false },
  WATERMARK_PDF:     { minFiles: 1, maxFiles: 1,  serverOnly: false },
  SIGN_PDF:          { minFiles: 1, maxFiles: 1,  serverOnly: false },
  EDIT_PDF:          { minFiles: 1, maxFiles: 1,  serverOnly: false },

  // ---------- Server-side (security) ----------
  PROTECT_PDF:       { minFiles: 1, maxFiles: 1,  serverOnly: true, timeoutMs: 60_000 },
  UNLOCK_PDF:        { minFiles: 1, maxFiles: 1,  serverOnly: true, timeoutMs: 60_000 },
  REPAIR_PDF:        { minFiles: 1, maxFiles: 1,  serverOnly: true, timeoutMs: 60_000 },

  // ---------- Server-side (CloudConvert/iLovePDF) ----------
  WORD_TO_PDF:        { minFiles: 1, maxFiles: 10, serverOnly: true, timeoutMs: 5 * 60_000 },
  POWERPOINT_TO_PDF:  { minFiles: 1, maxFiles: 10, serverOnly: true, timeoutMs: 5 * 60_000 },
  EXCEL_TO_PDF:       { minFiles: 1, maxFiles: 10, serverOnly: true, timeoutMs: 5 * 60_000 },
  PDF_TO_WORD:        { minFiles: 1, maxFiles: 1,  serverOnly: true, timeoutMs: 5 * 60_000 },
  PDF_TO_POWERPOINT:  { minFiles: 1, maxFiles: 1,  serverOnly: true, timeoutMs: 5 * 60_000 },
  PDF_TO_EXCEL:       { minFiles: 1, maxFiles: 1,  serverOnly: true, timeoutMs: 5 * 60_000 },
};

// ============================================================================
// SERVER-ONLY SET (type-narrowing source of truth)
// ============================================================================

/**
 * Daftar tool server-only sebagai Set, dipakai oleh isServerOnlyTool()
 * sebagai type guard. WAJIB sinkron dengan union `ServerOnlyTool` di types.ts
 * dan dengan `case` di index.server.ts.
 */
const SERVER_ONLY_SET: ReadonlySet<PDFTool> = new Set<PDFTool>([
  'WORD_TO_PDF',
  'POWERPOINT_TO_PDF',
  'EXCEL_TO_PDF',
  'PDF_TO_WORD',
  'PDF_TO_POWERPOINT',
  'PDF_TO_EXCEL',
  'PROTECT_PDF',
  'UNLOCK_PDF',
  'REPAIR_PDF',
]);

/**
 * Type guard: mempersempit PDFTool → ClientTool.
 * Kebalikan dari isServerOnlyTool.
 */
export function isClientTool(tool: PDFTool): tool is ClientTool {
  return !SERVER_ONLY_SET.has(tool);
}

// ============================================================================
// HELPERS
// ============================================================================

const IMAGE_MIME_SET: ReadonlySet<string> = new Set(IMAGE_MIMES);

export function isImageMime(mime: string): mime is ImageMime {
  return IMAGE_MIME_SET.has(mime);
}

export function isPdfMime(mime: string): boolean {
  return mime === PDF_MIME;
}

/**
 * Type guard: mempersempit PDFTool → ServerOnlyTool.
 * Setelah `if (!isServerOnlyTool(tool)) throw ...`, TypeScript tahu
 * `tool` hanya berisi tool server-only, sehingga switch yang exhaustive
 * akan menghasilkan `never` di default.
 */
export function isServerOnlyTool(tool: PDFTool): tool is ServerOnlyTool {
  return SERVER_ONLY_SET.has(tool);
}

export function formatBytes(bytes: number): string {
  if (!bytes) return '0 B';
  if (bytes >= 1024 ** 3) return `${(bytes / 1024 ** 3).toFixed(2)} GB`;
  if (bytes >= 1024 ** 2) return `${(bytes / 1024 ** 2).toFixed(2)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${bytes} B`;
}