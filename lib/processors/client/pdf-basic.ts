// lib/processors/client/pdf-basic.ts
import { PDFDocument, StandardFonts, rgb, degrees } from "pdf-lib";
import { FileInput, ProcessOptions, ProcessResult, ProgressFn } from "../types";
import { loadPDF, savePDF, parseRanges, toUint8 } from "./utils";
import { PDFProcessingError, assert } from "../errors";

// ============ MERGE_PDF ============
export async function mergePDFs(
  files: FileInput[],
  onProgress?: ProgressFn
): Promise<ProcessResult> {
  assert(files.length >= 2, "Butuh minimal 2 file PDF", "MERGE_MIN_FILES");

  const merged = await PDFDocument.create();
  const total = files.length;

  for (let i = 0; i < total; i++) {
    onProgress?.(5 + (i / total) * 90, `Menggabungkan file ${i + 1}/${total}...`);
    const src = await loadPDF(files[i]);
    const indices = src.getPageIndices();
    const copied = await merged.copyPages(src, indices);
    copied.forEach((p) => merged.addPage(p));
  }

  merged.setProducer("PDF Tools");
  merged.setCreationDate(new Date());

  onProgress?.(95, "Menyimpan hasil...");
  const result = await savePDF(merged, "merged.pdf");
  onProgress?.(100, "Selesai");
  return { files: [result], meta: { totalPages: merged.getPageCount() } };
}

// ============ SPLIT_PDF ============
/**
 * Split PDF menjadi beberapa file.
 * Mode:
 *  - options.ranges  → mis. "1-3,5,7-9"
 *  - options.pages   → array halaman spesifik (setiap halaman jadi 1 file)
 *  - default         → setiap halaman jadi file terpisah
 *
 * Catatan: `parseRanges()` mengembalikan flat `number[]` (daftar halaman).
 * Untuk split, kita perlakukan setiap halaman sebagai 1 file.
 * Jika ingin range "1-3" jadi SATU file (bukan 3 file), ubah
 * `parseRanges` agar mengembalikan `number[][]`.
 */
export async function splitPDF(
  files: FileInput[],
  options: ProcessOptions,
  onProgress?: ProgressFn
): Promise<ProcessResult> {
  assert(files.length === 1, "Split hanya 1 file", "SPLIT_ONE_FILE");

  onProgress?.(5, "Membuka PDF...");
  const src = await loadPDF(files[0]);
  const totalPages = src.getPageCount();

  assert(totalPages > 0, "PDF tidak memiliki halaman", "SPLIT_EMPTY");

  // Tentukan grup halaman (setiap grup = 1 file output)
  let groups: number[][] = [];

  if (options.ranges) {
    // parseRanges → flat number[]
    const parsed: number[] = parseRanges(options.ranges, totalPages);
    assert(parsed.length > 0, "Range tidak valid", "SPLIT_BAD_RANGES");

    // ✅ FIX: bungkus setiap halaman menjadi grup 1-halaman.
    // Flat array → number[][]
    groups = parsed.map((n) => [n]);
  } else if (options.pages?.length) {
    const pages = options.pages
      .filter((n) => n >= 1 && n <= totalPages)
      .map((n) => [n]);
    assert(pages.length > 0, "Tidak ada halaman valid", "SPLIT_BAD_PAGES");
    groups = pages;
  } else {
    // Default: pecah per halaman
    groups = Array.from({ length: totalPages }, (_, i) => [i + 1]);
  }

  const outputs: ProcessResult["files"] = [];
  const totalGroups = groups.length;

  for (let i = 0; i < totalGroups; i++) {
    const group = groups[i];
    const indices = group.map((n) => n - 1).filter((n) => n >= 0);

    onProgress?.(
      10 + (i / totalGroups) * 80,
      `Membuat file ${i + 1}/${totalGroups}...`
    );

    const doc = await PDFDocument.create();
    const copied = await doc.copyPages(src, indices);
    copied.forEach((p) => doc.addPage(p));

    const label =
      group.length === 1
        ? `page-${group[0]}`
        : `pages-${group[0]}-${group[group.length - 1]}`;

    const saved = await savePDF(doc, `split-${label}.pdf`);
    outputs.push(saved);
  }

  onProgress?.(95, "Menyelesaikan...");
  onProgress?.(100, "Selesai");
  return { files: outputs, meta: { totalPages, totalOutputs: outputs.length } };
}

