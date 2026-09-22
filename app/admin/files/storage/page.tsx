// app/admin/files/storage/page.tsx
import { Suspense } from "react";
import { StorageStats } from "@/components/admin/files/storage-stats";
import { StorageTable } from "@/components/admin/files/storage-table";

export const metadata = {
  title: "Files by Storage | Admin",
  description: "Supabase vs Google Drive",
};

export default function FilesStoragePage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Files by Storage</h1>
        <p className="text-muted-foreground">
          Distribusi file antara Supabase dan Google Drive
        </p>
      </div>

      <Suspense fallback={<div className="h-28" />}>
        <StorageStats />
      </Suspense>

      <Suspense fallback={<div className="h-96 animate-pulse rounded-lg border" />}>
        <StorageTable />
      </Suspense>
    </div>
  );
}