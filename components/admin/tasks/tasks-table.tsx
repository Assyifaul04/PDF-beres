// components/admin/tasks/tasks-table.tsx
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
import { TasksRowActions } from "./tasks-row-actions";
import { getTasksList, getToolTypeLabel } from "@/lib/queries/tasks";
import { TaskStatus, ToolType } from "@prisma/client";

interface Props {
  query?: string;
  status?: string;
  toolType?: string;
  page: number;
}

export async function TasksTable({ query, status, toolType, page }: Props) {
  const result = await getTasksList({
    q: query,
    status:
      status && Object.values(TaskStatus).includes(status as TaskStatus)
        ? (status as TaskStatus)
        : undefined,
    toolType:
      toolType && Object.values(ToolType).includes(toolType as ToolType)
        ? (toolType as ToolType)
        : undefined,
    page,
  });

  if (result.items.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-12 text-center">
        <p className="text-muted-foreground">Tidak ada task ditemukan</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Task</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Files</TableHead>
              <TableHead>Dibuat</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {result.items.map((task) => (
              <TableRow key={task.id}>
                <TableCell>
                  <Link
                    href={`/admin/tasks/${task.id}`}
                    className="font-medium hover:underline"
                  >
                    {getToolTypeLabel(task.toolType)}
                  </Link>
                  <p className="font-mono text-xs text-muted-foreground">
                    {task.id.slice(0, 12)}...
                  </p>
                </TableCell>
                <TableCell>
                  {task.user ? (
                    <div>
                      <p className="text-sm">{task.user.name ?? "—"}</p>
                      <p className="text-xs text-muted-foreground">
                        {task.user.email}
                      </p>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      task.status === "COMPLETED"
                        ? "default"
                        : task.status === "FAILED"
                          ? "destructive"
                          : "outline"
                    }
                  >
                    {task.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <p className="text-xs text-muted-foreground">
                    In: {task._count.inputFiles} / Out:{" "}
                    {task._count.outputFiles}
                  </p>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {new Date(task.createdAt).toLocaleString("id-ID")}
                </TableCell>
                <TableCell className="text-right">
                  <TasksRowActions id={task.id} status={task.status} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {result.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Halaman {result.page} dari {result.totalPages} ({result.total} task)
          </p>
          <div className="flex gap-2">
            {result.page > 1 && (
              <Link
                href={`/admin/tasks?page=${result.page - 1}`}
                className="rounded-md border px-3 py-1.5 text-sm hover:bg-muted"
              >
                Sebelumnya
              </Link>
            )}
            {result.page < result.totalPages && (
              <Link
                href={`/admin/tasks?page=${result.page + 1}`}
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