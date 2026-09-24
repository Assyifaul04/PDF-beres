// lib/processors/server/pdf-to-office.ts
import 'server-only';

import type {
  FileInput,
  ProcessOptions,
  ProcessResult,
  ProgressFn,
} from '../types';
import { PDFProcessingError } from '../errors';
import { convertWithFallback } from './converter-fallback';
import { toUint8, toFileInput, assertSingleFile } from './utils';

// ============================================================================
// PDF → WORD (.docx)
// ============================================================================

export async function pdfToWord(
  files: FileInput[],
  _options: ProcessOptions,
  onProgress?: ProgressFn
): Promise<ProcessResult> {
  const f = assertSingleFile(files);

  if (!f.buffer || f.size === 0) {
    throw new PDFProcessingError(
      `File "${f.name}" kosong atau tidak valid`,
      'EMPTY_FILE'
    );
  }

  try {
    const result = await convertWithFallback({
      input: {
        buffer: toUint8(f.buffer),
        filename: f.name,
        mimeType: f.type || 'application/pdf',
      },
      outputFormat: 'docx',
      outputFilename: f.name.replace(/\.pdf$/i, '.docx'),
      options: { enable_table_detection: true },
      onProgress,
    });

    return { files: [toFileInput(result)] };
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    throw new PDFProcessingError(
      `PDF → Word gagal: ${message}`,
      'PDF_TO_WORD_FAILED',
      { filename: f.name }
    );
  }
}

// ============================================================================
// PDF → POWERPOINT (.pptx)
// ============================================================================

export async function pdfToPowerPoint(
  files: FileInput[],
  _options: ProcessOptions,
  onProgress?: ProgressFn
): Promise<ProcessResult> {
  const f = assertSingleFile(files);

  if (!f.buffer || f.size === 0) {
    throw new PDFProcessingError(
      `File "${f.name}" kosong atau tidak valid`,
      'EMPTY_FILE'
    );
  }

  try {
    const result = await convertWithFallback({
      input: {
        buffer: toUint8(f.buffer),
        filename: f.name,
        mimeType: f.type || 'application/pdf',
      },
      outputFormat: 'pptx',
      outputFilename: f.name.replace(/\.pdf$/i, '.pptx'),
      options: {},
      onProgress,
    });

    return { files: [toFileInput(result)] };
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    throw new PDFProcessingError(
      `PDF → PowerPoint gagal: ${message}`,
      'PDF_TO_PPT_FAILED',
      { filename: f.name }
    );
  }
}

// ============================================================================
// PDF → EXCEL (.xlsx)
// ============================================================================

export async function pdfToExcel(
  files: FileInput[],
  _options: ProcessOptions,
  onProgress?: ProgressFn
): Promise<ProcessResult> {
  const f = assertSingleFile(files);

  if (!f.buffer || f.size === 0) {
    throw new PDFProcessingError(
      `File "${f.name}" kosong atau tidak valid`,
      'EMPTY_FILE'
    );
  }

  try {
    const result = await convertWithFallback({
      input: {
        buffer: toUint8(f.buffer),
        filename: f.name,
        mimeType: f.type || 'application/pdf',
      },
      outputFormat: 'xlsx',
      outputFilename: f.name.replace(/\.pdf$/i, '.xlsx'),
      options: {},
      onProgress,
    });

    return { files: [toFileInput(result)] };
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    throw new PDFProcessingError(
      `PDF → Excel gagal: ${message}`,
      'PDF_TO_EXCEL_FAILED',
      { filename: f.name }
    );
  }
}