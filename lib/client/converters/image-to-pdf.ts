// lib/client/converters/image-to-pdf.ts
import { jsPDF } from "jspdf";
import type { ConvertInput, ConvertOutput, ProgressCallback } from "./utils";

export async function jpgToPdf(
  inputs: ConvertInput[],
  settings: Record<string, unknown> | null,
  onProgress?: ProgressCallback
): Promise<ConvertOutput> {
  const size = (settings?.size as string) ?? "a4";

  const pageSize: Record<string, [number, number]> = {
    a4: [595, 842],
    letter: [612, 792],
    auto: [0, 0],
  };

  const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: size });
  const [pageW, pageH] = pageSize[size] ?? pageSize.a4;

  for (let i = 0; i < inputs.length; i++) {
    onProgress?.(10 + (i / inputs.length) * 80, `Memproses ${inputs[i].name}...`);
    if (i > 0) pdf.addPage();

    // Convert buffer → data URL
    const blob = new Blob([inputs[i].buffer]);
    const dataUrl = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });

    // Get image dimension
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = dataUrl;
    });

    const imgRatio = img.width / img.height;
    const pageRatio = pageW / pageH;

    let w = pageW;
    let h = pageH;
    if (imgRatio > pageRatio) {
      h = pageW / imgRatio;
    } else {
      w = pageH * imgRatio;
    }

    const x = (pageW - w) / 2;
    const y = (pageH - h) / 2;

    pdf.addImage(dataUrl, "JPEG", x, y, w, h);
  }

  onProgress?.(90, "Menyimpan PDF...");

  return {
    blob: pdf.output("blob"),
    fileName: "images.pdf",
    mimeType: "application/pdf",
  };
}