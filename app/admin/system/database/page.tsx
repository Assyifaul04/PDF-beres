// app/admin/system/database/page.tsx
import { Suspense } from "react";
import { DatabaseStats } from "@/components/admin/system/database-stats";
import { DatabaseConnectionCard } from "@/components/admin/system/database-connection-card";
import { DatabaseTablesCard } from "@/components/admin/system/database-tables-card";
import { DatabaseCharts } from "@/components/admin/system/database-charts";

export const metadata = {
  title: "Database Status | Admin",
  description: "Kesehatan & koneksi database",
};

export default function DatabasePage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Database Status</h1>
        <p className="text-muted-foreground">
          Kesehatan koneksi, latensi, dan statistik tabel — auto-refresh
        </p>
      </div>

      {/* Connection + Stats — SSR */}
      <Suspense fallback={<div className="h-40 animate-pulse rounded-lg border" />}>
        <DatabaseConnectionCard />
      </Suspense>

      <Suspense fallback={<div className="h-28" />}>
        <DatabaseStats />
      </Suspense>

      {/* ✅ Grafik auto-refresh — Client */}
      <DatabaseCharts />

      {/* Tables detail — SSR */}
      <Suspense fallback={<div className="h-96 animate-pulse rounded-lg border" />}>
        <DatabaseTablesCard />
      </Suspense>
    </div>
  );
}