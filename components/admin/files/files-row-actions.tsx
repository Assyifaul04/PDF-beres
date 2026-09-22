// components/admin/files/files-row-actions.tsx
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
import { DotsThreeIcon, TrashIcon, EyeIcon } from "@phosphor-icons/react";

interface Props {
  id: string;
  name: string;
}

export function FilesRowActions({ id, name }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm(`Hapus file "${name}"? Tindakan ini tidak bisa dibatalkan.`)) {
      return;
    }
    startTransition(async () => {
      const res = await fetch(`/api/admin/files/${id}`, { method: "DELETE" });
      if (res.ok) router.refresh();
      else alert("Gagal menghapus file");
    });
  }

  return (
    <DropdownMenu>
      {/* ✅ Tanpa asChild — DropdownMenuTrigger render <button> sendiri */}
      <DropdownMenuTrigger
        disabled={isPending}
        aria-label={`Aksi untuk file ${name}`}
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
        <DropdownMenuItem onClick={() => router.push(`/admin/files/${id}`)}>
          <EyeIcon className="mr-2 h-4 w-4" />
          Detail
        </DropdownMenuItem>
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