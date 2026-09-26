// lib/processors/constants.ts
import type { PDFTool, ServerOnlyTool, ClientTool, ProcessOptions } from './types';
import type { ToolSettings } from '@/lib/tools/settings';

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
// SERVER-ONLY SET
// ============================================================================

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

export function isClientTool(tool: PDFTool): tool is ClientTool {
  return !SERVER_ONLY_SET.has(tool);
}

const IMAGE_MIME_SET: ReadonlySet<string> = new Set(IMAGE_MIMES);

export function isImageMime(mime: string): mime is ImageMime {
  return IMAGE_MIME_SET.has(mime);
}

export function isPdfMime(mime: string): boolean {
  return mime === PDF_MIME;
}

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

// ============================================================================
// TOOLSETTINGS → PROCESSOPTIONS BRIDGE  ⭐ (BARU)
// ============================================================================

/**
 * Konversi ToolSettings (dari UI) → ProcessOptions (dari processor).
 *
 * PENTING: Nama properti antara ToolSettings dan ProcessOptions BERBEDA.
 * Fungsi ini menjembatani keduanya agar setting user sampai ke processor.
 */
export function toolSettingsToProcessOptions(
  tool: PDFTool,
  settings: ToolSettings
): ProcessOptions {
  switch (tool) {
    case 'COMPRESS_PDF':
      return {
        compressionLevel: settings.compressionLevel ?? 'recommended',
      };

    case 'SPLIT_PDF':
      return {
        ranges: settings.pageRanges ?? '1-5',
      };

    case 'ROTATE_PDF':
      return {
        rotation: settings.rotationAngle ?? 90,
      };

    case 'WATERMARK_PDF':
      return {
        text: settings.watermarkText ?? 'CONFIDENTIAL',
        position: settings.watermarkPosition ?? 'center',
        opacity: settings.watermarkOpacity ?? 0.5,
        fontSize: settings.watermarkFontSize ?? 32,
      };

    case 'PAGE_NUMBERS':
      return {
        position: settings.pageNumberPosition ?? 'bottom-center',
        format: settings.pageNumberFormat ?? 'page_n',
        startNumber: settings.startPageNumber ?? 1,
      };

    case 'JPG_TO_PDF':
      return {
        pageSize: (settings.pageSize?.toUpperCase() as 'A4' | 'LETTER' | 'FIT') ?? 'A4',
        orientation:
          settings.orientation === 'auto'
            ? 'portrait'
            : (settings.orientation ?? 'portrait'),
        margin:
          settings.marginSize === 'none' ? 0
          : settings.marginSize === 'big' ? 40
          : 20,
      };

    case 'PDF_TO_JPG':
      return {
        dpi:
          settings.jpgQuality === 'high' ? 300
          : settings.jpgQuality === 'medium' ? 150
          : 72,
      };

    case 'SIGN_PDF':
      return {
        text: settings.signName ?? '',
        position: settings.signPosition ?? 'bottom-right',
      };

    case 'PROTECT_PDF':
    case 'UNLOCK_PDF':
      return {
        password: settings.password ?? '',
      };

    case 'HTML_TO_PDF':
      return {
        html: '',
        pageSize: (settings.htmlPageSize?.toUpperCase() as 'A4' | 'LETTER') ?? 'A4',
      };

    case 'PDF_TO_WORD':
    case 'PDF_TO_EXCEL':
    case 'PDF_TO_POWERPOINT':
      return {
        format: settings.outputFormat,
      };

    default:
      return {};
  }
}