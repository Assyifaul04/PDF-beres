"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";

import { NavMain } from "@/components/admin/nav-main";
import { NavProjects } from "@/components/admin/nav-projects";
import { NavSecondary } from "@/components/admin/nav-secondary";
import { NavUser } from "@/components/admin/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  SquaresFourIcon,
  UsersIcon,
  FolderIcon,
  ListChecksIcon,
  GearIcon,
  LifebuoyIcon,
  BookOpenIcon,
  ClockCounterClockwiseIcon,
  CloudArrowUpIcon,
  WarningCircleIcon,
  StackIcon,
} from "@phosphor-icons/react";

const data = {
  navMain: [
    // ==========================================
    // 🏠 DASHBOARD
    // ==========================================
    {
      title: "Dashboard",
      url: "/admin/dashboard",
      icon: <SquaresFourIcon />,
      isActive: true,
    },

    // ==========================================
    // 👥 USERS → model: User, Account, Session
    // ==========================================
    {
      title: "Users",
      url: "#",
      icon: <UsersIcon />,
      items: [
        {
          title: "All Users",
          url: "/admin/users",
          description: "Semua user terdaftar",
        },
        {
          title: "Admins",
          url: "/admin/users?role=ADMIN",
          description: "User dengan role ADMIN",
        },
        {
          title: "Premium",
          url: "/admin/users?plan=PREMIUM",
          description: "User dengan plan PREMIUM",
        },
        {
          title: "Quota & Activity",
          url: "/admin/users/quota",
          description: "usedBytes, taskCount & sessions",
        },
      ],
    },

    // ==========================================
    // 📁 FILES → model: File
    // ==========================================
    {
      title: "Files",
      url: "#",
      icon: <FolderIcon />,
      items: [
        {
          title: "All Files",
          url: "/admin/files",
          description: "Semua file di sistem",
        },
        {
          title: "By Storage",
          url: "/admin/files/storage",
          description: "Supabase vs Google Drive",
        },
        {
          title: "Migration Queue",
          url: "/admin/files/migration",
          description: "TEMP → PROCESSING → COMPLETED",
        },
        {
          title: "Expired Files",
          url: "/admin/files/expired",
          description: "File melewati expiresAt",
        },
      ],
    },

    // ==========================================
    // 📝 DOCUMENT TASKS → model: DocumentTask
    // ==========================================
    {
      title: "Document Tasks",
      url: "#",
      icon: <ListChecksIcon />,
      items: [
        {
          title: "All Tasks",
          url: "/admin/tasks",
          description: "Semua task konversi",
        },
        {
          title: "Pending",
          url: "/admin/tasks?status=PENDING",
          description: "Menunggu diproses",
        },
        {
          title: "Processing",
          url: "/admin/tasks?status=PROCESSING",
          description: "Sedang diproses",
        },
        {
          title: "Completed",
          url: "/admin/tasks?status=COMPLETED",
          description: "Berhasil diselesaikan",
        },
        {
          title: "Failed",
          url: "/admin/tasks?status=FAILED",
          description: "Gagal — lihat errorMessage",
        },
        {
          title: "By Tool Type",
          url: "/admin/tasks/by-tool",
          description: "Kelompokkan per ToolType",
        },
      ],
    },

    // ==========================================
    // 🎛️ TOOL MENUS → model: ToolCategory, ToolMenu
    // ==========================================
    {
      title: "Tool Menus",
      url: "#",
      icon: <StackIcon />,
      items: [
        {
          title: "Categories",
          url: "/admin/tool-menus/categories",
          description: "Kelola ToolCategory",
        },
        {
          title: "All Menus",
          url: "/admin/tool-menus",
          description: "Kelola ToolMenu",
        },
        {
          title: "Ordering",
          url: "/admin/tool-menus/ordering",
          description: "Atur urutan drag & drop",
        },
        {
          title: "Tool Type Mapping",
          url: "/admin/tool-menus/tool-type",
          description: "Hubungkan ke ToolType enum",
        },
      ],
    },

    // ==========================================
    // 📜 SYSTEM → model: SystemLog
    // ==========================================
    {
      title: "System",
      url: "#",
      icon: <ClockCounterClockwiseIcon />,
      items: [
        {
          title: "All Logs",
          url: "/admin/system/logs",
          description: "Semua aktivitas sistem",
        },
        {
          title: "Errors Only",
          url: "/admin/system/logs?level=error",
          description: "Filter level = error",
        },
        {
          title: "Database Status",
          url: "/admin/system/database",
          description: "Kesehatan & koneksi DB",
        },
      ],
    },

    // ==========================================
    // ⚙️ SETTINGS → Konfigurasi aplikasi
    // ==========================================
    {
      title: "Settings",
      url: "#",
      icon: <GearIcon />,
      items: [
        {
          title: "General",
          url: "/admin/settings/general",
          description: "Pengaturan umum",
        },
        {
          title: "Storage",
          url: "/admin/settings/storage",
          description: "Supabase & Google Drive",
        },
        {
          title: "File Retention",
          url: "/admin/settings/retention",
          description: "Kebijakan expiresAt",
        },
        {
          title: "Plans & Pricing",
          url: "/admin/settings/plans",
          description: "Limit FREE vs PREMIUM",
        },
      ],
    },
  ],

  // ==========================================
  // 🔗 QUICK ACCESS (Shortcut ke menu penting)
  // ==========================================
  projects: [
    {
      name: "File Manager",
      url: "/admin/files",
      icon: <FolderIcon />,
    },
    {
      name: "Task Monitor",
      url: "/admin/tasks",
      icon: <ListChecksIcon />,
    },
    {
      name: "Drive Sync",
      url: "/admin/files/storage/drive",
      icon: <CloudArrowUpIcon />,
    },
    {
      name: "Error Logs",
      url: "/admin/system/logs?level=error",
      icon: <WarningCircleIcon />,
    },
  ],

  // ==========================================
  // 🆘 SECONDARY (Bantuan)
  // ==========================================
  navSecondary: [
    {
      title: "Documentation",
      url: "/admin/docs",
      icon: <BookOpenIcon />,
    },
    {
      title: "Support",
      url: "/admin/support",
      icon: <LifebuoyIcon />,
    },
  ],

  user: {
    name: "Admin DocTools",
    email: "admin@doctools.com",
    avatar: "/avatars/admin.jpg",
  },
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <Link href="/admin/dashboard" className="block w-full">
              <SidebarMenuButton size="lg" className="w-full">
                <div className="flex items-center justify-center w-full overflow-hidden">
                  <Image
                    src="/image/Logo Beres.png"
                    alt="Beres Admin Logo"
                    width={130}
                    height={35}
                    priority
                    className="h-7 w-auto object-contain"
                  />
                </div>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}