// components/admin/tasks/tasks-row-actions.tsx
"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
  DotsThreeIcon,
  TrashIcon,
  EyeIcon,
  ArrowClockwiseIcon,
} from "@phosphor-icons/react";

interface Props {
  id: string;
  status: string;
}

export function TasksRowActions({ id, status }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm(`Hapus task ini? Tindakan tidak bisa dibatalkan.`)) return;
    startTransition(async () => {
      const res = await fetch(`/api/admin/tasks/${id}`, { method: "DELETE" });
      if (res.ok) router.refresh();
      else alert("Gagal menghapus task");
    });
  }

  function handleReset() {
    if (!confirm("Reset task ke PENDING?")) return;
    startTransition(async () => {
      const res = await fetch(`/api/admin/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "PENDING",
          errorMessage: null,
          completedAt: null,
        }),
      });
      if (res.ok) router.refresh();
      else alert("Gagal reset task");
    });
  }

  return (
    <DropdownMenu>
      {/* ✅ Tanpa asChild */}
      <DropdownMenuTrigger
        disabled={isPending}
        aria-label="Aksi task"
        className={cn(
          "inline-flex h-8 w-8 items-center justify-center rounded-md",
          "text-muted-foreground transition-colors",
          "hover:bg-accent hover:text-accent-foreground",
          "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
          "disabled:pointer-events-none disabled:opacity-50"
        )}
      >
        <DotsThreeIcon className="h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => router.push(`/admin/tasks/${id}`)}>
          <EyeIcon className="mr-2 h-4 w-4" />
          Detail
        </DropdownMenuItem>

        {(status === "FAILED" || status === "COMPLETED") && (
          <DropdownMenuItem onClick={handleReset}>
            <ArrowClockwiseIcon className="mr-2 h-4 w-4" />
            Reset ke PENDING
          </DropdownMenuItem>
        )}

        <DropdownMenuItem
          onClick={handleDelete}
          className="text-destructive focus:text-destructive"
        >
          <TrashIcon className="mr-2 h-4 w-4" />
          Hapus
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}