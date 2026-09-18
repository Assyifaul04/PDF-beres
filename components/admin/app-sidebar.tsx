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
  TerminalIcon,
  BookOpenIcon,
  GearIcon,
  LifebuoyIcon,
  PaperPlaneTiltIcon,
  UsersIcon,
  DatabaseIcon,
  FolderIcon,
  ListChecksIcon,
  SquaresFourIcon,
  CloudArrowUpIcon,
  ClockCounterClockwiseIcon,
} from "@phosphor-icons/react";

const data = {
  navMain: [
    // ==========================================
    // 1. DASHBOARD
    // ==========================================
    {
      title: "Dashboard",
      url: "/admin/dashboard",
      icon: <TerminalIcon />,
      isActive: true,
      items: [
        { title: "Overview", url: "/admin/dashboard" },
        { title: "Analytics", url: "/admin/analytics" },
        { title: "Revenue", url: "/admin/analytics/revenue" },
      ],
    },

    // ==========================================
    // 2. USERS (model: User, Account, Session)
    // ==========================================
    {
      title: "Users",
      url: "#",
      icon: <UsersIcon />,
      items: [
        {
          title: "All Users",
          url: "/admin/users",
          description: "Manage user accounts (role, plan, quota)",
        },
        {
          title: "Admins",
          url: "/admin/users/admins",
          description: "Filter by role ADMIN",
        },
        {
          title: "Premium Users",
          url: "/admin/users/premium",
          description: "Filter by plan PREMIUM",
        },
        {
          title: "User Quota",
          url: "/admin/users/quota",
          description: "Monitor usedBytes & taskCount",
        },
        {
          title: "User Activity",
          url: "/admin/users/activity",
          description: "Login sessions & account activity",
        },
      ],
    },

    // ==========================================
    // 3. FILES (model: File)
    // ==========================================
    {
      title: "Files",
      url: "#",
      icon: <FolderIcon />,
      items: [
        {
          title: "All Files",
          url: "/admin/files",
          description: "Manage uploaded & generated files",
        },
        {
          title: "Supabase Storage",
          url: "/admin/files/storage/supabase",
          description: "Filter storageProvider SUPABASE",
        },
        {
          title: "Google Drive",
          url: "/admin/files/storage/drive",
          description: "Filter storageProvider GOOGLE_DRIVE",
        },
        {
          title: "Migration Queue",
          url: "/admin/files/migration",
          description: "Monitor migrationStatus (TEMP→PROCESSING→COMPLETED)",
        },
        {
          title: "Expired Files",
          url: "/admin/files/expired",
          description: "Files past expiresAt for cleanup",
        },
        {
          title: "Storage Stats",
          url: "/admin/files/stats",
          description: "Total size, per-provider breakdown",
        },
      ],
    },

    // ==========================================
    // 4. DOCUMENT TASKS (model: DocumentTask)
    // ==========================================
    {
      title: "Document Tasks",
      url: "#",
      icon: <ListChecksIcon />,
      items: [
        {
          title: "All Tasks",
          url: "/admin/tasks",
          description: "Monitor all conversion tasks",
        },
        {
          title: "Pending",
          url: "/admin/tasks?status=PENDING",
          description: "Tasks waiting to be processed",
        },
        {
          title: "Processing",
          url: "/admin/tasks?status=PROCESSING",
          description: "Tasks currently running",
        },
        {
          title: "Completed",
          url: "/admin/tasks?status=COMPLETED",
          description: "Successfully finished tasks",
        },
        {
          title: "Failed",
          url: "/admin/tasks?status=FAILED",
          description: "Tasks with errorMessage",
        },
        {
          title: "By Tool Type",
          url: "/admin/tasks/by-tool",
          description: "Group by ToolType (21 tools)",
        },
        {
          title: "Task Inputs",
          url: "/admin/tasks/inputs",
          description: "Manage TaskInputFile relations",
        },
        {
          title: "Task Outputs",
          url: "/admin/tasks/outputs",
          description: "Manage TaskOutputFile relations",
        },
      ],
    },

    // ==========================================
    // 5. TOOL MENUS (model: ToolCategory, ToolMenu)
    // ==========================================
    {
      title: "Tool Menus",
      url: "#",
      icon: <SquaresFourIcon />,
      items: [
        {
          title: "Categories",
          url: "/admin/tool-menus/categories",
          description: "Manage ToolCategory (name, slug, order)",
        },
        {
          title: "All Menus",
          url: "/admin/tool-menus",
          description: "Manage ToolMenu (title, href, icon)",
        },
        {
          title: "Menu Ordering",
          url: "/admin/tool-menus/ordering",
          description: "Drag & drop sort by order field",
        },
        {
          title: "Active/Inactive",
          url: "/admin/tool-menus/visibility",
          description: "Toggle isActive flag",
        },
        {
          title: "Tool Type Mapping",
          url: "/admin/tool-menus/tool-type",
          description: "Link ToolMenu to ToolType enum",
        },
      ],
    },

    // ==========================================
    // 6. SYSTEM (model: SystemLog)
    // ==========================================
    {
      title: "System",
      url: "#",
      icon: <DatabaseIcon />,
      items: [
        {
          title: "System Logs",
          url: "/admin/system/logs",
          description: "View SystemLog (level, action, message)",
        },
        {
          title: "Error Logs",
          url: "/admin/system/logs?level=error",
          description: "Filter by level=error",
        },
        {
          title: "Database Status",
          url: "/admin/system/database",
          description: "Database health & metrics",
        },
        {
          title: "Cron Jobs",
          url: "/admin/system/cron",
          description: "Scheduled tasks (file migration, cleanup)",
        },
        {
          title: "Queue Monitor",
          url: "/admin/system/queue",
          description: "BullMQ / task queue status",
        },
      ],
    },

    // ==========================================
    // 7. SETTINGS
    // ==========================================
    {
      title: "Settings",
      url: "#",
      icon: <GearIcon />,
      items: [
        {
          title: "General",
          url: "/admin/settings/general",
        },
        {
          title: "Storage",
          url: "/admin/settings/storage",
          description: "Supabase & Google Drive credentials",
        },
        {
          title: "File Retention",
          url: "/admin/settings/retention",
          description: "Default expiresAt & cleanup policy",
        },
        {
          title: "Tool Types",
          url: "/admin/settings/tool-types",
          description: "Enable/disable 21 ToolType enum",
        },
        {
          title: "Ad Settings",
          url: "/admin/settings/ads",
          description: "Google AdSense configuration",
        },
        {
          title: "Plan & Pricing",
          url: "/admin/settings/plans",
          description: "FREE vs PREMIUM limits",
        },
      ],
    },
  ],

  // ==========================================
  // NAV SECONDARY (Shortcut)
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
    {
      title: "Feedback",
      url: "/admin/feedback",
      icon: <PaperPlaneTiltIcon />,
    },
  ],

  // ==========================================
  // PROJECTS (Quick Access)
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
      name: "Google Drive Sync",
      url: "/admin/files/storage/drive",
      icon: <CloudArrowUpIcon />,
    },
    {
      name: "Tool Categories",
      url: "/admin/tool-menus/categories",
      icon: <SquaresFourIcon />,
    },
    {
      name: "System Logs",
      url: "/admin/system/logs",
      icon: <ClockCounterClockwiseIcon />,
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
                  {/* Logo untuk Light Mode */}
                  <Image
                    src="/image/Logo Beres.png"
                    alt="DocTools Logo Light"
                    width={130}
                    height={35}
                    priority
                    className="h-7 w-auto object-contain dark:hidden block"
                  />
                  {/* Logo untuk Dark Mode */}
                  <Image
                    src="/image/Logo Beres.png"
                    alt="DocTools Logo Dark"
                    width={130}
                    height={35}
                    priority
                    className="h-7 w-auto object-contain hidden dark:block"
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