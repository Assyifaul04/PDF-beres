export default function Loading() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="h-20 animate-pulse rounded bg-muted" />
      <div className="grid gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
      <div className="h-12 animate-pulse rounded bg-muted" />
      <div className="h-96 animate-pulse rounded-lg bg-muted" />
    </div>
  );
}