import { prisma } from "@/lib/prisma";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  StackIcon,
  FolderIcon,
  CheckCircleIcon,
  LinkIcon,
} from "@phosphor-icons/react/dist/ssr";

export async function ToolMenusStats() {
  const [totalMenus, totalCategories, activeMenus, mappedMenus] =
    await Promise.all([
      prisma.toolMenu.count(),
      prisma.toolCategory.count(),
      prisma.toolMenu.count({ where: { isActive: true } }),
      prisma.toolMenu.count({ where: { toolType: { not: null } } }),
    ]);

  const stats = [
    {
      title: "Total Menus",
      value: totalMenus.toLocaleString("id-ID"),
      icon: StackIcon,
      color: "text-blue-600",
    },
    {
      title: "Categories",
      value: totalCategories.toLocaleString("id-ID"),
      icon: FolderIcon,
      color: "text-purple-600",
    },
    {
      title: "Active Menus",
      value: activeMenus.toLocaleString("id-ID"),
      icon: CheckCircleIcon,
      color: "text-emerald-600",
    },
    {
      title: "Tool Type Mapped",
      value: mappedMenus.toLocaleString("id-ID"),
      icon: LinkIcon,
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