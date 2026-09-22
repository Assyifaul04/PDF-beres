// lib/client/converters/pdf-enhance.ts
import { PDFDocument, rgb, StandardFonts, degrees } from "pdf-lib";
import type { ConvertInput, ConvertOutput, ProgressCallback } from "./utils";

// ============================================================================
// WATERMARK PDF
// ============================================================================
export async function watermarkPdf(
  input: ConvertInput,
  settings: Record<string, unknown> | null,
  onProgress?: ProgressCallback
): Promise<ConvertOutput> {
  const text = (settings?.text as string) ?? "CONFIDENTIAL";
  const opacity = (settings?.opacity as number) ?? 0.3;
  const fontSize = (settings?.fontSize as number) ?? 60;

  onProgress?.(20, "Membaca PDF...");
  const pdf = await PDFDocument.load(input.buffer);
  const font = await pdf.embedFont(StandardFonts.HelveticaBold);
  const pages = pdf.getPages();

  onProgress?.(50, "Menambahkan watermark...");
  pages.forEach((page) => {
    const { width, height } = page.getSize();
    const textWidth = font.widthOfTextAtSize(text, fontSize);
    page.drawText(text, {
      x: (width - textWidth) / 2,
      y: height / 2,
      size: fontSize,
      font,
      color: rgb(0.5, 0.5, 0.5),
      opacity,
      rotate: degrees(-45),
    });
  });

  onProgress?.(80, "Menyimpan PDF...");
  const bytes = await pdf.save();

  return {
    blob: new Blob([bytes as BlobPart], { type: "application/pdf" }),
    fileName: input.name.replace(/\.pdf$/i, "-watermarked.pdf"),
    mimeType: "application/pdf",
  };
}

// ============================================================================
// PAGE NUMBERS
// ============================================================================
export async function addPageNumbers(
  input: ConvertInput,
  settings: Record<string, unknown> | null,
  onProgress?: ProgressCallback
): Promise<ConvertOutput> {
  const position = (settings?.position as string) ?? "bottom-center";

  onProgress?.(20, "Membaca PDF...");
  const pdf = await PDFDocument.load(input.buffer);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const pages = pdf.getPages();

  onProgress?.(50, "Menambahkan nomor halaman...");
  pages.forEach((page, i) => {
    const { width, height } = page.getSize();
    const text = `${i + 1} / ${pages.length}`;
    const fontSize = 10;
    const textWidth = font.widthOfTextAtSize(text, fontSize);
    const margin = 20;

    let x = (width - textWidth) / 2;
    let y = margin;

    if (position.startsWith("top")) y = height - margin - fontSize;
    if (position.endsWith("left")) x = margin;
    if (position.endsWith("right")) x = width - textWidth - margin;

    page.drawText(text, {
      x,
      y,
      size: fontSize,
      font,
      color: rgb(0.3, 0.3, 0.3),
    });
  });

  onProgress?.(80, "Menyimpan PDF...");
  const bytes = await pdf.save();

  return {
    blob: new Blob([bytes as BlobPart], { type: "application/pdf" }),
    fileName: input.name.replace(/\.pdf$/i, "-numbered.pdf"),
    mimeType: "application/pdf",
  };
}

// ============================================================================
// EDIT PDF (add text overlay)
// ============================================================================
export async function editPdf(
  input: ConvertInput,
  settings: Record<string, unknown> | null,
  onProgress?: ProgressCallback
): Promise<ConvertOutput> {
  const edits =
    (settings?.edits as Array<{
      page: number;
      text: string;
      x: number;
      y: number;
      size: number;
      color?: [number, number, number];
    }>) ?? [];

  onProgress?.(20, "Membaca PDF...");
  const pdf = await PDFDocument.load(input.buffer);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const pages = pdf.getPages();

  onProgress?.(50, "Menambahkan elemen...");
  edits.forEach((edit) => {
    const page = pages[edit.page];
    if (!page) return;
    const c = edit.color ?? [0, 0, 0];
    page.drawText(edit.text, {
      x: edit.x,
      y: edit.y,
      size: edit.size,
      font,
      color: rgb(c[0], c[1], c[2]),
    });
  });

  onProgress?.(80, "Menyimpan PDF...");
  const bytes = await pdf.save();

  return {
    blob: new Blob([bytes as BlobPart], { type: "application/pdf" }),
    fileName: input.name.replace(/\.pdf$/i, "-edited.pdf"),
    mimeType: "application/pdf",
  };
}

// ============================================================================
// SIGN PDF (add signature image)
// ============================================================================
export async function signPdf(
  input: ConvertInput,
  settings: Record<string, unknown> | null,
  onProgress?: ProgressCallback
): Promise<ConvertOutput> {
  const signatureDataUrl = settings?.signature as string;
  const pageIndex = (settings?.page as number) ?? 0;
  const x = (settings?.x as number) ?? 100;
  const y = (settings?.y as number) ?? 100;
  const width = (settings?.width as number) ?? 150;
  const height = (settings?.height as number) ?? 60;

  if (!signatureDataUrl) throw new Error("Signature tidak ditemukan");

  onProgress?.(20, "Membaca PDF...");
  const pdf = await PDFDocument.load(input.buffer);
  const pages = pdf.getPages();
  const page = pages[pageIndex];
  if (!page) throw new Error(`Halaman ${pageIndex + 1} tidak ada`);

  onProgress?.(50, "Menambahkan tanda tangan...");
  // Convert data URL → Uint8Array
  const base64 = signatureDataUrl.split(",")[1];
  const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));

  const img = await pdf.embedPng(bytes);
  page.drawImage(img, { x, y, width, height });

  onProgress?.(80, "Menyimpan PDF...");
  const out = await pdf.save();

  return {
    blob: new Blob([out as BlobPart], { type: "application/pdf" }),
    fileName: input.name.replace(/\.pdf$/i, "-signed.pdf"),
    mimeType: "application/pdf",
  };
}