// lib/processors/client/pdf-enhance.ts
import { PDFDocument, StandardFonts, rgb, degrees } from 'pdf-lib';
import type {
  FileInput,
  ProcessOptions,
  ProcessResult,
  ProgressFn,
  EditOperation,
} from '../types';
import { loadPDF, savePDF, toUint8 } from './utils';
import { assert } from '../errors';

// ============================================================================
// WATERMARK_PDF
// ============================================================================

/**
 * Tipe posisi watermark (subset dari ProcessOptions['position']).
 * Hanya posisi yang valid untuk watermark yang dipakai.
 */
type WatermarkPosition =
  | 'top-left' | 'top-center' | 'top-right'
  | 'center'
  | 'bottom-left' | 'bottom-center' | 'bottom-right';

export async function watermarkPDF(
  files: FileInput[],
  options: ProcessOptions,
  onProgress?: ProgressFn
): Promise<ProcessResult> {
  assert(files.length === 1, 'Watermark hanya 1 file');
  onProgress?.(5, 'Membuka PDF...');

  const doc = await loadPDF(files[0]);
  const font = await doc.embedFont(StandardFonts.HelveticaBold);

  const text = options.text ?? 'CONFIDENTIAL';
  const opacity = options.opacity ?? 0.3;
  const color = options.color ?? { r: 1, g: 0, b: 0 };
  const position = (options.position ?? 'center') as WatermarkPosition;

  const pages = doc.getPages();

  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    const { width, height } = page.getSize();

    // Font size proporsional terhadap halaman
    const fontSize = Math.min(width, height) * 0.12;
    const textWidth = font.widthOfTextAtSize(text, fontSize);
    const textHeight = fontSize;

    // Margin untuk posisi di tepi halaman
    const margin = Math.min(width, height) * 0.08;

    // =========================================================
    // Hitung (x, y) berdasarkan posisi
    // =========================================================
    let x = 0;
    let y = 0;

    switch (position) {
      case 'top-left':
        x = margin;
        y = height - margin - textHeight;
        break;

      case 'top-center':
        x = width / 2 - textWidth / 2;
        y = height - margin - textHeight;
        break;

      case 'top-right':
        x = width - margin - textWidth;
        y = height - margin - textHeight;
        break;

      case 'center':
      default:
        x = width / 2 - textWidth / 2;
        y = height / 2 - textHeight / 2;
        break;

      case 'bottom-left':
        x = margin;
        y = margin;
        break;

      case 'bottom-center':
        x = width / 2 - textWidth / 2;
        y = margin;
        break;

      case 'bottom-right':
        x = width - margin - textWidth;
        y = margin;
        break;
    }

    // =========================================================
    // Rotasi hanya untuk posisi 'center' (watermark diagonal)
    // Posisi lain digambar horizontal agar tidak keluar halaman
    // =========================================================
    const rotate = position === 'center' ? degrees(-45) : degrees(0);

    page.drawText(text, {
      x,
      y,
      size: fontSize,
      font,
      color: rgb(color.r, color.g, color.b),
      opacity,
      rotate,
    });

    onProgress?.(10 + ((i + 1) / pages.length) * 80);
  }

  onProgress?.(95, 'Menyimpan hasil...');
  const out = await savePDF(doc, 'watermarked.pdf');
  onProgress?.(100, 'Selesai');
  return { files: [out] };
}

// ============================================================================
// SIGN_PDF (TIDAK BERUBAH)
// ============================================================================
export async function signPDF(
  files: FileInput[],
  options: ProcessOptions,
  onProgress?: ProgressFn
): Promise<ProcessResult> {
  assert(files.length === 1, 'Sign hanya 1 file');

  const sigInput = options.signatureImage;
  assert(sigInput, 'Signature image wajib', 'NO_SIGNATURE');

  onProgress?.(5, 'Membuka PDF...');
  const doc = await loadPDF(files[0]);
  const pages = doc.getPages();

  const sigBytes = toUint8(sigInput);

  onProgress?.(20, 'Menyiapkan tanda tangan...');
  let sigImage;
  try {
    sigImage = await doc.embedPng(sigBytes);
  } catch {
    sigImage = await doc.embedJpg(sigBytes);
  }

  const targetPages = options.pages?.length
    ? options.pages.map((p) => p - 1)
    : [pages.length - 1];

  for (let i = 0; i < targetPages.length; i++) {
    const page = pages[targetPages[i]];
    if (!page) continue;
    const { width } = page.getSize();
    const w = options.width ?? 150;
    const h = options.height ?? (w * sigImage.height) / sigImage.width;
    const x = options.x ?? width - w - 40;
    const y = options.y ?? 40;

    page.drawImage(sigImage, { x, y, width: w, height: h });
    onProgress?.(30 + (i / targetPages.length) * 60);
  }

  onProgress?.(95, 'Menyimpan hasil...');
  const out = await savePDF(doc, 'signed.pdf');
  onProgress?.(100, 'Selesai');
  return { files: [out] };
}

// ============================================================================
// EDIT_PDF (TIDAK BERUBAH)
// ============================================================================
export async function editPDF(
  files: FileInput[],
  options: ProcessOptions,
  onProgress?: ProgressFn
): Promise<ProcessResult> {
  assert(files.length === 1, 'Edit hanya 1 file');
  onProgress?.(5, 'Membuka PDF...');

  const doc = await loadPDF(files[0]);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const pages = doc.getPages();
  const operations: EditOperation[] = options.operations ?? [];

  for (let i = 0; i < operations.length; i++) {
    const op = operations[i];
    const page = pages[op.page - 1];
    if (!page) continue;

    if (op.type === 'text') {
      page.drawText(op.text, {
        x: op.x,
        y: page.getSize().height - op.y,
        size: op.fontSize ?? 12,
        font,
        color: rgb(
          op.color?.r ?? 0,
          op.color?.g ?? 0,
          op.color?.b ?? 0
        ),
      });
    } else if (op.type === 'image') {
      const bytes = toUint8(op.imageBuffer);
      let img;
      try {
        img = await doc.embedPng(bytes);
      } catch {
        img = await doc.embedJpg(bytes);
      }
      page.drawImage(img, {
        x: op.x,
        y: page.getSize().height - op.y - op.height,
        width: op.width,
        height: op.height,
      });
    } else if (op.type === 'rect') {
      page.drawRectangle({
        x: op.x,
        y: page.getSize().height - op.y - op.height,
        width: op.width,
        height: op.height,
        color: rgb(
          op.color?.r ?? 0,
          op.color?.g ?? 0,
          op.color?.b ?? 0
        ),
        opacity: op.opacity ?? 1,
      });
    }

    onProgress?.(10 + (i / Math.max(operations.length, 1)) * 80);
  }

  onProgress?.(95, 'Menyimpan hasil...');
  const out = await savePDF(doc, 'edited.pdf');
  onProgress?.(100, 'Selesai');
  return { files: [out] };
}