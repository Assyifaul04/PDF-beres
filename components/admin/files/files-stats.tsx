// components/admin/files/files-stats.tsx
import {
  FilesIcon,
  DatabaseIcon,
  ClockIcon,
  WarningCircleIcon,
} from "@phosphor-icons/react/dist/ssr";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getFilesStats } from "@/lib/queries/files";

function formatBytes(bytes: bigint): string {
  const n = Number(bytes);
  if (n === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(n) / Math.log(k));
  return `${(n / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

export async function FilesStats() {
  const stats = await getFilesStats();

  const cards = [
    {
      title: "Total Files",
      value: stats.total.toLocaleString("id-ID"),
      subtitle: `Total ukuran: ${formatBytes(stats.totalBytes)}`,
      icon: <FilesIcon className="h-5 w-5 text-muted-foreground" />,
    },
    {
      title: "Supabase",
      value: stats.supabaseCount.toLocaleString("id-ID"),
      subtitle: "File di Supabase Storage",
      icon: <DatabaseIcon className="h-5 w-5 text-blue-500" />,
    },
    {
      title: "Google Drive",
      value: stats.driveCount.toLocaleString("id-ID"),
      subtitle: "File sudah dipindah ke Drive",
      icon: <DatabaseIcon className="h-5 w-5 text-green-500" />,
    },
    {
      title: "Expired",
      value: stats.expiredCount.toLocaleString("id-ID"),
      subtitle: "Melewati expiresAt",
      icon: <WarningCircleIcon className="h-5 w-5 text-destructive" />,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((c) => (
        <Card key={c.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{c.title}</CardTitle>
            {c.icon}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{c.value}</div>
            <p className="text-xs text-muted-foreground">{c.subtitle}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}