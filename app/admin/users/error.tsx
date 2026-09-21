"use client";

import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 p-6">
      <h2 className="text-2xl font-bold">Terjadi Kesalahan</h2>
      <p className="text-muted-foreground">{error.message}</p>
      <Button onClick={reset}>Coba Lagi</Button>
    </div>
  );
}