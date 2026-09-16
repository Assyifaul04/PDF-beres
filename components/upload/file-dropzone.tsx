// components/upload/file-dropzone.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import { FilePlus2, ChevronDown, UploadCloud } from "lucide-react";
import { cn } from "@/lib/utils";

type FileDropzoneProps = {
  /** Judul utama di atas dropzone */
  title?: string;
  /** Deskripsi di bawah judul */
  description?: string;
  /** Maksimum ukuran file (dalam bytes). Default 1GB */
  maxSize?: number;
  /** Terima tipe file tertentu, contoh: "application/pdf" */
  accept?: string;
  /** Callback saat file dipilih */
  onFilesSelected?: (files: File[]) => void;
  /** Label tombol utama */
  buttonLabel?: string;
  className?: string;
};

export function FileDropzone({
  title = "Pilih file untuk memulai",
  description = "Seret & lepas file di sini, atau klik tombol di bawah.",
  maxSize = 1024 * 1024 * 1024, // 1GB
  accept = "application/pdf",
  onFilesSelected,
  buttonLabel = "Pilih File",
  className,
}: FileDropzoneProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = React.useState(false);

  const handleClick = () => inputRef.current?.click();

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const arr = Array.from(files);
    onFilesSelected?.(arr);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  // Format ukuran
  const sizeLabel =
    maxSize >= 1024 * 1024 * 1024
      ? `${maxSize / (1024 * 1024 * 1024)}GB`
      : `${Math.round(maxSize / (1024 * 1024))}MB`;

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
              className="inline-flex items-center gap-2 bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              <FilePlus2 className="h-5 w-5" />
              {buttonLabel}
            </button>
            <button
              type="button"
              aria-label="Opsi lain"
              className="inline-flex items-center border-l border-primary-foreground/20 bg-primary px-3 text-primary-foreground transition-opacity hover:opacity-90"
            >
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>

          {/* Hidden input */}
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />

          {/* Info limit + Mendaftar */}
          <p className="mt-5 text-sm text-muted-foreground">
            Ukuran file maksimum {sizeLabel}.{" "}
            <Link
              href="/signup"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Mendaftar
            </Link>{" "}
            untuk lebih lanjut
          </p>

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
          {isDragging && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-2xl bg-primary/10">
              <div className="flex flex-col items-center gap-2 text-primary">
                <UploadCloud className="h-12 w-12" />
                <span className="text-sm font-medium">Lepaskan file di sini</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}