// components/admin/files/files-filters.tsx
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
  currentProvider?: string;
  currentStatus?: string;
}

export function FilesFilters({
  currentQuery,
  currentProvider,
  currentStatus,
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
      router.push(`/admin/files?${params.toString()}`);
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative flex-1 min-w-[240px]">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          defaultValue={currentQuery}
          placeholder="Cari nama file atau key..."
          className="pl-9"
          onChange={(e) => {
            const v = e.target.value;
            clearTimeout((window as any).__filesSearch);
            (window as any).__filesSearch = setTimeout(
              () => updateParam("q", v || null),
              400
            );
          }}
        />
      </div>

      <Select
        value={currentProvider ?? "__all__"}
        onValueChange={(v) => updateParam("provider", v)}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Provider" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all__">Semua Provider</SelectItem>
          <SelectItem value="SUPABASE">Supabase</SelectItem>
          <SelectItem value="GOOGLE_DRIVE">Google Drive</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={currentStatus ?? "__all__"}
        onValueChange={(v) => updateParam("status", v)}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Migration Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all__">Semua Status</SelectItem>
          <SelectItem value="TEMP">TEMP</SelectItem>
          <SelectItem value="PROCESSING">PROCESSING</SelectItem>
          <SelectItem value="COMPLETED">COMPLETED</SelectItem>
          <SelectItem value="FAILED">FAILED</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}