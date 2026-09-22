// components/admin/tasks/tasks-filters.tsx
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
  currentStatus?: string;
  currentToolType?: string;
}

const TOOL_TYPES = [
  "MERGE_PDF",
  "SPLIT_PDF",
  "COMPRESS_PDF",
  "PDF_TO_WORD",
  "PDF_TO_POWERPOINT",
  "PDF_TO_EXCEL",
  "WORD_TO_PDF",
  "POWERPOINT_TO_PDF",
  "EXCEL_TO_PDF",
  "EDIT_PDF",
  "PDF_TO_JPG",
  "JPG_TO_PDF",
  "SIGN_PDF",
  "WATERMARK_PDF",
  "ROTATE_PDF",
  "HTML_TO_PDF",
  "UNLOCK_PDF",
  "PROTECT_PDF",
  "ORGANIZE_PDF",
  "REPAIR_PDF",
  "PAGE_NUMBERS",
] as const;

export function TasksFilters({
  currentQuery,
  currentStatus,
  currentToolType,
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
      router.push(`/admin/tasks?${params.toString()}`);
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative flex-1 min-w-[240px]">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          defaultValue={currentQuery}
          placeholder="Cari ID task, email user, atau error message..."
          className="pl-9"
          onChange={(e) => {
            const v = e.target.value;
            clearTimeout((window as any).__tasksSearch);
            (window as any).__tasksSearch = setTimeout(
              () => updateParam("q", v || null),
              400
            );
          }}
        />
      </div>

      <Select
        value={currentStatus ?? "__all__"}
        onValueChange={(v) => updateParam("status", v ?? "__all__")}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all__">Semua Status</SelectItem>
          <SelectItem value="PENDING">PENDING</SelectItem>
          <SelectItem value="PROCESSING">PROCESSING</SelectItem>
          <SelectItem value="COMPLETED">COMPLETED</SelectItem>
          <SelectItem value="FAILED">FAILED</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={currentToolType ?? "__all__"}
        onValueChange={(v) => updateParam("toolType", v ?? "__all__")}
      >
        <SelectTrigger className="w-[220px]">
          <SelectValue placeholder="Tool Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all__">Semua Tool Type</SelectItem>
          {TOOL_TYPES.map((t) => (
            <SelectItem key={t} value={t} className="font-mono text-xs">
              {t}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}