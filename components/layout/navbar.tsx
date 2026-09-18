// components/layout/navbar.tsx
"use client"

import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import { Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "@/components/layout/theme-toggle"
import { UserMenu } from "@/components/auth/user-menu"

// Import komponen menu yang sudah dipisah
import { NavDropdown } from "@/components/menu/nav-dropdown"
import { NavDropdownMobile } from "@/components/menu/nav-dropdown-mobile"
import { PdfConversionMenu } from "@/components/menu/pdf-conversion-menu"
import { AllToolsMenu } from "@/components/menu/all-tools-menu"

type NavbarProps = {
  session: {
    user?: {
      name?: string | null
      email?: string | null
      image?: string | null
    }
  } | null
}

export function Navbar({ session }: NavbarProps) {
  const [open, setOpen] = useState(false)
  const isLoggedIn = !!session?.user

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
          <li>
            <Link
              href="/combine-pdf"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Combine PDF
            </Link>
          </li>
          <li>
            <Link
              href="/separate-pdf"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Separate PDF
            </Link>
          </li>
          <li>
            <Link
              href="/compress-pdf"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Compress PDF
            </Link>
          </li>

          {/* PDF Conversion — 2 kolom seperti gambar */}
          <li>
            <NavDropdown label="PDF Conversion" href="/convert-pdf">
              <PdfConversionMenu />
            </NavDropdown>
          </li>

          {/* All PDF Tools */}
          <li>
            <NavDropdown label="All PDF Tools" href="/tools">
              <AllToolsMenu />
            </NavDropdown>
          </li>
        </ul>

        {/* CTA + Theme toggle */}
        <div className="hidden items-center gap-3 md:flex">
          <ThemeToggle />
          {isLoggedIn ? (
            <UserMenu user={session.user!} />
          ) : (
            <>
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
            </>
          )}
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
          open ? "max-h-[60rem]" : "max-h-0 border-transparent"
        )}
      >
        <div className="flex items-center justify-between px-4 pt-4">
          <span className="text-xs font-medium uppercase text-muted-foreground">
            Theme
          </span>
          <ThemeToggle />
        </div>

        <ul className="space-y-1 px-4 py-4">
          <li>
            <Link
              href="/combine-pdf"
              onClick={() => setOpen(false)}
              className="block rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              Combine PDF
            </Link>
          </li>
          <li>
            <Link
              href="/separate-pdf"
              onClick={() => setOpen(false)}
              className="block rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              Separate PDF
            </Link>
          </li>
          <li>
            <Link
              href="/compress-pdf"
              onClick={() => setOpen(false)}
              className="block rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              Compress PDF
            </Link>
          </li>

          {/* PDF Conversion — mobile pakai versi list */}
          <NavDropdownMobile label="PDF Conversion">
            <PdfConversionMenu />
          </NavDropdownMobile>

          {/* All PDF Tools — mobile */}
          <NavDropdownMobile label="All PDF Tools">
            <AllToolsMenu />
          </NavDropdownMobile>
        </ul>

        {/* Mobile auth section */}
        <div className="border-t px-4 py-4">
          {isLoggedIn ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {session.user?.image ? (
                  <Image
                    src={session.user.image}
                    alt={session.user.name ?? "User"}
                    width={36}
                    height={36}
                    className="h-9 w-9 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-sm font-medium">
                    {session.user?.name?.[0]?.toUpperCase() ?? "U"}
                  </div>
                )}
                <div className="flex flex-col">
                  <span className="text-sm font-medium">
                    {session.user?.name ?? "User"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {session.user?.email}
                  </span>
                </div>
              </div>
              <UserMenu user={session.user!} />
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="rounded-lg border px-4 py-2 text-center text-sm font-medium hover:bg-muted"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                onClick={() => setOpen(false)}
                className="rounded-lg bg-primary px-4 py-2 text-center text-sm font-medium text-primary-foreground hover:opacity-90"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}