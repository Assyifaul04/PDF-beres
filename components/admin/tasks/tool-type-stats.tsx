// components/admin/tasks/tool-type-stats.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getTasksByToolType, getToolTypeLabel } from "@/lib/queries/tasks";

export async function ToolTypeStats() {
  const groups = await getTasksByToolType();

  const top5 = groups.slice(0, 5);
  const total = groups.reduce((sum, g) => sum + g._count._all, 0);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      {top5.map((g) => {
        const pct = total > 0 ? Math.round((g._count._all / total) * 100) : 0;
        return (
          <Card key={g.toolType}>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium truncate">
                {getToolTypeLabel(g.toolType)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {g._count._all.toLocaleString("id-ID")}
              </div>
              <p className="text-xs text-muted-foreground">
                {pct}% dari total task
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}