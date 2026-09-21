import { Suspense } from "react";
import { ToolMenusStats } from "@/components/admin/tool-menus/tool-menus-stats";
import { ToolMenusFilters } from "@/components/admin/tool-menus/tool-menus-filters";
import { ToolMenusTable } from "@/components/admin/tool-menus/tool-menus-table";
import { ToolMenusTableSkeleton } from "@/components/admin/tool-menus/tool-menus-table-skeleton";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlusIcon } from "@phosphor-icons/react/dist/ssr";

type SearchParams = Promise<{
  categoryId?: string;
  isActive?: string;
  q?: string;
  page?: string;
}>;

export const metadata = {
  title: "Tool Menus | Admin",
  description: "Kelola semua menu tool",
};

export default async function ToolMenusPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tool Menus</h1>
          <p className="text-muted-foreground">
            Kelola ToolMenu: judul, href, icon, urutan, dan status aktif
          </p>
        </div>
        <Link
          href="/admin/tool-menus/new"
          className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
        >
          <PlusIcon className="mr-2 h-4 w-4" />
          Tambah Menu
        </Link>
      </div>

      <Suspense fallback={<div className="h-28" />}>
        <ToolMenusStats />
      </Suspense>

      <ToolMenusFilters
        categories={[]}
        currentCategoryId={params.categoryId}
        currentIsActive={params.isActive}
        currentQuery={params.q}
      />

      <Suspense fallback={<ToolMenusTableSkeleton />}>
        <ToolMenusTable
          categoryId={params.categoryId}
          isActive={params.isActive}
          query={params.q}
          page={Number(params.page) || 1}
        />
      </Suspense>
    </div>
  );
}