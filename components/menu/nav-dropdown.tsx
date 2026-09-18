// components/menu/nav-dropdown.tsx
"use client"

import * as React from "react"
import Link from "next/link"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

type NavDropdownProps = {
  label: string
  href: string
  children: React.ReactNode
  /** apakah dropdown lebar (2 kolom) atau normal */
  wide?: boolean
}

export function NavDropdown({ label, href, children, wide = false }: NavDropdownProps) {
  const [open, setOpen] = React.useState(false)
  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div
      ref={ref}
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="true"
        className="flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        {label}
        <ChevronDown
          className={cn("h-4 w-4 transition-transform", open && "rotate-180")}
        />
      </button>

      <div
        className={cn(
          "absolute left-0 top-full pt-2 transition-all",
          open
            ? "visible opacity-100 translate-y-0"
            : "invisible opacity-0 -translate-y-1"
        )}
      >
        <div className="rounded-xl border bg-popover shadow-lg">
          {children}
        </div>
      </div>
    </div>
  )
}