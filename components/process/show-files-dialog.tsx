// components/process/show-files-dialog.tsx
"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  FileText,
  FileImage,
  FileSpreadsheet,
  FileType2,
  Presentation,
  FileArchive,
  FileCode2,
  Download,
  Inbox,
  Search,
  Copy,
  Check,
  X,
  TrendingDown,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ============================================================================
// TYPES (TIDAK BERUBAH)
// ============================================================================

export interface ShowFilesInputFile {
  fileId: string;
  fileKey: string;
  originalName: string;
  mimeType: string;
  sizeBytes: string;
  expiresAt?: string;
  order?: number;
}

export interface ShowFilesOutputFile {
  fileId: string;
  fileKey: string;
  originalName: string;
  mimeType: string;
  sizeBytes: string;
  expiresAt?: string;
}

export interface ShowFilesDialogProps {
  inputFiles: ShowFilesInputFile[];
  outputFiles: ShowFilesOutputFile[];
  isCompleted: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  defaultOpen?: boolean;
  previewUrls?: Record<string, string>;
  downloadUrls?: Record<string, string>;
  showSavings?: boolean;
}

// ============================================================================
// ICON MAPPER (TIDAK BERUBAH)
// ============================================================================

function getFileIcon(mime: string, name: string) {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (mime.startsWith("image/")) return FileImage;
  if (mime === "application/pdf" || ext === "pdf") return FileText;
  if (mime.includes("spreadsheet") || ["xls", "xlsx", "csv"].includes(ext))
    return FileSpreadsheet;
  if (mime.includes("presentation") || ["ppt", "pptx"].includes(ext))
    return Presentation;
  if (mime.includes("word") || ["doc", "docx", "rtf"].includes(ext))
    return FileType2;
  if (mime.includes("zip") || ["zip", "rar", "7z"].includes(ext))
    return FileArchive;
  if (["js", "ts", "json", "xml", "html", "css"].includes(ext))
    return FileCode2;
  return FileText;
}

function getFileColor(mime: string, name: string): string {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (mime.startsWith("image/")) return "text-purple-500 bg-purple-500/10";
  if (mime === "application/pdf" || ext === "pdf")
    return "text-red-500 bg-red-500/10";
  if (mime.includes("spreadsheet") || ["xls", "xlsx", "csv"].includes(ext))
    return "text-green-500 bg-green-500/10";
  if (mime.includes("presentation") || ["ppt", "pptx"].includes(ext))
    return "text-orange-500 bg-orange-500/10";
  if (mime.includes("word") || ["doc", "docx"].includes(ext))
    return "text-blue-500 bg-blue-500/10";
  return "text-muted-foreground bg-muted";
}

// ============================================================================
// SAVINGS DONUT (TIDAK BERUBAH)
// ============================================================================