// ============ ROTATE_PDF ============
export async function rotatePDF(
  files: FileInput[],
  options: ProcessOptions,
  onProgress?: ProgressFn
): Promise<ProcessResult> {
  assert(files.length === 1, "Rotate hanya 1 file", "ROTATE_ONE_FILE");
  onProgress?.(5, "Membuka PDF...");

  const angle = options.rotation ?? 90;
  assert(
    [90, 180, 270].includes(angle),
    "Rotation harus 90/180/270",
    "ROTATE_BAD_ANGLE"
  );

  const doc = await loadPDF(files[0]);
  const pages = doc.getPages();
  const target = options.pages?.length
    ? options.pages.map((p) => p - 1)
    : pages.map((_, i) => i);

  for (let i = 0; i < target.length; i++) {
    const page = pages[target[i]];
    if (!page) continue;
    const current = page.getRotation().angle;
    page.setRotation(degrees((current + angle) % 360));
    onProgress?.(10 + (i / target.length) * 80);
  }

  onProgress?.(95, "Menyimpan hasil...");
  const out = await savePDF(doc, "rotated.pdf");
  onProgress?.(100, "Selesai");
  return { files: [out] };
}

// ============ PAGE_NUMBERS ============
export async function addPageNumbers(
  files: FileInput[],
  options: ProcessOptions,
  onProgress?: ProgressFn
): Promise<ProcessResult> {
  assert(files.length === 1, "Page numbers hanya 1 file", "PAGENUM_ONE_FILE");
  onProgress?.(5, "Membuka PDF...");

  const doc = await loadPDF(files[0]);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const pages = doc.getPages();
  const total = pages.length;
  const start = options.startNumber ?? 1;
  const fontSize = options.fontSize ?? 11;
  const position = options.position ?? "bottom-center";
  const fmt = options.format ?? "{n}";

  pages.forEach((page, i) => {
    const { width, height } = page.getSize();
    const num = i + start;
    const text = fmt
      .replace("{n}", String(num))
      .replace("{total}", String(total));
    const textWidth = font.widthOfTextAtSize(text, fontSize);
    const margin = 30;

    let x = width / 2 - textWidth / 2;
    let y = margin;

    if (position.includes("right")) x = width - textWidth - margin;
    if (position.includes("left")) x = margin;
    if (position.startsWith("top")) y = height - margin - fontSize;

    page.drawText(text, { x, y, size: fontSize, font, color: rgb(0, 0, 0) });
    onProgress?.(10 + (i / total) * 80);
  });

  onProgress?.(95, "Menyimpan hasil...");
  const out = await savePDF(doc, "numbered.pdf");
  onProgress?.(100, "Selesai");
  return { files: [out] };
}

// ============ ORGANIZE_PDF ============
export async function organizePDF(
  files: FileInput[],
  options: ProcessOptions,
  onProgress?: ProgressFn
): Promise<ProcessResult> {
  assert(files.length === 1, "Organize hanya 1 file", "ORGANIZE_ONE_FILE");
  onProgress?.(5, "Membuka PDF...");

  const src = await loadPDF(files[0]);
  const total = src.getPageCount();

  let order: number[];

  if (options.order?.length) {
    order = options.order.filter((n) => n >= 1 && n <= total);
  } else if (options.deletePages?.length) {
    const del = new Set(options.deletePages);
    order = Array.from({ length: total }, (_, i) => i + 1).filter(
      (n) => !del.has(n)
    );
  } else {
    order = Array.from({ length: total }, (_, i) => i + 1);
  }

  if (options.duplicatePages?.length) {
    for (const n of options.duplicatePages) {
      const idx = order.indexOf(n);
      if (idx >= 0) order.splice(idx + 1, 0, n);
    }
  }

  assert(order.length > 0, "Tidak ada halaman tersisa", "EMPTY_ORDER");

  onProgress?.(30, "Menyusun ulang halaman...");
  const doc = await PDFDocument.create();
  const indices = order.map((n) => n - 1);
  const copied = await doc.copyPages(src, indices);
  copied.forEach((p) => doc.addPage(p));

  onProgress?.(95, "Menyimpan hasil...");
  const out = await savePDF(doc, "organized.pdf");
  onProgress?.(100, "Selesai");
  return { files: [out], meta: { order } };
}