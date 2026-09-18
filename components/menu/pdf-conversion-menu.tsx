// components/menu/pdf-conversion-menu.tsx
"use client"

import Link from "next/link"
import Image from "next/image"

type MenuItem = {
  href: string
  label: string
  icon: string // path ke /public/image/icons/...
}

type MenuColumn = {
  title: string
  items: MenuItem[]
}

const columns: MenuColumn[] = [
  {
    title: "Konversi ke PDF",
    items: [
      { href: "/convert-pdf/jpg-to-pdf", label: "JPG ke PDF", icon: "/image/icons/jpg.png" },
      { href: "/convert-pdf/word-to-pdf", label: "WORD ke PDF", icon: "/image/icons/word.png" },
      { href: "/convert-pdf/ppt-to-pdf", label: "POWERPOINT ke PDF", icon: "/image/icons/ppt.png" },
      { href: "/convert-pdf/excel-to-pdf", label: "EXCEL ke PDF", icon: "/image/icons/excel.png" },
      { href: "/convert-pdf/html-to-pdf", label: "HTML ke PDF", icon: "/image/icons/html.png" },
    ],
  },
  {
    title: "Konversi dari PDF",
    items: [
      { href: "/convert-pdf/pdf-to-jpg", label: "PDF ke JPG", icon: "/image/icons/pdf.png" },
      { href: "/convert-pdf/pdf-to-word", label: "PDF ke WORD", icon: "/image/icons/pdf-word.png" },
      { href: "/convert-pdf/pdf-to-ppt", label: "PDF ke POWERPOINT", icon: "/image/icons/pdf-ppt.png" },
      { href: "/convert-pdf/pdf-to-excel", label: "PDF ke EXCEL", icon: "/image/icons/pdf-excel.png" },
      { href: "/convert-pdf/pdf-to-pdfa", label: "PDF ke PDF/A", icon: "/image/icons/pdf-a.png" },
    ],
  },
]

export function PdfConversionMenu() {
  return (
    <div className="grid grid-cols-2 gap-6 p-4 min-w-[560px]">
      {columns.map((col) => (
        <div key={col.title}>
          <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {col.title}
          </h3>
          <ul className="space-y-1">
            {col.items.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex items-center gap-3 rounded-md px-2 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
                >
                  <Image
                    src={item.icon}
                    alt=""
                    width={24}
                    height={24}
                    className="h-6 w-6 shrink-0 object-contain"
                  />
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}