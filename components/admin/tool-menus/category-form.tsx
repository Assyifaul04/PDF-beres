"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FloppyDiskIcon, WarningCircleIcon } from "@phosphor-icons/react";

interface CategoryData {
  id?: string;
  name: string;
  slug: string;
  description: string;
  order: number;
  isActive: boolean;
}

interface Props {
  mode: "create" | "edit";
  initialData?: Partial<CategoryData>;
}

export function CategoryForm({ mode, initialData }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<CategoryData>({
    id: initialData?.id,
    name: initialData?.name ?? "",
    slug: initialData?.slug ?? "",
    description: initialData?.description ?? "",
    order: initialData?.order ?? 0,
    isActive: initialData?.isActive ?? true,
  });

  function handleNameChange(value: string) {
    setForm((prev) => ({
      ...prev,
      name: value,
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
          ? "/api/admin/tool-menus/categories"
          : `/api/admin/tool-menus/categories/${form.id}`;

      const method = mode === "create" ? "POST" : "PATCH";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          description: form.description || null,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.error ?? "Gagal menyimpan kategori");
        return;
      }

      router.push("/admin/tool-menus/categories");
      router.refresh();
    });
  }

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
            <CardTitle>Informasi Kategori</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                Nama <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Konversi ke PDF"
                required
              />
            </div>

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
                placeholder="konversi-ke-pdf"
                className="font-mono text-sm"
                required
              />
              <p className="text-xs text-muted-foreground">
                Unique, hanya huruf kecil, angka, dan dash
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Deskripsi</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) =>
                  setForm((p) => ({ ...p, description: e.target.value }))
                }
                placeholder="Kumpulan tool untuk konversi ke format PDF"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

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
            </div>

            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <Label htmlFor="isActive" className="cursor-pointer">
                  Status Aktif
                </Label>
                <p className="text-xs text-muted-foreground">
                  Kategori tampil di aplikasi
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
          </CardContent>
        </Card>
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
        <Button type="submit" disabled={isPending}>
          <FloppyDiskIcon className="mr-2 h-4 w-4" />
          {isPending
            ? "Menyimpan..."
            : mode === "create"
              ? "Buat Kategori"
              : "Simpan Perubahan"}
        </Button>
      </div>
    </form>
  );
}