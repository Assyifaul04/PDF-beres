// components/admin/files/expired-stats.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";

export async function ExpiredStats() {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [totalExpired, expiredLast7, expiredLast30, totalSize] =
    await Promise.all([
      prisma.file.count({ where: { expiresAt: { lt: now } } }),
      prisma.file.count({
        where: { expiresAt: { gte: sevenDaysAgo, lt: now } },
      }),
      prisma.file.count({
        where: { expiresAt: { gte: thirtyDaysAgo, lt: now } },
      }),
      prisma.file.aggregate({
        where: { expiresAt: { lt: now } },
        _sum: { sizeBytes: true },
      }),
    ]);

  function formatBytes(bytes: bigint): string {
    const n = Number(bytes);
    if (n === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(n) / Math.log(k));
    return `${(n / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  }

  const cards = [
    { title: "Total Expired", value: totalExpired },
    { title: "7 Hari Terakhir", value: expiredLast7 },
    { title: "30 Hari Terakhir", value: expiredLast30 },
    {
      title: "Total Size",
      value: formatBytes(totalSize._sum.sizeBytes ?? BigInt(0)),
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((c) => (
        <Card key={c.title}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{c.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {typeof c.value === "number"
                ? c.value.toLocaleString("id-ID")
                : c.value}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}