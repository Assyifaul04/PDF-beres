// components/admin/system/logs-filters.tsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MagnifyingGlassIcon } from "@phosphor-icons/react";

interface Props {
  currentQuery?: string;
  currentLevel?: string;
  currentAction?: string;
}

export function LogsFilters({
  currentQuery,
  currentLevel,
  currentAction,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function updateParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "__all__") params.set(key, value);
    else params.delete(key);
    params.delete("page");

    startTransition(() => {
      router.push(`/admin/system/logs?${params.toString()}`);
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative flex-1 min-w-[240px]">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          defaultValue={currentQuery}
          placeholder="Cari pesan atau action..."
          className="pl-9"
          onChange={(e) => {
            const v = e.target.value;
            clearTimeout((window as any).__logsSearch);
            (window as any).__logsSearch = setTimeout(
              () => updateParam("q", v || null),
              400
            );
          }}
        />
      </div>

      <Select
        value={currentLevel ?? "__all__"}
        onValueChange={(v) => updateParam("level", v ?? "__all__")}
      >
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Level" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all__">Semua Level</SelectItem>
          <SelectItem value="error">Error</SelectItem>
          <SelectItem value="warn">Warning</SelectItem>
          <SelectItem value="info">Info</SelectItem>
          <SelectItem value="debug">Debug</SelectItem>
        </SelectContent>
      </Select>

      <Input
        defaultValue={currentAction}
        placeholder="Filter action..."
        className="max-w-[200px]"
        onChange={(e) => {
          const v = e.target.value;
          clearTimeout((window as any).__actionSearch);
          (window as any).__actionSearch = setTimeout(
            () => updateParam("action", v || null),
            400
          );
        }}
      />
    </div>
  );
}