// components/upload/file-ready-card.tsx
"use client";

import * as React from "react";
import { X, Settings, ArrowRight } from "lucide-react";
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

/**
 * Card yang tampil setelah file berhasil diupload.
 *
 * Layout:
 * ┌─────────────────────────────────────────────────────────┐
 * │ welpaper.jpg        Keluaran: [PNG▼]  ⚙  ✕              │
 * │ 498.49 KB                                               │
 * ├─────────────────────────────────────────────────────────┤
 * │ Menambahkan 1 file                    [Mengubah →]      │
 * └─────────────────────────────────────────────────────────┘
 */
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
  return (
    <div className={cn("w-full overflow-hidden rounded-md border bg-card", className)}>
      {/* ============================================================
          Baris atas: file info + controls
          ============================================================ */}
      <div className="flex items-center justify-between gap-4 px-4 py-3">
        {/* Kiri: nama file + size */}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium leading-tight">
            {file.originalName}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {formatSize(Number(file.sizeBytes))}
          </p>
        </div>

        {/* Kanan: output select + gear + X */}
        <div className="flex shrink-0 items-center gap-2">
          {/* Output selector */}
          {outputOptions && outputOptions.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="hidden text-sm text-muted-foreground sm:inline">
                Keluaran:
              </span>
              <Select
                value={outputValue}
                onValueChange={(v) => onOutputChange?.(v ?? "")}
              >
                <SelectTrigger className="h-9 w-[100px] border-primary/40 text-primary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {outputOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Gear — settings */}
          {onSettings && (
            <button
              type="button"
              onClick={onSettings}
              aria-label="Pengaturan"
              className="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <Settings className="h-5 w-5" />
            </button>
          )}

          {/* X — remove */}
          <button
            type="button"
            onClick={onRemove}
            aria-label="Hapus file"
            className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* ============================================================
          Baris bawah: action bar
          ============================================================ */}
      <div className="flex items-stretch justify-between border-t bg-muted/40">
        {/* Label kiri */}
        <div className="flex items-center px-4">
          <span className="text-sm text-muted-foreground">
            Menambahkan {totalFiles} file
          </span>
        </div>

        {/* Tombol process kanan */}
        <Button
          type="button"
          onClick={onProcess}
          disabled={isProcessing}
          className="h-14 rounded-none rounded-br-md px-6 text-base font-medium"
        >
          {isProcessing ? "Memproses..." : processLabel}
          <ArrowRight className="ml-2 h-5 w-5" />
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