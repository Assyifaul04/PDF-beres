// lib/client/converters/office-to-pdf.ts
import mammoth from "mammoth";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import type { ConvertInput, ConvertOutput, ProgressCallback } from "./utils";
import { renderHtmlInIframe, sanitizeClone } from "./utils";

// ============================================================================
// WORD → PDF
// ============================================================================
export async function wordToPdf(
  input: ConvertInput,
  onProgress?: ProgressCallback
): Promise<ConvertOutput> {
  onProgress?.(10, "Membaca Word...");

  const result = await mammoth.convertToHtml({ arrayBuffer: input.buffer });

  onProgress?.(40, "Merender HTML...");

  const { iframe, doc } = await renderHtmlInIframe(result.value);

  try {
    onProgress?.(60, "Mengkonversi ke PDF...");

    const canvas = await html2canvas(doc.body, {
      scale: 2,
      backgroundColor: "#ffffff",
      logging: false,
      useCORS: true,
      onclone: sanitizeClone,
    });

    onProgress?.(80, "Menyusun PDF...");

    const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();

    const imgW = pageW;
    const imgH = (canvas.height / canvas.width) * imgW;
    const pageContentH = pageH;

    let remaining = imgH;
    let offsetY = 0;
    const scale = canvas.width / imgW;

    while (remaining > 0) {
      const sliceH = Math.min(pageContentH, remaining);
      const sliceCanvas = document.createElement("canvas");
      sliceCanvas.width = canvas.width;
      sliceCanvas.height = Math.max(1, Math.floor(sliceH * scale));
      const ctx = sliceCanvas.getContext("2d")!;
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height);
      ctx.drawImage(
        canvas,
        0,
        Math.floor(offsetY * scale),
        canvas.width,
        Math.floor(sliceH * scale),
        0,
        0,
        canvas.width,
        Math.floor(sliceH * scale)
      );

      pdf.addImage(
        sliceCanvas.toDataURL("image/jpeg", 0.92),
        "JPEG",
        0,
        0,
        imgW,
        sliceH
      );

      remaining -= sliceH;
      offsetY += sliceH;
      if (remaining > 0) pdf.addPage();
    }

    return {
      blob: pdf.output("blob"),
      fileName: input.name.replace(/\.(docx?|DOCX?)$/, ".pdf"),
      mimeType: "application/pdf",
    };
  } finally {
    document.body.removeChild(iframe);
  }
}

// ============================================================================
// EXCEL → PDF
// ============================================================================
export async function excelToPdf(
  input: ConvertInput,
  onProgress?: ProgressCallback
): Promise<ConvertOutput> {
  onProgress?.(10, "Membaca Excel...");
  const XLSX = await import("xlsx");

  const wb = XLSX.read(input.buffer, { type: "array" });
  const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });

  onProgress?.(40, "Merender sheet...");

  const sheets = wb.SheetNames;
  let first = true;

  for (const sheetName of sheets) {
    if (!first) pdf.addPage();
    first = false;

    const sheet = wb.Sheets[sheetName];
    const rows: string[][] = XLSX.utils.sheet_to_json(sheet, {
      header: 1,
      defval: "",
    }) as string[][];

    // Title
    pdf.setFontSize(14);
    pdf.text(sheetName, 40, 40);

    // Table
    pdf.setFontSize(9);
    let y = 60;
    for (const row of rows) {
      const text = row.map((c) => String(c)).join("  |  ");
      if (y > 800) {
        pdf.addPage();
        y = 40;
      }
      pdf.text(text.slice(0, 120), 40, y);
      y += 14;
    }
  }

  onProgress?.(90, "Menyimpan PDF...");

  return {
    blob: pdf.output("blob"),
    fileName: input.name.replace(/\.(xlsx?|XLSX?)$/, ".pdf"),
    mimeType: "application/pdf",
  };
}

// ============================================================================
// POWERPOINT → PDF
// ============================================================================
export async function powerpointToPdf(
  input: ConvertInput,
  onProgress?: ProgressCallback
): Promise<ConvertOutput> {
  // ⚠️ Tidak ada library client-side yang bisa parse .pptx dengan baik.
  // Placeholder: extract text kasar & render.
  throw new Error(
    "PowerPoint ke PDF membutuhkan server-side (LibreOffice). Gunakan fallback server."
  );
}

// ============================================================================
// HTML → PDF
// ============================================================================
export async function htmlToPdf(
  input: ConvertInput,
  onProgress?: ProgressCallback
): Promise<ConvertOutput> {
  const html = new TextDecoder().decode(input.buffer);

  onProgress?.(30, "Merender HTML...");
  const { iframe, doc } = await renderHtmlInIframe(html);

  try {
    onProgress?.(60, "Mengkonversi ke PDF...");

    const canvas = await html2canvas(doc.body, {
      scale: 2,
      backgroundColor: "#ffffff",
      logging: false,
      useCORS: true,
      onclone: sanitizeClone,
    });

    const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();
    const imgW = pageW;
    const imgH = (canvas.height / canvas.width) * imgW;

    let remaining = imgH;
    let offsetY = 0;
    const scale = canvas.width / imgW;

    while (remaining > 0) {
      const sliceH = Math.min(pageH, remaining);
      const sliceCanvas = document.createElement("canvas");
      sliceCanvas.width = canvas.width;
      sliceCanvas.height = Math.max(1, Math.floor(sliceH * scale));
      const ctx = sliceCanvas.getContext("2d")!;
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height);
      ctx.drawImage(
        canvas,
        0,
        Math.floor(offsetY * scale),
        canvas.width,
        Math.floor(sliceH * scale),
        0,
        0,
        canvas.width,
        Math.floor(sliceH * scale)
      );

      pdf.addImage(
        sliceCanvas.toDataURL("image/jpeg", 0.92),
        "JPEG",
        0,
        0,
        imgW,
        sliceH
      );
      remaining -= sliceH;
      offsetY += sliceH;
      if (remaining > 0) pdf.addPage();
    }

    return {
      blob: pdf.output("blob"),
      fileName: input.name.replace(/\.html?$/i, ".pdf"),
      mimeType: "application/pdf",
    };
  } finally {
    document.body.removeChild(iframe);
  }
}