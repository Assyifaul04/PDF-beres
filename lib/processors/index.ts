// lib/processors/index.ts
/**
 * ⚠️ FILE INI HANYA UNTUK CLIENT-SIDE PROCESSING.
 */
import type {
  PDFTool,
  ClientTool,
  FileInput,
  ProcessOptions,
  ProcessResult,
  ProgressFn,
} from './types';
import type { ToolSettings } from '@/lib/tools/settings';
import { PDFProcessingError } from './errors';
import {
  TOOL_REQUIREMENTS,
  MAX_FILES,
  isClientTool,
  toolSettingsToProcessOptions,  // ⭐ import bridge
} from './constants';

// Client processors
import {
  mergePDFs,
  splitPDF,
  rotatePDF,
  addPageNumbers,
  organizePDF,
} from './client/pdf-basic';
import { compressPDF } from './client/compress';
import { jpgToPDF, pdfToJPG } from './client/image-to-pdf';
import { htmlToPDF } from './client/pdf-convert-to';
import { watermarkPDF, signPDF, editPDF } from './client/pdf-enhance';

// ============================================================================
// TYPES
// ============================================================================

export type { ProgressFn };
export type { PDFTool, ClientTool, FileInput, ProcessOptions, ProcessResult };

export interface RunOptions extends ProcessOptions {
  onProgress?: ProgressFn;
}

/**
 * Opsi untuk entry point yang menerima ToolSettings langsung dari UI.
 */
export interface RunWithSettingsOptions {
  settings: ToolSettings;
  onProgress?: ProgressFn;
}

// ============================================================================
// MAIN ROUTER (internal) — menerima ProcessOptions mentah
// ============================================================================

export async function runPDFTool(
  tool: PDFTool,
  files: FileInput[],
  options: RunOptions = {}
): Promise<ProcessResult> {
  const { onProgress, ...opts } = options;

  if (!isClientTool(tool)) {
    throw new PDFProcessingError(
      `Tool ${tool} hanya dapat dijalankan di server. ` +
        `Gunakan endpoint /api/tasks/[id]/process-server.`,
      'SERVER_ONLY_TOOL'
    );
  }

  const clientTool: ClientTool = tool;
  validateClientInput(clientTool, files, options);

  try {
    switch (clientTool) {
      case 'MERGE_PDF':
        return await mergePDFs(files, onProgress);
      case 'SPLIT_PDF':
        return await splitPDF(files, opts, onProgress);
      case 'COMPRESS_PDF':
        return await compressPDF(files, opts, onProgress);
      case 'ROTATE_PDF':
        return await rotatePDF(files, opts, onProgress);
      case 'PAGE_NUMBERS':
        return await addPageNumbers(files, opts, onProgress);
      case 'ORGANIZE_PDF':
        return await organizePDF(files, opts, onProgress);
      case 'JPG_TO_PDF':
        return await jpgToPDF(files, opts, onProgress);
      case 'PDF_TO_JPG':
        return await pdfToJPG(files, opts, onProgress);
      case 'HTML_TO_PDF':
        return await htmlToPDF(files, opts, onProgress);
      case 'WATERMARK_PDF':
        return await watermarkPDF(files, opts, onProgress);
      case 'SIGN_PDF':
        return await signPDF(files, opts, onProgress);
      case 'EDIT_PDF':
        return await editPDF(files, opts, onProgress);
      default:
        return assertNever(
          clientTool,
          `Tool client tidak dikenal: ${String(clientTool)}`
        );
    }
  } catch (e: unknown) {
    if (e instanceof PDFProcessingError) throw e;
    const message = e instanceof Error ? e.message : 'Terjadi kesalahan';
    const stack = e instanceof Error ? e.stack : undefined;
    throw new PDFProcessingError(message, 'UNEXPECTED_ERROR', { stack });
  }
}

// ============================================================================
// ⭐ ENTRY POINT UTAMA — dari UI (menerima ToolSettings)
// ============================================================================

/**
 * Entry point yang dipakai oleh komponen React.
 * Otomatis mengonversi ToolSettings → ProcessOptions.
 */
export async function runPDFToolWithSettings(
  tool: PDFTool,
  files: FileInput[],
  options: RunWithSettingsOptions
): Promise<ProcessResult> {
  const { settings, onProgress } = options;
  const processOptions = toolSettingsToProcessOptions(tool, settings);

  return runPDFTool(tool, files, {
    ...processOptions,
    onProgress,
  });
}

// ============================================================================
// EXHAUSTIVE CHECK
// ============================================================================

function assertNever(value: never, message?: string): never {
  throw new PDFProcessingError(
    message ?? `Unexpected value: ${JSON.stringify(value)}`,
    'UNKNOWN_TOOL'
  );
}

// ============================================================================
// VALIDATION
// ============================================================================

function validateClientInput(
  tool: PDFTool,
  files: FileInput[],
  options: RunOptions
): void {
  const req = TOOL_REQUIREMENTS[tool];
  if (!req) {
    throw new PDFProcessingError(`Tool tidak dikenal: ${tool}`, 'UNKNOWN_TOOL');
  }

  if (tool === 'HTML_TO_PDF') {
    if (!options.html || options.html.trim() === '') {
      throw new PDFProcessingError(
        'Konten HTML tidak boleh kosong',
        'MISSING_HTML_CONTENT'
      );
    }
    return;
  }

  if (files.length < req.minFiles) {
    throw new PDFProcessingError(
      `Tool ${tool} membutuhkan minimal ${req.minFiles} file (diterima: ${files.length})`,
      'MIN_FILES_NOT_MET'
    );
  }
  if (files.length > req.maxFiles) {
    throw new PDFProcessingError(
      `Tool ${tool} maksimal ${req.maxFiles} file (diterima: ${files.length})`,
      'MAX_FILES_EXCEEDED'
    );
  }
  if (files.length > MAX_FILES) {
    throw new PDFProcessingError(
      `Total file maksimal ${MAX_FILES}`,
      'GLOBAL_MAX_FILES'
    );
  }

  for (const f of files) {
    if (!f.buffer || f.size === 0) {
      throw new PDFProcessingError(
        `File "${f.name}" kosong atau tidak valid`,
        'EMPTY_FILE'
      );
    }
  }
}

// ============================================================================
// RE-EXPORTS
// ============================================================================

export * from './types';
export * from './constants';
export { PDFProcessingError } from './errors';
export { downloadBlob, toBlob } from './client/utils';