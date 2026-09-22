// lib/client/converters/compress.ts
import * as pdfjsLib from "pdfjs-dist";
import { PDFDocument } from "pdf-lib";
import type { ConvertInput, ConvertOutput, ProgressCallback } from "./utils";

if (typeof window !== "undefined") {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
}

export async function compressPdf(
  input: ConvertInput,
  settings: Record<string, unknown> | null,
  onProgress?: ProgressCallback
): Promise<ConvertOutput> {
  const level = (settings?.level as string) ?? "recommended";

  const qualityMap: Record<string, number> = {
    extreme: 0.4,
    recommended: 0.6,
    less: 0.85,
  };
  const quality = qualityMap[level] ?? 0.6;

  onProgress?.(10, "Membaca PDF...");
  const srcPdf = await pdfjsLib.getDocument({ data: input.buffer }).promise;
  const totalPages = srcPdf.numPages;

  // Buat PDF baru dengan halaman sebagai gambar terkompresi
  const newPdf = await PDFDocument.create();

  for (let i = 1; i <= totalPages; i++) {
    onProgress?.(10 + (i / totalPages) * 75, `Kompres halaman ${i}/${totalPages}...`);

    const page = await srcPdf.getPage(i);
    const viewport = page.getViewport({ scale: 1.5 });
    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext("2d")!;
    await page.render({ canvasContext: ctx, viewport, canvas } as never).promise;

    const blob = await new Promise<Blob>((resolve) =>
      canvas.toBlob((b) => resolve(b!), "image/jpeg", quality)
    );
    const buffer = await blob.arrayBuffer();

    const img = await newPdf.embedJpg(buffer);
    const newPage = newPdf.addPage([viewport.width, viewport.height]);
    newPage.drawImage(img, {
      x: 0,
      y: 0,
      width: viewport.width,
      height: viewport.height,
    });
  }

  onProgress?.(90, "Menyimpan PDF...");
  const bytes = await newPdf.save();

  return {
    blob: new Blob([bytes as BlobPart], { type: "application/pdf" }),
    fileName: input.name.replace(/\.pdf$/i, "-compressed.pdf"),
    mimeType: "application/pdf",
  };
}