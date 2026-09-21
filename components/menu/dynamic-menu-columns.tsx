// components/menu/dynamic-menu-columns.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import type { MenuColumnData } from "@/lib/queries/tool-menus";

interface Props {
  columns: MenuColumnData[];
  /** Kolom per baris — default 2 */
  gridCols?: 1 | 2 | 3;
  /** Mode mobile: 1 kolom, tanpa min-width */
  mobile?: boolean;
}

export function DynamicMenuColumns({
  columns,
  gridCols = 2,
  mobile = false,
}: Props) {
  if (columns.length === 0) {
    return (
      <div className="p-6 text-center text-sm text-muted-foreground">
        Belum ada menu tersedia
      </div>
    );
  }

  // ✅ Mobile: paksa 1 kolom, tanpa min-width
  const gridClass = mobile
    ? "grid-cols-1"
    : {
        1: "grid-cols-1 sm:min-w-[280px]",
        2: "grid-cols-1 sm:grid-cols-2 sm:min-w-[560px]",
        3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 sm:min-w-[560px] lg:min-w-[840px]",
      }[gridCols];

  return (
    <div
      className={`grid ${gridClass} ${
        mobile ? "gap-2" : "gap-6 p-4"
      }`}
    >
      {columns.map((col) => (
        <div key={col.id}>
          <h3
            className={`font-bold uppercase tracking-wider text-muted-foreground ${
              mobile ? "mb-1.5 px-1 text-[10px]" : "mb-3 text-xs"
            }`}
          >
            {col.title}
          </h3>

          {col.items.length === 0 ? (
            <p className="px-2 text-xs text-muted-foreground">
              Belum ada menu
            </p>
          ) : (
            <ul className="space-y-0.5">
              {col.items.map((item) => (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 rounded-md text-sm font-semibold text-foreground transition-colors hover:bg-muted ${
                      mobile ? "px-2 py-2" : "px-2 py-2"
                    }`}
                  >
                    {item.icon ? (
                      <Image
                        src={item.icon}
                        alt=""
                        width={24}
                        height={24}
                        className="h-5 w-5 shrink-0 object-contain sm:h-6 sm:w-6"
                      />
                    ) : (
                      <span className="h-5 w-5 shrink-0 rounded bg-muted sm:h-6 sm:w-6" />
                    )}
                    <span className="truncate">{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}