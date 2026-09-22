// components/admin/files/storage-table.tsx
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

export async function StorageTable() {
  const groups = await prisma.file.groupBy({
    by: ["storageProvider"],
    _count: { _all: true },
    _sum: { sizeBytes: true },
  });

  if (groups.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-12 text-center">
        <p className="text-muted-foreground">Belum ada file</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Provider</TableHead>
            <TableHead className="text-center">Jumlah File</TableHead>
            <TableHead className="text-right">Total Size</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {groups.map((g) => (
            <TableRow key={g.storageProvider}>
              <TableCell>
                <Badge
                  variant={
                    g.storageProvider === "SUPABASE" ? "outline" : "default"
                  }
                >
                  {g.storageProvider === "SUPABASE"
                    ? "Supabase"
                    : "Google Drive"}
                </Badge>
              </TableCell>
              <TableCell className="text-center">
                {g._count._all.toLocaleString("id-ID")}
              </TableCell>
              <TableCell className="text-right">
                {formatBytes(g._sum.sizeBytes ?? BigInt(0))}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function formatBytes(bytes: bigint): string {
  const n = Number(bytes);
  if (n === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(n) / Math.log(k));
  return `${(n / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}