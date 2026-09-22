// components/admin/system/logs-cleanup-dialog.tsx
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TrashIcon } from "@phosphor-icons/react";

export function LogsCleanupDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [olderThanDays, setOlderThanDays] = useState(30);
  const [level, setLevel] = useState("__all__");
  const [result, setResult] = useState<number | null>(null);

  function handleCleanup() {
    if (
      !confirm(
        `Hapus log lebih tua dari ${olderThanDays} hari${
          level !== "__all__" ? ` dengan level ${level}` : ""
        }?`
      )
    ) {
      return;
    }

    startTransition(async () => {
      const res = await fetch("/api/admin/system/logs", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          olderThanDays,
          level: level === "__all__" ? undefined : level,
        }),
      });
      const json = await res.json();
      if (res.ok) {
        setResult(json.deleted);
        router.refresh();
      } else {
        alert("Gagal cleanup log");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* ✅ Tanpa asChild */}
      <DialogTrigger
        className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-4 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      >
        <TrashIcon className="mr-2 h-4 w-4" />
        Cleanup Log
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cleanup Log</DialogTitle>
          <DialogDescription>
            Hapus log lama untuk mengurangi ukuran database. Tindakan ini tidak
            bisa dibatalkan.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="days">Hapus log lebih tua dari (hari)</Label>
            <Input
              id="days"
              type="number"
              min={1}
              max={365}
              value={olderThanDays}
              onChange={(e) => setOlderThanDays(parseInt(e.target.value) || 30)}
            />
          </div>

          <div className="space-y-2">
            <Label>Filter Level (opsional)</Label>
            <Select value={level} onValueChange={(v) => setLevel(v ?? "__all__")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">Semua Level</SelectItem>
                <SelectItem value="error">Error</SelectItem>
                <SelectItem value="warn">Warning</SelectItem>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="debug">Debug</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {result !== null && (
            <div className="rounded-md border bg-muted p-3 text-sm">
              ✅ Berhasil menghapus <strong>{result}</strong> log
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Batal
          </Button>
          <Button
            variant="destructive"
            onClick={handleCleanup}
            disabled={isPending}
          >
            <TrashIcon className="mr-2 h-4 w-4" />
            {isPending ? "Menghapus..." : "Hapus Sekarang"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}