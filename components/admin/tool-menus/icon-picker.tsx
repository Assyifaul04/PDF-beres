// components/admin/tool-menus/icon-picker.tsx
"use client";

import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { CaretUpDownIcon, CheckIcon } from "@phosphor-icons/react";
import { TOOL_ICONS, findIcon } from "@/lib/tool-icons";

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function IconPicker({
  value,
  onChange,
  placeholder = "Pilih icon...",
}: Props) {
  const [open, setOpen] = React.useState(false);
  const selected = findIcon(value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        role="combobox"
        aria-expanded={open}
        className={cn(
          "inline-flex w-full items-center justify-between gap-2",
          "h-9 rounded-md border border-input bg-transparent px-3 py-2",
          "text-sm font-normal shadow-sm transition-colors",
          "hover:bg-accent hover:text-accent-foreground",
          "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
          "disabled:pointer-events-none disabled:opacity-50"
        )}
      >
        {selected ? (
          <span className="flex min-w-0 items-center gap-2">
            <Image
              src={selected.value}
              alt=""
              width={20}
              height={20}
              className="h-5 w-5 shrink-0 object-contain"
            />
            <span className="truncate">{selected.label}</span>
          </span>
        ) : (
          <span className="text-muted-foreground">{placeholder}</span>
        )}
        <CaretUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </PopoverTrigger>

      <PopoverContent className="w-[320px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Cari icon..." />
          <CommandList>
            <CommandEmpty>Icon tidak ditemukan.</CommandEmpty>
            <CommandGroup>
              {TOOL_ICONS.map((icon) => (
                <CommandItem
                  key={icon.value}
                  value={`${icon.label} ${icon.value}`}
                  onSelect={() => {
                    onChange(icon.value === value ? "" : icon.value);
                    setOpen(false);
                  }}
                  className="flex items-center gap-2"
                >
                  <Image
                    src={icon.value}
                    alt=""
                    width={24}
                    height={24}
                    className="h-6 w-6 shrink-0 object-contain"
                  />
                  <span className="flex-1 truncate">{icon.label}</span>
                  <CheckIcon
                    className={cn(
                      "h-4 w-4 shrink-0",
                      value === icon.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}