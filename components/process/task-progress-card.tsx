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
  showSavings?: boolean;
  savingsTitle?: string;
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
      <div className="p-3 sm:p-4 lg:p-5">
        <div className="flex items-start gap-2.5 sm:gap-3.5">
          <div
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors sm:h-11 sm:w-11",
              status === "completed"
                ? "bg-green-500/10 text-green-600 dark:text-green-500"
                : "bg-muted text-muted-foreground"
            )}
            aria-hidden="true"
          >
            <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>

          <div className="min-w-0 flex-1">
            <p
              className="truncate text-[13px] font-semibold leading-tight sm:text-sm"
              title={inputFileName}
            >
              {inputFileName}
            </p>
            <p className="mt-0.5 text-[11px] tabular-nums text-muted-foreground sm:mt-1 sm:text-xs">
              {sizeLabel}
            </p>
          </div>

          <div className="hidden sm:block">
            <StatusBadge status={status} />
          </div>

          <button
            type="button"
            onClick={onRemove}
            aria-label="Tutup"
            className="-mr-1 -mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:h-8 sm:w-8"
          >
            <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </button>
        </div>

        {/* Status badge mobile — muncul di bawah, hanya di mobile */}
        <div className="mt-3 sm:hidden">
          <StatusBadge status={status} />
        </div>

        {/* Progress */}
        {status === "processing" && (
          <div className="mt-3 sm:mt-4">
            <div className="mb-1.5 flex items-center justify-between gap-3 text-[11px] sm:text-xs">
              <span className="flex min-w-0 items-center gap-1.5 text-muted-foreground">
                <Loader2 className="h-3 w-3 shrink-0 animate-spin motion-reduce:animate-none" />
                <span className="truncate">{statusLabel ?? "Memproses..."}</span>
              </span>
              <span className="font-medium tabular-nums text-foreground">
                {pct}%
              </span>
            </div>
            <div
              className="relative h-1.5 w-full overflow-hidden rounded-full bg-muted sm:h-2"
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

      {/* ================= Bagian savings ================= */}
      {isCompleted && showSavings && savingsPercent > 0 && (
        <div className="border-t bg-gradient-to-br from-green-500/5 via-background to-green-500/5 px-3 py-3 sm:px-5 sm:py-4">
          <div className="flex items-center gap-3 sm:gap-5">
            <SavingsDonut percent={savingsPercent} size={64} strokeWidth={7} />

            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1.5 text-[13px] font-semibold text-foreground sm:text-sm">
                <Sparkles className="h-3.5 w-3.5 text-green-500" />
                <span className="line-clamp-2">
                  {savingsTitle ?? "File berhasil dikompres!"}
                </span>
              </p>

              <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs sm:mt-2 sm:text-sm">
                <span className="font-medium tabular-nums text-muted-foreground line-through decoration-muted-foreground/40">
                  {sizeLabel}
                </span>
                <TrendingDown className="h-3.5 w-3.5 text-green-500" />
                <span className="font-bold tabular-nums text-green-600 dark:text-green-500">
                  {outputSizeLabel}
                </span>
              </div>

              <p className="mt-1 text-[10px] text-muted-foreground sm:text-[11px]">
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

      {/* ================= Info output (tanpa savings) ================= */}
      {isCompleted && !showSavings && (
        <div className="border-t bg-gradient-to-br from-green-500/5 via-background to-green-500/5 px-3 py-3 sm:px-5 sm:py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-green-500/10 text-green-600 dark:text-green-500 sm:h-10 sm:w-10">
              <Check className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1.5 text-[13px] font-semibold text-foreground sm:text-sm">
                <Sparkles className="h-3.5 w-3.5 text-green-500" />
                File berhasil diproses!
              </p>
              <p className="mt-0.5 text-[10px] text-muted-foreground sm:mt-1 sm:text-[11px]">
                {isMulti
                  ? `${outputCount} file siap diunduh dalam bentuk .zip`
                  : `Ukuran: ${outputSizeLabel ?? "—"}`}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ================= Bagian bawah: output + aksi ================= */}
      <div className="flex flex-col gap-2 border-t bg-muted/30 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:px-5 sm:py-3.5">
        <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
          <div
            className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg sm:h-9 sm:w-9",
              status === "completed" &&
                "bg-green-500/10 text-green-600 dark:text-green-500",
              status === "failed" && "bg-destructive/10 text-destructive",
              (status === "pending" || status === "processing") &&
                "bg-muted text-muted-foreground"
            )}
            aria-hidden="true"
          >
            <OutputIcon className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
          </div>

          <div className="min-w-0">
            {status === "completed" ? (
              <p
                className="truncate text-[13px] font-medium sm:text-sm"
                title={outputDisplay}
              >
                {outputDisplay}
              </p>
            ) : (
              <p className="truncate text-[13px] text-muted-foreground sm:text-sm">
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
              className="inline-flex h-9 items-center gap-1.5 rounded-md px-3 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:text-sm"
            >
              <span>Detail</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>

            <Button
              onClick={onDownload}
              size="sm"
              className="h-9 w-full gap-1.5 bg-green-600 px-4 text-[13px] font-medium hover:bg-green-700 sm:w-auto sm:text-sm"
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
// SAVINGS DONUT (TIDAK BERUBAH)
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
        <span className="text-sm font-bold tabular-nums leading-none text-green-600 dark:text-green-500 sm:text-base">
          {percent.toFixed(0)}%
        </span>
        <span className="mt-0.5 text-[7px] font-semibold uppercase tracking-wider text-muted-foreground sm:text-[8px]">
          Saved
        </span>
      </div>
    </div>
  );
}

// ============================================================================
// STATUS BADGE (TIDAK BERUBAH)
// ============================================================================

function StatusBadge({ status }: { status: CardStatus }) {
  const base =
    "inline-flex shrink-0 items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium sm:px-2.5 sm:py-1 sm:text-xs";

  switch (status) {
    case "pending":
      return (
        <span className={cn(base, "bg-muted text-muted-foreground")}>
          <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
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
          <CheckCircle2 className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
          Selesai
        </span>
      );
    case "failed":
      return (
        <span className={cn(base, "bg-destructive/10 text-destructive")}>
          <XCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
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