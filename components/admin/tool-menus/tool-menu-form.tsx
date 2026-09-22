"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FloppyDiskIcon, WarningCircleIcon } from "@phosphor-icons/react";
import { IconPicker } from "@/components/admin/tool-menus/icon-picker";
import { findIcon } from "@/lib/tool-icons";

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

interface MenuData {
  id?: string;
  categoryId: string;
  title: string;
  slug: string;
  description: string;
  href: string;
  icon: string;
  order: number;
  isActive: boolean;
  toolType: string | null;
}

interface Props {
  mode: "create" | "edit";
  initialData?: Partial<MenuData>;
  categories: { id: string; name: string }[];
}

export function ToolMenuForm({ mode, initialData, categories }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<MenuData>({
    id: initialData?.id,
    categoryId: initialData?.categoryId ?? categories[0]?.id ?? "",
    title: initialData?.title ?? "",
    slug: initialData?.slug ?? "",
    description: initialData?.description ?? "",
    href: initialData?.href ?? "",
    icon: initialData?.icon ?? "",
    order: initialData?.order ?? 0,
    isActive: initialData?.isActive ?? true,
    toolType: initialData?.toolType ?? null,
  });

  function handleTitleChange(value: string) {
    setForm((prev) => ({
      ...prev,
      title: value,
      slug:
        mode === "create"
          ? value
              .toLowerCase()
              .trim()
              .replace(/[^a-z0-9\s-]/g, "")
              .replace(/\s+/g, "-")
              .replace(/-+/g, "-")
          : prev.slug,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const url =
        mode === "create"
          ? "/api/admin/tool-menus"
          : `/api/admin/tool-menus/${form.id}`;

      const method = mode === "create" ? "POST" : "PATCH";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          icon: form.icon || null,
          description: form.description || null,
          toolType: form.toolType || null,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.error ?? "Gagal menyimpan menu");
        return;
      }

      router.push("/admin/tool-menus");
      router.refresh();
    });
  }

  const selectedIcon = findIcon(form.icon);

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {error && (
        <div className="flex items-start gap-3 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm">
          <WarningCircleIcon className="h-5 w-5 text-destructive" />
          <p className="text-destructive">{error}</p>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Informasi Menu</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Kategori */}
            <div className="space-y-2">
              <Label htmlFor="categoryId">
                Kategori <span className="text-destructive">*</span>
              </Label>
              <Select
                value={form.categoryId}
                onValueChange={(v) =>
                  setForm((p) => ({ ...p, categoryId: v }))
                }
              >
                <SelectTrigger id="categoryId">
                  <SelectValue placeholder="Pilih kategori..." />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Judul */}
            <div className="space-y-2">
              <Label htmlFor="title">
                Judul <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="WORD ke PDF"
                required
              />
            </div>

            {/* Slug */}
            <div className="space-y-2">
              <Label htmlFor="slug">
                Slug <span className="text-destructive">*</span>
              </Label>
              <Input
                id="slug"
                value={form.slug}
                onChange={(e) =>
                  setForm((p) => ({ ...p, slug: e.target.value }))
                }
                placeholder="word-ke-pdf"
                className="font-mono text-sm"
                required
              />
              <p className="text-xs text-muted-foreground">
                Unique, hanya huruf kecil, angka, dan dash
              </p>
            </div>

            {/* Deskripsi */}
            <div className="space-y-2">
              <Label htmlFor="description">Deskripsi</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) =>
                  setForm((p) => ({ ...p, description: e.target.value }))
                }
                placeholder="Konversi file Word ke PDF"
                rows={3}
              />
            </div>

            {/* Href */}
            <div className="space-y-2">
              <Label htmlFor="href">
                Href <span className="text-destructive">*</span>
              </Label>
              <Input
                id="href"
                value={form.href}
                onChange={(e) =>
                  setForm((p) => ({ ...p, href: e.target.value }))
                }
                placeholder="/convert-pdf/word-to-pdf"
                className="font-mono text-sm"
                required
              />
            </div>

            {/* ✅ ICON PICKER — ganti dari Input text */}
            <div className="space-y-2">
              <Label htmlFor="icon">Icon</Label>
              <IconPicker
                value={form.icon}
                onChange={(v) => setForm((p) => ({ ...p, icon: v }))}
                placeholder="Pilih icon..."
              />
              <p className="text-xs text-muted-foreground">
                Pilih icon dari daftar (opsional)
              </p>

              {/* Preview besar + tombol clear */}
              {selectedIcon && (
                <div className="mt-2 flex items-center gap-3 rounded-lg border bg-muted/30 p-3">
                  <Image
                    src={selectedIcon.value}
                    alt={selectedIcon.label}
                    width={48}
                    height={48}
                    className="h-12 w-12 shrink-0 object-contain"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {selectedIcon.label}
                    </p>
                    <p className="text-xs text-muted-foreground font-mono truncate">
                      {selectedIcon.value}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setForm((p) => ({ ...p, icon: "" }))}
                  >
                    Hapus
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Pengaturan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="order">Urutan</Label>
                <Input
                  id="order"
                  type="number"
                  value={form.order}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      order: parseInt(e.target.value) || 0,
                    }))
                  }
                  min={0}
                />
                <p className="text-xs text-muted-foreground">
                  Semakin kecil, semakin atas
                </p>
              </div>

              <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <Label htmlFor="isActive" className="cursor-pointer">
                    Status Aktif
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Menu tampil di aplikasi
                  </p>
                </div>
                <Switch
                  id="isActive"
                  checked={form.isActive}
                  onCheckedChange={(v) =>
                    setForm((p) => ({ ...p, isActive: v }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="toolType">Tool Type Mapping</Label>
                <Select
                  value={form.toolType ?? "__none__"}
                  onValueChange={(v) =>
                    setForm((p) => ({
                      ...p,
                      toolType: v === "__none__" ? null : v,
                    }))
                  }
                >
                  <SelectTrigger id="toolType">
                    <SelectValue placeholder="Pilih ToolType..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">
                      <span className="text-muted-foreground">
                        — Tidak di-mapping —
                      </span>
                    </SelectItem>
                    {TOOL_TYPES.map((t) => (
                      <SelectItem
                        key={t}
                        value={t}
                        className="font-mono text-xs"
                      >
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Hubungkan ke enum ToolType untuk handler konversi
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isPending}
        >
          Batal
        </Button>
        <Button type="submit" disabled={isPending || !form.categoryId}>
          <FloppyDiskIcon className="mr-2 h-4 w-4" />
          {isPending
            ? "Menyimpan..."
            : mode === "create"
              ? "Buat Menu"
              : "Simpan Perubahan"}
        </Button>
      </div>
    </form>
  );
}