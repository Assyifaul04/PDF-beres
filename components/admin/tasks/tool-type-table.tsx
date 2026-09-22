// components/admin/tasks/tool-type-table.tsx
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
import { getTasksByToolType, getToolTypeLabel } from "@/lib/queries/tasks";

export async function ToolTypeTable() {
  const groups = await getTasksByToolType();
  const total = groups.reduce((sum, g) => sum + g._count._all, 0);

  if (groups.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-12 text-center">
        <p className="text-muted-foreground">Belum ada task</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tool Type</TableHead>
            <TableHead className="text-center">Total</TableHead>
            <TableHead className="text-center">Pending</TableHead>
            <TableHead className="text-center">Processing</TableHead>
            <TableHead className="text-center">Completed</TableHead>
            <TableHead className="text-center">Failed</TableHead>
            <TableHead className="text-center">%</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {groups.map((g) => {
            const pct = total > 0 ? Math.round((g._count._all / total) * 100) : 0;
            return (
              <TableRow key={g.toolType}>
                <TableCell className="font-medium">
                  <Link
                    href={`/admin/tasks?toolType=${g.toolType}`}
                    className="hover:underline"
                  >
                    {getToolTypeLabel(g.toolType)}
                  </Link>
                  <p className="font-mono text-xs text-muted-foreground">
                    {g.toolType}
                  </p>
                </TableCell>
                <TableCell className="text-center font-semibold">
                  {g._count._all.toLocaleString("id-ID")}
                </TableCell>
                <TableCell className="text-center">
                  <span className="text-xs text-muted-foreground">
                    {g.pending}
                  </span>
                </TableCell>
                <TableCell className="text-center">
                  <span className="text-xs text-blue-500">{g.processing}</span>
                </TableCell>
                <TableCell className="text-center">
                  <span className="text-xs text-green-600">
                    {g.completed}
                  </span>
                </TableCell>
                <TableCell className="text-center">
                  <span className="text-xs text-destructive">{g.failed}</span>
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant="outline">{pct}%</Badge>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}