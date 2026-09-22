// components/process/show-files-dialog.tsx
"use client";

import * as React from "react";
import {
  FileText,
  Download,
  FileInput,
  FileOutput,
  ExternalLink,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface FileInfo {
  fileId: string;
  fileKey: string;
  originalName: string;
  mimeType: string;
  sizeBytes: string;
}

interface Props {
  inputFiles: FileInfo[];
  outputFiles: FileInfo[];
  /** Apakah output sudah siap (status COMPLETED) */
  isCompleted: boolean;
  /** Trigger button (children) */
  children: React.ReactNode;
  className?: string;
}

export function ShowFilesDialog({
  inputFiles,
  outputFiles,
  isCompleted,
  children,
  className,
}: Props) {
  const [open, setOpen] = React.useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className={cn(className)}>{children}</DialogTrigger>

      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Detail Files</DialogTitle>
          <DialogDescription>
            Daftar file input dan output untuk task ini
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-1">
          {/* ============================================================
              SECTION: INPUT FILES
              ============================================================ */}
          <div>
            <div className="mb-2 flex items-center gap-2">
              <FileInput className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold">
                File Input ({inputFiles.length})
              </h3>
            </div>

            <div className="space-y-2">
              {inputFiles.map((file) => (
                <FileRow
                  key={file.fileId}
                  file={file}
                  type="input"
                />
              ))}
            </div>
          </div>

          {/* ============================================================
              SECTION: OUTPUT FILES
              ============================================================ */}
          <div>
            <div className="mb-2 flex items-center gap-2">
              <FileOutput className="h-4 w-4 text-green-600" />
              <h3 className="text-sm font-semibold">
                File Output ({outputFiles.length})
              </h3>
            </div>

            {outputFiles.length === 0 ? (
              <div className="rounded-md border border-dashed bg-muted/20 p-4 text-center">
                <p className="text-xs text-muted-foreground">
                  {isCompleted
                    ? "Tidak ada output"
                    : "Output akan tersedia setelah proses selesai"}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {outputFiles.map((file) => (
                  <FileRow
                    key={file.fileId}
                    file={file}
                    type="output"
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        {outputFiles.length > 1 && (
          <div className="flex justify-end border-t pt-4">
            <Button
              onClick={() => {
                window.location.href = `/api/tasks/${
                  outputFiles[0]?.fileId
                }/download?zip=true`;
              }}
            >
              <Download className="mr-2 h-4 w-4" />
              Unduh Semua (ZIP)
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ============================================================================
// FILE ROW COMPONENT
// ============================================================================

interface FileRowProps {
  file: FileInfo;
  type: "input" | "output";
}

function FileRow({ file, type }: FileRowProps) {
  const sizeLabel = formatSize(Number(file.sizeBytes));

  return (
    <div className="flex items-center gap-3 rounded-md border bg-card px-3 py-2">
      {/* Icon */}
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-md",
          type === "input"
            ? "bg-muted text-muted-foreground"
            : "bg-green-600/10 text-green-600"
        )}
      >
        <FileText className="h-4 w-4" />
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{file.originalName}</p>
        <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
          <span>{sizeLabel}</span>
          <span>·</span>
          <span className="font-mono truncate">{file.mimeType}</span>
        </div>
      </div>

      {/* Actions */}
      {type === "output" && (
        <div className="flex shrink-0 items-center gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              window.location.href = `/api/files/${file.fileId}/download`;
            }}
            aria-label="Unduh file"
          >
            <Download className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              window.open(`/api/files/${file.fileId}/view`, "_blank");
            }}
            aria-label="Lihat file"
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
      )}

      {type === "input" && (
        <Badge variant="outline" className="shrink-0 text-[10px]">
          INPUT
        </Badge>
      )}
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