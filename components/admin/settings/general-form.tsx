// components/admin/settings/general-form.tsx
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { FloppyDiskIcon, WarningCircleIcon } from "@phosphor-icons/react";
import type { GeneralSettings } from "@/lib/settings/defaults";

interface Props {
  initialData: GeneralSettings;
}

export function GeneralForm({ initialData }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState<GeneralSettings>(initialData);

  function update<K extends keyof GeneralSettings>(
    key: K,
    value: GeneralSettings[K]
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
        body: JSON.stringify({ key: "general", value: form }),
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
          <CardTitle>Identitas Situs</CardTitle>
          <CardDescription>
            Informasi dasar yang tampil di aplikasi
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="siteName">Nama Situs</Label>
            <Input
              id="siteName"
              value={form.siteName}
              onChange={(e) => update("siteName", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="siteDescription">Deskripsi</Label>
            <Textarea
              id="siteDescription"
              rows={2}
              value={form.siteDescription}
              onChange={(e) => update("siteDescription", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="supportEmail">Email Support</Label>
            <Input
              id="supportEmail"
              type="email"
              value={form.supportEmail}
              onChange={(e) => update("supportEmail", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Operasional</CardTitle>
          <CardDescription>Mode & batasan aplikasi</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="maxUploadMB">Max Upload (MB)</Label>
            <Input
              id="maxUploadMB"
              type="number"
              min={1}
              value={form.maxUploadMB}
              onChange={(e) =>
                update("maxUploadMB", parseInt(e.target.value) || 0)
              }
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <Label htmlFor="maintenanceMode" className="cursor-pointer">
                Maintenance Mode
              </Label>
              <p className="text-xs text-muted-foreground">
                Aktifkan untuk menutup akses user biasa
              </p>
            </div>
            <Switch
              id="maintenanceMode"
              checked={form.maintenanceMode}
              onCheckedChange={(v) => update("maintenanceMode", v)}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <Label htmlFor="allowSignup" className="cursor-pointer">
                Izinkan Signup
              </Label>
              <p className="text-xs text-muted-foreground">
                User baru bisa mendaftar
              </p>
            </div>
            <Switch
              id="allowSignup"
              checked={form.allowSignup}
              onCheckedChange={(v) => update("allowSignup", v)}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-end gap-3">
        {success && (
          <span className="text-sm text-green-600">✓ Tersimpan</span>
        )}
        <Button type="submit" disabled={isPending}>
          <FloppyDiskIcon className="mr-2 h-4 w-4" />
          {isPending ? "Menyimpan..." : "Simpan Perubahan"}
        </Button>
      </div>
    </form>
  );
}