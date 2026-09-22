// components/admin/tasks/task-files-list.tsx
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

interface FileItem {
  id: string;
  originalName: string;
  fileKey: string;
  mimeType: string;
  sizeBytes: bigint;
  storageProvider: string;
}

function formatBytes(bytes: bigint): string {
  const n = Number(bytes);
  if (n === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(n) / Math.log(k));
  return `${(n / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

interface Props {
  files: FileItem[];
  emptyMessage?: string;
}

export function TaskFilesList({
  files,
  emptyMessage = "Tidak ada file",
}: Props) {
  if (files.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-4 text-center">
        {emptyMessage}
      </p>
    );
  }

  return (
    <ul className="divide-y">
      {files.map((file) => (
        <li key={file.id} className="flex items-center justify-between py-3">
          <div className="min-w-0 flex-1">
            <p className="font-medium truncate">{file.originalName}</p>
            <p className="font-mono text-xs text-muted-foreground truncate">
              {file.fileKey}
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="text-muted-foreground">
              {formatBytes(file.sizeBytes)}
            </span>
            <Badge variant="outline">
              {file.storageProvider === "SUPABASE" ? "Supabase" : "Drive"}
            </Badge>
            <Link
              href={`/admin/files/${file.id}`}
              className="text-primary hover:underline"
            >
              Lihat
            </Link>
          </div>
        </li>
      ))}
    </ul>
  );
}