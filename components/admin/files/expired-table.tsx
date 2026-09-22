// components/admin/files/expired-table.tsx
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { prisma } from "@/lib/prisma";
import { FilesRowActions } from "./files-row-actions";

function formatBytes(bytes: bigint): string {
  const n = Number(bytes);
  if (n === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(n) / Math.log(k));
  return `${(n / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

export async function ExpiredTable() {
  const now = new Date();
  const files = await prisma.file.findMany({
    where: { expiresAt: { lt: now } },
    orderBy: { expiresAt: "asc" },
    take: 100,
    include: {
      user: { select: { name: true, email: true } },
    },
  });

  if (files.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-12 text-center">
        <p className="text-muted-foreground">Tidak ada file expired 🎉</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>File</TableHead>
            <TableHead>Owner</TableHead>
            <TableHead>Size</TableHead>
            <TableHead>Provider</TableHead>
            <TableHead>Expired Sejak</TableHead>
            <TableHead className="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {files.map((file) => {
            const daysAgo = Math.floor(
              (now.getTime() - new Date(file.expiresAt).getTime()) /
                (1000 * 60 * 60 * 24)
            );
            return (
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
                  {file.user?.email ?? (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="text-sm">
                  {formatBytes(file.sizeBytes)}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {file.storageProvider === "SUPABASE" ? "Supabase" : "Drive"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="destructive">{daysAgo} hari</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <FilesRowActions id={file.id} name={file.originalName} />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}