// lib/processors/types.ts

// ============================================================================
// TOOL UNION
// ============================================================================

export type PDFTool =
  | 'MERGE_PDF'
  | 'SPLIT_PDF'
  | 'COMPRESS_PDF'
  | 'ROTATE_PDF'
  | 'ORGANIZE_PDF'
  | 'PAGE_NUMBERS'
  | 'JPG_TO_PDF'
  | 'WORD_TO_PDF'
  | 'POWERPOINT_TO_PDF'
  | 'EXCEL_TO_PDF'
  | 'HTML_TO_PDF'
  | 'PDF_TO_JPG'
  | 'PDF_TO_WORD'
  | 'PDF_TO_POWERPOINT'
  | 'PDF_TO_EXCEL'
  | 'WATERMARK_PDF'
  | 'SIGN_PDF'
  | 'EDIT_PDF'
  | 'PROTECT_PDF'
  | 'UNLOCK_PDF'
  | 'REPAIR_PDF';

/**
 * Subset tool yang HANYA boleh jalan di server.
 * Dipakai untuk type-narrowing di runPDFToolServer.
 *
 * PENTING: daftar ini harus sinkron dengan `SERVER_ONLY_SET`
 * di `lib/processors/constants.ts` dan dengan `case` di
 * `lib/processors/index.server.ts`.
 */
export type ServerOnlyTool =
  | 'WORD_TO_PDF'
  | 'POWERPOINT_TO_PDF'
  | 'EXCEL_TO_PDF'
  | 'PDF_TO_WORD'
  | 'PDF_TO_POWERPOINT'
  | 'PDF_TO_EXCEL'
  | 'PROTECT_PDF'
  | 'UNLOCK_PDF'
  | 'REPAIR_PDF';

  /**
 * Subset tool yang boleh jalan di client (browser).
 * Didefinisikan sebagai komplemen dari ServerOnlyTool,
 * sehingga jika Anda menambah tool server-only baru,
 * ClientTool otomatis ikut menyesuaikan.
 */
export type ClientTool = Exclude<PDFTool, ServerOnlyTool>;

// ============================================================================
// PROGRESS
// ============================================================================

/**
 * Callback progress yang dipakai di semua processor (client & server).
 * @param pct  0–100
 * @param message pesan opsional untuk UI
 */
export type ProgressFn = (pct: number, message?: string) => void;

// ============================================================================
// FILE I/O
// ============================================================================

export interface FileInput {
  buffer: ArrayBuffer | Uint8Array;
  name: string;
  type: string;
  size: number;
}

// ============================================================================
// OPTIONS
// ============================================================================

export interface ProcessOptions {
  quality?: number;
  pages?: number[];
  ranges?: string;
  rotation?: 90 | 180 | 270;
  position?:
    | 'bottom-center' | 'bottom-right' | 'bottom-left'
    | 'top-center' | 'top-right' | 'top-left';
  startNumber?: number;
  fontSize?: number;
  format?: string;
  text?: string;
  opacity?: number;
  color?: { r: number; g: number; b: number };
  signatureImage?: ArrayBuffer | Uint8Array;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  operations?: EditOperation[];
  password?: string;
  permissions?: {
    printing?: 'highResolution' | 'lowResolution' | 'none';
    modifying?: boolean;
    copying?: boolean;
    annotating?: boolean;
    fillingForms?: boolean;
    contentAccessibility?: boolean;
    documentAssembly?: boolean;
  };
  imageQuality?: number;
  imageMaxWidth?: number;
  order?: number[];
  deletePages?: number[];
  duplicatePages?: number[];
  dpi?: number;
  html?: string;
  pageSize?: 'A4' | 'LETTER' | 'FIT';
  margin?: number;
  orientation?: 'portrait' | 'landscape';
}

// ============================================================================
// EDIT OPERATIONS
// ============================================================================

export type EditOperation =
  | {
      type: 'text';
      page: number;
      x: number;
      y: number;
      text: string;
      fontSize?: number;
      color?: { r: number; g: number; b: number };
    }
  | {
      type: 'image';
      page: number;
      x: number;
      y: number;
      imageBuffer: ArrayBuffer | Uint8Array;
      width: number;
      height: number;
    }
  | {
      type: 'rect';
      page: number;
      x: number;
      y: number;
      width: number;
      height: number;
      color?: { r: number; g: number; b: number };
      opacity?: number;
    };

// ============================================================================
// RESULT
// ============================================================================

export interface ProcessResult {
  files: FileInput[];
  meta?: Record<string, unknown>;
}

// ============================================================================
// HELPERS
// ============================================================================

export function toUint8(input: ArrayBuffer | Uint8Array): Uint8Array {
  if (input instanceof Uint8Array) return input;
  return new Uint8Array(input);
}

export function isPdfFile(f: FileInput): boolean {
  return f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf');
}

export function isImageFile(f: FileInput): boolean {
  return (
    f.type.startsWith('image/') ||
    /\.(jpe?g|png|webp|gif|bmp|tiff?)$/i.test(f.name)
  );
}