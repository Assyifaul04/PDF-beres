// lib/tools/output-options.ts
import { ToolType } from "@prisma/client";

export interface OutputOption {
  value: string;
  label: string;
}

/**
 * Output options per tool.
 * Return `[]` kalau tool tidak punya pilihan output — 
 * dropdown "Keluaran" tidak akan tampil.
 */
export function getOutputOptions(toolType: ToolType): OutputOption[] {
  switch (toolType) {
    // ========================================================================
    // CONVERT FROM PDF — pilih format output
    // ========================================================================
    case "PDF_TO_JPG":
      return [
        { value: "jpg", label: "JPG" },
        { value: "png", label: "PNG" },
        { value: "webp", label: "WEBP" },
      ];

    case "PDF_TO_WORD":
      return [
        { value: "docx", label: "DOCX" },
        { value: "doc", label: "DOC" },
        { value: "rtf", label: "RTF" },
      ];

    case "PDF_TO_EXCEL":
      return [
        { value: "xlsx", label: "XLSX" },
        { value: "xls", label: "XLS" },
        { value: "csv", label: "CSV" },
      ];

    case "PDF_TO_POWERPOINT":
      return [
        { value: "pptx", label: "PPTX" },
        { value: "ppt", label: "PPT" },
      ];

    // ========================================================================
    // CONVERT TO PDF — kualitas output
    // ========================================================================
    case "WORD_TO_PDF":
    case "EXCEL_TO_PDF":
    case "POWERPOINT_TO_PDF":
    case "HTML_TO_PDF":
      return [
        { value: "high", label: "Kualitas Tinggi" },
        { value: "medium", label: "Sedang" },
        { value: "low", label: "Kecil" },
      ];

    // ========================================================================
    // IMAGE TO PDF — orientasi & ukuran
    // ========================================================================
    case "JPG_TO_PDF":
      return [
        { value: "a4", label: "A4" },
        { value: "letter", label: "Letter" },
        { value: "auto", label: "Auto" },
      ];

    // ========================================================================
    // COMPRESS PDF — level kompresi
    // ========================================================================
    case "COMPRESS_PDF":
      return [
        { value: "extreme", label: "Ekstrem" },
        { value: "recommended", label: "Direkomendasikan" },
        { value: "less", label: "Kualitas Tinggi" },
      ];

    // ========================================================================
    // SPLIT PDF — mode pemisahan
    // ========================================================================
    case "SPLIT_PDF":
      return [
        { value: "ranges", label: "Rentang" },
        { value: "every", label: "Setiap N halaman" },
        { value: "all", label: "Semua halaman" },
      ];

    // ========================================================================
    // ROTATE PDF — sudut rotasi
    // ========================================================================
    case "ROTATE_PDF":
      return [
        { value: "90", label: "90°" },
        { value: "180", label: "180°" },
        { value: "270", label: "270°" },
      ];

    // ========================================================================
    // WATERMARK PDF — tipe watermark
    // ========================================================================
    case "WATERMARK_PDF":
      return [
        { value: "text", label: "Teks" },
        { value: "image", label: "Gambar" },
      ];

    // ========================================================================
    // PAGE NUMBERS — posisi
    // ========================================================================
    case "PAGE_NUMBERS":
      return [
        { value: "bottom-center", label: "Bawah Tengah" },
        { value: "bottom-right", label: "Bawah Kanan" },
        { value: "bottom-left", label: "Bawah Kiri" },
        { value: "top-center", label: "Atas Tengah" },
        { value: "top-right", label: "Atas Kanan" },
        { value: "top-left", label: "Atas Kiri" },
      ];

    // ========================================================================
    // TOOLS TANPA OUTPUT OPTION
    // ========================================================================
    case "MERGE_PDF":
    case "EDIT_PDF":
    case "SIGN_PDF":
    case "UNLOCK_PDF":
    case "PROTECT_PDF":
    case "ORGANIZE_PDF":
    case "REPAIR_PDF":
    default:
      return [];
  }
}

/**
 * Label tombol process per tool.
 * Dipakai di FileReadyCard.
 */
export function getProcessLabel(toolType: ToolType): string {
  switch (toolType) {
    // Gabung
    case "MERGE_PDF":
      return "Gabungkan";

    // Pisah
    case "SPLIT_PDF":
      return "Pisahkan";

    // Kompres
    case "COMPRESS_PDF":
      return "Kompres";

    // Konversi (semua arah)
    case "PDF_TO_WORD":
    case "PDF_TO_POWERPOINT":
    case "PDF_TO_EXCEL":
    case "PDF_TO_JPG":
    case "WORD_TO_PDF":
    case "POWERPOINT_TO_PDF":
    case "EXCEL_TO_PDF":
    case "JPG_TO_PDF":
    case "HTML_TO_PDF":
      return "Konversi";

    // Edit
    case "EDIT_PDF":
      return "Edit";

    // Tanda tangan
    case "SIGN_PDF":
      return "Tanda Tangan";

    // Watermark
    case "WATERMARK_PDF":
      return "Tambahkan Watermark";

    // Rotate
    case "ROTATE_PDF":
      return "Putar";

    // Security
    case "UNLOCK_PDF":
      return "Buka";
    case "PROTECT_PDF":
      return "Lindungi";

    // Organize
    case "ORGANIZE_PDF":
      return "Atur";
    case "PAGE_NUMBERS":
      return "Tambahkan Nomor";

    // Repair
    case "REPAIR_PDF":
      return "Perbaiki";

    // Fallback
    default:
      return "Mengubah";
  }
}

/**
 * Label singkat untuk icon/CTA (opsional).
 */
export function getShortLabel(toolType: ToolType): string {
  switch (toolType) {
    case "MERGE_PDF":
      return "Gabung";
    case "SPLIT_PDF":
      return "Pisah";
    case "COMPRESS_PDF":
      return "Kompres";
    case "PDF_TO_WORD":
      return "Ke Word";
    case "PDF_TO_POWERPOINT":
      return "Ke PPT";
    case "PDF_TO_EXCEL":
      return "Ke Excel";
    case "PDF_TO_JPG":
      return "Ke JPG";
    case "WORD_TO_PDF":
      return "Word → PDF";
    case "POWERPOINT_TO_PDF":
      return "PPT → PDF";
    case "EXCEL_TO_PDF":
      return "Excel → PDF";
    case "JPG_TO_PDF":
      return "JPG → PDF";
    case "HTML_TO_PDF":
      return "HTML → PDF";
    case "EDIT_PDF":
      return "Edit";
    case "SIGN_PDF":
      return "Tanda Tangan";
    case "WATERMARK_PDF":
      return "Watermark";
    case "ROTATE_PDF":
      return "Putar";
    case "UNLOCK_PDF":
      return "Buka";
    case "PROTECT_PDF":
      return "Lindungi";
    case "ORGANIZE_PDF":
      return "Atur";
    case "REPAIR_PDF":
      return "Perbaiki";
    case "PAGE_NUMBERS":
      return "Nomor";
    default:
      return "Proses";
  }
}