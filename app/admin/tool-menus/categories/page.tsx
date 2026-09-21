import { Suspense } from "react";
import Link from "next/link";
import { PlusIcon } from "@phosphor-icons/react/dist/ssr";
import { CategoriesTable } from "@/components/admin/tool-menus/categories-table";

export const metadata = {
  title: "Tool Categories | Admin",
  description: "Kelola kategori tool menu",
};

export default function CategoriesPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tool Categories</h1>
          <p className="text-muted-foreground">
            Kelola kategori untuk mengelompokkan tool menu
          </p>
        </div>
        <Link
          href="/admin/tool-menus/categories/new"
          className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
        >
          <PlusIcon className="mr-2 h-4 w-4" />
          Tambah Kategori
        </Link>
      </div>

      <Suspense fallback={<div className="h-96 animate-pulse rounded-lg border" />}>
        <CategoriesTable />
      </Suspense>
    </div>
  );
}