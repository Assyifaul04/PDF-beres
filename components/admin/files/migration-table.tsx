// components/admin/files/migration-table.tsx
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
import { MigrationRowActions } from "./migration-row-actions";

export async function MigrationTable() {
  const files = await prisma.file.findMany({
    where: {
      migrationStatus: { in: ["TEMP", "PROCESSING", "FAILED"] },
    },
    orderBy: [{ migrationStatus: "asc" }, { moveToDriveAt: "asc" }],
    take: 100,
    include: {
      user: { select: { name: true, email: true } },
    },
  });

  if (files.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-12 text-center">
        <p className="text-muted-foreground">
          Tidak ada file dalam antrian migrasi 🎉
        </p>
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
            <TableHead>Status</TableHead>
            <TableHead>Jadwal Migrasi</TableHead>
            <TableHead className="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {files.map((file) => (
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
              <TableCell>
                <Badge
                  variant={
                    file.migrationStatus === "FAILED"
                      ? "destructive"
                      : file.migrationStatus === "PROCESSING"
                        ? "default"
                        : "outline"
                  }
                >
                  {file.migrationStatus}
                </Badge>
              </TableCell>
              <TableCell className="text-xs text-muted-foreground">
                {new Date(file.moveToDriveAt).toLocaleString("id-ID")}
              </TableCell>
              <TableCell className="text-right">
                <MigrationRowActions
                  id={file.id}
                  status={file.migrationStatus}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}