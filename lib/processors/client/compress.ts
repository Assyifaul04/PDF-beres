// lib/processors/client/compress.ts
import { PDFDocument } from 'pdf-lib';
import { FileInput, ProcessOptions, ProcessResult } from '../types';
import { loadPDF, savePDF } from './utils';
import { assert } from '../errors';

/**
 * Kompres PDF dengan:
 * - Re-encode images (jika pdf-lib mendukung)
 * - Object stream optimization
 * - Remove metadata
 *
 * Untuk kompresi lebih agresif, gunakan Ghostscript di server.
 * Versi client ini fokus pada optimasi struktur PDF.
 */
export async function compressPDF(
  files: FileInput[],
  options: ProcessOptions,
  onProgress?: (p: number) => void
): Promise<ProcessResult> {
  assert(files.length === 1, 'Compress hanya 1 file');

  const originalSize = files[0].size;
  const doc = await loadPDF(files[0]);

  // Bersihkan metadata berat
  doc.setTitle('');
  doc.setAuthor('');
  doc.setSubject('');
  doc.setKeywords([]);
  doc.setProducer('PDF Tools');
  doc.setCreator('PDF Tools');

  // Object streams + compression
  const bytes = await doc.save({
    useObjectStreams: true,
    addDefaultPage: false,
    objectsPerTick: 50,
  });

  const compressed = new Uint8Array(bytes);
  onProgress?.(100);

  // Jika hasil lebih besar, kembalikan original
  const buffer = compressed.byteLength < originalSize
    ? compressed
    : new Uint8Array(files[0].buffer as ArrayBuffer);

  const result: FileInput = {
    buffer,
    name: files[0].name.replace(/\.pdf$/i, '-compressed.pdf'),
    type: 'application/pdf',
    size: buffer.byteLength,
  };

  return {
    files: [result],
    meta: {
      originalSize,
      compressedSize: buffer.byteLength,
      ratio: ((1 - buffer.byteLength / originalSize) * 100).toFixed(2) + '%',
    },
  };
}