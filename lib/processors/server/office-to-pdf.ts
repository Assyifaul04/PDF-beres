// lib/processors/server/office-to-pdf.ts
import 'server-only';

import type {
  FileInput,
  ProcessOptions,
  ProcessResult,
  ProgressFn,
} from '../types';
import { PDFProcessingError } from '../errors';
import { convertWithFallback } from './converter-fallback';
import { toUint8, toFileInput, extOf } from './utils';

// ============================================================================
// CONFIG
// ============================================================================

type OfficeExt =
  | 'doc' | 'docx' | 'odt' | 'rtf' | 'txt'
  | 'ppt' | 'pptx' | 'odp'
  | 'xls' | 'xlsx' | 'ods';

const ALLOWED_OFFICE_EXTS: ReadonlySet<string> = new Set<OfficeExt>([
  'doc', 'docx', 'odt', 'rtf', 'txt',
  'ppt', 'pptx', 'odp',
  'xls', 'xlsx', 'ods',
]);

// ============================================================================
// MAIN
// ============================================================================

export async function officeToPDF(
  files: FileInput[],
  _options: ProcessOptions,
  onProgress?: ProgressFn
): Promise<ProcessResult> {
  if (!files.length) {
    throw new PDFProcessingError('Tidak ada file', 'NO_INPUT');
  }

  const outputs: FileInput[] = [];
  const total = files.length;

  for (let i = 0; i < total; i++) {
    const f = files[i];
    const baseMsg = `Konversi ${i + 1}/${total}`;

    // -------- Validasi ekstensi --------
    let ext: string;
    try {
      ext = extOf(f.name);
    } catch {
      throw new PDFProcessingError(
        `Nama file tidak valid: ${f.name}`,
        'BAD_FILENAME'
      );
    }

    if (!ALLOWED_OFFICE_EXTS.has(ext)) {
      throw new PDFProcessingError(
        `Ekstensi .${ext} tidak didukung untuk konversi ke PDF. ` +
          `Didukung: ${Array.from(ALLOWED_OFFICE_EXTS).join(', ')}`,
        'UNSUPPORTED_EXT'
      );
    }

    if (!f.buffer || f.size === 0) {
      throw new PDFProcessingError(
        `File "${f.name}" kosong atau tidak valid`,
        'EMPTY_FILE'
      );
    }

    // -------- Konversi --------
    try {
      const result = await convertWithFallback({
        input: {
          buffer: toUint8(f.buffer),
          filename: f.name,
          mimeType: f.type,
        },
        outputFormat: 'pdf',
        outputFilename: f.name.replace(/\.[^.]+$/, '.pdf'),
        options: buildOfficeToPDFOptions(ext as OfficeExt),
        onProgress: (pct, msg) => {
          const overall = Math.round(((i + pct / 100) / total) * 100);
          onProgress?.(overall, msg ? `${baseMsg}: ${msg}` : baseMsg);
        },
      });

      outputs.push(toFileInput(result));
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Unknown error';
      throw new PDFProcessingError(
        `Gagal konversi "${f.name}": ${message}`,
        'OFFICE_CONVERT_FAILED',
        { filename: f.name, index: i }
      );
    }
  }

  return { files: outputs, meta: { count: outputs.length } };
}

// ============================================================================
// OPTIONS BUILDER
// ============================================================================

function buildOfficeToPDFOptions(
  ext: OfficeExt
): Record<string, unknown> {
  switch (ext) {
    case 'doc':
    case 'docx':
    case 'odt':
    case 'rtf':
    case 'txt':
      return { pdf_a: false, embed_fonts: true };

    case 'ppt':
    case 'pptx':
    case 'odp':
      return { export_notes: false };

    case 'xls':
    case 'xlsx':
    case 'ods':
      return { fit_to_page: true };

    default:
      return {};
  }
}