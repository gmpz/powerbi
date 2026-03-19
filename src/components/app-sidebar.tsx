"use client";

import * as React from "react";
import { Command, Settings2, SquareTerminal } from "lucide-react";

import { NavMain } from "@/components/nav-main";

import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

type User = {
  id: string;
  provider_id: string;
  username: string;
  displayName: string | null;
  email: string | null;
  password: string | null;
  role: string;
  createdAt: Date;
  updatedAt: Date;
  updatedBy: string | null;
};

const data = {
  navMain: [
    {
      title: "Dashboards",
      url: "#",
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: "My Dashboard",
          url: "/dashboard",
        },
      ],
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings2,
      isActive: true,
      roles: ["ADMIN", "SUPER_ADMIN"], // 👈 กำหนด role ที่เห็นเมนูนี้
      items: [
        {
          title: "User Permissions",
          url: "/admin/users",
        },
        {
          title: "Dashboard Settings",
          url: "/admin/dashboard/setting",
        },
        {
          title: "Default Permission",
          url: "/admin/default/role",
        },
      ],
    },
  ],
};

export function AppSidebar({
  user,
  ...props
}: React.ComponentProps<typeof Sidebar> & { user: User | null }) {
  const role = user?.role;

  const navMain = data.navMain.filter((item: any) => {
    if (!item.roles) return true;
    return role && item.roles.includes(role);
  });
  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            {/* <SidebarMenuButton size="lg" asChild>
              <a href="#"><img
                    src="/assets/logomoph.png" // 👈 เปลี่ยน path รูป
                    alt="logo"
                    className="w-12 h-12 object-contain"
                  />
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Command className="size-4" />
                  
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">Dashboard</span>
                  <span className="truncate text-xs">สสจ.ปทุมธานี</span>
                </div>
              </a>
            </SidebarMenuButton> */}

            <SidebarMenuButton  className="h-17" asChild>
              <a
                href="/dashboard"
                className="
              flex items-center gap-3 w-full
              px-3 py-2
              rounded-xl
              bg-white/50 dark:bg-white/5
              backdrop-blur
              shadow-sm
              hover:shadow-md
              hover:bg-white/70 dark:hover:bg-white/10
              transition-all duration-200
            "
              >
                {/* 🔹 Logo */}
                <div>
                  <img
                    src="/assets/logomoph.png"
                    alt="logo"
                    className="w-12 h-12  object-contain"
                  />
                </div>

                {/* 🔹 Text */}
                <div className="grid flex-1 text-left leading-tight min-w-0">
                  <span className="truncate font-bold text-sm sm:text-base">
                    Dashboard
                  </span>
                  <span className="truncate text-[12px] sm:text-xs text-muted-foreground">
                    สาธารณสุขจังหวัดปทุมธานี
                  </span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
        {/* <NavProjects projects={data.projects} />
        <NavSecondary items={data.navSecondary} className="mt-auto" /> */}
      </SidebarContent>
      <SidebarFooter>{user && <NavUser user={user} />}</SidebarFooter>
    </Sidebar>
  );
}
