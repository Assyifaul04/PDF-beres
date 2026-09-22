// components/admin/system/logs-table-skeleton.tsx
export function LogsTableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="rounded-lg border">
        <div className="h-12 border-b bg-muted/30" />
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="h-12 animate-pulse border-b bg-muted/20" />
        ))}
      </div>
    </div>
  );
}