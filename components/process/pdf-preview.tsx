"use client";

import * as React from "react";
import {
  FileText,
  FileImage,
  FileSpreadsheet,
  FileType2,
  Presentation,
  File,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ============================================================================
// TYPES
// ============================================================================
interface PdfPreviewProps {
  url: string;
  rotation?: number;
  containerWidth?: number;
  className?: string;
  showPageCount?: boolean;
  mimeType?: string | null;
  originalName?: string | null;
}

// ============================================================================
// HELPERS
// ============================================================================

function hasExt(name: string | null | undefined, ...exts: string[]): boolean {
  if (!name) return false;
  const lower = name.toLowerCase();
  return exts.some((e) => lower.endsWith(e));
}

type FileKind = "pdf" | "word" | "excel" | "powerpoint" | "image" | "other";

function getFileKind(
  mimeType?: string | null,
  originalName?: string | null
): FileKind {
  const t = (mimeType ?? "").toLowerCase();

  // -------- PDF --------
  if (t === "application/pdf" || hasExt(originalName, ".pdf")) {
    return "pdf";
  }

  // -------- Word --------
  if (
    t ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    t === "application/msword" ||
    hasExt(originalName, ".docx", ".doc", ".rtf", ".odt")
  ) {
    return "word";
  }

  // -------- Excel --------
  if (
    t ===
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
    t === "application/vnd.ms-excel" ||
    t === "text/csv" ||
    hasExt(originalName, ".xlsx", ".xls", ".csv", ".ods")
  ) {
    return "excel";
  }

  // -------- PowerPoint --------
  if (
    t ===
      "application/vnd.openxmlformats-officedocument.presentationml.presentation" ||
    t === "application/vnd.ms-powerpoint" ||
    hasExt(originalName, ".pptx", ".ppt", ".odp")
  ) {
    return "powerpoint";
  }

  // -------- Image --------
  if (
    t.startsWith("image/") ||
    hasExt(originalName, ".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg", ".bmp")
  ) {
    return "image";
  }

  return "other";
}

type KindConfig = {
  Icon: React.ComponentType<{ className?: string }>;
  label: string;
  iconClass: string;
  bgClass: string;
};

const KIND_CONFIG: Record<FileKind, KindConfig> = {
  pdf: {
    Icon: FileText,
    label: "PDF",
    iconClass: "text-red-600 dark:text-red-400",
    bgClass: "bg-red-600/10 dark:bg-red-500/15",
  },
  word: {
    Icon: FileType2,
    label: "Word",
    iconClass: "text-blue-600 dark:text-blue-400",
    bgClass: "bg-blue-600/10 dark:bg-blue-500/15",
  },
  excel: {
    Icon: FileSpreadsheet,
    label: "Excel",
    iconClass: "text-emerald-600 dark:text-emerald-400",
    bgClass: "bg-emerald-600/10 dark:bg-emerald-500/15",
  },
  powerpoint: {
    Icon: Presentation,
    label: "PowerPoint",
    iconClass: "text-orange-600 dark:text-orange-400",
    bgClass: "bg-orange-600/10 dark:bg-orange-500/15",
  },
  image: {
    Icon: FileImage,
    label: "Gambar",
    iconClass: "text-purple-600 dark:text-purple-400",
    bgClass: "bg-purple-600/10 dark:bg-purple-500/15",
  },
  other: {
    Icon: File,
    label: "Berkas",
    iconClass: "text-muted-foreground",
    bgClass: "bg-muted",
  },
};

// ============================================================================
// MAIN
// ============================================================================
export function PdfPreview({
  url,
  rotation = 0,
  containerWidth = 220,
  className,
  showPageCount = true,
  mimeType,
  originalName,
}: PdfPreviewProps) {
  const kind = getFileKind(mimeType, originalName);
  const config = KIND_CONFIG[kind];
  const Icon = config.Icon;

  return (
    <div
      className={cn(
        "relative flex aspect-[3/4] w-full flex-col items-center justify-center gap-3 overflow-hidden rounded-lg border border-border/50",
        config.bgClass,
        className
      )}
      style={{ transform: rotation ? `rotate(${rotation}deg)` : undefined }}
      title={originalName ?? config.label}
    >
      {/* ICON BESAR */}
      <Icon className={cn("h-12 w-12", config.iconClass)} />

      {/* LABEL TIPE FILE */}
      <span
        className={cn(
          "rounded-full bg-background/80 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide backdrop-blur-sm",
          config.iconClass
        )}
      >
        {config.label}
      </span>
    </div>
  );
}