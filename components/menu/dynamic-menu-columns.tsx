// components/menu/dynamic-menu-columns.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import type { MenuColumnData } from "@/lib/queries/tool-menus";

interface Props {
  columns: MenuColumnData[];
  /** Kolom per baris — default 2 */
  gridCols?: 1 | 2 | 3 | 4 | 5;
  /** Mode mobile: 1 kolom, tanpa padding ekstra */
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

  // ✅ Responsive grid class per jumlah kolom
  // Format: [base] [sm] [md] [lg] [xl]
  const gridClassMap: Record<number, string> = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
    5: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5",
  };

  const gridClass = mobile
    ? "grid-cols-1"
    : gridClassMap[gridCols] ?? gridClassMap[2];

  return (
    <div className={`grid ${gridClass} ${mobile ? "gap-2" : "gap-5"}`}>
      {columns.map((col) => (
        <div key={col.id} className="min-w-0">
          <h3
            className={`font-bold uppercase tracking-wider text-muted-foreground ${
              mobile ? "mb-1.5 px-1 text-[10px]" : "mb-2 text-[11px]"
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
                    className="flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                  >
                    {item.icon ? (
                      <Image
                        src={item.icon}
                        alt=""
                        width={20}
                        height={20}
                        className="h-5 w-5 shrink-0 object-contain"
                      />
                    ) : (
                      <span className="h-5 w-5 shrink-0 rounded bg-muted" />
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