// components/admin/files/migration-stats.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getFilesStats } from "@/lib/queries/files";

export async function MigrationStats() {
  const stats = await getFilesStats();

  const cards = [
    { title: "TEMP", value: stats.tempCount, color: "text-muted-foreground" },
    { title: "PROCESSING", value: stats.processingCount, color: "text-blue-500" },
    { title: "COMPLETED", value: stats.completedCount, color: "text-green-600" },
    { title: "FAILED", value: stats.failedCount, color: "text-destructive" },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((c) => (
        <Card key={c.title}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{c.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${c.color}`}>
              {c.value.toLocaleString("id-ID")}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}