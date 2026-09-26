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
  TrendingDown,
  Sparkles,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type CardStatus = "pending" | "processing" | "completed" | "failed";

interface Props {
  inputFileName: string;
  inputFileSize: number;
  outputFileName?: string;
  outputFileSize?: number;
  outputCount?: number;
  status: CardStatus;
  progress?: number;
  statusLabel?: string;
  onDownload: () => void;
  onRemove: () => void;
  onShowFiles: () => void;
  className?: string;
  /** Tampilkan grafik savings (default: true) */
  showSavings?: boolean;
  /** Label custom untuk bagian savings */
  savingsTitle?: string;
  /** Label custom untuk "Menghemat" */
  savingsDescription?: string;
}

export function TaskProgressCard({
  inputFileName,
  inputFileSize,
  outputFileName,
  outputFileSize,
  outputCount,
  status,
  progress = 0,
  statusLabel,
  onDownload,
  onRemove,
  onShowFiles,
  className,
  showSavings = true,
  savingsTitle,
  savingsDescription,
}: Props) {
  const sizeLabel = formatSize(inputFileSize);
  const pct = Math.max(0, Math.min(100, progress));
  const isMulti = !!outputCount && outputCount > 1;
  const isCompleted = status === "completed";

  const outputDisplay = React.useMemo(() => {
    if (isMulti) return `${outputCount} file siap diunduh (.zip)`;
    return outputFileName ?? "—";
  }, [isMulti, outputCount, outputFileName]);

  // Hitung savings (hanya jika showSavings = true)
  const savingsPercent = React.useMemo(() => {
    if (!showSavings) return 0;
    if (!isCompleted || !outputFileSize || inputFileSize === 0) return 0;
    const diff = inputFileSize - outputFileSize;
    if (diff <= 0) return 0;
    return (diff / inputFileSize) * 100;
  }, [showSavings, isCompleted, inputFileSize, outputFileSize]);

  const outputSizeLabel = outputFileSize ? formatSize(outputFileSize) : null;

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
        "w-full overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm transition-shadow hover:shadow-md",
        status === "failed" && "border-destructive/40",
        status === "completed" && "border-green-500/30",
        className
      )}
      aria-live="polite"
    >
      {/* ================= Bagian atas: file input + status ================= */}
      <div className="p-4 sm:p-5">
        <div className="flex items-start gap-3.5">
          <div
            className={cn(
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-lg transition-colors",
              status === "completed"
                ? "bg-green-500/10 text-green-600 dark:text-green-500"
                : "bg-muted text-muted-foreground"
            )}
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
              className="relative h-2 w-full overflow-hidden rounded-full bg-muted"
              role="progressbar"
              aria-valuenow={pct}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Progres pemrosesan"
            >
              <div
                className="h-full rounded-full bg-gradient-to-r from-green-500 to-green-400 transition-[width] duration-300 ease-out motion-reduce:transition-none"
                style={{ width: `${pct}%` }}
              />
              <div className="pointer-events-none absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent motion-reduce:hidden" />
            </div>
          </div>
        )}
      </div>

      {/* ================= Bagian savings (hanya jika showSavings) ================= */}
      {isCompleted && showSavings && savingsPercent > 0 && (
        <div className="border-t bg-gradient-to-br from-green-500/5 via-background to-green-500/5 px-4 py-4 sm:px-5">
          <div className="flex items-center gap-5">
            <SavingsDonut percent={savingsPercent} size={72} strokeWidth={8} />

            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                <Sparkles className="h-3.5 w-3.5 text-green-500" />
                {savingsTitle ?? "File berhasil dikompres!"}
              </p>

              <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
                <span className="font-medium tabular-nums text-muted-foreground line-through decoration-muted-foreground/40">
                  {sizeLabel}
                </span>
                <TrendingDown className="h-3.5 w-3.5 text-green-500" />
                <span className="font-bold tabular-nums text-green-600 dark:text-green-500">
                  {outputSizeLabel}
                </span>
              </div>

              <p className="mt-1 text-[11px] text-muted-foreground">
                {savingsDescription ?? "Menghemat"}{" "}
                <span className="font-semibold text-foreground">
                  {formatSize(inputFileSize - (outputFileSize ?? 0))}
                </span>{" "}
                dari ukuran asli
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ================= Info output (untuk tool tanpa savings) ================= */}
      {isCompleted && !showSavings && (
        <div className="border-t bg-gradient-to-br from-green-500/5 via-background to-green-500/5 px-4 py-4 sm:px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-500/10 text-green-600 dark:text-green-500">
              <Check className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                <Sparkles className="h-3.5 w-3.5 text-green-500" />
                File berhasil diproses!
              </p>
              <p className="mt-1 text-[11px] text-muted-foreground">
                {isMulti
                  ? `${outputCount} file siap diunduh dalam bentuk .zip`
                  : `Ukuran: ${outputSizeLabel ?? "—"}`}
              </p>
            </div>
          </div>
        </div>
      )}

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
              <span>Detail</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>

            <Button
              onClick={onDownload}
              size="sm"
              className="h-9 gap-1.5 bg-green-600 px-4 text-sm font-medium hover:bg-green-700"
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
// SAVINGS DONUT
// ============================================================================

function SavingsDonut({
  percent,
  size = 72,
  strokeWidth = 8,
}: {
  percent: number;
  size?: number;
  strokeWidth?: number;
}) {
  const [animated, setAnimated] = React.useState(0);

  React.useEffect(() => {
    const duration = 1200;
    const start = performance.now();
    let raf: number;

    const animate = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setAnimated(percent * eased);
      if (t < 1) raf = requestAnimationFrame(animate);
    };

    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [percent]);

  const clamped = Math.max(0, Math.min(100, animated));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;
  const center = size / 2;

  return (
    <div
      className="relative shrink-0"
      style={{ width: size, height: size }}
      role="img"
      aria-label={`${percent.toFixed(0)} persen lebih kecil`}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
      >
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-green-500/15"
        />
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="#22c55e"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-base font-bold tabular-nums leading-none text-green-600 dark:text-green-500">
          {percent.toFixed(0)}%
        </span>
        <span className="mt-0.5 text-[8px] font-semibold uppercase tracking-wider text-muted-foreground">
          Saved
        </span>
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