// lib/processors/index.server.ts
import 'server-only';

import type {
  PDFTool,
  ServerOnlyTool,
  FileInput,
  ProcessOptions,
  ProcessResult,
  ProgressFn,
} from './types';
import { PDFProcessingError } from './errors';
import { isServerOnlyTool } from './constants';

// ============================================================================
// EXHAUSTIVE CHECK HELPER
// ============================================================================

/**
 * Dipakai di `default` switch yang exhaustive.
 * Menerima `never` — jika ada case yang lupa di-handle, TS akan error
 * di sini karena tipe argumen bukan `never`.
 */
function assertNever(value: never, message?: string): never {
  throw new PDFProcessingError(
    message ?? `Unexpected value: ${JSON.stringify(value)}`,
    'UNKNOWN_TOOL'
  );
}

// ============================================================================
// SERVER-SIDE ROUTER
// ============================================================================

export async function runPDFToolServer(
  tool: PDFTool,
  files: FileInput[],
  options: ProcessOptions = {},
  onProgress?: ProgressFn
): Promise<ProcessResult> {
  // Guard + type narrowing: setelah blok ini `tool` bertipe ServerOnlyTool.
  if (!isServerOnlyTool(tool)) {
    throw new PDFProcessingError(
      `Tool ${tool} bukan server-only. Gunakan runPDFTool dari index.ts.`,
      'NOT_SERVER_TOOL'
    );
  }

  const serverTool: ServerOnlyTool = tool;

  try {
    switch (serverTool) {
      // ---------- Office → PDF ----------
      case 'WORD_TO_PDF':
      case 'POWERPOINT_TO_PDF':
      case 'EXCEL_TO_PDF': {
        const { officeToPDF } = await import('./server/office-to-pdf');
        return await officeToPDF(files, options, onProgress);
      }

      // ---------- PDF → Office ----------
      case 'PDF_TO_WORD': {
        const { pdfToWord } = await import('./server/pdf-to-office');
        return await pdfToWord(files, options, onProgress);
      }

      case 'PDF_TO_POWERPOINT': {
        const { pdfToPowerPoint } = await import('./server/pdf-to-office');
        return await pdfToPowerPoint(files, options, onProgress);
      }

      case 'PDF_TO_EXCEL': {
        const { pdfToExcel } = await import('./server/pdf-to-office');
        return await pdfToExcel(files, options, onProgress);
      }

      // ---------- Security ----------
      case 'PROTECT_PDF': {
        const { protectPDF } = await import('./server/pdf-security');
        return await protectPDF(files, options, onProgress);
      }

      case 'UNLOCK_PDF': {
        const { unlockPDF } = await import('./server/pdf-security');
        return await unlockPDF(files, options, onProgress);
      }

      case 'REPAIR_PDF': {
        const { repairPDF } = await import('./server/pdf-security');
        return await repairPDF(files, options, onProgress);
      }

      default:
        return assertNever(
          serverTool,
          `Tool tidak didukung di server: ${String(serverTool)}`
        );
    }
  } catch (e: unknown) {
    if (e instanceof PDFProcessingError) throw e;
    const message = e instanceof Error ? e.message : 'Terjadi kesalahan';
    const stack = e instanceof Error ? e.stack : undefined;
    throw new PDFProcessingError(message, 'UNEXPECTED_ERROR', { stack });
  }
}