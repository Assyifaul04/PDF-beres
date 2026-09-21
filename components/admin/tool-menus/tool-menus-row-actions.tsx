"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DotsThreeIcon } from "@phosphor-icons/react";

interface Props {
  id: string;
  isActive: boolean;
  title: string;
}

export function ToolMenusRowActions({ id, isActive, title }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleEdit() {
    router.push(`/admin/tool-menus/${id}/edit`);
  }

  async function toggleActive() {
    startTransition(async () => {
      await fetch(`/api/admin/tool-menus/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !isActive }),
      });
      router.refresh();
    });
  }

  async function handleDelete() {
    if (!confirm(`Hapus menu "${title}"?`)) return;
    startTransition(async () => {
      await fetch(`/api/admin/tool-menus/${id}`, { method: "DELETE" });
      router.refresh();
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        disabled={isPending}
        className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent"
      >
        <DotsThreeIcon className="h-5 w-5" weight="bold" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleEdit}>Edit</DropdownMenuItem>
        <DropdownMenuItem onClick={toggleActive}>
          {isActive ? "Nonaktifkan" : "Aktifkan"}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleDelete}
          className="text-destructive"
        >
          Hapus
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}