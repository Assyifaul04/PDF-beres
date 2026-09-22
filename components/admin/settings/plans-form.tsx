// components/admin/settings/plans-form.tsx
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { FloppyDiskIcon, WarningCircleIcon } from "@phosphor-icons/react";
import type { PlanSettings } from "@/lib/settings/defaults";

interface Props {
  initialData: PlanSettings;
}

export function PlansForm({ initialData }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState<PlanSettings>(initialData);

  function update<K extends keyof PlanSettings>(key: K, value: PlanSettings[K]) {
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
        body: JSON.stringify({ key: "plans", value: form }),
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

      <div className="grid gap-6 lg:grid-cols-2">
        {/* FREE */}
        <Card>
          <CardHeader>
            <CardTitle>FREE</CardTitle>
            <CardDescription>Limit untuk user gratis</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="freeMaxFileMB">Max File Size (MB)</Label>
              <Input
                id="freeMaxFileMB"
                type="number"
                value={form.freeMaxFileMB}
                onChange={(e) =>
                  update("freeMaxFileMB", parseInt(e.target.value) || 0)
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="freeMaxTasksPerDay">Max Task per Hari</Label>
              <Input
                id="freeMaxTasksPerDay"
                type="number"
                value={form.freeMaxTasksPerDay}
                onChange={(e) =>
                  update("freeMaxTasksPerDay", parseInt(e.target.value) || 0)
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="freeMaxStorageMB">Max Storage (MB)</Label>
              <Input
                id="freeMaxStorageMB"
                type="number"
                value={form.freeMaxStorageMB}
                onChange={(e) =>
                  update("freeMaxStorageMB", parseInt(e.target.value) || 0)
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* PREMIUM */}
        <Card>
          <CardHeader>
            <CardTitle>PREMIUM</CardTitle>
            <CardDescription>Limit untuk user premium</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="premiumMaxFileMB">Max File Size (MB)</Label>
              <Input
                id="premiumMaxFileMB"
                type="number"
                value={form.premiumMaxFileMB}
                onChange={(e) =>
                  update("premiumMaxFileMB", parseInt(e.target.value) || 0)
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="premiumMaxTasksPerDay">Max Task per Hari</Label>
              <Input
                id="premiumMaxTasksPerDay"
                type="number"
                value={form.premiumMaxTasksPerDay}
                onChange={(e) =>
                  update("premiumMaxTasksPerDay", parseInt(e.target.value) || 0)
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="premiumMaxStorageMB">Max Storage (MB)</Label>
              <Input
                id="premiumMaxStorageMB"
                type="number"
                value={form.premiumMaxStorageMB}
                onChange={(e) =>
                  update("premiumMaxStorageMB", parseInt(e.target.value) || 0)
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="premiumPriceIDR">Harga (IDR)</Label>
              <Input
                id="premiumPriceIDR"
                type="number"
                value={form.premiumPriceIDR}
                onChange={(e) =>
                  update("premiumPriceIDR", parseInt(e.target.value) || 0)
                }
              />
            </div>
          </CardContent>
        </Card>
      </div>

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