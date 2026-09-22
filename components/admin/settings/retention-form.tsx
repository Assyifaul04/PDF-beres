// components/admin/settings/retention-form.tsx
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
import type { RetentionSettings } from "@/lib/settings/defaults";

interface Props {
  initialData: RetentionSettings;
}

export function RetentionForm({ initialData }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState<RetentionSettings>(initialData);

  function update<K extends keyof RetentionSettings>(
    key: K,
    value: RetentionSettings[K]
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
        body: JSON.stringify({ key: "retention", value: form }),
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
          <CardTitle>Retensi per Plan</CardTitle>
          <CardDescription>
            Berapa lama file disimpan sebelum expiresAt
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="freeRetentionDays">FREE — Retensi (hari)</Label>
            <Input
              id="freeRetentionDays"
              type="number"
              min={1}
              value={form.freeRetentionDays}
              onChange={(e) =>
                update("freeRetentionDays", parseInt(e.target.value) || 0)
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="premiumRetentionDays">
              PREMIUM — Retensi (hari)
            </Label>
            <Input
              id="premiumRetentionDays"
              type="number"
              min={1}
              value={form.premiumRetentionDays}
              onChange={(e) =>
                update("premiumRetentionDays", parseInt(e.target.value) || 0)
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="anonymousRetentionHours">
              Anonymous — Retensi (jam)
            </Label>
            <Input
              id="anonymousRetentionHours"
              type="number"
              min={1}
              value={form.anonymousRetentionHours}
              onChange={(e) =>
                update("anonymousRetentionHours", parseInt(e.target.value) || 0)
              }
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Auto Cleanup</CardTitle>
          <CardDescription>
            Hapus otomatis file yang sudah expired
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <Label className="cursor-pointer">Aktifkan Auto Cleanup</Label>
              <p className="text-xs text-muted-foreground">
                Jalankan cron job untuk hapus file expired
              </p>
            </div>
            <Switch
              checked={form.autoCleanupEnabled}
              onCheckedChange={(v) => update("autoCleanupEnabled", v)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cleanupCronExpression">
              Cron Expression
            </Label>
            <Input
              id="cleanupCronExpression"
              value={form.cleanupCronExpression}
              onChange={(e) => update("cleanupCronExpression", e.target.value)}
              placeholder="0 3 * * *"
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Default: setiap hari jam 3 pagi
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