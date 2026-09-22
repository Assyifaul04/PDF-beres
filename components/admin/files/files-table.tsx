// components/admin/files/files-table.tsx
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FilesRowActions } from "./files-row-actions";
import { getFilesList } from "@/lib/queries/files";
import { StorageProvider, MigrationStatus } from "@prisma/client";

function formatBytes(bytes: bigint): string {
  const n = Number(bytes);
  if (n === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(n) / Math.log(k));
  return `${(n / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

interface Props {
  query?: string;
  provider?: string;
  status?: string;
  page: number;
}

export async function FilesTable({ query, provider, status, page }: Props) {
  const result = await getFilesList({
    q: query,
    provider:
      provider &&
      Object.values(StorageProvider).includes(provider as StorageProvider)
        ? (provider as StorageProvider)
        : undefined,
    migrationStatus:
      status &&
      Object.values(MigrationStatus).includes(status as MigrationStatus)
        ? (status as MigrationStatus)
        : undefined,
    page,
  });

  if (result.items.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-12 text-center">
        <p className="text-muted-foreground">Tidak ada file ditemukan</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>File</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Provider</TableHead>
              <TableHead>Migration</TableHead>
              <TableHead>Expires</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {result.items.map((file) => (
              <TableRow key={file.id}>
                <TableCell>
                  <p className="font-medium truncate max-w-xs">
                    {file.originalName}
                  </p>
                  <p className="font-mono text-xs text-muted-foreground truncate max-w-xs">
                    {file.fileKey}
                  </p>
                </TableCell>
                <TableCell>
                  {file.user ? (
                    <div>
                      <p className="text-sm">{file.user.name ?? "—"}</p>
                      <p className="text-xs text-muted-foreground">
                        {file.user.email}
                      </p>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="text-sm">
                  {formatBytes(file.sizeBytes)}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {file.storageProvider === "SUPABASE"
                      ? "Supabase"
                      : "Drive"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      file.migrationStatus === "COMPLETED"
                        ? "default"
                        : file.migrationStatus === "FAILED"
                          ? "destructive"
                          : "outline"
                    }
                  >
                    {file.migrationStatus}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {new Date(file.expiresAt).toLocaleDateString("id-ID")}
                </TableCell>
                <TableCell className="text-right">
                  <FilesRowActions id={file.id} name={file.originalName} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {result.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Halaman {result.page} dari {result.totalPages} ({result.total} file)
          </p>
          <div className="flex gap-2">
            {result.page > 1 && (
              <Link
                href={`/admin/files?page=${result.page - 1}`}
                className="rounded-md border px-3 py-1.5 text-sm hover:bg-muted"
              >
                Sebelumnya
              </Link>
            )}
            {result.page < result.totalPages && (
              <Link
                href={`/admin/files?page=${result.page + 1}`}
                className="rounded-md border px-3 py-1.5 text-sm hover:bg-muted"
              >
                Selanjutnya
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}