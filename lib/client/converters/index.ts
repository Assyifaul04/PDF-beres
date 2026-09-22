// lib/client/converters/index.ts
import type { ConvertInput, ConvertOutput, ProgressCallback } from "./utils";

import {
  mergePdf,
  splitPdf,
  rotatePdf,
  organizePdf,
  repairPdf,
} from "./pdf-basic";
import { protectPdf, unlockPdf } from "./pdf-security";
import {
  watermarkPdf,
  addPageNumbers,
  editPdf,
  signPdf,
} from "./pdf-enhance";
import {
  pdfToJpg,
  pdfToWord,
  pdfToExcel,
  pdfToPowerpoint,
} from "./pdf-convert-to";
import {
  wordToPdf,
  excelToPdf,
  powerpointToPdf,
  htmlToPdf,
} from "./office-to-pdf";
import { jpgToPdf } from "./image-to-pdf";
import { compressPdf } from "./compress";

export type { ConvertInput, ConvertOutput, ProgressCallback };

export async function convertClientSide(
  toolType: string,
  inputs: ConvertInput[],
  settings?: Record<string, unknown> | null,
  onProgress?: ProgressCallback
): Promise<ConvertOutput> {
  const s = settings ?? null;

  switch (toolType) {
    // ---------- PDF BASIC ----------
    case "MERGE_PDF":
      return mergePdf(inputs, onProgress);
    case "SPLIT_PDF":
      return splitPdf(inputs[0], s, onProgress);
    case "ROTATE_PDF":
      return rotatePdf(inputs[0], s, onProgress);
    case "ORGANIZE_PDF":
      return organizePdf(inputs[0], s, onProgress);
    case "REPAIR_PDF":
      return repairPdf(inputs[0], s, onProgress);

    // ---------- PDF SECURITY ----------
    case "PROTECT_PDF":
      return protectPdf(inputs[0], s, onProgress);
    case "UNLOCK_PDF":
      return unlockPdf(inputs[0], s, onProgress);

    // ---------- PDF ENHANCE ----------
    case "WATERMARK_PDF":
      return watermarkPdf(inputs[0], s, onProgress);
    case "PAGE_NUMBERS":
      return addPageNumbers(inputs[0], s, onProgress);
    case "EDIT_PDF":
      return editPdf(inputs[0], s, onProgress);
    case "SIGN_PDF":
      return signPdf(inputs[0], s, onProgress);

    // ---------- PDF → OTHER ----------
    case "PDF_TO_JPG":
      return pdfToJpg(inputs[0], s, onProgress);
    case "PDF_TO_WORD":
      return pdfToWord(inputs[0], s, onProgress);
    case "PDF_TO_EXCEL":
      return pdfToExcel(inputs[0], s, onProgress);
    case "PDF_TO_POWERPOINT":
      return pdfToPowerpoint(inputs[0], s, onProgress);

    // ---------- OTHER → PDF ----------
    case "WORD_TO_PDF":
      return wordToPdf(inputs[0], onProgress);
    case "EXCEL_TO_PDF":
      return excelToPdf(inputs[0], onProgress);
    case "POWERPOINT_TO_PDF":
      return powerpointToPdf(inputs[0], onProgress);
    case "HTML_TO_PDF":
      return htmlToPdf(inputs[0], onProgress);
    case "JPG_TO_PDF":
      return jpgToPdf(inputs, s, onProgress);

    // ---------- COMPRESS ----------
    case "COMPRESS_PDF":
      return compressPdf(inputs[0], s, onProgress);

    default:
      throw new Error(
        `Tool ${toolType} belum didukung untuk client-side. Gunakan server-side.`
      );
  }
}