// components/admin/files/migration-row-actions.tsx
"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PlayIcon, ArrowClockwiseIcon } from "@phosphor-icons/react";

interface Props {
  id: string;
  status: string;
}

export function MigrationRowActions({ id, status }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function updateStatus(newStatus: "TEMP" | "PROCESSING" | "COMPLETED" | "FAILED") {
    startTransition(async () => {
      const res = await fetch(`/api/admin/files/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ migrationStatus: newStatus }),
      });
      if (res.ok) router.refresh();
      else alert("Gagal update status");
    });
  }

  if (status === "TEMP") {
    return (
      <Button
        size="sm"
        variant="outline"
        onClick={() => updateStatus("PROCESSING")}
        disabled={isPending}
      >
        <PlayIcon className="mr-1 h-3 w-3" />
        Proses
      </Button>
    );
  }

  if (status === "FAILED") {
    return (
      <Button
        size="sm"
        variant="outline"
        onClick={() => updateStatus("TEMP")}
        disabled={isPending}
      >
        <ArrowClockwiseIcon className="mr-1 h-3 w-3" />
        Retry
      </Button>
    );
  }

  return null;
}