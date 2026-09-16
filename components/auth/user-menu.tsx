// components/auth/user-menu.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { LayoutDashboard, LogOut, User as UserIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type UserMenuProps = {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
};

export function UserMenu({ user }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Tutup saat klik di luar
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await signOut({ redirect: false });
      // Full reload agar BFCache dibersihkan → tidak bisa back ke halaman terproteksi
      window.location.href = "/login";
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const initials =
    user.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U";

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="true"
        className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border bg-muted text-sm font-medium transition-colors hover:bg-muted/80"
      >
        {user.image ? (
          <Image
            src={user.image}
            alt={user.name ?? "User avatar"}
            width={36}
            height={36}
            className="h-full w-full object-cover"
          />
        ) : (
          <span>{initials}</span>
        )}
      </button>

      <div
        className={cn(
          "absolute right-0 top-full mt-2 transition-all",
          open
            ? "visible opacity-100 translate-y-0"
            : "invisible opacity-0 -translate-y-1"
        )}
      >
        <div className="min-w-[220px] overflow-hidden rounded-xl border bg-popover shadow-lg">
          {/* Header: name + email */}
          <div className="border-b px-4 py-3">
            <p className="truncate text-sm font-medium">{user.name ?? "User"}</p>
            <p className="truncate text-xs text-muted-foreground">
              {user.email}
            </p>
          </div>

          {/* Menu items */}
          <ul className="p-1">
            <li>
              <Link
                href="/dashboard"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Link>
            </li>
            <li>
              <Link
                href="/profile"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <UserIcon className="h-4 w-4" />
                Profile
              </Link>
            </li>
            <li>
              <button
                type="button"
                onClick={handleLogout}
                disabled={loading}
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <LogOut className="h-4 w-4" />
                )}
                {loading ? "Logging out..." : "Log out"}
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}