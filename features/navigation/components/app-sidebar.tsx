"use client"

import { useState } from "react"
import {
  IconBook,
  IconNotebook,
  IconHighlight,
  IconSearch,
  IconSettings,
  IconSun,
  IconMoon,
} from "@tabler/icons-react"
import { useAppTheme } from "@/features/theme/components/theme-provider"
import { useAppNavigation } from "../context/app-navigation-context"
import { ConfigDialog } from "@/features/config/components/config-dialog"
import { Kbd } from "@/components/ui/kbd"
import { APP_VERSION, APP_ENV, ENV_LABEL, isPreRelease } from "@/lib/app-env"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
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
  useSidebar,
} from "@/components/ui/sidebar"
import type { AppView } from "../types"

interface NavItem {
  id: AppView | "search"
  icon: React.ComponentType<{ className?: string }>
  label: string
}

const NAV_ITEMS: NavItem[] = [
  { id: "reader", icon: IconBook, label: "Leitura" },
  { id: "notes", icon: IconNotebook, label: "Notas" },
  { id: "highlights", icon: IconHighlight, label: "Destaques" },
]

interface AppSidebarProps {
  onOpenCommandPalette: () => void
  workspaceContent?: React.ReactNode
}

export function AppSidebar({ onOpenCommandPalette, workspaceContent }: AppSidebarProps) {
  const { isDark, setTheme } = useAppTheme()
  const { activeView, navigate } = useAppNavigation()
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"
  const [configOpen, setConfigOpen] = useState(false)

  return (
    <Sidebar collapsible="icon" variant="sidebar" className="border-r border-border/30 [&_div[data-sidebar=sidebar]]:bg-background">
      <SidebarHeader className="border-b border-border/30">
        <div className={cn(
          "flex items-center py-2.5",
          isCollapsed ? "justify-center px-1" : "justify-start px-2"
        )}>
          {isCollapsed ? (
            <img
              src="/logo-minimal.png"
              alt="Open Bible"
              className="size-8 object-contain select-none pointer-events-none"
            />
          ) : (
            <img
              src="/logo.png"
              alt="Open Bible Logo"
              className="h-8 w-auto select-none pointer-events-none"
            />
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup className="py-2">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={onOpenCommandPalette}
                  title="Buscar (⌘K)"
                  className={cn(
                    "h-9 rounded-md transition-all duration-150",
                    isCollapsed ? "justify-center" : "justify-between"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <IconSearch className="size-6 text-muted-foreground" />
                    {!isCollapsed && (
                      <span className="text-sm text-muted-foreground">Buscar...</span>
                    )}
                  </div>
                  {!isCollapsed && (
                    <Kbd className="text-[10px] ml-auto">⌘K</Kbd>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/50">
            Navegação
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_ITEMS.map((item) => {
                const isActive = activeView === item.id
                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      isActive={isActive}
                      onClick={() => navigate(item.id as AppView)}
                      title={item.label}
                      className={cn(
                        "h-9 rounded-md transition-all duration-150",
                        isActive && "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                      )}
                    >
                      <item.icon className={cn(
                        "size-6 transition-colors duration-150",
                        isActive ? "text-primary" : "text-muted-foreground"
                      )} />
                      <span className="text-sm">{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {workspaceContent && (
          <>
            {workspaceContent}
          </>
        )}
      </SidebarContent>

      <SidebarFooter className="p-2">
        <SidebarMenu className="gap-0.5">
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => setConfigOpen(true)}
              title="Configurações"
              className="h-9 rounded-md transition-all duration-150"
            >
              <IconSettings className="size-6" />
              <span className="text-sm">Configurações</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => setTheme(isDark ? "light" : "dark")}
              title={isDark ? "Modo Claro" : "Modo Escuro"}
              className="h-9 rounded-md transition-all duration-150"
            >
              {isDark ? (
                <IconSun className="size-6" />
              ) : (
                <IconMoon className="size-6" />
              )}
              <span className="text-sm">
                {isDark ? "Modo Claro" : "Modo Escuro"}
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        <div className="px-2.5 py-1.5 flex items-center justify-between border-t border-border/20 mt-1 select-none group-data-[collapsible=icon]:hidden">
          <span className="text-[10px] text-muted-foreground/40 font-mono">
            Open Bible v{APP_VERSION}
          </span>
          {isPreRelease && ENV_LABEL[APP_ENV] && (
            <Badge variant="secondary" className="h-3.5 px-1 text-[8px] font-medium leading-none">
              {ENV_LABEL[APP_ENV]}
            </Badge>
          )}
        </div>
      </SidebarFooter>

      <ConfigDialog open={configOpen} onOpenChange={setConfigOpen} />
    </Sidebar>
  )
}