function SavingsDonut({
  percent,
  size = 96,
  strokeWidth = 10,
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
        <span className="text-lg font-bold tabular-nums leading-none text-green-600 dark:text-green-500 sm:text-xl">
          {percent.toFixed(0)}%
        </span>
        <span className="mt-0.5 text-[8px] font-semibold uppercase tracking-wider text-muted-foreground sm:mt-1 sm:text-[9px]">
          Saved
        </span>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT (LOGIKA TIDAK BERUBAH)
// ============================================================================

export function ShowFilesDialog({
  inputFiles,
  outputFiles,
  isCompleted,
  open,
  onOpenChange,
  defaultOpen = false,
  previewUrls = {},
  downloadUrls = {},
  showSavings: showSavingsProp = true,
}: ShowFilesDialogProps) {
  const isControlled = open !== undefined;
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen);
  const [search, setSearch] = React.useState("");
  const [activeTab, setActiveTab] = React.useState<"all" | "input" | "output">(
    "all"
  );

  const actualOpen = isControlled ? open : internalOpen;
  const setOpen = React.useCallback(
    (next: boolean) => {
      if (!isControlled) setInternalOpen(next);
      onOpenChange?.(next);
    },
    [isControlled, onOpenChange]
  );

  React.useEffect(() => {
    if (!actualOpen) {
      setSearch("");
      setActiveTab("all");
    }
  }, [actualOpen]);

  const totalFiles = inputFiles.length + outputFiles.length;

  const totalInputSize = React.useMemo(
    () => inputFiles.reduce((sum, f) => sum + Number(f.sizeBytes), 0),
    [inputFiles]
  );

  const totalOutputSize = React.useMemo(
    () => outputFiles.reduce((sum, f) => sum + Number(f.sizeBytes), 0),
    [outputFiles]
  );

  const savingsPercent = React.useMemo(() => {
    if (!showSavingsProp) return 0;
    if (!isCompleted || totalInputSize === 0 || outputFiles.length === 0)
      return 0;
    const diff = totalInputSize - totalOutputSize;
    if (diff <= 0) return 0;
    return (diff / totalInputSize) * 100;
  }, [
    showSavingsProp,
    isCompleted,
    totalInputSize,
    totalOutputSize,
    outputFiles.length,
  ]);

  const showSavings =
    showSavingsProp && isCompleted && outputFiles.length > 0;

  const filteredInput = React.useMemo(() => {
    if (activeTab === "output") return [];
    const q = search.trim().toLowerCase();
    if (!q) return inputFiles;
    return inputFiles.filter((f) =>
      f.originalName.toLowerCase().includes(q)
    );
  }, [inputFiles, search, activeTab]);

  const filteredOutput = React.useMemo(() => {
    if (!isCompleted) return [];
    if (activeTab === "input") return [];
    const q = search.trim().toLowerCase();
    if (!q) return outputFiles;
    return outputFiles.filter((f) =>
      f.originalName.toLowerCase().includes(q)
    );
  }, [outputFiles, search, activeTab, isCompleted]);

  const hasResults = filteredInput.length > 0 || filteredOutput.length > 0;

  return (
    <Dialog open={actualOpen} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl gap-0 overflow-hidden p-0 max-h-[90vh] flex flex-col">
        {/* HEADER */}
        <DialogHeader className="shrink-0 border-b px-4 py-3 sm:px-5 sm:py-4">
          <div className="flex items-start justify-between gap-3 sm:items-center sm:gap-4">
            <div className="min-w-0 flex-1">
              <DialogTitle className="text-sm font-semibold sm:text-base">
                Daftar File
              </DialogTitle>
              <DialogDescription className="mt-0.5 text-[11px] sm:text-xs">
                {isCompleted
                  ? `${totalFiles} file terkait tugas ini`
                  : `${inputFiles.length} file input`}
              </DialogDescription>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1 text-[10px] sm:flex-row sm:items-center sm:gap-2 sm:text-xs">
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2 py-0.5 font-medium text-blue-600 dark:text-blue-400 sm:px-2.5 sm:py-1">
                {inputFiles.length} input
              </span>
              {isCompleted && (
                <span className="inline-flex items-center gap-1 rounded-full bg-green-500/10 px-2 py-0.5 font-medium text-green-600 dark:text-green-400 sm:px-2.5 sm:py-1">
                  {outputFiles.length} output
                </span>
              )}
            </div>
          </div>
        </DialogHeader>

        {/* SAVINGS BANNER */}
        {showSavings && (
          <div className="shrink-0 border-b bg-gradient-to-br from-green-500/5 via-background to-green-500/5 px-4 py-3 sm:px-5 sm:py-4">
            <div className="flex items-center gap-3 sm:gap-5">
              <SavingsDonut
                percent={savingsPercent}
                size={72}
                strokeWidth={8}
              />

              <div className="min-w-0 flex-1">
                <p className="flex items-start gap-1.5 text-[13px] font-semibold text-foreground sm:text-sm">
                  <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-green-500" />
                  <span className="line-clamp-2">
                    {savingsPercent > 0 ? (
                      <>
                        File sekarang{" "}
                        <span className="text-green-600 dark:text-green-500">
                          {savingsPercent.toFixed(0)}% lebih kecil
                        </span>
                        !
                      </>
                    ) : (
                      "File sudah optimal"
                    )}
                  </span>
                </p>

                <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs sm:mt-2 sm:text-sm">
                  <span className="font-medium tabular-nums text-muted-foreground line-through decoration-muted-foreground/40">
                    {formatSize(totalInputSize)}
                  </span>
                  <TrendingDown className="h-3.5 w-3.5 text-green-500" />
                  <span className="font-bold tabular-nums text-green-600 dark:text-green-500">
                    {formatSize(totalOutputSize)}
                  </span>
                </div>

                {savingsPercent > 0 && (
                  <p className="mt-0.5 text-[10px] text-muted-foreground sm:mt-1 sm:text-[11px]">
                    Menghemat{" "}
                    <span className="font-semibold text-foreground">
                      {formatSize(totalInputSize - totalOutputSize)}
                    </span>{" "}
                    dari ukuran asli
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* INFO PANEL (tanpa savings) */}
        {!showSavings && isCompleted && outputFiles.length > 0 && (
          <div className="shrink-0 border-b bg-gradient-to-br from-green-500/5 via-background to-green-500/5 px-4 py-3 sm:px-5 sm:py-4">
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
                  {outputFiles.length > 1
                    ? `${outputFiles.length} file output siap diunduh`
                    : `Ukuran output: ${formatSize(totalOutputSize)}`}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TOOLBAR */}
        {totalFiles > 3 && (
          <div className="shrink-0 border-b px-4 py-2.5 sm:px-5 sm:py-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Cari nama file..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-9 bg-muted/40 pl-9 text-sm"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded text-muted-foreground hover:bg-muted"
                    aria-label="Hapus pencarian"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {isCompleted && (
                <div className="flex shrink-0 items-center justify-center rounded-md border bg-muted/40 p-0.5 sm:justify-start">
                  {(["all", "input", "output"] as const).map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setActiveTab(tab)}
                      className={cn(
                        "flex-1 rounded px-2.5 py-1 text-[11px] font-medium capitalize transition-colors sm:flex-none sm:text-xs",
                        activeTab === tab
                          ? "bg-background text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {tab === "all"
                        ? "Semua"
                        : tab === "input"
                          ? "Input"
                          : "Output"}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* BODY */}
        <div className="flex-1 overflow-y-auto px-4 py-3 sm:px-5 sm:py-4">
          {!hasResults ? (
            <EmptyState
              hasSearch={search.trim().length > 0}
              isCompleted={isCompleted}
            />
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {filteredInput.length > 0 && (
                <FileSection
                  title="File Input"
                  count={filteredInput.length}
                  accent="blue"
                  files={filteredInput.map((f) => ({
                    id: f.fileId,
                    name: f.originalName,
                    size: Number(f.sizeBytes),
                    mime: f.mimeType,
                    previewUrl: previewUrls[f.fileId],
                    downloadUrl: downloadUrls[f.fileId],
                  }))}
                />
              )}

              {filteredOutput.length > 0 && (
                <FileSection
                  title="File Output"
                  count={filteredOutput.length}
                  accent="green"
                  files={filteredOutput.map((f) => ({
                    id: f.fileId,
                    name: f.originalName,
                    size: Number(f.sizeBytes),
                    mime: f.mimeType,
                    previewUrl: previewUrls[f.fileId],
                    downloadUrl: downloadUrls[f.fileId],
                  }))}
                />
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================================
// EMPTY STATE (TIDAK BERUBAH)
// ============================================================================

function EmptyState({
  hasSearch,
  isCompleted,
}: {
  hasSearch: boolean;
  isCompleted: boolean;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-8 text-center sm:py-12">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted sm:h-12 sm:w-12">
        <Inbox className="h-5 w-5 text-muted-foreground sm:h-6 sm:w-6" />
      </div>
      <p className="text-[13px] font-medium text-foreground sm:text-sm">
        {hasSearch ? "Tidak ada file yang cocok" : "Belum ada file"}
      </p>
      <p className="max-w-xs text-[11px] text-muted-foreground sm:text-xs">
        {hasSearch
          ? "Coba kata kunci lain atau hapus filter."
          : isCompleted
            ? "File input dan output akan muncul di sini setelah tugas selesai."
            : "File input akan muncul di sini setelah Anda mengunggah."}
      </p>
    </div>
  );
}

// ============================================================================
// FILE SECTION (TIDAK BERUBAH)
// ============================================================================

interface FileItem {
  id: string;
  name: string;
  size: number;
  mime: string;
  previewUrl?: string;
  downloadUrl?: string;
}

function FileSection({
  title,
  count,
  accent,
  files,
}: {
  title: string;
  count: number;
  accent: "blue" | "green";
  files: FileItem[];
}) {
  const accentClass =
    accent === "blue"
      ? "border-l-blue-500 bg-blue-500/5"
      : "border-l-green-500 bg-green-500/5";

  return (
    <section className="rounded-lg border">
      <header
        className={cn(
          "flex items-center justify-between border-b border-l-4 px-3 py-2",
          accentClass
        )}
      >
        <p className="text-[10px] font-semibold uppercase tracking-wider text-foreground sm:text-xs">
          {title}
        </p>
        <span className="rounded-full bg-background/80 px-2 py-0.5 text-[10px] font-medium tabular-nums text-muted-foreground">
          {count}
        </span>
      </header>

      <ul className="divide-y">
        {files.map((f) => (
          <FileRow key={f.id} file={f} />
        ))}
      </ul>
    </section>
  );
}

// ============================================================================
// FILE ROW (TIDAK BERUBAH)
// ============================================================================

const FileRow = React.memo(function FileRow({ file }: { file: FileItem }) {
  const [copied, setCopied] = React.useState(false);
  const Icon = getFileIcon(file.mime, file.name);
  const colorClass = getFileColor(file.mime, file.name);
  const previewSrc = file.previewUrl ?? null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(file.name);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  };

  return (
    <li className="group flex items-center gap-2 px-3 py-2.5 transition-colors hover:bg-muted/40 sm:gap-3">
      <div
        className={cn(
          "relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-md sm:h-9 sm:w-9",
          colorClass
        )}
      >
        {previewSrc && file.mime.startsWith("image/") ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={previewSrc}
            alt={file.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p
          className="truncate text-[13px] font-medium text-foreground sm:text-sm"
          title={file.name}
        >
          {file.name}
        </p>
        <p className="mt-0.5 text-[11px] tabular-nums text-muted-foreground sm:text-xs">
          {formatSize(file.size)}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-0.5 opacity-100 transition-opacity sm:gap-1 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-within:opacity-100">
        <button
          type="button"
          onClick={handleCopy}
          className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Salin nama file"
          title="Salin nama"
        >
          {copied ? (
            <Check className="h-3.5 w-3.5 text-green-500" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
        </button>

        {file.downloadUrl && (
          <a
            href={file.downloadUrl}
            download={file.name}
            className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Unduh file"
            title="Unduh"
          >
            <Download className="h-3.5 w-3.5" />
          </a>
        )}
      </div>
    </li>
  );
});

// ============================================================================
// HELPERS (TIDAK BERUBAH)
// ============================================================================

function formatSize(bytes: number): string {
  if (!bytes) return "0 B";
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${bytes} B`;
}