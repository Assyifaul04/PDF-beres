import { prisma } from "@/lib/prisma";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  FolderIcon,
  CheckCircleIcon,
  StackIcon,
  SortAscendingIcon,
} from "@phosphor-icons/react/dist/ssr";

export async function CategoriesStats() {
  const [total, active, totalMenus, maxOrder] = await Promise.all([
    prisma.toolCategory.count(),
    prisma.toolCategory.count({ where: { isActive: true } }),
    prisma.toolMenu.count(),
    prisma.toolCategory.aggregate({ _max: { order: true } }),
  ]);

  const stats = [
    {
      title: "Total Categories",
      value: total.toLocaleString("id-ID"),
      icon: FolderIcon,
      color: "text-blue-600",
    },
    {
      title: "Active",
      value: active.toLocaleString("id-ID"),
      icon: CheckCircleIcon,
      color: "text-emerald-600",
    },
    {
      title: "Total Menus",
      value: totalMenus.toLocaleString("id-ID"),
      icon: StackIcon,
      color: "text-purple-600",
    },
    {
      title: "Max Order",
      value: (maxOrder._max.order ?? 0).toString(),
      icon: SortAscendingIcon,
      color: "text-amber-600",
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