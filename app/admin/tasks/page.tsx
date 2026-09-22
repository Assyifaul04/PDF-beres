// app/admin/tasks/page.tsx
import { Suspense } from "react";
import { TasksStats } from "@/components/admin/tasks/tasks-stats";
import { TasksFilters } from "@/components/admin/tasks/tasks-filters";
import { TasksTable } from "@/components/admin/tasks/tasks-table";
import { TasksTableSkeleton } from "@/components/admin/tasks/tasks-table-skeleton";
import { TaskStatus } from "@prisma/client";

type SearchParams = Promise<{
  q?: string;
  status?: string;
  toolType?: string;
  page?: string;
}>;

export const metadata = {
  title: "Document Tasks | Admin",
  description: "Kelola semua task konversi",
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending",
  PROCESSING: "Processing",
  COMPLETED: "Completed",
  FAILED: "Failed",
};

export default async function TasksPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;

  const title = params.status
    ? `${STATUS_LABELS[params.status] ?? params.status} Tasks`
    : "Document Tasks";

  const subtitle = params.status
    ? `Task dengan status ${params.status}`
    : "Semua task konversi dari pengguna";

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <p className="text-muted-foreground">{subtitle}</p>
      </div>

      <Suspense fallback={<div className="h-28" />}>
        <TasksStats />
      </Suspense>

      <TasksFilters
        currentQuery={params.q}
        currentStatus={params.status}
        currentToolType={params.toolType}
      />

      <Suspense fallback={<TasksTableSkeleton />}>
        <TasksTable
          query={params.q}
          status={params.status}
          toolType={params.toolType}
          page={Number(params.page) || 1}
        />
      </Suspense>
    </div>
  );
}