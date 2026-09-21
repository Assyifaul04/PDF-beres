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
  currentRole?: string;
  currentPlan?: string;
  currentQuery?: string;
}

export function UsersFilters({ currentRole, currentPlan, currentQuery }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function updateParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("page"); // reset page

    startTransition(() => {
      router.push(`/admin/users?${params.toString()}`);
    });
  }

  function handleSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    updateParam("q", (formData.get("q") as string) || null);
  }

  const hasFilter = currentRole || currentPlan || currentQuery;

  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center">
      <form onSubmit={handleSearch} className="relative flex-1">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          name="q"
          placeholder="Cari nama atau email..."
          defaultValue={currentQuery}
          className="pl-9"
        />
      </form>

      <Select
        value={currentRole ?? "all"}
        onValueChange={(v) => updateParam("role", v === "all" ? null : v)}
      >
        <SelectTrigger className="w-full md:w-40">
          <SelectValue placeholder="Role" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Semua Role</SelectItem>
          <SelectItem value="USER">User</SelectItem>
          <SelectItem value="ADMIN">Admin</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={currentPlan ?? "all"}
        onValueChange={(v) => updateParam("plan", v === "all" ? null : v)}
      >
        <SelectTrigger className="w-full md:w-40">
          <SelectValue placeholder="Plan" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Semua Plan</SelectItem>
          <SelectItem value="FREE">Free</SelectItem>
          <SelectItem value="PREMIUM">Premium</SelectItem>
        </SelectContent>
      </Select>

      {hasFilter && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/admin/users")}
          disabled={isPending}
        >
          <XIcon className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}