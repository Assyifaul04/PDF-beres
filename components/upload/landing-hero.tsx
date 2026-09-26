// components/upload/landing-hero.tsx
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FileDropzone } from "@/components/upload/file-dropzone";
import { FileReadyWorkspace } from "@/components/upload/file-ready-card";
import type { UploadedFile } from "@/components/upload/file-ready-card";
import type { ToolSettings } from "@/lib/tools/settings";

interface OutputOption {
  value: string;
  label: string;
}

interface Props {
  slug: string;
  title: string;
  description: string;
  accept: string;
  multiple: boolean;
  minFiles: number;
  maxFiles: number;
  toolType: string;
  maxSize?: number;
  outputOptions?: OutputOption[];
  processLabel?: string;
}

export function LandingHero({
  slug,
  title,
  description,
  accept,
  multiple,
  minFiles,
  maxFiles,
  toolType,
  maxSize = 1024 * 1024 * 1024,
  outputOptions,
  processLabel = "Mengubah",
}: Props) {
  const router = useRouter();

  const [uploadedFiles, setUploadedFiles] = React.useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = React.useState(false);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [progress, setProgress] = React.useState(0);

  const hiddenInputRef = React.useRef<HTMLInputElement>(null);

  const handleFilesSelected = async (files: File[]) => {
    if (files.length === 0) return;

    const totalFiles = uploadedFiles.length + files.length;

    if (totalFiles < minFiles) {
      toast.error(`Minimal ${minFiles} file`);
      return;
    }
    if (maxFiles > 0 && totalFiles > maxFiles) {
      toast.error(`Maksimal ${maxFiles} file`);
      return;
    }

    setIsUploading(true);
    setProgress(0);

    try {
      const formData = new FormData();
      files.forEach((f) => formData.append("files", f));
      formData.append("toolType", toolType);

      const result = await uploadWithProgress(formData, setProgress);

      setUploadedFiles((prev) => [...prev, ...result.files]);
      toast.success(`${result.files.length} file berhasil diunggah`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload gagal";
      toast.error(message);
    } finally {
      setIsUploading(false);
      setProgress(0);
    }
  };

  const handleRemoveFile = async (fileId: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.fileId !== fileId));
    fetch(`/api/files/${fileId}`, { method: "DELETE" }).catch(() => null);
  };

  // Handler untuk mengubah urutan file setelah dipindah (Drag & Drop)
  const handleReorderFiles = (reorderedFiles: UploadedFile[]) => {
    setUploadedFiles(reorderedFiles);
  };

  // Handler untuk memutar rotasi gambar PDF (0° -> 90° -> 180° -> 270°)
  const handleRotateFile = (fileId: string) => {
    setUploadedFiles((prev) =>
      prev.map((f) => {
        if (f.fileId === fileId) {
          const currentRotation = f.rotation || 0;
          return { ...f, rotation: (currentRotation + 90) % 360 };
        }
        return f;
      })
    );
  };

  const handleAddMore = () => {
    hiddenInputRef.current?.click();
  };

  const handleHiddenInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    handleFilesSelected(Array.from(files));
    if (hiddenInputRef.current) hiddenInputRef.current.value = "";
  };

  const handleProcess = async (settings: ToolSettings) => {
    if (uploadedFiles.length === 0) return;

    if (uploadedFiles.length < minFiles) {
      toast.error(`Tambahkan ${minFiles - uploadedFiles.length} file lagi untuk melanjutkan`);
      return;
    }

    setIsProcessing(true);

    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toolType,
          fileIds: uploadedFiles.map((f) => f.fileId),
          settings: {
            ...settings,
            // Mengirim urutan file terbaru dan rotasinya ke backend
            fileOrders: uploadedFiles.map((f) => ({
              fileId: f.fileId,
              rotation: f.rotation || 0,
            })),
          },
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error ?? "Gagal membuat task");
      }

      const taskId = json.data.taskId;

      router.push(`/process/${taskId}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Gagal memproses";
      toast.error(message);
      setIsProcessing(false);
    }
  };

  if (uploadedFiles.length > 0) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <input
          ref={hiddenInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          className="hidden"
          onChange={handleHiddenInputChange}
        />

        <FileReadyWorkspace
          files={uploadedFiles}
          title={title}
          toolType={toolType as any}
          onRemove={handleRemoveFile}
          onReorder={handleReorderFiles}
          onRotate={handleRotateFile}
          onProcess={handleProcess}
          onAddMore={handleAddMore}
          isProcessing={isProcessing}
          processLabel={processLabel}
        />

        {isUploading && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-4">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              <p className="text-base font-medium text-foreground">Mengunggah... {progress}%</p>
              <div className="h-2.5 w-64 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <FileDropzone
        title={title}
        description={description}
        accept={accept}
        maxSize={maxSize}
        multiple={multiple}
        minFiles={minFiles}
        maxFiles={maxFiles}
        onFilesSelected={handleFilesSelected}
        disabled={isUploading}
      />

      {isUploading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center rounded-3xl bg-background/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-base font-medium text-foreground">Mengunggah... {progress}%</p>
            <div className="h-2.5 w-64 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface UploadResponse {
  success: boolean;
  data: { files: UploadedFile[] };
  error?: string;
}

function uploadWithProgress(
  formData: FormData,
  onProgress: (pct: number) => void
): Promise<{ files: UploadedFile[] }> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable) {
        const pct = Math.round((e.loaded / e.total) * 100);
        onProgress(pct);
      }
    });

    xhr.addEventListener("load", () => {
      try {
        const json: UploadResponse = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300 && json.success) {
          resolve(json.data);
        } else {
          reject(new Error(json.error ?? "Upload gagal"));
        }
      } catch {
        reject(new Error("Response tidak valid"));
      }
    });

    xhr.addEventListener("error", () => reject(new Error("Network error")));
    xhr.addEventListener("abort", () => reject(new Error("Upload dibatalkan")));

    xhr.open("POST", "/api/upload");
    xhr.send(formData);
  });
}