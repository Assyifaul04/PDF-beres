// components/upload/file-ready-card.tsx
"use client";

import * as React from "react";
import { X, Settings, ArrowRight, FileText, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface UploadedFile {
  fileId: string;
  fileKey: string;
  originalName: string;
  sizeBytes: string;
  mimeType: string;
}

interface OutputOption {
  value: string;
  label: string;
}

interface Props {
  file: UploadedFile;
  /** Opsi output (misal PNG, JPG untuk convert) */
  outputOptions?: OutputOption[];
  /** Nilai output yang dipilih */
  outputValue?: string;
  /** Callback saat output berubah */
  onOutputChange?: (value: string) => void;
  /** Callback saat tombol X diklik */
  onRemove: () => void;
  /** Callback saat tombol Settings diklik */
  onSettings?: () => void;
  /** Callback saat tombol "Mengubah" diklik */
  onProcess: () => void;
  /** Loading state saat process */
  isProcessing?: boolean;
  /** Label tombol process (default: "Mengubah") */
  processLabel?: string;
  /** Total file dalam group (untuk label bawah) */
  totalFiles?: number;
  className?: string;
}

export function FileReadyCard({
  file,
  outputOptions,
  outputValue,
  onOutputChange,
  onRemove,
  onSettings,
  onProcess,
  isProcessing = false,
  processLabel = "Mengubah",
  totalFiles = 1,
  className,
}: Props) {
  const hasOutput = !!outputOptions && outputOptions.length > 0;

  return (
    <div
      className={cn(
        "w-full overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm",
        className
      )}
    >
      {/* ================= Bagian atas: info file + kontrol ================= */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-3 p-4 sm:flex-nowrap sm:p-5">
        {/* Kiri: ikon + nama + ukuran */}
        <div className="flex min-w-0 flex-1 basis-full items-center gap-3.5 sm:basis-auto">
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground"
            aria-hidden="true"
          >
            <FileText className="h-5 w-5" />
          </div>

          <div className="min-w-0">
            <p
              className="truncate text-sm font-semibold leading-tight"
              title={file.originalName}
            >
              {file.originalName}
            </p>
            <p className="mt-1 text-xs tabular-nums text-muted-foreground">
              {formatSize(Number(file.sizeBytes))}
            </p>
          </div>
        </div>

        {/* Kanan: output select + pengaturan + hapus */}
        <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:ml-0">
          {hasOutput && (
            <div className="mr-1 flex items-center gap-2">
              <span className="hidden text-sm text-muted-foreground sm:inline">
                Keluaran
              </span>
              <Select
                value={outputValue}
                onValueChange={(v) => onOutputChange?.(v ?? "")}
              >
                <SelectTrigger
                  className="h-9 w-[104px] font-medium"
                  aria-label="Format keluaran"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {outputOptions!.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {onSettings && (
            <button
              type="button"
              onClick={onSettings}
              aria-label="Pengaturan"
              className="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Settings className="h-[18px] w-[18px]" />
            </button>
          )}

          <button
            type="button"
            onClick={onRemove}
            aria-label="Hapus file"
            className="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X className="h-[18px] w-[18px]" />
          </button>
        </div>
      </div>

      {/* ================= Bagian bawah: action bar ================= */}
      <div className="flex items-center justify-between gap-3 border-t bg-muted/30 px-4 py-3 sm:px-5">
        <span className="text-sm text-muted-foreground">
          Menambahkan{" "}
          <span className="font-medium tabular-nums text-foreground">
            {totalFiles}
          </span>{" "}
          file
        </span>

        <Button
          type="button"
          onClick={onProcess}
          disabled={isProcessing}
          className="h-10 gap-2 px-5 text-sm font-semibold"
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" />
              Memproses...
            </>
          ) : (
            <>
              {processLabel}
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
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