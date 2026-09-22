// app/admin/system/logs/page.tsx
import { Suspense } from "react";
import { LogsStats } from "@/components/admin/system/logs-stats";
import { LogsFilters } from "@/components/admin/system/logs-filters";
import { LogsTable } from "@/components/admin/system/logs-table";
import { LogsTableSkeleton } from "@/components/admin/system/logs-table-skeleton";
import { LogsCleanupDialog } from "@/components/admin/system/logs-cleanup-dialog";

type SearchParams = Promise<{
  q?: string;
  level?: string;
  action?: string;
  page?: string;
}>;

export const metadata = {
  title: "System Logs | Admin",
  description: "Semua aktivitas sistem",
};

const LEVEL_LABELS: Record<string, string> = {
  error: "Error Logs",
  warn: "Warning Logs",
  info: "Info Logs",
  debug: "Debug Logs",
};

export default async function LogsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;

  const title = params.level
    ? `${LEVEL_LABELS[params.level] ?? `${params.level} Logs`}`
    : "System Logs";

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          <p className="text-muted-foreground">
            {params.level
              ? `Log dengan level = ${params.level}`
              : "Semua aktivitas sistem dari semua sumber"}
          </p>
        </div>
        <LogsCleanupDialog />
      </div>

      <Suspense fallback={<div className="h-28" />}>
        <LogsStats />
      </Suspense>

      <LogsFilters
        currentQuery={params.q}
        currentLevel={params.level}
        currentAction={params.action}
      />

      <Suspense fallback={<LogsTableSkeleton />}>
        <LogsTable
          query={params.q}
          level={params.level}
          action={params.action}
          page={Number(params.page) || 1}
        />
      </Suspense>
    </div>
  );
}