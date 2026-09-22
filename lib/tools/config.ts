// lib/tools/config.ts
import { ToolType } from "@prisma/client";

export interface ToolConfig {
  /** Slug URL — dipakai di href */
  slug: string;
  /** ToolType enum dari Prisma */
  toolType: ToolType;
  /** Judul yang tampil di halaman */
  title: string;
  /** Deskripsi singkat */
  description: string;
  /** MIME types yang diterima input file */
  accept: string;
  /** Jumlah file minimum */
  minFiles: number;
  /** Jumlah file maksimum (0 = unlimited) */
  maxFiles: number;
  /** Apakah tool menerima banyak file */
  multiple: boolean;
}

// ==============================================================================
// TOOL CONFIGS
// ==============================================================================

export const TOOL_CONFIGS: Record<string, ToolConfig> = {
  // ========================================
  // MERGE / SPLIT / COMPRESS
  // ========================================
  "merge-pdf": {
    slug: "merge-pdf",
    toolType: "MERGE_PDF",
    title: "Gabungkan PDF",
    description:
      "Gabungkan beberapa file PDF menjadi satu dokumen. Susun urutan, klik proses, selesai.",
    accept: "application/pdf",
    minFiles: 2,
    maxFiles: 0,
    multiple: true,
  },
  "split-pdf": {
    slug: "split-pdf",
    toolType: "SPLIT_PDF",
    title: "Pisahkan PDF",
    description:
      "Pisahkan halaman PDF menjadi file terpisah atau ekstrak halaman tertentu.",
    accept: "application/pdf",
    minFiles: 1,
    maxFiles: 1,
    multiple: false,
  },
  "compress-pdf": {
    slug: "compress-pdf",
    toolType: "COMPRESS_PDF",
    title: "Kompres PDF",
    description:
      "Kurangi ukuran PDF tanpa mengorbankan kualitas. Hasil optimal untuk dibagikan.",
    accept: "application/pdf",
    minFiles: 1,
    maxFiles: 1,
    multiple: false,
  },

  // ========================================
  // CONVERT TO PDF
  // ========================================
  "word-to-pdf": {
    slug: "word-to-pdf",
    toolType: "WORD_TO_PDF",
    title: "Word ke PDF",
    description: "Konversi file Word (.doc, .docx) menjadi PDF.",
    accept:
      "application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    minFiles: 1,
    maxFiles: 1,
    multiple: false,
  },
  "excel-to-pdf": {
    slug: "excel-to-pdf",
    toolType: "EXCEL_TO_PDF",
    title: "Excel ke PDF",
    description: "Konversi file Excel (.xls, .xlsx) menjadi PDF.",
    accept:
      "application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    minFiles: 1,
    maxFiles: 1,
    multiple: false,
  },
  "powerpoint-to-pdf": {
    slug: "powerpoint-to-pdf",
    toolType: "POWERPOINT_TO_PDF",
    title: "PowerPoint ke PDF",
    description: "Konversi presentasi PowerPoint menjadi PDF.",
    accept:
      "application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation",
    minFiles: 1,
    maxFiles: 1,
    multiple: false,
  },
  "jpg-to-pdf": {
    slug: "jpg-to-pdf",
    toolType: "JPG_TO_PDF",
    title: "JPG ke PDF",
    description: "Ubah gambar JPG/PNG menjadi dokumen PDF.",
    accept: "image/jpeg,image/png,image/webp",
    minFiles: 1,
    maxFiles: 0,
    multiple: true,
  },
  "html-to-pdf": {
    slug: "html-to-pdf",
    toolType: "HTML_TO_PDF",
    title: "HTML ke PDF",
    description: "Konversi halaman HTML menjadi PDF.",
    accept: "text/html,application/xhtml+xml",
    minFiles: 1,
    maxFiles: 1,
    multiple: false,
  },

  // ========================================
  // CONVERT FROM PDF
  // ========================================
  "pdf-to-word": {
    slug: "pdf-to-word",
    toolType: "PDF_TO_WORD",
    title: "PDF ke Word",
    description: "Ekstrak konten PDF menjadi file Word yang bisa diedit.",
    accept: "application/pdf",
    minFiles: 1,
    maxFiles: 1,
    multiple: false,
  },
  "pdf-to-excel": {
    slug: "pdf-to-excel",
    toolType: "PDF_TO_EXCEL",
    title: "PDF ke Excel",
    description: "Ekstrak tabel dari PDF menjadi spreadsheet Excel.",
    accept: "application/pdf",
    minFiles: 1,
    maxFiles: 1,
    multiple: false,
  },
  "pdf-to-powerpoint": {
    slug: "pdf-to-powerpoint",
    toolType: "PDF_TO_POWERPOINT",
    title: "PDF ke PowerPoint",
    description: "Ubah PDF menjadi presentasi PowerPoint.",
    accept: "application/pdf",
    minFiles: 1,
    maxFiles: 1,
    multiple: false,
  },
  "pdf-to-jpg": {
    slug: "pdf-to-jpg",
    toolType: "PDF_TO_JPG",
    title: "PDF ke JPG",
    description: "Konversi halaman PDF menjadi gambar JPG.",
    accept: "application/pdf",
    minFiles: 1,
    maxFiles: 1,
    multiple: false,
  },

  // ========================================
  // EDIT & SIGN
  // ========================================
  "edit-pdf": {
    slug: "edit-pdf",
    toolType: "EDIT_PDF",
    title: "Edit PDF",
    description: "Tambah teks, gambar, atau anotasi ke PDF.",
    accept: "application/pdf",
    minFiles: 1,
    maxFiles: 1,
    multiple: false,
  },
  "sign-pdf": {
    slug: "sign-pdf",
    toolType: "SIGN_PDF",
    title: "Tanda Tangan PDF",
    description: "Tambahkan tanda tangan digital ke PDF.",
    accept: "application/pdf",
    minFiles: 1,
    maxFiles: 1,
    multiple: false,
  },
  "watermark-pdf": {
    slug: "watermark-pdf",
    toolType: "WATERMARK_PDF",
    title: "Watermark PDF",
    description: "Tambahkan watermark teks atau gambar ke PDF.",
    accept: "application/pdf",
    minFiles: 1,
    maxFiles: 1,
    multiple: false,
  },
  "page-numbers": {
    slug: "page-numbers",
    toolType: "PAGE_NUMBERS",
    title: "Nomor Halaman PDF",
    description: "Tambahkan nomor halaman ke PDF.",
    accept: "application/pdf",
    minFiles: 1,
    maxFiles: 1,
    multiple: false,
  },

  // ========================================
  // ORGANIZE & SECURITY
  // ========================================
  "organize-pdf": {
    slug: "organize-pdf",
    toolType: "ORGANIZE_PDF",
    title: "Atur PDF",
    description: "Susun ulang, hapus, atau putar halaman PDF.",
    accept: "application/pdf",
    minFiles: 1,
    maxFiles: 1,
    multiple: false,
  },
  "rotate-pdf": {
    slug: "rotate-pdf",
    toolType: "ROTATE_PDF",
    title: "Putar PDF",
    description: "Perbaiki orientasi halaman PDF.",
    accept: "application/pdf",
    minFiles: 1,
    maxFiles: 1,
    multiple: false,
  },
  "protect-pdf": {
    slug: "protect-pdf",
    toolType: "PROTECT_PDF",
    title: "Lindungi PDF",
    description: "Enkripsi PDF dengan password.",
    accept: "application/pdf",
    minFiles: 1,
    maxFiles: 1,
    multiple: false,
  },
  "unlock-pdf": {
    slug: "unlock-pdf",
    toolType: "UNLOCK_PDF",
    title: "Buka PDF",
    description: "Hapus password dari PDF.",
    accept: "application/pdf",
    minFiles: 1,
    maxFiles: 1,
    multiple: false,
  },
  "repair-pdf": {
    slug: "repair-pdf",
    toolType: "REPAIR_PDF",
    title: "Perbaiki PDF",
    description: "Perbaiki PDF yang rusak atau tidak bisa dibuka.",
    accept: "application/pdf",
    minFiles: 1,
    maxFiles: 1,
    multiple: false,
  },
};

