// components/upload/add-more-files-button.tsx
"use client";

import * as React from "react";
import { FilePlus2, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  /** Callback saat tombol utama diklik */
  onClick: () => void;
  /** Callback saat chevron dropdown diklik */
  onDropdownClick?: () => void;
  /** Label tombol (default: "Tambahkan Lebih Banyak File") */
  label?: string;
  /** Nonaktifkan */
  disabled?: boolean;
  /** Apakah dropdown sedang terbuka */
  isOpen?: boolean;
  className?: string;
}

/**
 * Tombol "Tambahkan Lebih Banyak File" + dropdown chevron.
 * Muncul di atas file card saat sudah ada file yang diupload.
 */
export function AddMoreFilesButton({
  onClick,
  onDropdownClick,
  label = "Tambahkan Lebih Banyak File",
  disabled = false,
  isOpen = false,
  className,
}: Props) {
  return (
    <div
      className={cn(
        "inline-flex overflow-hidden rounded-md border",
        className
      )}
    >
      {/* Tombol utama */}
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        title={label}
        className={cn(
          "inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors",
          "bg-primary/5 text-primary hover:bg-primary/10",
          "disabled:cursor-not-allowed disabled:opacity-50"
        )}
      >
        <FilePlus2 className="h-4 w-4 shrink-0" />
        <span className="truncate">{label}</span>
      </button>

      {/* Chevron dropdown */}
      <button
        type="button"
        onClick={onDropdownClick}
        disabled={disabled || !onDropdownClick}
        aria-label="Opsi lain"
        aria-haspopup="true"
        aria-expanded={isOpen}
        className={cn(
          "inline-flex items-center border-l border-primary/20 px-2.5",
          "bg-primary/5 text-primary hover:bg-primary/10",
          "disabled:cursor-not-allowed disabled:opacity-50",
          // Rotasi chevron saat open
          isOpen && "[&_svg]:rotate-180"
        )}
      >
        <ChevronDown className="h-4 w-4 transition-transform duration-200" />
      </button>
    </div>
  );
}