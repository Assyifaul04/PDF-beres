"use client"

import * as React from "react"
import Link from "next/link"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import {
  DotsThreeOutlineIcon,
  FolderIcon,
  ShareIcon,
  TrashIcon,
} from "@phosphor-icons/react"

type ProjectItem = {
  name: string
  url: string
  icon: React.ReactNode
}

export function NavProjects({ projects }: { projects: ProjectItem[] }) {
  const { isMobile } = useSidebar()

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Projects</SidebarGroupLabel>
      <SidebarMenu>
        {projects.map((item) => (
          <SidebarMenuItem key={item.name}>
            {/* ✅ Pakai render prop, bukan asChild */}
            <SidebarMenuButton render={<Link href={item.url} />}>
              {item.icon}
              <span>{item.name}</span>
            </SidebarMenuButton>

            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <SidebarMenuAction
                    showOnHover
                    className="aria-expanded:bg-muted"
                  />
                }
              >
                <DotsThreeOutlineIcon className="size-4" />
                <span className="sr-only">More</span>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                className="w-48"
                side={isMobile ? "bottom" : "right"}
                align={isMobile ? "end" : "start"}
              >
                <DropdownMenuItem render={<Link href={item.url} />}>
                  <FolderIcon className="text-muted-foreground" />
                  <span>View Project</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => {
                    // TODO: implement share logic
                    navigator.clipboard?.writeText(
                      `${window.location.origin}${item.url}`
                    )
                  }}
                >
                  <ShareIcon className="text-muted-foreground" />
                  <span>Share Project</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => {
                    // TODO: implement delete logic
                  }}
                >
                  <TrashIcon className="text-muted-foreground" />
                  <span>Delete Project</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        ))}

        {/* Tombol "More" di paling bawah */}
        <SidebarMenuItem>
          <SidebarMenuButton render={<Link href="/admin/projects" />}>
            <DotsThreeOutlineIcon className="size-4" />
            <span>More</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  )
}