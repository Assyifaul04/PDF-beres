// components/process/task-progress-card.tsx
"use client";

import * as React from "react";
import {
  X,
  Download,
  Loader2,
  CheckCircle2,
  XCircle,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type CardStatus = "processing" | "completed" | "failed";

interface Props {
  /** Nama file input */
  inputFileName: string;
  /** Ukuran file input (bytes) */
  inputFileSize: number;
  /** Nama file output (untuk bar bawah) */
  outputFileName?: string;
  /** Status card */
  status: CardStatus;
  /** Progress 0-100 */
  progress?: number;
  /** Label status */
  statusLabel?: string;
  /** Callback Unduh */
  onDownload: () => void;
  /** Callback X (remove/close) */
  onRemove: () => void;
  /** Callback "Tampilkan Files" */
  onShowFiles: () => void;
  className?: string;
}

export function TaskProgressCard({
  inputFileName,
  inputFileSize,
  outputFileName,
  status,
  progress = 0,
  statusLabel,
  onDownload,
  onRemove,
  onShowFiles,
  className,
}: Props) {
  const sizeLabel = formatSize(inputFileSize);

  return (
    <div
      className={cn(
        "w-full overflow-hidden rounded-md border bg-card",
        className
      )}
    >
      {/* ============================================================
          Baris atas: input file info + status + unduh + close
          ============================================================ */}
      <div className="flex items-center gap-4 px-4 py-3">
        {/* Kiri: nama file + size */}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium leading-tight">
            {inputFileName}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">{sizeLabel}</p>
        </div>

        {/* Tengah: status */}
        <div className="flex shrink-0 flex-col items-end gap-1">
          {status === "processing" && (
            <>
              <div className="flex items-center gap-1.5 text-xs font-medium text-green-600">
                <Loader2 className="h-3 w-3 animate-spin" />
                <span>{statusLabel ?? "Memproses..."}</span>
              </div>
              <div className="h-1.5 w-32 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-green-500 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </>
          )}

          {status === "completed" && (
            <div className="flex items-center gap-1.5 text-xs font-medium text-green-600">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Selesai</span>
            </div>
          )}

          {status === "failed" && (
            <div className="flex items-center gap-1.5 text-xs font-medium text-destructive">
              <XCircle className="h-3.5 w-3.5" />
              <span>Gagal</span>
            </div>
          )}
        </div>

        {/* Kanan: tombol Unduh + X */}
        <div className="flex shrink-0 items-center gap-2">
          {status === "completed" && (
            <Button
              onClick={onDownload}
              size="sm"
              className="h-9 gap-1.5 px-4 text-sm font-medium"
            >
              <Download className="h-4 w-4" />
              Unduh
            </Button>
          )}

          <button
            type="button"
            onClick={onRemove}
            aria-label="Tutup"
            className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* ============================================================
          Baris bawah: output file + "Tampilkan Files"
          ============================================================ */}
      <div className="flex items-center justify-between border-t bg-muted/40 px-4 py-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">
            {outputFileName ?? "—"}
          </p>
        </div>

        {status === "completed" && (
          <button
            type="button"
            onClick={onShowFiles}
            className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:text-primary/80"
          >
            <span>Tampilkan Files</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        )}

        {status === "processing" && (
          <span className="text-xs text-muted-foreground">
            Menunggu selesai...
          </span>
        )}

        {status === "failed" && (
          <span className="text-xs text-muted-foreground">
            Tidak ada output
          </span>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// HELPER
// ============================================================================

function formatSize(bytes: number): string {
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }
  if (bytes >= 1024) {
    return `${(bytes / 1024).toFixed(2)} KB`;
  }
  return `${bytes} B`;
}