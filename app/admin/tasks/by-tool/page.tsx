// app/admin/tasks/by-tool/page.tsx
import { Suspense } from "react";
import { ToolTypeStats } from "@/components/admin/tasks/tool-type-stats";
import { ToolTypeTable } from "@/components/admin/tasks/tool-type-table";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Tasks by Tool Type | Admin",
  description: "Kelompokkan task per ToolType",
};

export default function TasksByToolPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">By Tool Type</h1>
        <p className="text-muted-foreground">
          Distribusi task berdasarkan jenis tool konversi
        </p>
      </div>

      <Suspense fallback={<div className="h-28" />}>
        <ToolTypeStats />
      </Suspense>

      <Suspense
        fallback={<div className="h-96 animate-pulse rounded-lg border" />}
      >
        <ToolTypeTable />
      </Suspense>
    </div>
  );
}