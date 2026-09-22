// components/admin/system/log-detail-sheet.tsx
"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { EyeIcon } from "@phosphor-icons/react";

interface Props {
  log: {
    id: string;
    level: string;
    action: string;
    message: string;
    meta: unknown;
    createdAt: Date;
  };
}

export function LogDetailSheet({ log }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      {/* ✅ Tanpa asChild */}
      <SheetTrigger
        aria-label="Lihat detail log"
        className={cn(
          "inline-flex h-8 w-8 items-center justify-center rounded-md",
          "text-muted-foreground transition-colors",
          "hover:bg-accent hover:text-accent-foreground",
          "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        )}
      >
        <EyeIcon className="h-4 w-4" />
      </SheetTrigger>

      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Log Detail</SheetTitle>
          <SheetDescription className="font-mono text-xs">
            {log.id}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          <div>
            <p className="text-xs font-medium uppercase text-muted-foreground">
              Level
            </p>
            <p className="font-mono">{log.level}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase text-muted-foreground">
              Action
            </p>
            <p className="font-mono">{log.action}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase text-muted-foreground">
              Waktu
            </p>
            <p>{new Date(log.createdAt).toLocaleString("id-ID")}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase text-muted-foreground">
              Message
            </p>
            <pre className="mt-1 whitespace-pre-wrap rounded-md bg-muted p-3 text-sm font-mono">
              {log.message}
            </pre>
          </div>
          {log.meta !== null && log.meta !== undefined && (
            <div>
              <p className="text-xs font-medium uppercase text-muted-foreground">
                Meta
              </p>
              <pre className="mt-1 max-h-96 overflow-auto rounded-md bg-muted p-3 text-xs font-mono">
                {JSON.stringify(log.meta, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}