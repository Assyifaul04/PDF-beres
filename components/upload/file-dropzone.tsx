// components/upload/file-dropzone.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import { FilePlus2, ChevronDown, UploadCloud, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type FileDropzoneProps = {
  /** Judul utama di atas dropzone */
  title?: string;
  /** Deskripsi di bawah judul */
  description?: string;
  /** Maksimum ukuran file per file (dalam bytes). Default 1GB */
  maxSize?: number;
  /** Terima tipe file tertentu, contoh: "application/pdf" */
  accept?: string;
  /** Jumlah file minimum (default 1) */
  minFiles?: number;
  /** Jumlah file maksimum (0 = unlimited, default 1) */
  maxFiles?: number;
  /** Apakah menerima banyak file (default false) */
  multiple?: boolean;
  /** Callback saat file dipilih */
  onFilesSelected?: (files: File[]) => void;
  /** Callback saat validasi gagal */
  onError?: (message: string) => void;
  /** Label tombol utama */
  buttonLabel?: string;
  /** Nonaktifkan dropzone (misal saat uploading) */
  disabled?: boolean;
  className?: string;
};

export function FileDropzone({
  title = "Pilih file untuk memulai",
  description = "Seret & lepas file di sini, atau klik tombol di bawah.",
  maxSize = 1024 * 1024 * 1024, // 1GB
  accept = "application/pdf",
  minFiles = 1,
  maxFiles = 1,
  multiple = false,
  onFilesSelected,
  onError,
  buttonLabel = "Pilih File",
  disabled = false,
  className,
}: FileDropzoneProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleClick = () => {
    if (disabled) return;
    inputRef.current?.click();
  };

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setError(null);
    const arr = Array.from(files);

    // ✅ Validasi 1: jumlah file minimum
    if (arr.length < minFiles) {
      const msg = `Minimal ${minFiles} file${
        minFiles > 1 ? "s" : ""
      } untuk diproses`;
      setError(msg);
      onError?.(msg);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    // ✅ Validasi 2: jumlah file maksimum (0 = unlimited)
    if (maxFiles > 0 && arr.length > maxFiles) {
      const msg = `Maksimal ${maxFiles} file per proses`;
      setError(msg);
      onError?.(msg);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    // ✅ Validasi 3: ukuran
    const tooLarge = arr.filter((f) => f.size > maxSize);
    if (tooLarge.length > 0) {
      const msg = `File terlalu besar (maks ${formatSize(maxSize)}): ${tooLarge
        .map((f) => f.name)
        .join(", ")}`;
      setError(msg);
      onError?.(msg);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    // ✅ Validasi 4: file kosong
    const empty = arr.filter((f) => f.size === 0);
    if (empty.length > 0) {
      const msg = `File kosong: ${empty.map((f) => f.name).join(", ")}`;
      setError(msg);
      onError?.(msg);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    onFilesSelected?.(arr);

    // ✅ Reset input supaya file yang sama bisa dipilih lagi
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    handleFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (disabled) return;
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  // Label ukuran
  const sizeLabel = formatSize(maxSize);

  // Label jumlah file
  const filesLabel =
    maxFiles === 0
      ? minFiles > 1
        ? `${minFiles}+ file`
        : "beberapa file"
      : minFiles === maxFiles
        ? `${minFiles} file`
        : `${minFiles}–${maxFiles} file`;

  return (
    <div className={cn("w-full", className)}>
      {/* Judul + deskripsi */}
      {(title || description) && (
        <div className="mb-8 text-center">
          {title && (
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              {title}
            </h1>
          )}
          {description && (
            <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
              {description}
            </p>
          )}
        </div>
      )}

      {/* Dropzone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          "relative mx-auto max-w-4xl rounded-2xl border-2 border-dashed p-10 transition-colors sm:p-16",
          disabled && "pointer-events-none opacity-60",
          isDragging
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/30 bg-muted/20"
        )}
      >
        <div className="flex flex-col items-center justify-center text-center">
          {/* Tombol Pilih File + dropdown chevron */}
          <div className="inline-flex overflow-hidden rounded-lg shadow-sm">
            <button
              type="button"
              onClick={handleClick}
              disabled={disabled}
              className="inline-flex items-center gap-2 bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FilePlus2 className="h-5 w-5" />
              {buttonLabel}
            </button>
            <button
              type="button"
              aria-label="Opsi lain"
              disabled={disabled}
              className="inline-flex items-center border-l border-primary-foreground/20 bg-primary px-3 text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>

          {/* Hidden input */}
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            multiple={multiple}
            disabled={disabled}
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />

          {/* Info limit + Mendaftar */}
          <p className="mt-5 text-sm text-muted-foreground">
            {filesLabel} · Maks {sizeLabel} per file.{" "}
            <Link
              href="/signup"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Mendaftar
            </Link>{" "}
            untuk lebih lanjut
          </p>

          {/* ✅ Error message */}
          {error && (
            <div className="mt-4 flex items-start gap-2 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-2 text-sm text-destructive">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span className="text-left">{error}</span>
            </div>
          )}

          {/* Disclaimer */}
          <p className="mx-auto mt-4 max-w-2xl text-xs leading-relaxed text-muted-foreground sm:text-sm">
            Dengan melanjutkan, Anda mengonfirmasi bahwa Anda memiliki hak atas
            file yang Anda unggah dan menyetujui{" "}
            <Link
              href="/terms"
              className="underline underline-offset-4 hover:text-foreground"
            >
              Ketentuan Penggunaan
            </Link>{" "}
            kami.
          </p>

          {/* Icon dekoratif (muncul saat dragging) */}
          {isDragging && !disabled && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-2xl bg-primary/10">
              <div className="flex flex-col items-center gap-2 text-primary">
                <UploadCloud className="h-12 w-12" />
                <span className="text-sm font-medium">
                  Lepaskan file di sini
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// HELPER
// ============================================================================

function formatSize(bytes: number): string {
  if (bytes >= 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)}GB`;
  }
  if (bytes >= 1024 * 1024) {
    return `${Math.round(bytes / (1024 * 1024))}MB`;
  }
  if (bytes >= 1024) {
    return `${Math.round(bytes / 1024)}KB`;
  }
  return `${bytes}B`;
}