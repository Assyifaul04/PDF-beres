// components/admin/system/logs-table.tsx
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getLogsList } from "@/lib/queries/system";
import { LogLevelBadge } from "./log-level-badge";
import { LogDetailSheet } from "./log-detail-sheet";

interface Props {
  query?: string;
  level?: string;
  action?: string;
  page: number;
}

export async function LogsTable({ query, level, action, page }: Props) {
  const result = await getLogsList({ q: query, level, action, page });

  if (result.items.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-12 text-center">
        <p className="text-muted-foreground">Tidak ada log ditemukan</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-24">Level</TableHead>
              <TableHead className="w-40">Action</TableHead>
              <TableHead>Message</TableHead>
              <TableHead className="w-44">Waktu</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {result.items.map((log) => (
              <TableRow key={log.id}>
                <TableCell>
                  <LogLevelBadge level={log.level} />
                </TableCell>
                <TableCell>
                  <span className="font-mono text-xs">{log.action}</span>
                </TableCell>
                <TableCell>
                  <p className="truncate max-w-2xl text-sm">{log.message}</p>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {new Date(log.createdAt).toLocaleString("id-ID")}
                </TableCell>
                <TableCell>
                  <LogDetailSheet log={log} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {result.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Halaman {result.page} dari {result.totalPages} ({result.total} log)
          </p>
          <div className="flex gap-2">
            {result.page > 1 && (
              <Link
                href={`/admin/system/logs?page=${result.page - 1}`}
                className="rounded-md border px-3 py-1.5 text-sm hover:bg-muted"
              >
                Sebelumnya
              </Link>
            )}
            {result.page < result.totalPages && (
              <Link
                href={`/admin/system/logs?page=${result.page + 1}`}
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