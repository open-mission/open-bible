"use client";

import { useRouter } from "next/navigation";
import {
  IconSun,
  IconMoon,
  IconSettings,
  IconBook,
} from "@tabler/icons-react";
import { useAppTheme } from "@/components/theme-provider";
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
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar";

interface NavItem {
  id: string;
  icon: any;
  label: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: "library", icon: IconBook, label: "Bible" },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onNavClick: (navId: string) => void;
  activeNav: string | null;
  sidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
}

export function AppSidebar({
  isOpen,
  onClose,
  onNavClick,
  activeNav,
  sidebarCollapsed,
  onToggleSidebar,
}: SidebarProps) {
  const { isDark, setTheme } = useAppTheme();
  const router = useRouter();

  return (
    <Sidebar
      collapsible={sidebarCollapsed ? "icon" : "offcanvas"}
      variant="sidebar"
    >
      <SidebarHeader className="border-b border-sidebar-border">
        <div
          className={`flex items-center px-2 py-2 ${sidebarCollapsed ? "justify-center" : "justify-between"}`}
        >
          <h1
            className={`font-semibold tracking-tight ${sidebarCollapsed ? "hidden" : "text-base"}`}
          >
            Open Bible
          </h1>
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
              onClick={() => router.push("/config")}
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
    </Sidebar>
  );
}
