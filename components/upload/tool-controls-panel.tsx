// components/upload/tool-controls-panel.tsx
"use client";

import * as React from "react";
import { ToolType } from "@prisma/client";
import { ToolSettings } from "@/lib/tools/settings";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  FileArchive,
  Scissors,
  Type,
  Lock,
  Unlock,
  RotateCw,
  Hash,
  ShieldCheck,
  Image as ImageIcon,
  Sparkles,
  Layout,
  Layers,
  Wrench,
} from "lucide-react";

interface ToolControlsPanelProps {
  toolType: ToolType;
  settings: ToolSettings;
  onChange: (newSettings: ToolSettings) => void;
}

export function ToolControlsPanel({
  toolType,
  settings,
  onChange,
}: ToolControlsPanelProps) {
  const updateSetting = <K extends keyof ToolSettings>(
    key: K,
    value: ToolSettings[K]
  ) => {
    onChange({ ...settings, [key]: value });
  };

  switch (toolType) {
    /* ====================================================================== */
    /* 1. COMPRESS_PDF                                                        */
    /* ====================================================================== */
    case "COMPRESS_PDF":
      return (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <FileArchive className="h-4 w-4 text-red-500" />
            <span>Tingkat Kompresi</span>
          </div>
          <div className="space-y-2">
            {[
              {
                id: "recommended",
                title: "Rekomendasi (Kualitas Bagus)",
                desc: "Pengurangan ukuran ~60-70%",
              },
              {
                id: "extreme",
                title: "Kompresi Ekstrem",
                desc: "Ukuran sekecil mungkin, kualitas sedang",
              },
              {
                id: "low",
                title: "Kompresi Rendah",
                desc: "Kualitas tertinggi, ukuran berkurang sedikit",
              },
            ].map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() =>
                  updateSetting("compressionLevel", option.id as any)
                }
                className={`w-full rounded-lg border p-3 text-left text-xs transition-all ${
                  settings.compressionLevel === option.id
                    ? "border-red-500 bg-red-500/10 font-medium text-foreground"
                    : "border-border bg-card text-muted-foreground hover:bg-muted"
                }`}
              >
                <div className="font-bold text-foreground">{option.title}</div>
                <div className="mt-0.5 text-[11px] opacity-80">
                  {option.desc}
                </div>
              </button>
            ))}
          </div>
        </div>
      );

    /* ====================================================================== */
    /* 2. SPLIT_PDF                                                           */
    /* ====================================================================== */
    case "SPLIT_PDF":
      return (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Scissors className="h-4 w-4 text-red-500" />
            <span>Mode Pemisahan Halaman</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => updateSetting("splitMode", "ranges")}
              className={`rounded-md border p-2.5 text-center font-medium ${
                settings.splitMode === "ranges"
                  ? "border-red-500 bg-red-500/10 text-foreground"
                  : "border-border text-muted-foreground hover:bg-muted"
              }`}
            >
              Rentang Halaman
            </button>
            <button
              type="button"
              onClick={() => updateSetting("splitMode", "single_pages")}
              className={`rounded-md border p-2.5 text-center font-medium ${
                settings.splitMode === "single_pages"
                  ? "border-red-500 bg-red-500/10 text-foreground"
                  : "border-border text-muted-foreground hover:bg-muted"
              }`}
            >
              Ekstrak Semua
            </button>
          </div>

          {settings.splitMode === "ranges" && (
            <div className="space-y-1.5">
              <Label className="text-xs">
                Nomor Halaman (contoh: 1-3, 5, 7-10)
              </Label>
              <Input
                value={settings.pageRanges || ""}
                onChange={(e) => updateSetting("pageRanges", e.target.value)}
                placeholder="misal: 1-5, 8"
                className="bg-background text-xs"
              />
            </div>
          )}
        </div>
      );

    /* ====================================================================== */
    /* 3. WATERMARK_PDF                                                       */
    /* ====================================================================== */
    case "WATERMARK_PDF":
      return (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Type className="h-4 w-4 text-red-500" />
            <span>Pengaturan Watermark</span>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Teks Watermark</Label>
            <Input
              value={settings.watermarkText || ""}
              onChange={(e) => updateSetting("watermarkText", e.target.value)}
              placeholder="CONFIDENTIAL / RAHASIA"
              className="bg-background text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Posisi Watermark</Label>
            <select
              value={settings.watermarkPosition || "center"}
              onChange={(e) =>
                updateSetting("watermarkPosition", e.target.value as any)
              }
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs text-foreground"
            >
              <option value="center">Tengah Halaman</option>
              <option value="top-left">Kiri Atas</option>
              <option value="top-right">Kanan Atas</option>
              <option value="bottom-left">Kiri Bawah</option>
              <option value="bottom-right">Kanan Bawah</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">
              Transparansi (
              {Math.round((settings.watermarkOpacity || 0.5) * 100)}%)
            </Label>
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.1"
              value={settings.watermarkOpacity || 0.5}
              onChange={(e) =>
                updateSetting("watermarkOpacity", parseFloat(e.target.value))
              }
              className="w-full cursor-pointer accent-red-600"
            />
          </div>
        </div>
      );

    /* ====================================================================== */
    /* 4. PROTECT_PDF & UNLOCK_PDF                                            */
    /* ====================================================================== */
    case "PROTECT_PDF":
    case "UNLOCK_PDF": {
      const isProtect = toolType === "PROTECT_PDF";
      return (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            {isProtect ? (
              <Lock className="h-4 w-4 text-red-500" />
            ) : (
              <Unlock className="h-4 w-4 text-red-500" />
            )}
            <span>
              {isProtect ? "Atur Kata Sandi Enkripsi" : "Buka Kata Sandi PDF"}
            </span>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">
              {isProtect ? "Kata Sandi Baru" : "Kata Sandi PDF Saat Ini"}
            </Label>
            <Input
              type="password"
              value={settings.password || ""}
              onChange={(e) => updateSetting("password", e.target.value)}
              placeholder="Masukkan password..."
              className="bg-background text-xs"
            />
          </div>
        </div>
      );
    }

    /* ====================================================================== */
    /* 5. PAGE_NUMBERS                                                        */
    /* ====================================================================== */
    case "PAGE_NUMBERS":
      return (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Hash className="h-4 w-4 text-red-500" />
            <span>Format & Posisi Nomor Halaman</span>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Posisi Nomor</Label>
            <select
              value={settings.pageNumberPosition || "bottom-center"}
              onChange={(e) =>
                updateSetting("pageNumberPosition", e.target.value as any)
              }
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs text-foreground"
            >
              <option value="bottom-center">Bawah Tengah</option>
              <option value="bottom-right">Bawah Kanan</option>
              <option value="bottom-left">Bawah Kiri</option>
              <option value="top-center">Atas Tengah</option>
              <option value="top-right">Atas Kanan</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Format Tampilan</Label>
            <select
              value={settings.pageNumberFormat || "page_n"}
              onChange={(e) =>
                updateSetting("pageNumberFormat", e.target.value as any)
              }
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs text-foreground"
            >
              <option value="page_n">Halaman 1</option>
              <option value="n_of_total">1 dari N</option>
              <option value="n">1 (Angka Saja)</option>
            </select>
          </div>
        </div>
      );

    /* ====================================================================== */
    /* 6. ROTATE_PDF                                                          */
    /* ====================================================================== */
    case "ROTATE_PDF":
      return (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <RotateCw className="h-4 w-4 text-red-500" />
            <span>Rotasi Dokumen</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[
              { angle: 90, label: "90° Kanan" },
              { angle: 180, label: "180° Balik" },
              { angle: 270, label: "90° Kiri" },
            ].map((item) => (
              <button
                key={item.angle}
                type="button"
                onClick={() =>
                  updateSetting("rotationAngle", item.angle as any)
                }
                className={`rounded-md border py-3 text-center text-xs font-medium transition-all ${
                  settings.rotationAngle === item.angle
                    ? "border-red-500 bg-red-500/10 font-bold text-foreground"
                    : "border-border text-muted-foreground hover:bg-muted"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      );

    /* ====================================================================== */
    /* 7. JPG_TO_PDF & PDF_TO_JPG                                             */
    /* ====================================================================== */
    case "JPG_TO_PDF":
      return (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <ImageIcon className="h-4 w-4 text-red-500" />
            <span>Tata Letak Halaman PDF</span>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Orientasi</Label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => updateSetting("orientation", "portrait")}
                className={`rounded border p-2 text-center ${
                  settings.orientation === "portrait"
                    ? "border-red-500 bg-red-500/10 font-bold"
                    : "border-border text-muted-foreground"
                }`}
              >
                Potret (Tegak)
              </button>
              <button
                type="button"
                onClick={() => updateSetting("orientation", "landscape")}
                className={`rounded border p-2 text-center ${
                  settings.orientation === "landscape"
                    ? "border-red-500 bg-red-500/10 font-bold"
                    : "border-border text-muted-foreground"
                }`}
              >
                Lansekap (Mendatar)
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Ukuran Margin</Label>
            <select
              value={settings.marginSize || "small"}
              onChange={(e) =>
                updateSetting("marginSize", e.target.value as any)
              }
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs text-foreground"
            >
              <option value="none">Tanpa Margin</option>
              <option value="small">Margin Kecil</option>
              <option value="big">Margin Besar</option>
            </select>
          </div>
        </div>
      );

    case "PDF_TO_JPG":
      return (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <ImageIcon className="h-4 w-4 text-red-500" />
            <span>Kualitas Hasil Gambar</span>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Kualitas Konversi</Label>
            <select
              value={settings.jpgQuality || "high"}
              onChange={(e) =>
                updateSetting("jpgQuality", e.target.value as any)
              }
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs text-foreground"
            >
              <option value="high">Tinggi (300 DPI - Jernih)</option>
              <option value="medium">Sedang (150 DPI)</option>
              <option value="low">Rendah (72 DPI - File Ringan)</option>
            </select>
          </div>
        </div>
      );

    /* ====================================================================== */
    /* 8. SIGN_PDF                                                            */
    /* ====================================================================== */
    case "SIGN_PDF":
      return (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <ShieldCheck className="h-4 w-4 text-red-500" />
            <span>Tanda Tangan Dokumen</span>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Nama Pemilik Tanda Tangan</Label>
            <Input
              value={settings.signName || ""}
              onChange={(e) => updateSetting("signName", e.target.value)}
              placeholder="Contoh: John Doe"
              className="bg-background text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Posisi Tanda Tangan</Label>
            <select
              value={settings.signPosition || "bottom-right"}
              onChange={(e) =>
                updateSetting("signPosition", e.target.value as any)
              }
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs text-foreground"
            >
              <option value="bottom-right">Bawah Kanan</option>
              <option value="bottom-left">Bawah Kiri</option>
              <option value="bottom-center">Bawah Tengah</option>
            </select>
          </div>
        </div>
      );

    /* ====================================================================== */
    /* 9. GENERAL CONVERSIONS                                                 */
    /* ====================================================================== */
    case "PDF_TO_WORD":
    case "PDF_TO_EXCEL":
    case "PDF_TO_POWERPOINT":
    case "WORD_TO_PDF":
    case "EXCEL_TO_PDF":
    case "POWERPOINT_TO_PDF":
    case "HTML_TO_PDF":
      return (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Sparkles className="h-4 w-4 text-red-500" />
            <span>Opsi Konversi Dokumen</span>
          </div>

          <label className="flex cursor-pointer items-center gap-3 rounded-md border border-border bg-card p-3">
            <input
              type="checkbox"
              checked={!!settings.enableOcr}
              onChange={(e) => updateSetting("enableOcr", e.target.checked)}
              className="h-4 w-4 accent-red-600"
            />
            <div className="text-xs">
              <div className="font-bold text-foreground">
                Aktifkan OCR (Pengenalan Teks)
              </div>
              <div className="text-[11px] text-muted-foreground">
                Ubah dokumen hasil pemindaian/scan menjadi teks yang bisa
                diedit.
              </div>
            </div>
          </label>
        </div>
      );

    /* ====================================================================== */
    /* 10. MERGE_PDF, ORGANIZE_PDF, EDIT_PDF, REPAIR_PDF                      */
    /* ====================================================================== */
    case "MERGE_PDF":
      return (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Layers className="h-4 w-4 text-red-500" />
            <span>Pengaturan Penggabungan</span>
          </div>
          <p className="text-xs leading-relaxed text-muted-foreground">
            Semua file di sebelah kiri akan digabungkan menjadi 1 dokumen
            tunggal secara berurutan dari atas ke bawah.
          </p>
        </div>
      );

    case "ORGANIZE_PDF":
      return (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Layout className="h-4 w-4 text-red-500" />
            <span>Organisasi Halaman</span>
          </div>
          <p className="text-xs leading-relaxed text-muted-foreground">
            Gunakan antarmuka utama untuk menghapus, mengurutkan ulang, atau
            memutar halaman spesifik sebelum diproses.
          </p>
        </div>
      );

    case "REPAIR_PDF":
      return (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Wrench className="h-4 w-4 text-red-500" />
            <span>Pemulihan Dokumen</span>
          </div>
          <p className="text-xs leading-relaxed text-muted-foreground">
            Sistem akan menganalisis struktur file PDF yang rusak dan
            memperbaiki indeks tabel yang korup.
          </p>
        </div>
      );

    default:
      return (
        <div className="text-xs italic text-muted-foreground">
          Opsi standar telah disesuaikan secara otomatis untuk tool ini.
        </div>
      );
  }
}