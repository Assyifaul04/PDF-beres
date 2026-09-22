// components/admin/files/files-table-skeleton.tsx
export function FilesTableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="rounded-lg border">
        <div className="h-12 border-b bg-muted/30" />
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-16 animate-pulse border-b bg-muted/20" />
        ))}
      </div>
    </div>
  );
}