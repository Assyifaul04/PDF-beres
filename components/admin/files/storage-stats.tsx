// components/admin/files/storage-stats.tsx
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

export async function StorageStats() {
  const stats = await getFilesStats();

  const total = stats.supabaseCount + stats.driveCount || 1;
  const supabasePct = Math.round((stats.supabaseCount / total) * 100);
  const drivePct = Math.round((stats.driveCount / total) * 100);

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Supabase</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.supabaseCount.toLocaleString("id-ID")}
          </div>
          <p className="text-xs text-muted-foreground">
            {supabasePct}% dari total file
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Google Drive</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.driveCount.toLocaleString("id-ID")}
          </div>
          <p className="text-xs text-muted-foreground">
            {drivePct}% dari total file
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Total Size</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatBytes(stats.totalBytes)}
          </div>
          <p className="text-xs text-muted-foreground">
            Akumulasi semua file
          </p>
        </CardContent>
      </Card>
    </div>
  );
}