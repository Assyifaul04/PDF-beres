// lib/client/converters/pdf-convert-to.ts
import * as pdfjsLib from "pdfjs-dist";
import { PDFDocument } from "pdf-lib";
import type { ConvertInput, ConvertOutput, ProgressCallback } from "./utils";

// ✅ Setup pdf.js worker
if (typeof window !== "undefined") {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
}

// ============================================================================
// PDF → JPG (render tiap halaman jadi gambar)
// ============================================================================
export async function pdfToJpg(
  input: ConvertInput,
  settings: Record<string, unknown> | null,
  onProgress?: ProgressCallback
): Promise<ConvertOutput> {
  const format = (settings?.output as string) ?? "jpg";
  const pdf = await pdfjsLib.getDocument({ data: input.buffer }).promise;
  const totalPages = pdf.numPages;

  onProgress?.(10, `Memproses ${totalPages} halaman...`);

  // Kalau 1 halaman → return single image
  if (totalPages === 1) {
    const page = await pdf.getPage(1);
    const viewport = page.getViewport({ scale: 2 });
    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext("2d")!;
    await page.render({ canvasContext: ctx, viewport, canvas } as never).promise;

    const mime = format === "png" ? "image/png" : "image/jpeg";
    const blob = await new Promise<Blob>((resolve) =>
      canvas.toBlob((b) => resolve(b!), mime, 0.92)
    );

    return {
      blob,
      fileName: input.name.replace(/\.pdf$/i, `.${format}`),
      mimeType: mime,
    };
  }

  // Multiple halaman → ZIP
  const JSZip = (await import("jszip")).default;
  const zip = new JSZip();

  for (let i = 1; i <= totalPages; i++) {
    onProgress?.(10 + (i / totalPages) * 80, `Halaman ${i}/${totalPages}...`);
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 2 });
    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext("2d")!;
    await page.render({ canvasContext: ctx, viewport, canvas } as never).promise;

    const blob = await new Promise<Blob>((resolve) =>
      canvas.toBlob((b) => resolve(b!), "image/jpeg", 0.92)
    );
    zip.file(`page-${i}.jpg`, blob);
  }

  const zipBlob = await zip.generateAsync({ type: "blob" });

  return {
    blob: zipBlob,
    fileName: input.name.replace(/\.pdf$/i, "-images.zip"),
    mimeType: "application/zip",
  };
}

// ============================================================================
// PDF → WORD (extract text → DOCX)
// ============================================================================
export async function pdfToWord(
  input: ConvertInput,
  settings: Record<string, unknown> | null,
  onProgress?: ProgressCallback
): Promise<ConvertOutput> {
  const { Document, Packer, Paragraph, TextRun } = await import("docx");

  const pdf = await pdfjsLib.getDocument({ data: input.buffer }).promise;
  const totalPages = pdf.numPages;

  onProgress?.(10, `Membaca ${totalPages} halaman...`);

  const paragraphs: InstanceType<typeof Paragraph>[] = [];

  for (let i = 1; i <= totalPages; i++) {
    onProgress?.(10 + (i / totalPages) * 70, `Halaman ${i}/${totalPages}...`);
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const text = content.items
      .map((item: any) => item.str)
      .join(" ");

    // Split per baris
    const lines = text.split(/\n+/).filter((l) => l.trim());
    lines.forEach((line) => {
      paragraphs.push(
        new Paragraph({
          children: [new TextRun({ text: line, size: 24 })],
        })
      );
    });
    // Page break
    if (i < totalPages) {
      paragraphs.push(new Paragraph({ pageBreakBefore: true }));
    }
  }

  onProgress?.(90, "Menyimpan DOCX...");
  const doc = new Document({ sections: [{ children: paragraphs }] });
  const blob = await Packer.toBlob(doc);

  return {
    blob,
    fileName: input.name.replace(/\.pdf$/i, ".docx"),
    mimeType:
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  };
}

// ============================================================================
// PDF → EXCEL (extract text → XLSX)
// ============================================================================
export async function pdfToExcel(
  input: ConvertInput,
  settings: Record<string, unknown> | null,
  onProgress?: ProgressCallback
): Promise<ConvertOutput> {
  const XLSX = await import("xlsx");

  const pdf = await pdfjsLib.getDocument({ data: input.buffer }).promise;
  const totalPages = pdf.numPages;

  onProgress?.(10, `Membaca ${totalPages} halaman...`);

  const wb = XLSX.utils.book_new();

  for (let i = 1; i <= totalPages; i++) {
    onProgress?.(10 + (i / totalPages) * 70, `Halaman ${i}/${totalPages}...`);
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();

    // Group by Y coordinate (baris)
    const lines = new Map<number, string[]>();
    content.items.forEach((item: any) => {
      const y = Math.round(item.transform[5]);
      if (!lines.has(y)) lines.set(y, []);
      lines.get(y)!.push(item.str);
    });

    // Convert ke array of rows
    const rows = Array.from(lines.entries())
      .sort((a, b) => b[0] - a[0]) // Y descending
      .map(([_, texts]) => texts);

    const ws = XLSX.utils.aoa_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, `Page ${i}`);
  }

  onProgress?.(90, "Menyimpan XLSX...");
  const bytes = XLSX.write(wb, { bookType: "xlsx", type: "array" });

  return {
    blob: new Blob([bytes], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }),
    fileName: input.name.replace(/\.pdf$/i, ".xlsx"),
    mimeType:
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  };
}

// ============================================================================
// PDF → POWERPOINT (extract text → PPTX)
// ============================================================================
export async function pdfToPowerpoint(
  input: ConvertInput,
  settings: Record<string, unknown> | null,
  onProgress?: ProgressCallback
): Promise<ConvertOutput> {
  const PptxGenJS = (await import("pptxgenjs")).default;

  const pdf = await pdfjsLib.getDocument({ data: input.buffer }).promise;
  const totalPages = pdf.numPages;

  onProgress?.(10, `Membaca ${totalPages} halaman...`);

  const pptx = new PptxGenJS();
  pptx.layout = "LAYOUT_WIDE";

  for (let i = 1; i <= totalPages; i++) {
    onProgress?.(10 + (i / totalPages) * 70, `Halaman ${i}/${totalPages}...`);
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const text = content.items.map((item: any) => item.str).join(" ");

    const slide = pptx.addSlide();
    slide.addText(text || `Halaman ${i}`, {
      x: 0.5,
      y: 0.5,
      w: 12,
      h: 6,
      fontSize: 14,
      color: "000000",
      valign: "top",
    });
  }

  onProgress?.(90, "Menyimpan PPTX...");
  const blob = (await pptx.write({ outputType: "blob" })) as Blob;

  return {
    blob,
    fileName: input.name.replace(/\.pdf$/i, ".pptx"),
    mimeType:
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  };
}