// components/upload/advanced-settings-dialog.tsx
"use client";

import * as React from "react";
import { Settings, ChevronDown } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface AdvancedSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fileName: string;
  fileSizeText: string;
  onApplySettings?: (settings: { password?: string }) => void;
}

export function AdvancedSettingsDialog({
  open,
  onOpenChange,
  fileName,
  fileSizeText,
  onApplySettings,
}: AdvancedSettingsDialogProps) {
  const [password, setPassword] = React.useState("");

  const handleReset = () => {
    setPassword("");
  };

  const handleApply = () => {
    onApplySettings?.({ password });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl p-6 sm:rounded-xl">
        <DialogHeader className="space-y-1">
          <DialogTitle className="flex items-center gap-2 text-lg font-bold">
            <Settings className="h-5 w-5 text-muted-foreground" />
            Opsi Lanjutan (Opsional)
          </DialogTitle>
          <p className="text-xs text-muted-foreground">
            Nama berkas: <span className="font-medium">{fileName}</span> ({fileSizeText})
          </p>
        </DialogHeader>

        {/* Konten Opsi */}
        <div className="my-4 space-y-4 rounded-lg bg-slate-50 p-4 border dark:bg-muted/20">
          <h4 className="text-sm font-semibold text-foreground">Opsi Dokumen</h4>
          
          <div className="space-y-1.5">
            <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-2">
              <label className="text-xs font-medium text-foreground">
                Kata sandi (opsional)
              </label>
              <div className="sm:col-span-2">
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-background text-sm"
                />
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground sm:ml-[33.333%]">
              Kata sandi untuk membuka berkas sumber (Maksimal 255 karakter).
            </p>
          </div>
        </div>

        {/* Tombol Aksi */}
        <div className="flex items-center justify-between pt-2">
          <Button
            type="button"
            variant="secondary"
            onClick={handleReset}
            className="text-xs font-medium"
          >
            Setel ulang semua opsi
          </Button>

          <div className="flex items-center gap-0">
            <Button
              type="button"
              onClick={handleApply}
              className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-medium rounded-r-none px-4"
            >
              Terapkan Pengaturan
            </Button>
            <Button
              type="button"
              className="bg-primary text-primary-foreground hover:bg-primary/90 border-l border-primary-foreground/20 rounded-l-none px-2"
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}