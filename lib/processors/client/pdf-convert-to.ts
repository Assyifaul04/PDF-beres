// lib/processors/client/pdf-convert-to.ts
import { FileInput, ProcessOptions, ProcessResult, ProgressFn } from '../types';

/**
 * Konversi HTML string menjadi PDF di sisi klien.
 * Catatan: `assert` di lib/processors/errors harus dideklarasikan
 * sebagai assertion function (asserts condition) agar narrowing bekerja.
 */
export async function htmlToPDF(
  files: FileInput[],
  options: ProcessOptions,
  onProgress?: ProgressFn
): Promise<ProcessResult> {
  const html = options.html;

  // Guard eksplisit — aman meskipun `assert` bukan assertion function.
  if (!html || typeof html !== 'string') {
    throw new Error('HTML content wajib diisi');
  }

  onProgress?.(10, 'Menyiapkan HTML...');
  const { default: html2pdf } = await import('html2pdf.js' as any);

  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-99999px';
  container.style.top = '0';
  container.style.width = '210mm';
  container.innerHTML = html;
  document.body.appendChild(container);

  try {
    onProgress?.(30, 'Merender HTML...');

    const pageSize =
      options.pageSize === 'LETTER' ? 'letter' : 'a4';
    const orientation = options.orientation ?? 'portrait';

    const worker = html2pdf()
      .set({
        margin: options.margin ?? 10,
        filename: 'output.pdf',
        image: { type: 'jpeg', quality: options.imageQuality ?? 0.95 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: {
          unit: 'mm',
          format: pageSize,
          orientation,
        },
        pagebreak: { mode: ['css', 'legacy'] },
      })
      .from(container);

    onProgress?.(60, 'Mengkonversi ke PDF...');
    const blob: Blob = await worker.outputPdf('blob');
    const buf = new Uint8Array(await blob.arrayBuffer());

    onProgress?.(100, 'Selesai');

    return {
      files: [
        {
          buffer: buf,
          name: 'converted.pdf',
          type: 'application/pdf',
          size: buf.byteLength,
        },
      ],
    };
  } finally {
    container.remove();
  }
}