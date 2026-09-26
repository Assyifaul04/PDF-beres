// components/upload/output-format-popover.tsx
"use client";

import * as React from "react";
import { Search, ChevronUp, ChevronDown } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FormatCategory {
  id: string;
  label: string;
  formats: string[];
}

const CATEGORIES: FormatCategory[] = [
  { id: "ebook", label: "Ebook", formats: ["EPUB", "MOBI", "AZW3", "FB2"] },
  { id: "image", label: "Image", formats: ["JPG", "PNG", "WEBP", "SVG", "GIF"] },
  {
    id: "document",
    label: "Document",
    formats: [
      "DOC", "DOCX", "EXCEL", "HTML", "ODT", "PDF", 
      "PPT", "PPTX", "PS", "RTF", "TEXT", "TXT", 
      "WORD", "XLS", "XLSX"
    ]
  },
  { id: "laporan", label: "Laporan", formats: ["CSV", "XLSX", "PDF"] },
];

interface OutputFormatPopoverProps {
  value: string;
  onChange: (value: string) => void;
}

export function OutputFormatPopover({ value, onChange }: OutputFormatPopoverProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [activeCategory, setActiveCategory] = React.useState("document");

  const currentCategoryObj = CATEGORIES.find((c) => c.id === activeCategory) || CATEGORIES[2];

  // Filter format berdasarkan query pencarian jika ada
  const displayedFormats = React.useMemo(() => {
    if (!search.trim()) return currentCategoryObj.formats;
    const allFormats = CATEGORIES.flatMap((c) => c.formats);
    return Array.from(new Set(allFormats)).filter((fmt) =>
      fmt.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, currentCategoryObj]);

  const handleSelect = (fmt: string) => {
    onChange(fmt);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        role="combobox"
        aria-expanded={open}
        className={cn(
          buttonVariants({ variant: "outline" }),
          "h-10 w-full justify-between gap-1.5 border-black/20 px-3 font-semibold text-foreground hover:bg-gray-50"
        )}
      >
        {value.toUpperCase() || "SELECT"}
        {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </PopoverTrigger>
      
      <PopoverContent className="w-[360px] p-4" align="end">
        {/* Input Pencarian */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Format Pencarian"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-muted/50 pl-9"
          />
        </div>

        <div className="flex min-h-[220px] gap-4">
          {/* Sidebar Kategori (Sembunyikan saat mencari) */}
          {!search && (
            <div className="w-28 shrink-0 border-r pr-2 space-y-1">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-md px-2 py-1.5 text-xs font-medium transition-colors text-left",
                    activeCategory === cat.id
                      ? "text-primary font-bold"
                      : "text-muted-foreground hover:bg-muted"
                  )}
                >
                  {cat.label}
                  {activeCategory === cat.id && <span className="text-primary">▸</span>}
                </button>
              ))}
            </div>
          )}

          {/* Grid Tombol Format */}
          <div className="flex-1 overflow-y-auto max-h-[220px]">
            <div className="grid grid-cols-3 gap-2">
              {displayedFormats.map((fmt) => {
                const isSelected = value.toUpperCase() === fmt.toUpperCase();
                return (
                  <button
                    key={fmt}
                    type="button"
                    onClick={() => handleSelect(fmt)}
                    className={cn(
                      "flex h-9 items-center justify-center rounded-md border text-xs font-medium uppercase transition-colors",
                      isSelected
                        ? "bg-primary text-primary-foreground border-primary font-semibold"
                        : "bg-muted/40 hover:bg-muted border-transparent text-foreground"
                    )}
                  >
                    {fmt}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}