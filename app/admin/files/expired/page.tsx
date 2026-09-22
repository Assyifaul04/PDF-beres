// app/admin/files/expired/page.tsx
import { Suspense } from "react";
import { ExpiredStats } from "@/components/admin/files/expired-stats";
import { ExpiredTable } from "@/components/admin/files/expired-table";

export const metadata = {
  title: "Expired Files | Admin",
  description: "File melewati expiresAt",
};

export default function FilesExpiredPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Expired Files</h1>
        <p className="text-muted-foreground">
          File yang sudah melewati tanggal kedaluwarsa
        </p>
      </div>

      <Suspense fallback={<div className="h-28" />}>
        <ExpiredStats />
      </Suspense>

      <Suspense fallback={<div className="h-96 animate-pulse rounded-lg border" />}>
        <ExpiredTable />
      </Suspense>
    </div>
  );
}