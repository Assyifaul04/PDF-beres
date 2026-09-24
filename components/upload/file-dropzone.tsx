// components/upload/file-dropzone.tsx
"use client";

import * as React from "react";
import Image from "next/image"; // Tambahkan import next/image
import { AlertCircle, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type FileDropzoneProps = {
  title?: string;
  description?: string;
  maxSize?: number;
  accept?: string;
  minFiles?: number;
  maxFiles?: number;
  multiple?: boolean;
  onFilesSelected?: (files: File[]) => void;
  onError?: (message: string) => void;
  buttonLabel?: string;
  disabled?: boolean;
  className?: string;
};

export function FileDropzone({
  title = "Kompres file PDF",
  description = "Kurangi ukuran file dengan tetap mengoptimalkan kualitas PDF maksimal.",
  maxSize = 1024 * 1024 * 1024,
  accept = "application/pdf",
  minFiles = 1,
  maxFiles = 1,
  multiple = false,
  onFilesSelected,
  onError,
  buttonLabel = "Pilih file PDF",
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

  const handleCloudClick = (provider: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Mencegah trigger area dropzone
    toast.info(`Integrasi ${provider} segera hadir`);
  };

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setError(null);
    const arr = Array.from(files);

    if (arr.length < minFiles) {
      const msg = `Minimal ${minFiles} file untuk diproses`;
      setError(msg);
      onError?.(msg);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    if (maxFiles > 0 && arr.length > maxFiles) {
      const msg = `Maksimal ${maxFiles} file per proses`;
      setError(msg);
      onError?.(msg);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

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

    const empty = arr.filter((f) => f.size === 0);
    if (empty.length > 0) {
      const msg = `File kosong: ${empty.map((f) => f.name).join(", ")}`;
      setError(msg);
      onError?.(msg);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    onFilesSelected?.(arr);
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

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={cn(
        "relative flex min-h-[500px] w-full flex-col items-center justify-center px-4 py-20 text-center transition-colors",
        className,
        isDragging && "bg-primary/5"
      )}
    >
      {/* Judul & Deskripsi */}
      {(title || description) && (
        <div className="mb-12">
          {title && (
            <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-[54px]">
              {title}
            </h1>
          )}
          {description && (
            <p className="mx-auto mt-5 max-w-2xl text-pretty text-lg font-medium text-muted-foreground md:text-xl">
              {description}
            </p>
          )}
        </div>
      )}

      {/* Area Tombol */}
      <div className="relative z-10 flex flex-col items-center justify-center">
        <div className="flex items-center gap-2">
          {/* Tombol Utama */}
          <button
            type="button"
            onClick={handleClick}
            disabled={disabled}
            className="flex h-20 items-center justify-center rounded-xl bg-[#e5322d] px-10 text-2xl font-bold text-white shadow-lg transition-all hover:bg-[#d02925] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70 sm:px-14 sm:text-[28px]"
          >
            {buttonLabel}
          </button>

          {/* Tombol Eksternal (Drive & Dropbox) dengan Gambar PNG */}
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={(e) => handleCloudClick("Google Drive", e)}
              className="group flex h-9 w-9 items-center justify-center rounded-full bg-[#e5322d] text-white shadow-md transition-all hover:bg-[#d02925] active:scale-95"
              title="Pilih dari Google Drive"
            >
              <Image
                src="/image/drive.png"
                alt="Google Drive"
                width={20}
                height={20}
                className="object-contain" // Pastikan gambar tidak terdistorsi
              />
            </button>
            <button
              type="button"
              onClick={(e) => handleCloudClick("Dropbox", e)}
              className="group flex h-9 w-9 items-center justify-center rounded-full bg-[#e5322d] text-white shadow-md transition-all hover:bg-[#d02925] active:scale-95"
              title="Pilih dari Dropbox"
            >
              <Image
                src="/image/dropbox.png"
                alt="Dropbox"
                width={20}
                height={20}
                className="object-contain" // Pastikan gambar tidak terdistorsi
              />
            </button>
          </div>
        </div>

        <p className="mt-5 text-sm font-medium text-muted-foreground">
          atau jatuhkan PDF di sini
        </p>

        {/* Input Tersembunyi */}
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {/* Error Alert */}
      {error && (
        <div
          role="alert"
          className="mt-8 flex max-w-xl items-start gap-2.5 rounded-lg border border-destructive/40 bg-destructive/5 px-5 py-3 text-sm font-medium text-destructive"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span className="break-words text-left">{error}</span>
        </div>
      )}

      {/* Overlay Drag & Drop */}
      {isDragging && !disabled && (
        <div className="pointer-events-none absolute inset-0 z-50 flex items-center justify-center border-4 border-dashed border-primary bg-background/80 backdrop-blur-sm transition-all">
          <div className="flex flex-col items-center gap-4 text-primary animate-in zoom-in-95">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
              <UploadCloud className="h-10 w-10" />
            </div>
            <span className="text-2xl font-bold">Lepaskan file di sini</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// HELPERS
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