// ==============================================================================
// LOOKUP HELPERS
// ==============================================================================

/**
 * ✅ Cari config by slug — return `undefined` kalau tidak ada.
 *
 * ⚠️ TIDAK fallback ke merge-pdf, supaya halaman bisa `notFound()`.
 */
export function getToolConfig(slug: string): ToolConfig | undefined {
  return TOOL_CONFIGS[slug];
}

/**
 * ✅ Cari by ToolType enum — lebih robust karena enum pasti unik.
 */
export function getToolConfigByType(
  toolType: ToolType
): ToolConfig | undefined {
  return Object.values(TOOL_CONFIGS).find((c) => c.toolType === toolType);
}

/**
 * ✅ Cari by slug ATAU toolType.
 * Dipakai kalau `href` dari DB tidak match slug.
 */
export function findToolConfig(opts: {
  slug?: string | null;
  toolType?: ToolType | null;
}): ToolConfig | undefined {
  if (opts.slug && TOOL_CONFIGS[opts.slug]) {
    return TOOL_CONFIGS[opts.slug];
  }
  if (opts.toolType) {
    return getToolConfigByType(opts.toolType);
  }
  return undefined;
}

/**
 * ✅ Ambil slug dari URL path — handle nested.
 * "/convert-to-pdf/word-to-pdf" → "word-to-pdf"
 */
export function getSlugFromPath(path: string | string[]): string {
  if (Array.isArray(path)) {
    return path[path.length - 1] ?? "";
  }
  const parts = path.split("/").filter(Boolean);
  return parts[parts.length - 1] ?? "";
}

/**
 * ✅ Cek apakah URL path valid (ada config-nya).
 */
export function isValidToolPath(path: string | string[]): boolean {
  const slug = getSlugFromPath(path);
  return TOOL_CONFIGS[slug] !== undefined;
}