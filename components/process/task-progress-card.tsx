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
  Clock,
  FileText,
  FileArchive,
  FileCheck2,
  FileX2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type CardStatus = "pending" | "processing" | "completed" | "failed";

interface Props {
  inputFileName: string;
  inputFileSize: number;
  outputFileName?: string;
  /** jumlah file output (untuk multi-output seperti split/pdf→jpg) */
  outputCount?: number;
  status: CardStatus;
  progress?: number;
  statusLabel?: string;
  onDownload: () => void;
  onRemove: () => void;
  onShowFiles: () => void;
  className?: string;
}

export function TaskProgressCard({
  inputFileName,
  inputFileSize,
  outputFileName,
  outputCount,
  status,
  progress = 0,
  statusLabel,
  onDownload,
  onRemove,
  onShowFiles,
  className,
}: Props) {
  const sizeLabel = formatSize(inputFileSize);
  const pct = Math.max(0, Math.min(100, progress));
  const isMulti = !!outputCount && outputCount > 1;

  const outputDisplay = React.useMemo(() => {
    if (isMulti) {
      return `${outputCount} file siap diunduh (.zip)`;
    }
    return outputFileName ?? "—";
  }, [isMulti, outputCount, outputFileName]);

  const OutputIcon =
    status === "completed"
      ? isMulti
        ? FileArchive
        : FileCheck2
      : status === "failed"
        ? FileX2
        : FileText;

  return (
    <div
      className={cn(
        "w-full overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm",
        status === "failed" && "border-destructive/40",
        className
      )}
      aria-live="polite"
    >
      {/* ================= Bagian atas: file input + status ================= */}
      <div className="p-4 sm:p-5">
        <div className="flex items-start gap-3.5">
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground"
            aria-hidden="true"
          >
            <FileText className="h-5 w-5" />
          </div>

          <div className="min-w-0 flex-1">
            <p
              className="truncate text-sm font-semibold leading-tight"
              title={inputFileName}
            >
              {inputFileName}
            </p>
            <p className="mt-1 text-xs text-muted-foreground tabular-nums">
              {sizeLabel}
            </p>
          </div>

          <StatusBadge status={status} />

          <button
            type="button"
            onClick={onRemove}
            aria-label="Tutup"
            className="-mr-1.5 -mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Progress */}
        {status === "processing" && (
          <div className="mt-4">
            <div className="mb-1.5 flex items-center justify-between gap-3 text-xs">
              <span className="flex min-w-0 items-center gap-1.5 text-muted-foreground">
                <Loader2 className="h-3 w-3 shrink-0 animate-spin motion-reduce:animate-none" />
                <span className="truncate">{statusLabel ?? "Memproses..."}</span>
              </span>
              <span className="font-medium tabular-nums text-foreground">
                {pct}%
              </span>
            </div>
            <div
              className="h-2 w-full overflow-hidden rounded-full bg-muted"
              role="progressbar"
              aria-valuenow={pct}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Progres pemrosesan"
            >
              <div
                className="h-full rounded-full bg-green-500 transition-[width] duration-300 ease-out motion-reduce:transition-none"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* ================= Bagian bawah: output + aksi ================= */}
      <div className="flex flex-col gap-3 border-t bg-muted/30 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <div
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
              status === "completed" &&
                "bg-green-500/10 text-green-600 dark:text-green-500",
              status === "failed" && "bg-destructive/10 text-destructive",
              (status === "pending" || status === "processing") &&
                "bg-muted text-muted-foreground"
            )}
            aria-hidden="true"
          >
            <OutputIcon className="h-[18px] w-[18px]" />
          </div>

          <div className="min-w-0">
            {status === "completed" ? (
              <p className="truncate text-sm font-medium" title={outputDisplay}>
                {outputDisplay}
              </p>
            ) : (
              <p className="truncate text-sm text-muted-foreground">
                {status === "failed"
                  ? "Tidak ada output"
                  : status === "processing"
                    ? "Menunggu selesai..."
                    : outputDisplay}
              </p>
            )}
          </div>
        </div>

        {status === "completed" && (
          <div className="flex shrink-0 items-center justify-end gap-1.5">
            <button
              type="button"
              onClick={onShowFiles}
              className="inline-flex h-9 items-center gap-1.5 rounded-md px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span>Tampilkan File</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>

            <Button
              onClick={onDownload}
              size="sm"
              className="h-9 gap-1.5 px-4 text-sm font-medium"
            >
              <Download className="h-4 w-4" />
              Unduh
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// SUB-COMPONENTS & HELPERS
// ============================================================================

function StatusBadge({ status }: { status: CardStatus }) {
  const base =
    "inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium";

  switch (status) {
    case "pending":
      return (
        <span className={cn(base, "bg-muted text-muted-foreground")}>
          <Clock className="h-3.5 w-3.5" />
          Menunggu
        </span>
      );
    case "processing":
      return (
        <span
          className={cn(
            base,
            "bg-green-500/10 text-green-700 dark:text-green-400"
          )}
        >
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-60 motion-reduce:animate-none" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-green-500" />
          </span>
          Memproses
        </span>
      );
    case "completed":
      return (
        <span
          className={cn(
            base,
            "bg-green-500/10 text-green-700 dark:text-green-400"
          )}
        >
          <CheckCircle2 className="h-3.5 w-3.5" />
          Selesai
        </span>
      );
    case "failed":
      return (
        <span className={cn(base, "bg-destructive/10 text-destructive")}>
          <XCircle className="h-3.5 w-3.5" />
          Gagal
        </span>
      );
  }
}

function formatSize(bytes: number): string {
  if (!bytes) return "0 B";
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${bytes} B`;
}