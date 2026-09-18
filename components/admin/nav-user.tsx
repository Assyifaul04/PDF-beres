"use client"

import * as React from "react"
import { signOut, useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import {
  CaretUpDownIcon,
  SparkleIcon,
  CheckCircleIcon,
  CreditCardIcon,
  BellIcon,
  SignOutIcon,
  SunIcon,
  MoonIcon,
  DesktopIcon,
  CircleNotchIcon,
  CheckIcon,
} from "@phosphor-icons/react"

export function NavUser({
  user,
}: {
  user: {
    name: string
    email: string
    avatar: string
  }
}) {
  const { isMobile } = useSidebar()
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const { data: session } = useSession()

  const [isLoggingOut, setIsLoggingOut] = React.useState(false)
  const [mounted, setMounted] = React.useState(false)

  // ✅ Guard agar theme tidak flicker di SSR
  React.useEffect(() => {
    setMounted(true)
  }, [])

  // ==========================================
  // FUNGSI LOGOUT
  // ==========================================
  const handleLogout = async () => {
    if (isLoggingOut) return
    setIsLoggingOut(true)

    try {
      await signOut({
        redirect: false,
        callbackUrl: "/login",
      })
      router.push("/login")
      router.refresh()
    } catch (error) {
      console.error("Logout error:", error)
      try {
        await signOut({ callbackUrl: "/login" })
      } catch (fallbackError) {
        console.error("Fallback logout error:", fallbackError)
        window.location.href = "/login"
      }
    } finally {
      setIsLoggingOut(false)
    }
  }

  // ==========================================
  // FUNGSI GANTI THEME
  // ==========================================
  const handleThemeChange = (newTheme: "light" | "dark" | "system") => {
    console.log("Setting theme to:", newTheme)
    setTheme(newTheme)
  }

  // Fallback data user
  const displayName = user.name || session?.user?.name || "User"
  const displayEmail = user.email || session?.user?.email || "user@mail.com"
  const displayAvatar = user.avatar || session?.user?.image || ""
  const fallbackInitial = displayName.charAt(0).toUpperCase() || "U"

  // Icon theme berdasarkan theme aktif
  const ThemeIcon = !mounted
    ? SunIcon
    : theme === "dark"
      ? MoonIcon
      : theme === "system"
        ? DesktopIcon
        : SunIcon

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton size="lg" className="aria-expanded:bg-muted" />
            }
          >
            <Avatar>
              <AvatarImage src={displayAvatar} alt={displayName} />
              <AvatarFallback>{fallbackInitial}</AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">{displayName}</span>
              <span className="truncate text-xs">{displayEmail}</span>
            </div>
            <CaretUpDownIcon className="ml-auto size-4" />
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            {/* User Info */}
            <DropdownMenuGroup>
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <Avatar>
                    <AvatarImage src={displayAvatar} alt={displayName} />
                    <AvatarFallback>{fallbackInitial}</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{displayName}</span>
                    <span className="truncate text-xs">{displayEmail}</span>
                  </div>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            {/* Upgrade */}
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <SparkleIcon />
                Upgrade to Pro
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            {/* Menu Utama */}
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <CheckCircleIcon />
                Account
              </DropdownMenuItem>
              <DropdownMenuItem>
                <CreditCardIcon />
                Billing
              </DropdownMenuItem>
              <DropdownMenuItem>
                <BellIcon />
                Notifications
              </DropdownMenuItem>

              {/* Sub-menu Theme */}
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="gap-2">
                  <ThemeIcon className="size-4" />
                  <span>Theme</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuItem
                    onClick={() => handleThemeChange("light")}
                  >
                    <SunIcon className="size-4" />
                    <span>Light</span>
                    {mounted && theme === "light" && (
                      <CheckIcon className="ml-auto size-4" />
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleThemeChange("dark")}
                  >
                    <MoonIcon className="size-4" />
                    <span>Dark</span>
                    {mounted && theme === "dark" && (
                      <CheckIcon className="ml-auto size-4" />
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleThemeChange("system")}
                  >
                    <DesktopIcon className="size-4" />
                    <span>System</span>
                    {mounted && theme === "system" && (
                      <CheckIcon className="ml-auto size-4" />
                    )}
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            {/* Logout */}
            <DropdownMenuItem
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="cursor-pointer text-red-600 focus:text-red-600 dark:text-red-400 dark:focus:text-red-400"
            >
              {isLoggingOut ? (
                <CircleNotchIcon className="size-4 animate-spin" />
              ) : (
                <SignOutIcon className="size-4" />
              )}
              {isLoggingOut ? "Logging out..." : "Log out"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}