// components/menu/nav-dropdown-mobile.tsx
"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

type NavDropdownMobileProps = {
  label: string;
  children: React.ReactNode;
};

export function NavDropdownMobile({ label, children }: NavDropdownMobileProps) {
  const [open, setOpen] = React.useState(false);
  const contentRef = React.useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = React.useState(0);

  // Ukur tinggi konten supaya animasi smooth (bukan max-h magic number)
  React.useEffect(() => {
    if (!contentRef.current) return;
    const el = contentRef.current;
    const update = () => setContentHeight(el.scrollHeight);
    update();

    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <li className="w-full">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className={cn(
          "flex w-full items-center justify-between rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
          open
            ? "bg-muted text-foreground"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        )}
      >
        <span>{label}</span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>

      {/* Panel accordion */}
      <div
        className="overflow-hidden transition-[max-height,opacity] duration-300 ease-out"
        style={{
          maxHeight: open ? `${contentHeight + 8}px` : "0px",
          opacity: open ? 1 : 0,
        }}
        aria-hidden={!open}
      >
        <div
          ref={contentRef}
          className="ml-2 mt-1 border-l-2 border-border/60 pl-3 pb-2"
        >
          {children}
        </div>
      </div>
    </li>
  );
}