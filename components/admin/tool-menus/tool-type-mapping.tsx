"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FloppyDiskIcon, WarningIcon } from "@phosphor-icons/react";

type ToolType = string;

interface MenuRow {
  id: string;
  title: string;
  slug: string;
  toolType: ToolType | null;
  isActive: boolean;
  category: { id: string; name: string };
}

export function ToolTypeMapping({
  menus,
  toolTypes,
}: {
  menus: MenuRow[];
  toolTypes: readonly ToolType[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [local, setLocal] = useState<Record<string, ToolType | null>>(
    Object.fromEntries(menus.map((m) => [m.id, m.toolType]))
  );
  const [dirty, setDirty] = useState(false);

  // ToolType yang sudah dipakai (untuk warning duplikat)
  const usedTypes = new Map<ToolType, string[]>();
  Object.entries(local).forEach(([menuId, type]) => {
    if (!type) return;
    const list = usedTypes.get(type) ?? [];
    list.push(menuId);
    usedTypes.set(type, list);
  });

  function handleChange(menuId: string, value: string) {
    setLocal((prev) => ({
      ...prev,
      [menuId]: value === "__none__" ? null : value,
    }));
    setDirty(true);
  }

  function handleSave() {
    startTransition(async () => {
      const payload = Object.entries(local)
        .filter(([menuId, newType]) => {
          const original = menus.find((m) => m.id === menuId)?.toolType ?? null;
          return original !== newType;
        })
        .map(([menuId, newType]) => ({ id: menuId, toolType: newType }));

      if (payload.length === 0) {
        setDirty(false);
        return;
      }

      const res = await fetch("/api/admin/tool-menus/tool-type", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mappings: payload }),
      });

      if (!res.ok) {
        alert("Gagal menyimpan mapping");
        return;
      }

      setDirty(false);
      router.refresh();
    });
  }

  const unmappedCount = menus.filter((m) => !local[m.id]).length;

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between rounded-lg border bg-card p-4">
        <div>
          <p className="text-sm font-medium">
            {unmappedCount > 0
              ? `${unmappedCount} menu belum di-mapping`
              : "Semua menu sudah di-mapping"}
          </p>
          <p className="text-xs text-muted-foreground">
            {dirty
              ? "Ada perubahan belum disimpan"
              : "Semua perubahan tersimpan"}
          </p>
        </div>
        <Button onClick={handleSave} disabled={!dirty || isPending}>
          <FloppyDiskIcon className="mr-2 h-4 w-4" />
          {isPending ? "Menyimpan..." : "Simpan Mapping"}
        </Button>
      </div>

      {/* Duplicate Warning */}
      {Array.from(usedTypes.entries()).some(([, ids]) => ids.length > 1) && (
        <div className="flex items-start gap-3 rounded-lg border border-amber-500/50 bg-amber-500/10 p-4">
          <WarningIcon className="h-5 w-5 text-amber-600" />
          <div>
            <p className="font-medium text-amber-900 dark:text-amber-200">
              Ada ToolType yang dipakai lebih dari 1 menu
            </p>
            <p className="text-sm text-amber-800 dark:text-amber-300">
              Pastikan setiap ToolType hanya di-mapping ke 1 menu aktif.
            </p>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Menu</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-72">Tool Type</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {menus.map((menu) => {
              const current = local[menu.id];
              const isDuplicate =
                current && (usedTypes.get(current)?.length ?? 0) > 1;

              return (
                <TableRow key={menu.id}>
                  <TableCell>
                    <p className="font-medium">{menu.title}</p>
                    <p className="font-mono text-xs text-muted-foreground">
                      {menu.slug}
                    </p>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{menu.category.name}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={menu.isActive ? "default" : "outline"}>
                      {menu.isActive ? "Aktif" : "Nonaktif"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={current ?? "__none__"}
                      onValueChange={(v) => handleChange(menu.id, v)}
                    >
                      <SelectTrigger
                        className={isDuplicate ? "border-amber-500" : ""}
                      >
                        <SelectValue placeholder="Pilih ToolType..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">
                          <span className="text-muted-foreground">
                            — Tidak di-mapping —
                          </span>
                        </SelectItem>
                        {toolTypes.map((t) => (
                          <SelectItem key={t} value={t} className="font-mono text-xs">
                            {t}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}