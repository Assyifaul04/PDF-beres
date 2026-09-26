// components/upload/file-ready-card.tsx
"use client";

import * as React from "react";
import { ToolType } from "@prisma/client";
import {
  X,
  ArrowRight,
  Loader2,
  Plus,
  Info,
  RotateCw,
  FileWarning,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ToolControlsPanel } from "./tool-controls-panel";
import { ToolSettings, getDefaultToolSettings } from "@/lib/tools/settings";
import { PdfPreview } from "@/components/process/pdf-preview";

export interface UploadedFile {
  fileId: string;
  fileKey: string;
  originalName: string;
  sizeBytes: string;
  mimeType: string;
  url?: string;
  rotation?: number;
}

interface Props {
  files: UploadedFile[];
  title: string;
  toolType?: ToolType;
  onRemove: (fileId: string) => void;
  onReorder: (files: UploadedFile[]) => void;
  onRotate?: (fileId: string) => void;
  onProcess: (settings: ToolSettings) => void;
  onAddMore: () => void;
  isProcessing?: boolean;
  processLabel?: string;
  className?: string;
}

export function FileReadyWorkspace({
  files,
  title,
  toolType = "MERGE_PDF",
  onRemove,
  onReorder,
  onRotate,
  onProcess,
  onAddMore,
  isProcessing = false,
  processLabel = "Proses Dokumen",
  className,
}: Props) {
  const [toolSettings, setToolSettings] = React.useState<ToolSettings>(() =>
    getDefaultToolSettings(toolType)
  );

  const [draggedIndex, setDraggedIndex] = React.useState<number | null>(null);

  React.useEffect(() => {
    setToolSettings(getDefaultToolSettings(toolType));
  }, [toolType]);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newFiles = [...files];
    const draggedItem = newFiles[draggedIndex];

    newFiles.splice(draggedIndex, 1);
    newFiles.splice(index, 0, draggedItem);

    setDraggedIndex(index);
    onReorder(newFiles);
  };

  const handleDragEnd = () => setDraggedIndex(null);

  return (
    <div
      className={cn(
        "flex min-h-[560px] w-full flex-col overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-md transition-colors sm:flex-row",
        className
      )}
    >
      {/* ================= AREA FILE (KIRI) ================= */}
      <div className="relative flex-1 overflow-y-auto bg-muted/30 p-6 sm:p-8">
        {/* Floating Add Button */}
        <div className="absolute right-6 top-6 z-10">
          <button
            type="button"
            onClick={onAddMore}
            className="relative flex h-12 w-12 items-center justify-center rounded-full bg-red-600 text-white shadow-lg transition-transform hover:scale-105 hover:bg-red-700 active:scale-95"
            title="Tambah File"
          >
            <Plus className="h-6 w-6" />
            {files.length > 0 && (
              <span className="absolute -left-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-background bg-foreground text-[10px] font-bold text-background">
                {files.length}
              </span>
            )}
          </button>
        </div>

        {files.length === 0 ? (
          <div className="flex h-full min-h-[400px] flex-col items-center justify-center gap-3 text-center text-muted-foreground">
            <FileWarning className="h-10 w-10 opacity-40" />
            <p className="max-w-[220px] text-sm">
              Belum ada file. Tekan tombol{" "}
              <span className="font-semibold text-foreground">+</span> untuk
              menambahkan dokumen.
            </p>
          </div>
        ) : (
          /* ================================================================= */
          /* GRID MASONRY — kartu lebar dengan preview PDF penuh              */
          /* ================================================================= */
          <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-6 pt-2">
            {files.map((file, index) => {
              const pdfUrl = file.url || `/api/files/${file.fileId}`;

              return (
                <div
                  key={file.fileId}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                  className={cn(
                    "group relative cursor-grab select-none transition-all duration-200 active:cursor-grabbing",
                    draggedIndex === index && "scale-95 opacity-40"
                  )}
                >
                  {/* FLOATING ACTION BUTTONS */}
                  <div className="absolute right-2 top-2 z-20 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    {onRotate && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRotate(file.fileId);
                        }}
                        className="flex h-7 w-7 items-center justify-center rounded-full bg-red-600 text-white shadow-md hover:bg-red-700 active:scale-90"
                        title="Rotate"
                      >
                        <RotateCw className="h-3.5 w-3.5" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemove(file.fileId);
                      }}
                      className="flex h-7 w-7 items-center justify-center rounded-full bg-muted-foreground/80 text-white shadow-md hover:bg-red-500 active:scale-90"
                      title="Hapus File"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  {/* NOMOR URUT */}
                  <div className="absolute -left-2 -top-2 z-20 flex h-6 w-6 items-center justify-center rounded-full bg-foreground text-[11px] font-bold text-background shadow">
                    {index + 1}
                  </div>

                  {/* ============================================== */}
                  {/* CARD DENGAN PREVIEW PDF PENUH                  */}
                  {/* ============================================== */}
                  <div className="flex flex-col rounded-xl border border-border bg-card p-3 shadow-sm transition-all hover:border-primary hover:shadow-md">
                    {/* Preview PDF — pakai PdfPreview bukan PdfThumbnail */}
                    <div className="w-full overflow-hidden rounded-lg border border-border/50 bg-muted/30">
                      <PdfPreview
                        url={pdfUrl}
                        rotation={file.rotation || 0}
                        containerWidth={220}
                        showPageCount
                      />
                    </div>

                    {/* Nama & ukuran */}
                    <div className="mt-3 flex w-full flex-col">
                      <span
                        className="line-clamp-1 text-center text-xs font-semibold text-foreground"
                        title={file.originalName}
                      >
                        {file.originalName}
                      </span>
                      <span className="text-center text-[10px] text-muted-foreground">
                        {formatSize(Number(file.sizeBytes))}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ================= PANEL KONTROL SIDEBAR (KANAN) ================= */}
      <div className="flex w-full shrink-0 flex-col border-t border-border bg-card sm:w-[320px] sm:border-l sm:border-t-0">
        <div className="flex items-center justify-center border-b border-border p-5">
          <h2 className="text-xl font-bold uppercase tracking-wide text-foreground">
            {title}
          </h2>
        </div>

        <div className="flex flex-1 flex-col space-y-6 overflow-y-auto p-5">
          <div className="flex items-start gap-3 rounded-lg border border-blue-500/20 bg-blue-500/10 p-3 text-xs text-blue-600 dark:text-blue-400">
            <Info className="mt-0.5 h-4 w-4 shrink-0" />
            <p className="leading-relaxed">
              Tekan dan tahan file untuk menggeser posisi file sesuai urutan
              yang diinginkan.
            </p>
          </div>

          <ToolControlsPanel
            toolType={toolType}
            settings={toolSettings}
            onChange={setToolSettings}
          />
        </div>

        <div className="border-t border-border bg-muted/20 p-5">
          <Button
            type="button"
            onClick={() => onProcess(toolSettings)}
            disabled={isProcessing || files.length === 0}
            className="h-14 w-full gap-2 rounded-lg bg-red-600 text-lg font-bold text-white transition-all hover:bg-red-700 hover:shadow-md active:scale-[0.98] disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Memproses...
              </>
            ) : (
              <>
                {processLabel}
                <ArrowRight className="h-5 w-5" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

function formatSize(bytes: number): string {
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }
  if (bytes >= 1024) {
    return `${(bytes / 1024).toFixed(2)} KB`;
  }
  return `${bytes} B`;
}