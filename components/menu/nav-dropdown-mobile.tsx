// components/menu/nav-dropdown-mobile.tsx
"use client"

import * as React from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

type NavDropdownMobileProps = {
  label: string
  children: React.ReactNode
}

export function NavDropdownMobile({ label, children }: NavDropdownMobileProps) {
  const [open, setOpen] = React.useState(false)

  return (
    <li>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
      >
        {label}
        <ChevronDown
          className={cn("h-4 w-4 transition-transform", open && "rotate-180")}
        />
      </button>

      <div
        className={cn(
          "overflow-hidden transition-all",
          open ? "max-h-[32rem]" : "max-h-0"
        )}
      >
        <div className="ml-3 border-l pl-3 pt-1">{children}</div>
      </div>
    </li>
  )
}