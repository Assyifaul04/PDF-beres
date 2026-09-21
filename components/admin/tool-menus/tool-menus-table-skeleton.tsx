export function ToolMenusTableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="rounded-lg border">
        {/* Header */}
        <div className="flex items-center gap-4 border-b bg-muted/50 px-4 py-3">
          <div className="h-4 w-12 animate-pulse rounded bg-muted" />
          <div className="h-4 flex-1 animate-pulse rounded bg-muted" />
          <div className="h-4 w-24 animate-pulse rounded bg-muted" />
          <div className="h-4 w-32 animate-pulse rounded bg-muted" />
          <div className="h-4 w-16 animate-pulse rounded bg-muted" />
          <div className="h-4 w-16 animate-pulse rounded bg-muted" />
        </div>

        {/* Rows */}
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 border-b px-4 py-3 last:border-b-0"
          >
            <div className="h-4 w-12 animate-pulse rounded bg-muted" />
            <div className="flex flex-1 items-center gap-3">
              <div className="h-9 w-9 animate-pulse rounded bg-muted" />
              <div className="flex-1 space-y-1">
                <div className="h-3 w-40 animate-pulse rounded bg-muted" />
                <div className="h-3 w-56 animate-pulse rounded bg-muted" />
              </div>
            </div>
            <div className="h-6 w-24 animate-pulse rounded-full bg-muted" />
            <div className="h-6 w-32 animate-pulse rounded bg-muted" />
            <div className="h-6 w-16 animate-pulse rounded-full bg-muted" />
            <div className="h-8 w-8 animate-pulse rounded bg-muted" />
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="h-4 w-48 animate-pulse rounded bg-muted" />
        <div className="flex gap-2">
          <div className="h-8 w-24 animate-pulse rounded bg-muted" />
          <div className="h-8 w-24 animate-pulse rounded bg-muted" />
        </div>
      </div>
    </div>
  );
}