import { prisma } from "@/lib/prisma";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  UsersIcon,
  ShieldCheckIcon,
  CrownIcon,
  HardDriveIcon,
} from "@phosphor-icons/react/dist/ssr";

export async function UsersStats() {
  const [total, admins, premium, storageAgg] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: "ADMIN" } }),
    prisma.user.count({ where: { plan: "PREMIUM" } }),
    prisma.user.aggregate({
      _sum: { usedBytes: true, taskCount: true },
    }),
  ]);

  // ✅ Fix: gunakan BigInt(0) bukan 0n
  const totalStorage = Number(storageAgg._sum.usedBytes ?? BigInt(0));
  const totalTasks = storageAgg._sum.taskCount ?? 0;

  const stats = [
    {
      title: "Total Users",
      value: total.toLocaleString("id-ID"),
      icon: UsersIcon,
      color: "text-blue-600",
    },
    {
      title: "Admins",
      value: admins.toLocaleString("id-ID"),
      icon: ShieldCheckIcon,
      color: "text-purple-600",
    },
    {
      title: "Premium",
      value: premium.toLocaleString("id-ID"),
      icon: CrownIcon,
      color: "text-amber-600",
    },
    {
      title: "Total Storage",
      value: formatBytes(totalStorage),
      icon: HardDriveIcon,
      color: "text-emerald-600",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <stat.icon className={`h-5 w-5 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}