"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MagnifyingGlassIcon, XIcon } from "@phosphor-icons/react";

interface Props {
  currentCategoryId?: string;
  currentIsActive?: string;
  currentQuery?: string;
  categories: { id: string; name: string }[];
}

export function ToolMenusFilters({
  currentCategoryId,
  currentIsActive,
  currentQuery,
  categories,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // ✅ Debug: log di console untuk cek apakah prop sampai
  console.log("[ToolMenusFilters] categories:", categories);

  function updateParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("page");

    startTransition(() => {
      router.push(`/admin/tool-menus?${params.toString()}`);
    });
  }

  function handleSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    updateParam("q", (formData.get("q") as string) || null);
  }

  const hasFilter = currentCategoryId || currentIsActive || currentQuery;

  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center">
      <form onSubmit={handleSearch} className="relative flex-1">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          name="q"
          placeholder="Cari judul, slug, atau description..."
          defaultValue={currentQuery}
          className="pl-9"
        />
      </form>

      <Select
        value={currentCategoryId ?? "all"}
        onValueChange={(v) =>
          updateParam("categoryId", v === "all" ? null : v)
        }
      >
        <SelectTrigger className="w-full md:w-56">
          <SelectValue placeholder="Kategori" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Semua Kategori</SelectItem>
          {/* ✅ Defensive: cek categories ada & array */}
          {Array.isArray(categories) && categories.length > 0 ? (
            categories.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))
          ) : (
            <SelectItem value="__empty__" disabled>
              Belum ada kategori
            </SelectItem>
          )}
        </SelectContent>
      </Select>

      <Select
        value={currentIsActive ?? "all"}
        onValueChange={(v) => updateParam("isActive", v === "all" ? null : v)}
      >
        <SelectTrigger className="w-full md:w-40">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Semua Status</SelectItem>
          <SelectItem value="true">Aktif</SelectItem>
          <SelectItem value="false">Nonaktif</SelectItem>
        </SelectContent>
      </Select>

      {hasFilter && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/admin/tool-menus")}
          disabled={isPending}
        >
          <XIcon className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}