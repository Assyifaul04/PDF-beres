// app/admin/files/migration/page.tsx
import { Suspense } from "react";
import { MigrationStats } from "@/components/admin/files/migration-stats";
import { MigrationTable } from "@/components/admin/files/migration-table";

export const metadata = {
  title: "Migration Queue | Admin",
  description: "TEMP → PROCESSING → COMPLETED",
};

export default function FilesMigrationPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Migration Queue</h1>
        <p className="text-muted-foreground">
          File yang menunggu dipindah dari Supabase ke Google Drive
        </p>
      </div>

      <Suspense fallback={<div className="h-28" />}>
        <MigrationStats />
      </Suspense>

      <Suspense fallback={<div className="h-96 animate-pulse rounded-lg border" />}>
        <MigrationTable />
      </Suspense>
    </div>
  );
}