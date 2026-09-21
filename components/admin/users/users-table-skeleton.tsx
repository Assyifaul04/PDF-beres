export function UsersTableSkeleton() {
  return (
    <div className="space-y-3 rounded-lg border p-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <div className="h-9 w-9 animate-pulse rounded-full bg-muted" />
          <div className="flex-1 space-y-1">
            <div className="h-3 w-32 animate-pulse rounded bg-muted" />
            <div className="h-3 w-48 animate-pulse rounded bg-muted" />
          </div>
          <div className="h-6 w-16 animate-pulse rounded bg-muted" />
          <div className="h-6 w-16 animate-pulse rounded bg-muted" />
        </div>
      ))}
    </div>
  );
}