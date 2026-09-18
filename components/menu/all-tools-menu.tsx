// components/menu/all-tools-menu.tsx
"use client"

import Link from "next/link"
import { FileTextIcon, ScissorsIcon, RotateCwIcon, LockIcon, UnlockIcon, DropletIcon, PenToolIcon, LayoutGridIcon } from "lucide-react"

const tools = [
  { href: "/tools/merge-pdf", label: "Merge PDF", icon: FileTextIcon },
  { href: "/tools/split-pdf", label: "Split PDF", icon: ScissorsIcon },
  { href: "/tools/rotate-pdf", label: "Rotate PDF", icon: RotateCwIcon },
  { href: "/tools/protect-pdf", label: "Protect PDF", icon: LockIcon },
  { href: "/tools/unlock-pdf", label: "Unlock PDF", icon: UnlockIcon },
  { href: "/tools/watermark-pdf", label: "Watermark PDF", icon: DropletIcon },
  { href: "/tools/sign-pdf", label: "Sign PDF", icon: PenToolIcon },
  { href: "/tools/organize-pdf", label: "Organize PDF", icon: LayoutGridIcon },
]

export function AllToolsMenu() {
  return (
    <ul className="min-w-[220px] p-2">
      {tools.map((tool) => {
        const Icon = tool.icon
        return (
          <li key={tool.href}>
            <Link
              href={tool.href}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{tool.label}</span>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}