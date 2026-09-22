// lib/client/converters.ts
import mammoth from "mammoth";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { PDFDocument } from "pdf-lib";

export interface ConvertInput {
  name: string;
  buffer: ArrayBuffer;
}

export interface ConvertOutput {
  blob: Blob;
  fileName: string;
  mimeType: string;
}

export async function convertClientSide(
  toolType: string,
  inputs: ConvertInput[],
  settings?: Record<string, unknown> | null,
  onProgress?: (pct: number, message: string) => void
): Promise<ConvertOutput> {
  switch (toolType) {
    case "WORD_TO_PDF":
      return convertWordToPdf(inputs[0], onProgress);
    case "MERGE_PDF":
      return mergePdf(inputs, onProgress);
    default:
      throw new Error(`Tool ${toolType} belum didukung untuk client-side`);
  }
}

// ============================================================================
// WORD → PDF (mammoth + html2canvas + jspdf)
// ============================================================================

async function convertWordToPdf(
  input: ConvertInput,
  onProgress?: (pct: number, message: string) => void
): Promise<ConvertOutput> {
  onProgress?.(10, "Membaca file Word...");

  // 1. DOCX → HTML
  const result = await mammoth.convertToHtml(
    { arrayBuffer: input.buffer },
    {
      styleMap: [
        "p[style-name='Heading 1'] => h1:fresh",
        "p[style-name='Heading 2'] => h2:fresh",
        "p[style-name='Heading 3'] => h3:fresh",
        "b => strong",
        "i => em",
      ],
    }
  );

  if (result.messages.length > 0) {
    console.warn("[mammoth warnings]", result.messages);
  }

  onProgress?.(40, "Merender HTML...");

  // 2. ✅ Buat iframe terisolasi
  const iframe = document.createElement("iframe");
  iframe.style.cssText = `
    position: fixed;
    left: -9999px;
    top: 0;
    width: 794px;
    height: 1123px;
    border: none;
    background: white;
  `;
  document.body.appendChild(iframe);

  const iframeDoc = iframe.contentDocument!;
  const iframeWin = iframe.contentWindow!;

  iframeDoc.open();
  iframeDoc.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          * { box-sizing: border-box; }
          html, body {
            margin: 0;
            padding: 0;
            background: #ffffff;
          }
          body {
            padding: 40px 60px;
            color: #000000;
            font-family: 'Times New Roman', Times, serif;
            font-size: 12pt;
            line-height: 1.6;
          }
          h1 { font-size: 24pt; font-weight: bold; margin: 16pt 0 8pt; }
          h2 { font-size: 18pt; font-weight: bold; margin: 14pt 0 8pt; }
          h3 { font-size: 14pt; font-weight: bold; margin: 12pt 0 6pt; }
          p { margin: 8pt 0; }
          ul, ol { margin: 8pt 0; padding-left: 24pt; }
          table { border-collapse: collapse; width: 100%; margin: 12pt 0; }
          th, td { border: 1px solid #cccccc; padding: 6pt; text-align: left; }
          th { background: #f5f5f5; font-weight: bold; }
          img { max-width: 100%; height: auto; }
          strong { font-weight: bold; }
          em { font-style: italic; }
        </style>
      </head>
      <body>
        ${result.value}
      </body>
    </html>
  `);
  iframeDoc.close();

  // Tunggu render
  await new Promise((r) => setTimeout(r, 300));

  try {
    onProgress?.(60, "Mengkonversi ke PDF...");

    const target = iframeDoc.body;

    // 3. ✅ html2canvas langsung + onclone sanitize
    const canvas = await html2canvas(target, {
      scale: 2,
      backgroundColor: "#ffffff",
      logging: false,
      useCORS: true,
      allowTaint: false,
      windowWidth: 794,
      // ✅ INI KUNCI — sanitize CSS di clone SEBELUM render
      onclone: (clonedDoc, clonedElement) => {
        // Buat <style> override untuk semua elemen
        const styleEl = clonedDoc.createElement("style");
        styleEl.textContent = `
          * {
            color: #000000 !important;
            background-color: transparent !important;
            border-color: #cccccc !important;
          }
          body {
            background-color: #ffffff !important;
          }
          th {
            background-color: #f5f5f5 !important;
          }
        `;
        clonedDoc.head.appendChild(styleEl);

        // Iterate semua elemen, force warna aman
        const all = clonedDoc.querySelectorAll("*");
        all.forEach((el) => {
          const htmlEl = el as HTMLElement;
          // Hapus CSS variables yang bikin masalah
          if (htmlEl.style) {
            htmlEl.style.removeProperty("color");
            htmlEl.style.removeProperty("background-color");
            htmlEl.style.removeProperty("border-color");
          }
        });
      },
    });

    onProgress?.(80, "Menyusun PDF...");

    // 4. Render canvas → PDF multipage manual
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: "a4",
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 0;

    const imgWidth = pageWidth - margin * 2;
    const imgHeight = (canvas.height / canvas.width) * imgWidth;
    const pageContentHeight = pageHeight - margin * 2;

    let remainingHeight = imgHeight;
    let yOffset = 0;
    const scale = canvas.width / imgWidth;

    while (remainingHeight > 0) {
      const sliceHeight = Math.min(pageContentHeight, remainingHeight);

      const sliceCanvas = document.createElement("canvas");
      sliceCanvas.width = canvas.width;
      sliceCanvas.height = Math.max(1, Math.floor(sliceHeight * scale));

      const sliceCtx = sliceCanvas.getContext("2d");
      if (sliceCtx) {
        sliceCtx.fillStyle = "#ffffff";
        sliceCtx.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height);
        sliceCtx.drawImage(
          canvas,
          0,
          Math.floor(yOffset * scale),
          canvas.width,
          Math.floor(sliceHeight * scale),
          0,
          0,
          canvas.width,
          Math.floor(sliceHeight * scale)
        );
      }

      const imgData = sliceCanvas.toDataURL("image/jpeg", 0.92);
      pdf.addImage(imgData, "JPEG", margin, margin, imgWidth, sliceHeight);

      remainingHeight -= sliceHeight;
      yOffset += sliceHeight;

      if (remainingHeight > 0) pdf.addPage();
    }

    onProgress?.(90, "Menyiapkan PDF...");

    const blob = pdf.output("blob");
    const fileName = input.name.replace(/\.(docx?|DOCX?)$/, ".pdf");

    return {
      blob,
      fileName,
      mimeType: "application/pdf",
    };
  } finally {
    // ✅ Cleanup iframe
    document.body.removeChild(iframe);
  }
}

// ============================================================================
// MERGE PDF (pdf-lib)
// ============================================================================

async function mergePdf(
  inputs: ConvertInput[],
  onProgress?: (pct: number, message: string) => void
): Promise<ConvertOutput> {
  if (inputs.length < 2) {
    throw new Error("Minimal 2 file untuk merge");
  }

  onProgress?.(10, "Memuat file PDF...");

  const mergedPdf = await PDFDocument.create();

  for (let i = 0; i < inputs.length; i++) {
    const input = inputs[i];
    onProgress?.(
      10 + (i / inputs.length) * 70,
      `Memproses ${input.name}...`
    );

    const pdf = await PDFDocument.load(input.buffer);
    const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    pages.forEach((page) => mergedPdf.addPage(page));
  }

  onProgress?.(90, "Menyimpan PDF...");

  const bytes = await mergedPdf.save();
  const blob = new Blob([bytes as BlobPart], { type: "application/pdf" });

  return {
    blob,
    fileName: "merged.pdf",
    mimeType: "application/pdf",
  };
}