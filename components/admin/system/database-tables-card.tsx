// components/admin/system/database-tables-card.tsx
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getDatabaseHealth } from "@/lib/queries/system";

export async function DatabaseTablesCard() {
  const { counts } = await getDatabaseHealth();

  const tables = [
    { name: "users", label: "Users", count: counts.users, model: "User" },
    { name: "files", label: "Files", count: counts.files, model: "File" },
    {
      name: "document_tasks",
      label: "Document Tasks",
      count: counts.tasks,
      model: "DocumentTask",
    },
    {
      name: "tool_categories",
      label: "Tool Categories",
      count: counts.toolCategories,
      model: "ToolCategory",
    },
    {
      name: "tool_menus",
      label: "Tool Menus",
      count: counts.toolMenus,
      model: "ToolMenu",
    },
    {
      name: "system_logs",
      label: "System Logs",
      count: counts.logs,
      model: "SystemLog",
    },
  ];

  const total = tables.reduce((sum, t) => sum + t.count, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Table Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tabel</TableHead>
                <TableHead>Model</TableHead>
                <TableHead className="text-right">Rows</TableHead>
                <TableHead className="text-right">%</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tables.map((t) => {
                const pct =
                  total > 0 ? Math.round((t.count / total) * 100) : 0;
                return (
                  <TableRow key={t.name}>
                    <TableCell>
                      <p className="font-medium">{t.label}</p>
                      <p className="font-mono text-xs text-muted-foreground">
                        {t.name}
                      </p>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{t.model}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {t.count.toLocaleString("id-ID")}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="text-xs text-muted-foreground">
                        {pct}%
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })}
              <TableRow className="bg-muted/30 font-medium">
                <TableCell>Total</TableCell>
                <TableCell />
                <TableCell className="text-right font-mono">
                  {total.toLocaleString("id-ID")}
                </TableCell>
                <TableCell className="text-right">100%</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}