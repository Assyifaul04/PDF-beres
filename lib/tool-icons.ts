// lib/tool-icons.ts
export interface ToolIcon {
  /** Path publik, contoh: /image/icons/merge_pdf.png */
  value: string;
  /** Label untuk dropdown */
  label: string;
  /** ToolType enum yang cocok (opsional) */
  toolType?: string;
}

export const TOOL_ICONS: ToolIcon[] = [
  { value: "/image/icons/merge_pdf.png", label: "Merge PDF", toolType: "MERGE_PDF" },
  { value: "/image/icons/split_pdf.png", label: "Split PDF", toolType: "SPLIT_PDF" },
  { value: "/image/icons/compress_pdf.png", label: "Compress PDF", toolType: "COMPRESS_PDF" },
  { value: "/image/icons/pdf_to_word.png", label: "PDF to Word", toolType: "PDF_TO_WORD" },
  { value: "/image/icons/pdf_to_powerpoint.png", label: "PDF to PowerPoint", toolType: "PDF_TO_POWERPOINT" },
  { value: "/image/icons/pdf_to_excel.png", label: "PDF to Excel", toolType: "PDF_TO_EXCEL" },
  { value: "/image/icons/word_to_pdf.png", label: "Word to PDF", toolType: "WORD_TO_PDF" },
  { value: "/image/icons/powerpoint_to_pdf.png", label: "PowerPoint to PDF", toolType: "POWERPOINT_TO_PDF" },
  { value: "/image/icons/excel_to_pdf.png", label: "Excel to PDF", toolType: "EXCEL_TO_PDF" },
  { value: "/image/icons/edit_pdf.png", label: "Edit PDF", toolType: "EDIT_PDF" },
  { value: "/image/icons/pdf_to_jpg.png", label: "PDF to JPG", toolType: "PDF_TO_JPG" },
  { value: "/image/icons/jpg_to_pdf.png", label: "JPG to PDF", toolType: "JPG_TO_PDF" },
  { value: "/image/icons/sign_pdf.png", label: "Sign PDF", toolType: "SIGN_PDF" },
  { value: "/image/icons/watermark_pdf.png", label: "Watermark PDF", toolType: "WATERMARK_PDF" },
  { value: "/image/icons/rotate_pdf.png", label: "Rotate PDF", toolType: "ROTATE_PDF" },
  { value: "/image/icons/html_to_pdf.png", label: "HTML to PDF", toolType: "HTML_TO_PDF" },
  { value: "/image/icons/unlock_pdf.png", label: "Unlock PDF", toolType: "UNLOCK_PDF" },
  { value: "/image/icons/protect_pdf.png", label: "Protect PDF", toolType: "PROTECT_PDF" },
  { value: "/image/icons/organize_pdf.png", label: "Organize PDF", toolType: "ORGANIZE_PDF" },
  { value: "/image/icons/repair_pdf.png", label: "Repair PDF", toolType: "REPAIR_PDF" },
  { value: "/image/icons/page_numbers.png", label: "Page Numbers", toolType: "PAGE_NUMBERS" },
];

/**
 * Cari icon berdasarkan value path
 */
export function findIcon(value: string | null | undefined): ToolIcon | undefined {
  if (!value) return undefined;
  return TOOL_ICONS.find((i) => i.value === value);
}

/**
 * Cari icon berdasarkan ToolType enum
 */
export function findIconByToolType(toolType: string | null | undefined): ToolIcon | undefined {
  if (!toolType) return undefined;
  return TOOL_ICONS.find((i) => i.toolType === toolType);
}