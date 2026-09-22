"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type NavDropdownProps = {
  label: string;
  href: string;
  children: React.ReactNode;
  /** Posisi panel: start = kiri trigger, end = kanan trigger, viewport-center = center viewport */
  align?: "start" | "center" | "end" | "viewport-center";
  panelClassName?: string;
};

export function NavDropdown({
  label,
  href,
  children,
  align = "start",
  panelClassName,
}: NavDropdownProps) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const panelRef = React.useRef<HTMLDivElement>(null);
  const [arrowLeft, setArrowLeft] = React.useState<number | null>(null);
  const [panelStyle, setPanelStyle] = React.useState<React.CSSProperties>({});

  // Close on click outside
  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close on Escape
  React.useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [open]);

  // ✅ Hitung posisi panel + arrow
  React.useEffect(() => {
    if (!open || !triggerRef.current || !panelRef.current) return;

    const compute = () => {
      if (!triggerRef.current || !panelRef.current) return;

      const trigger = triggerRef.current.getBoundingClientRect();
      const panel = panelRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const margin = 16;

      let panelLeft: number;

      if (align === "viewport-center") {
        // ✅ Panel SELALU center viewport
        panelLeft = (viewportWidth - panel.width) / 2;
        // Clamp kalau viewport lebih sempit dari panel
        panelLeft = Math.max(margin, Math.min(panelLeft, viewportWidth - panel.width - margin));
      } else if (align === "center") {
        // Center ke trigger
        panelLeft = trigger.left + trigger.width / 2 - panel.width / 2;
        panelLeft = Math.max(margin, Math.min(panelLeft, viewportWidth - panel.width - margin));
      } else if (align === "end") {
        // Kanan trigger
        panelLeft = trigger.right - panel.width;
        panelLeft = Math.max(margin, Math.min(panelLeft, viewportWidth - panel.width - margin));
      } else {
        // start: kiri trigger
        panelLeft = trigger.left;
        panelLeft = Math.max(margin, Math.min(panelLeft, viewportWidth - panel.width - margin));
      }

      // Posisi panel relatif ke wrapper (yang `position: relative`)
      const wrapper = ref.current?.getBoundingClientRect();
      const wrapperLeft = wrapper?.left ?? 0;
      const offsetLeft = panelLeft - wrapperLeft;

      // ✅ Simpan style untuk panel wrapper
      setPanelStyle({
        left: `${offsetLeft}px`,
        transform: "none", // reset transform default dari alignClass
      });

      // ✅ Hitung arrow: posisi trigger center, relatif ke panel
      const triggerCenter = trigger.left + trigger.width / 2;
      const arrowRelative = triggerCenter - panelLeft;
      // Clamp agar arrow tidak keluar panel
      const clampedArrow = Math.max(16, Math.min(arrowRelative, panel.width - 16));
      setArrowLeft(clampedArrow);
    };

    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, [open, align]);

  // Class default jika align belum dihitung (sebelum panel terbuka)
  const alignClass = {
    start: "left-0",
    center: "left-1/2 -translate-x-1/2",
    end: "right-0",
    "viewport-center": "left-1/2 -translate-x-1/2",
  }[align];

  return (
    <div
      ref={ref}
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      {/* Trigger */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="true"
        className={cn(
          "flex items-center text-sm font-medium transition-colors",
          open
            ? "text-foreground"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        {label}
      </button>

      {/* Panel Wrapper */}
      <div
        className={cn(
          "absolute top-full z-[100] pt-6 transition-all duration-200 ease-out",
          open
            ? "visible translate-y-0 opacity-100"
            : "invisible -translate-y-2 opacity-0"
        )}
        style={
          open && panelStyle.left
            ? {
                ...panelStyle,
                // Saat open, pakai posisi yang sudah dihitung
                left: panelStyle.left,
                transform: undefined,
              }
            : undefined
        }
      >
        <div className="relative" ref={panelRef}>
          {/* Panel Konten */}
          <div
            className={cn(
              "relative z-10 rounded-none border border-border/60 bg-popover",
              "shadow-[0_12px_40px_-8px_rgba(0,0,0,0.18)] ring-1 ring-black/5",
              "max-w-[calc(100vw-2rem)] overflow-hidden",
              "animate-in fade-in-0 zoom-in-95",
              panelClassName
            )}
          >
            {children}
          </div>

          {/* ARROW */}
          <div
            className="absolute -top-[6px] z-20 h-3.5 w-3.5 rotate-45 border-l border-t border-border/60 bg-popover shadow-[-4px_-4px_10px_rgba(0,0,0,0.02)]"
            style={
              arrowLeft !== null
                ? { left: `${arrowLeft - 7}px` }
                : { left: "50%", transform: "translateX(-50%) rotate(45deg)" }
            }
            aria-hidden="true"
          />
        </div>
      </div>
    </div>
  );
}