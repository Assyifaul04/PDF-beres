// components/layout/navbar.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/layout/theme-toggle";

type NavLink = {
  href: string;
  label: string;
  children?: { href: string; label: string; desc?: string }[];
};

const navLinks: NavLink[] = [
  { href: "/combine-pdf", label: "Combine PDF" },
  { href: "/separate-pdf", label: "Separate PDF" },
  { href: "/compress-pdf", label: "Compress PDF" },
  {
    href: "/convert-pdf",
    label: "PDF Conversion",
    children: [
      { href: "/convert-pdf/pdf-to-word", label: "PDF to Word" },
      { href: "/convert-pdf/pdf-to-excel", label: "PDF to Excel" },
      { href: "/convert-pdf/pdf-to-jpg", label: "PDF to JPG" },
      { href: "/convert-pdf/pdf-to-ppt", label: "PDF to PowerPoint" },
      { href: "/convert-pdf/word-to-pdf", label: "Word to PDF" },
      { href: "/convert-pdf/jpg-to-pdf", label: "JPG to PDF" },
    ],
  },
  {
    href: "/tools",
    label: "All PDF Tools",
    children: [
      { href: "/tools/merge-pdf", label: "Merge PDF" },
      { href: "/tools/split-pdf", label: "Split PDF" },
      { href: "/tools/rotate-pdf", label: "Rotate PDF" },
      { href: "/tools/protect-pdf", label: "Protect PDF" },
      { href: "/tools/unlock-pdf", label: "Unlock PDF" },
      { href: "/tools/watermark-pdf", label: "Watermark PDF" },
      { href: "/tools/sign-pdf", label: "Sign PDF" },
      { href: "/tools/organize-pdf", label: "Organize PDF" },
    ],
  },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" aria-label="Beres — Home" className="flex items-center">
          <Image
            src="/image/Logo Beres.png"
            alt="Beres"
            width={140}
            height={60}
            priority
            className="h-9 w-auto object-contain"
          />
        </Link>

        {/* Desktop links */}
        <ul className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) =>
            link.children ? (
              <li key={link.href}>
                <DropdownNavItem link={link} />
              </li>
            ) : (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {link.label}
                </Link>
              </li>
            )
          )}
        </ul>

        {/* CTA + Theme toggle */}
        <div className="hidden items-center gap-3 md:flex">
          <ThemeToggle />
          <Link
            href="/login"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Get Started
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          aria-label="Toggle menu"
          onClick={() => setOpen((v) => !v)}
          className="md:hidden"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {/* Mobile menu */}
      <div
        className={cn(
          "overflow-hidden border-t transition-all md:hidden",
          open ? "max-h-[32rem]" : "max-h-0 border-transparent"
        )}
      >
        <div className="flex items-center justify-between px-4 pt-4">
          <span className="text-xs font-medium uppercase text-muted-foreground">
            Theme
          </span>
          <ThemeToggle />
        </div>
        <ul className="space-y-1 px-4 py-4">
          {navLinks.map((link) =>
            link.children ? (
              <MobileDropdownItem key={link.href} link={link} />
            ) : (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  {link.label}
                </Link>
              </li>
            )
          )}
        </ul>
      </div>
    </header>
  );
}

/* ---------- Dropdown untuk desktop ---------- */
function DropdownNavItem({ link }: { link: NavLink }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Tutup dropdown saat klik di luar
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
        {link.label}
        <ChevronDown
          className={cn(
            "h-4 w-4 transition-transform",
            open && "rotate-180"
          )}
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
        <ul className="min-w-[220px] rounded-xl border bg-popover p-2 shadow-lg">
          {link.children?.map((child) => (
            <li key={child.href}>
              <Link
                href={child.href}
                className="block rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {child.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* ---------- Dropdown untuk mobile ---------- */
function MobileDropdownItem({ link }: { link: NavLink }) {
  const [open, setOpen] = useState(false);

  return (
    <li>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
      >
        {link.label}
        <ChevronDown
          className={cn("h-4 w-4 transition-transform", open && "rotate-180")}
        />
      </button>

      <div
        className={cn(
          "overflow-hidden transition-all",
          open ? "max-h-96" : "max-h-0"
        )}
      >
        <ul className="ml-3 space-y-1 border-l pl-3 pt-1">
          {link.children?.map((child) => (
            <li key={child.href}>
              <Link
                href={child.href}
                className="block rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                {child.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </li>
  );
}