// app/admin/files/page.tsx
import { Suspense } from "react";
import { FilesStats } from "@/components/admin/files/files-stats";
import { FilesFilters } from "@/components/admin/files/files-filters";
import { FilesTable } from "@/components/admin/files/files-table";
import { FilesTableSkeleton } from "@/components/admin/files/files-table-skeleton";

type SearchParams = Promise<{
  q?: string;
  provider?: string;
  status?: string;
  page?: string;
}>;

export const metadata = {
  title: "Files | Admin",
  description: "Kelola semua file di sistem",
};

export default async function FilesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Files</h1>
        <p className="text-muted-foreground">
          Semua file di sistem — filter, monitor, dan kelola
        </p>
      </div>

      <Suspense fallback={<div className="h-28" />}>
        <FilesStats />
      </Suspense>

      <FilesFilters
        currentQuery={params.q}
        currentProvider={params.provider}
        currentStatus={params.status}
      />

      <Suspense fallback={<FilesTableSkeleton />}>
        <FilesTable
          query={params.q}
          provider={params.provider}
          status={params.status}
          page={Number(params.page) || 1}
        />
      </Suspense>
    </div>
  );
}