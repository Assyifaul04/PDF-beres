// components/admin/settings/storage-form.tsx
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { FloppyDiskIcon, WarningCircleIcon } from "@phosphor-icons/react";
import type { StorageSettings } from "@/lib/settings/defaults";

interface Props {
  initialData: StorageSettings;
}

export function StorageForm({ initialData }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState<StorageSettings>(initialData);

  function update<K extends keyof StorageSettings>(
    key: K,
    value: StorageSettings[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSuccess(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    startTransition(async () => {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "storage", value: form }),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        setError(json.error ?? "Gagal menyimpan");
        return;
      }

      setSuccess(true);
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="flex items-start gap-3 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm">
          <WarningCircleIcon className="h-5 w-5 text-destructive" />
          <p className="text-destructive">{error}</p>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Supabase Storage</CardTitle>
          <CardDescription>
            Storage utama untuk file temporary
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <Label className="cursor-pointer">Aktifkan Supabase</Label>
              <p className="text-xs text-muted-foreground">
                Provider storage default
              </p>
            </div>
            <Switch
              checked={form.supabaseEnabled}
              onCheckedChange={(v) => update("supabaseEnabled", v)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="supabaseBucket">Bucket Name</Label>
            <Input
              id="supabaseBucket"
              value={form.supabaseBucket}
              onChange={(e) => update("supabaseBucket", e.target.value)}
              placeholder="beres-files"
              className="font-mono text-sm"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Google Drive</CardTitle>
          <CardDescription>
            Storage jangka panjang untuk file yang perlu disimpan lama
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <Label className="cursor-pointer">Aktifkan Google Drive</Label>
              <p className="text-xs text-muted-foreground">
                File otomatis dipindah setelah X jam
              </p>
            </div>
            <Switch
              checked={form.driveEnabled}
              onCheckedChange={(v) => update("driveEnabled", v)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="driveFolderId">Folder ID</Label>
            <Input
              id="driveFolderId"
              value={form.driveFolderId}
              onChange={(e) => update("driveFolderId", e.target.value)}
              placeholder="1A2B3C4D..."
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              ID folder Google Drive tujuan migrasi
            </p>
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <Label className="cursor-pointer">Auto Migrate</Label>
              <p className="text-xs text-muted-foreground">
                Otomatis pindah file lama ke Drive
              </p>
            </div>
            <Switch
              checked={form.driveAutoMigrate}
              onCheckedChange={(v) => update("driveAutoMigrate", v)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="driveMigrateAfterHours">
              Migrasi Setelah (jam)
            </Label>
            <Input
              id="driveMigrateAfterHours"
              type="number"
              min={1}
              value={form.driveMigrateAfterHours}
              onChange={(e) =>
                update("driveMigrateAfterHours", parseInt(e.target.value) || 0)
              }
            />
            <p className="text-xs text-muted-foreground">
              File akan dipindah setelah X jam sejak upload
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-end gap-3">
        {success && <span className="text-sm text-green-600">✓ Tersimpan</span>}
        <Button type="submit" disabled={isPending}>
          <FloppyDiskIcon className="mr-2 h-4 w-4" />
          {isPending ? "Menyimpan..." : "Simpan Perubahan"}
        </Button>
      </div>
    </form>
  );
}