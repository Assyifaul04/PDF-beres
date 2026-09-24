// lib/processors/client/utils.ts
import { PDFDocument } from 'pdf-lib';
import type { FileInput } from '../types';
import { toUint8 } from '../types';

export { toUint8 };

export async function loadPDF(file: FileInput): Promise<PDFDocument> {
  const bytes = toUint8(file.buffer);
  return PDFDocument.load(bytes, { ignoreEncryption: true });
}

export async function savePDF(
  doc: PDFDocument,
  filename = 'output.pdf'
): Promise<FileInput> {
  const bytes = await doc.save({ useObjectStreams: true });
  const safe = new Uint8Array(bytes);
  return {
    buffer: safe,
    name: filename,
    type: 'application/pdf',
    size: safe.byteLength,
  };
}

export function parseRanges(ranges: string, totalPages: number): number[] {
  const result = new Set<number>();
  const parts = ranges.split(',').map((s) => s.trim()).filter(Boolean);

  for (const p of parts) {
    if (p.includes('-')) {
      const [a, b] = p.split('-').map((s) => parseInt(s.trim(), 10));
      if (isNaN(a) || isNaN(b)) continue;
      const from = Math.max(1, Math.min(a, b));
      const to = Math.min(totalPages, Math.max(a, b));
      for (let i = from; i <= to; i++) result.add(i);
    } else {
      const n = parseInt(p, 10);
      if (!isNaN(n) && n >= 1 && n <= totalPages) result.add(n);
    }
  }
  return Array.from(result).sort((a, b) => a - b);
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function toBlob(file: FileInput): Blob {
  return new Blob([file.buffer as BlobPart], { type: file.type });
}