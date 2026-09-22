// components/admin/tasks/tasks-stats.tsx
import { getTasksStats } from "@/lib/queries/tasks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export async function TasksStats() {
  const stats = await getTasksStats();
  return (
    <div className="grid gap-4 md:grid-cols-5">
      {[
        { title: "Total", value: stats.total },
        { title: "Pending", value: stats.pending },
        { title: "Processing", value: stats.processing },
        { title: "Completed", value: stats.completed },
        { title: "Failed", value: stats.failed },
      ].map((c) => (
        <Card key={c.title}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{c.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{c.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}