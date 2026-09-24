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
import { FileText, Download, Inbox } from "lucide-react";
import { cn } from "@/lib/utils";

// ============================================================================
// TYPES
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

  /** Controlled mode */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;

  /** Uncontrolled mode (opsional) */
  defaultOpen?: boolean;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function ShowFilesDialog({
  inputFiles,
  outputFiles,
  isCompleted,
  open,
  onOpenChange,
  defaultOpen = false,
}: ShowFilesDialogProps) {
  // Mendukung controlled & uncontrolled
  const isControlled = open !== undefined;
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen);

  const actualOpen = isControlled ? open : internalOpen;
  const setOpen = React.useCallback(
    (next: boolean) => {
      if (!isControlled) setInternalOpen(next);
      onOpenChange?.(next);
    },
    [isControlled, onOpenChange]
  );

  const totalFiles = inputFiles.length + outputFiles.length;

  return (
    <Dialog open={actualOpen} onOpenChange={setOpen}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Daftar File</DialogTitle>
          <DialogDescription>
            {isCompleted
              ? `${totalFiles} file terkait tugas ini.`
              : "File input untuk tugas ini."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* ===================== INPUT FILES ===================== */}
          <FileSection
            title="File Input"
            files={inputFiles.map((f) => ({
              id: f.fileId,
              name: f.originalName,
              size: Number(f.sizeBytes),
              mime: f.mimeType,
            }))}
          />

          {/* ===================== OUTPUT FILES ===================== */}
          {isCompleted && outputFiles.length > 0 && (
            <FileSection
              title="File Output"
              files={outputFiles.map((f) => ({
                id: f.fileId,
                name: f.originalName,
                size: Number(f.sizeBytes),
                mime: f.mimeType,
              }))}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================================
// SUB-COMPONENT
// ============================================================================

interface FileItem {
  id: string;
  name: string;
  size: number;
  mime: string;
}

function FileSection({
  title,
  files,
}: {
  title: string;
  files: FileItem[];
}) {
  return (
    <div className="rounded-lg border">
      <div className="border-b bg-muted/40 px-3 py-2">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {title}
        </p>
      </div>

      {files.length === 0 ? (
        <div className="flex items-center gap-2 px-3 py-4 text-sm text-muted-foreground">
          <Inbox className="h-4 w-4" />
          Tidak ada file.
        </div>
      ) : (
        <ul className="divide-y">
          {files.map((f) => (
            <li
              key={f.id}
              className="flex items-center gap-3 px-3 py-2.5 text-sm"
            >
              <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="min-w-0 flex-1 truncate" title={f.name}>
                {f.name}
              </span>
              <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                {formatSize(f.size)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function formatSize(bytes: number): string {
  if (!bytes) return "0 B";
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${bytes} B`;
}