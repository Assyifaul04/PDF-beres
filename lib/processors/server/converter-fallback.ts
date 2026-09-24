import 'server-only';

import { convertWithCloudConvert } from './cloudconvert';
import { convertWithILovePDF, type ILovePDFTaskType } from './ilovepdf';
import { PDFProcessingError } from '../errors';

// ============================================================================
// TYPES
// ============================================================================

export interface SmartConvertInput {
  input: {
    buffer: Uint8Array | Buffer;
    filename: string;
    mimeType?: string;
  };
  outputFormat: string;
  outputFilename?: string;
  options?: Record<string, unknown>;
  onProgress?: (pct: number, message?: string) => void;
}

export interface ConvertJobOutput {
  buffer: Uint8Array;
  filename: string;
  mimeType: string;
}

// ============================================================================
// HELPERS
// ============================================================================

function getILovePDFTaskType(
  filename: string,
  outputFormat: string
): ILovePDFTaskType {
  const ext = filename.split('.').pop()?.toLowerCase() ?? '';

  // PDF → Office
  if (ext === 'pdf') {
    if (outputFormat === 'docx' || outputFormat === 'doc') return 'pdfword';
    if (outputFormat === 'pptx' || outputFormat === 'ppt') return 'pdfpowerpoint';
    if (outputFormat === 'xlsx' || outputFormat === 'xls') return 'pdfexcel';
  }

  // Office → PDF (default)
  return 'officepdf';
}

function getAvailableProviders(): Array<'cloudconvert' | 'ilovepdf'> {
  const providers: Array<'cloudconvert' | 'ilovepdf'> = [];

  if (process.env.CLOUDCONVERT_API_KEY) {
    providers.push('cloudconvert');
  }
  if (process.env.ILOVEPDF_PUBLIC_KEY) {
    providers.push('ilovepdf');
  }

  return providers;
}

// ============================================================================
// MAIN: Fallback Chain
// ============================================================================

export async function convertWithFallback(
  input: SmartConvertInput
): Promise<ConvertJobOutput> {
  const providers = getAvailableProviders();

  if (!providers.length) {
    throw new PDFProcessingError(
      'Tidak ada provider konversi tersedia. ' +
        'Set CLOUDCONVERT_API_KEY atau ILOVEPDF_PUBLIC_KEY di .env',
      'NO_PROVIDER'
    );
  }

  const errors: Array<{ provider: string; message: string }> = [];

  for (const provider of providers) {
    try {
      // ============================================================
      // CloudConvert
      // ============================================================
      if (provider === 'cloudconvert') {
        input.onProgress?.(5, 'Menggunakan CloudConvert...');
        return await convertWithCloudConvert({
          input: input.input,
          outputFormat: input.outputFormat,
          outputFilename: input.outputFilename,
          options: input.options,
          onProgress: input.onProgress,
        });
      }

      // ============================================================
      // iLovePDF
      // ============================================================
      if (provider === 'ilovepdf') {
        const taskType = getILovePDFTaskType(
          input.input.filename,
          input.outputFormat
        );

        input.onProgress?.(5, 'Menggunakan iLovePDF...');

        return await convertWithILovePDF({
          input: {
            buffer: input.input.buffer,
            filename: input.input.filename,
          },
          taskType,
          outputFormat: input.outputFormat,
          onProgress: input.onProgress,
        });
      }
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      errors.push({ provider, message });

      console.warn(`⚠️ ${provider} gagal: ${message}`);
    }
  }

  // ============================================================
  // Semua provider gagal
  // ============================================================
  const detail = errors.map((e) => `• ${e.provider}: ${e.message}`).join('\n');
  console.error('❌ Semua provider gagal:\n' + detail);

  throw new PDFProcessingError(
    'Gagal memproses dokumen. Semua provider konversi gagal:\n' + detail,
    'ALL_PROVIDERS_FAILED',
    { errors }
  );
}