import { ToolType } from "@prisma/client";

export interface ToolSettings {
  // COMPRESS_PDF
  compressionLevel?: "recommended" | "extreme" | "low";
  
  // SPLIT_PDF
  splitMode?: "ranges" | "single_pages" | "fixed_range";
  pageRanges?: string; // e.g. "1-3, 5, 7-10"
  splitEveryPages?: number;

  // WATERMARK_PDF
  watermarkText?: string;
  watermarkPosition?: "top-left" | "top-center" | "top-right" | "center" | "bottom-left" | "bottom-center" | "bottom-right";
  watermarkOpacity?: number; // 0.1 - 1.0
  watermarkFontSize?: number;
  watermarkColor?: string;

  // PROTECT_PDF / UNLOCK_PDF
  password?: string;
  confirmPassword?: string;

  // PAGE_NUMBERS
  pageNumberPosition?: "bottom-center" | "bottom-right" | "bottom-left" | "top-center" | "top-right" | "top-left";
  pageNumberFormat?: "page_n" | "n_of_total" | "n";
  startPageNumber?: number;

  // ROTATE_PDF
  rotationAngle?: 90 | 180 | 270;

  // JPG_TO_PDF
  pageSize?: "A4" | "Letter" | "Fit";
  orientation?: "portrait" | "landscape" | "auto";
  marginSize?: "none" | "small" | "big";

  // PDF_TO_JPG
  jpgQuality?: "high" | "medium" | "low";
  extractImagesOnly?: boolean;

  // HTML_TO_PDF
  htmlPageSize?: "A4" | "Letter";
  includeBackgroundGraphics?: boolean;

  // SIGN_PDF
  signName?: string;
  signPosition?: "bottom-right" | "bottom-left" | "bottom-center";

  // EDIT_PDF
  annotationNote?: string;

  // GENERAL CONVERSIONS (PDF_TO_WORD, PDF_TO_EXCEL, WORD_TO_PDF, dll)
  enableOcr?: boolean;
  outputFormat?: string;
}

export function getDefaultToolSettings(toolType: ToolType): ToolSettings {
  switch (toolType) {
    case "COMPRESS_PDF":
      return { compressionLevel: "recommended" };
    case "SPLIT_PDF":
      return { splitMode: "ranges", pageRanges: "1-5" };
    case "WATERMARK_PDF":
      return {
        watermarkText: "CONFIDENTIAL",
        watermarkPosition: "center",
        watermarkOpacity: 0.5,
        watermarkFontSize: 32,
        watermarkColor: "#000000",
      };
    case "PROTECT_PDF":
    case "UNLOCK_PDF":
      return { password: "" };
    case "PAGE_NUMBERS":
      return {
        pageNumberPosition: "bottom-center",
        pageNumberFormat: "page_n",
        startPageNumber: 1,
      };
    case "ROTATE_PDF":
      return { rotationAngle: 90 };
    case "JPG_TO_PDF":
      return { pageSize: "A4", orientation: "portrait", marginSize: "small" };
    case "PDF_TO_JPG":
      return { jpgQuality: "high", extractImagesOnly: false };
    case "HTML_TO_PDF":
      return { htmlPageSize: "A4", includeBackgroundGraphics: true };
    case "SIGN_PDF":
      return { signName: "", signPosition: "bottom-right" };
    case "EDIT_PDF":
      return { annotationNote: "" };
    case "PDF_TO_WORD":
    case "PDF_TO_EXCEL":
    case "PDF_TO_POWERPOINT":
      return { enableOcr: false, outputFormat: toolType.split("_").pop() };
    default:
      return {};
  }
}