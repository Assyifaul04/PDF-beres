// lib/processors/client/image-to-pdf.ts
import { PDFDocument, rgb } from 'pdf-lib';
import { FileInput, ProcessOptions, ProcessResult } from '../types';
import { loadPDF, savePDF, toUint8 } from './utils';
import { assert } from '../errors';

const PAGE_SIZES: Record<string, [number, number]> = {
  A4: [595.28, 841.89],
  LETTER: [612, 792],
};

// ============ JPG_TO_PDF ============
export async function jpgToPDF(
  files: FileInput[],
  options: ProcessOptions,
  onProgress?: (p: number) => void
): Promise<ProcessResult> {
  assert(files.length >= 1, 'Butuh minimal 1 gambar');

  const pdf = await PDFDocument.create();
  const orientation = options.orientation ?? 'portrait';
  const margin = options.margin ?? 0;
  const pageSizeKey = options.pageSize ?? 'FIT';

  for (let i = 0; i < files.length; i++) {
    const f = files[i];
    const bytes = toUint8(f.buffer);
    let img;
    try {
      if (f.type === 'image/png') img = await pdf.embedPng(bytes);
      else img = await pdf.embedJpg(bytes);
    } catch {
      // Fallback: decode via canvas
      const blob = new Blob([bytes as BlobPart], { type: f.type });
      const bitmap = await createImageBitmap(blob);
      const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(bitmap, 0, 0);
      const jpgBlob = await canvas.convertToBlob({ type: 'image/jpeg', quality: 0.92 });
      const jpgBytes = new Uint8Array(await jpgBlob.arrayBuffer());
      img = await pdf.embedJpg(jpgBytes);
    }

    const imgW = img.width;
    const imgH = img.height;

    let pageW: number, pageH: number;

    if (pageSizeKey === 'FIT') {
      pageW = imgW + margin * 2;
      pageH = imgH + margin * 2;
    } else {
      let [w, h] = PAGE_SIZES[pageSizeKey];
      const isLandscape = orientation === 'landscape' || (imgW > imgH);
      if (isLandscape) [w, h] = [h, w];
      pageW = w; pageH = h;
    }

    const page = pdf.addPage([pageW, pageH]);

    // Fit gambar ke area (contain)
    const availW = pageW - margin * 2;
    const availH = pageH - margin * 2;
    const scale = Math.min(availW / imgW, availH / imgH);
    const drawW = imgW * scale;
    const drawH = imgH * scale;
    const x = (pageW - drawW) / 2;
    const y = (pageH - drawH) / 2;

    page.drawImage(img, { x, y, width: drawW, height: drawH });

    onProgress?.(((i + 1) / files.length) * 100);
  }

  const out = await savePDF(pdf, 'images.pdf');
  return { files: [out] };
}

// ============ PDF_TO_JPG (via pdf.js) ============
export async function pdfToJPG(
  files: FileInput[],
  options: ProcessOptions,
  onProgress?: (p: number) => void
): Promise<ProcessResult> {
  assert(files.length === 1, 'PDF to JPG hanya 1 file');

  // pdf.js di-load dinamis agar tidak bloat bundle utama
  const pdfjs: any = await import('pdfjs-dist/legacy/build/pdf.mjs');

  // Worker setup
  if (typeof window !== 'undefined' && !pdfjs.GlobalWorkerOptions.workerSrc) {
    pdfjs.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/legacy/build/pdf.worker.min.mjs`;
  }

  const bytes = new Uint8Array(files[0].buffer as ArrayBuffer);
  const loadingTask = pdfjs.getDocument({ data: bytes, useSystemFonts: true });
  const pdf = await loadingTask.promise;

  const scale = (options.dpi ?? 150) / 72;
  const quality = options.imageQuality ?? 0.92;
  const outputs: FileInput[] = [];
  const pagesToExport = options.pages?.length
    ? options.pages
    : Array.from({ length: pdf.numPages }, (_, i) => i + 1);

  for (let i = 0; i < pagesToExport.length; i++) {
    const pageNum = pagesToExport[i];
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement('canvas');
    canvas.width = Math.ceil(viewport.width);
    canvas.height = Math.ceil(viewport.height);
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    await page.render({ canvasContext: ctx, viewport, canvas } as any).promise;

    const blob: Blob = await new Promise(res =>
      canvas.toBlob(b => res(b!), 'image/jpeg', quality)
    );
    const buf = new Uint8Array(await blob.arrayBuffer());

    outputs.push({
      buffer: buf,
      name: `page-${pageNum}.jpg`,
      type: 'image/jpeg',
      size: buf.byteLength,
    });

    onProgress?.(((i + 1) / pagesToExport.length) * 100);
  }

  return { files: outputs, meta: { count: outputs.length } };
}