// lib/processors/server/utils.ts
import 'server-only';

import { FileInput } from '../types';
import { PDFProcessingError } from '../errors';

/**
 * Normalisasi `ArrayBuffer | Uint8Array` → `Uint8Array`.
 * Pakai `Buffer.isBuffer` + `instanceof Uint8Array` guard.
 */
export function toUint8(
  input: ArrayBuffer | Uint8Array
): Uint8Array {
  if (input instanceof Uint8Array) return input;
  if (input instanceof ArrayBuffer) return new Uint8Array(input);
  throw new TypeError('Tipe buffer tidak didukung');
}

/**
 * Normalisasi `ArrayBuffer | Uint8Array` → Node.js `Buffer`.
 */
export function toBuffer(
  input: ArrayBuffer | Uint8Array
): Buffer {
  if (Buffer.isBuffer(input)) return input;
  if (input instanceof ArrayBuffer) return Buffer.from(input);
  if (input instanceof Uint8Array) {
    return Buffer.from(input.buffer, input.byteOffset, input.byteLength);
  }
  throw new TypeError('Tipe buffer tidak didukung');
}

/**
 * Assert hanya 1 file yang diizinkan.
 */
export function assertSingleFile(files: FileInput[]): FileInput {
  if (files.length !== 1) {
    throw new PDFProcessingError(
      `Operasi ini hanya menerima 1 file (diterima: ${files.length})`,
      'SINGLE_FILE_ONLY'
    );
  }
  return files[0];
}

/**
 * Konversi output adapter → FileInput.
 */
export function toFileInput(out: {
  buffer: Uint8Array;
  filename: string;
  mimeType: string;
}): FileInput {
  return {
    buffer: out.buffer,
    name: out.filename,
    type: out.mimeType,
    size: out.buffer.byteLength,
  };
}

/**
 * MIME map untuk output format.
 */
export function mimeOf(format: string): string {
  const map: Record<string, string> = {
    pdf: 'application/pdf',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ppt: 'application/vnd.ms-powerpoint',
    pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    xls: 'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
  };
  return map[format] ?? 'application/octet-stream';
}

/**
 * Ambil ekstensi file (lowercase, tanpa titik).
 */
export function extOf(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();
  if (!ext || ext === filename) {
    throw new PDFProcessingError(
      `Nama file tanpa ekstensi: ${filename}`,
      'BAD_FILENAME'
    );
  }
  return ext;
}