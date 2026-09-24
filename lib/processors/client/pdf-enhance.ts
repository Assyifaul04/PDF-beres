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

// ============ WATERMARK_PDF ============
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
  const pages = doc.getPages();

  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    const { width, height } = page.getSize();
    const fontSize = Math.min(width, height) * 0.12;
    const textWidth = font.widthOfTextAtSize(text, fontSize);

    page.drawText(text, {
      x: width / 2 - textWidth / 2,
      y: height / 2 - fontSize / 2,
      size: fontSize,
      font,
      color: rgb(color.r, color.g, color.b),
      opacity,
      rotate: degrees(-45),
    });
    onProgress?.(10 + (i / pages.length) * 80);
  }

  onProgress?.(95, 'Menyimpan hasil...');
  const out = await savePDF(doc, 'watermarked.pdf');
  onProgress?.(100, 'Selesai');
  return { files: [out] };
}

// ============ SIGN_PDF ============
export async function signPDF(
  files: FileInput[],
  options: ProcessOptions,
  onProgress?: ProgressFn
): Promise<ProcessResult> {
  assert(files.length === 1, 'Sign hanya 1 file');

  // ✅ FIX: pindahkan ke variabel lokal agar TypeScript bisa
  // mempersempit `ArrayBuffer | Uint8Array | undefined`
  // menjadi `ArrayBuffer | Uint8Array` setelah `assert`.
  //
  // Alasan: assertion function (`asserts condition`) hanya
  // mempersempit variabel lokal, BUKAN property access seperti
  // `options.signatureImage`.
  const sigInput = options.signatureImage;
  assert(sigInput, 'Signature image wajib', 'NO_SIGNATURE');

  onProgress?.(5, 'Membuka PDF...');
  const doc = await loadPDF(files[0]);
  const pages = doc.getPages();

  // `sigInput` sekarang bertipe `ArrayBuffer | Uint8Array` (tanpa undefined)
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

// ============ EDIT_PDF ============
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