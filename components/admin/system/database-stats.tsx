// components/admin/system/database-stats.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDatabaseHealth } from "@/lib/queries/system";

export async function DatabaseStats() {
  const { counts } = await getDatabaseHealth();

  const cards = [
    { title: "Users", value: counts.users },
    { title: "Files", value: counts.files },
    { title: "Tasks", value: counts.tasks },
    { title: "Categories", value: counts.toolCategories },
    { title: "Tool Menus", value: counts.toolMenus },
    { title: "System Logs", value: counts.logs },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
      {cards.map((c) => (
        <Card key={c.title}>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              {c.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {c.value.toLocaleString("id-ID")}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}