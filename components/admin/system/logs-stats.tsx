// components/admin/system/logs-stats.tsx
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getLogsStats } from "@/lib/queries/system";

export async function LogsStats() {
  const stats = await getLogsStats();

  const cards = [
    {
      title: "Total",
      value: stats.total,
      href: "/admin/system/logs",
      color: "",
    },
    {
      title: "Error",
      value: stats.errorTotal,
      href: "/admin/system/logs?level=error",
      color: "text-destructive",
    },
    {
      title: "Warning",
      value: stats.warnTotal,
      href: "/admin/system/logs?level=warn",
      color: "text-amber-600",
    },
    {
      title: "Info",
      value: stats.infoTotal,
      href: "/admin/system/logs?level=info",
      color: "text-blue-500",
    },
    {
      title: "Debug",
      value: stats.debugTotal,
      href: "/admin/system/logs?level=debug",
      color: "text-muted-foreground",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      {cards.map((c) => (
        <Link key={c.title} href={c.href}>
          <Card className="transition-colors hover:border-foreground/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">{c.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${c.color}`}>
                {c.value.toLocaleString("id-ID")}
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}