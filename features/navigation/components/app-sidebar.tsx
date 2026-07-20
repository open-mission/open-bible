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
    <Sidebar collapsible="icon" variant="sidebar" className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border/40">
        <div className={cn(
          "flex items-center px-2 py-2.5",
          isCollapsed ? "justify-center" : "justify-start"
        )}>
          {isCollapsed ? (
            <img
              src="/logo-minimal-transparent.png"
              alt="Open Bible"
              className="h-6 w-auto select-none pointer-events-none dark:invert-0 invert transition-opacity duration-200"
            />
          ) : (
            <img
              src="/logo.svg"
              alt="Open Bible Logo"
              className="h-7 w-auto dark:invert-0 invert select-none pointer-events-none transition-opacity duration-200"
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
                  tooltip="Buscar (⌘K)"
                  className={cn(
                    "h-9 rounded-lg transition-all duration-150",
                    isCollapsed ? "justify-center" : "justify-between"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <IconSearch className="size-[18px] text-muted-foreground" />
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

        <SidebarSeparator />

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
                      tooltip={item.label}
                      className={cn(
                        "h-9 rounded-lg transition-all duration-150",
                        isActive && "bg-sidebar-accent text-sidebar-accent-foreground font-medium border-l-2 border-primary"
                      )}
                    >
                      <item.icon className={cn(
                        "size-[18px] transition-colors duration-150",
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
            <SidebarSeparator />
            {workspaceContent}
          </>
        )}
      </SidebarContent>

      <SidebarSeparator />

      <SidebarFooter className="p-2">
        <SidebarMenu className="gap-0.5">
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => setConfigOpen(true)}
              tooltip="Configurações"
              className="h-9 rounded-lg transition-all duration-150"
            >
              <IconSettings className="size-[18px]" />
              <span className="text-sm">Configurações</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => setTheme(isDark ? "light" : "dark")}
              tooltip={isDark ? "Modo Claro" : "Modo Escuro"}
              className="h-9 rounded-lg transition-all duration-150"
            >
              {isDark ? (
                <IconSun className="size-[18px]" />
              ) : (
                <IconMoon className="size-[18px]" />
              )}
              <span className="text-sm">
                {isDark ? "Modo Claro" : "Modo Escuro"}
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        <div className="px-2.5 py-1.5 flex items-center justify-between border-t border-sidebar-border/20 mt-1 select-none group-data-[collapsible=icon]:hidden">
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
