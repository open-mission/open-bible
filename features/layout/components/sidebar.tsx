"use client";

import { useState } from "react";
import {
  IconSun,
  IconMoon,
  IconSettings,
  IconBook,
} from "@tabler/icons-react";
import { useAppTheme } from "@/features/theme/components/theme-provider";
import { ConfigDialog } from "@/features/config/components/config-dialog";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar";

interface NavItem {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: "library", icon: IconBook, label: "Bible" },
];

interface SidebarProps {
  onNavClick: (navId: string) => void;
  activeNav: string | null;
  sidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
}

export function AppSidebar({
  onNavClick,
  activeNav,
  sidebarCollapsed,
  onToggleSidebar,
}: SidebarProps) {
  const { isDark, setTheme } = useAppTheme();
  const [configOpen, setConfigOpen] = useState(false);

  return (
    <Sidebar
      collapsible={sidebarCollapsed ? "icon" : "offcanvas"}
      variant="sidebar"
    >
      <SidebarHeader className="border-b border-sidebar-border">
        <div
          className={`flex items-center px-2 py-2 ${sidebarCollapsed ? "justify-center" : "justify-between"}`}
        >
          {!sidebarCollapsed ? (
            <img
              src="/logo.svg"
              alt="Open Bible Logo"
              className="h-7 w-auto dark:invert-0 invert select-none pointer-events-none"
            />
          ) : (
            <img
              src="/logo-minimal-transparent.png"
              alt="Open Bible"
              className="h-6 w-auto select-none pointer-events-none dark:invert-0 invert"
            />
          )}
          {onToggleSidebar && (
            <SidebarTrigger
              onClick={onToggleSidebar}
              className="hidden md:flex"
            />
          )}
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navegação</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_ITEMS.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    isActive={activeNav === item.id}
                    onClick={() => onNavClick(item.id)}
                    tooltip={item.label}
                    className="h-11"
                  >
                    <item.icon className="size-5" />
                    <span className="text-sm">{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarSeparator />
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => setConfigOpen(true)}
              tooltip="Configurações"
              className="h-11"
            >
              <IconSettings className="size-5" />
              <span className="text-sm">Configurações</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => setTheme(isDark ? "light" : "dark")}
              tooltip={isDark ? "Modo Claro" : "Modo Escuro"}
              className="h-11"
            >
              {isDark ? (
                <IconSun className="size-5" />
              ) : (
                <IconMoon className="size-5" />
              )}
              <span className="text-sm">
                {isDark ? "Modo Claro" : "Modo Escuro"}
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <ConfigDialog open={configOpen} onOpenChange={setConfigOpen} />
    </Sidebar>
  );
}
