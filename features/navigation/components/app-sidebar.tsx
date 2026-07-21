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
      <Sidebar collapsible="icon" variant="floating" className="border-r border-border/30">
      <SidebarHeader className="border-b border-border/30">
        <div className={cn(
          "flex items-center py-2.5",
          isCollapsed ? "justify-center px-1" : "justify-start"
        )}>
          {isCollapsed ? (
            <img
              src="/logo-minimal.png"
              alt="Open Bible"
              className="size-8 object-contain select-none pointer-events-none invert dark:invert-0"
            />
          ) : (
            <img
              src="/logo.png"
              alt="Open Bible Logo"
              className="h-8 w-auto select-none pointer-events-none invert dark:invert-0"
            />
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>

        <SidebarGroup className="mx-0 px-0 pt-0 border-t">
          <SidebarGroupLabel className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/50">
            Navegação
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-0">
              {NAV_ITEMS.map((item) => {
                const isActive = activeView === item.id
                return (
                  <SidebarMenuItem key={item.id} className="w-full flex items-center border-b my-0.5">
                    <SidebarMenuButton
                      isActive={isActive}
                      onClick={() => navigate(item.id as AppView)}
                      title={item.label}
                      className={cn(
                        "border-transparent transition-all duration-150 group rounded-none!",
                        isCollapsed
                          ? "group-data-[collapsible=icon]:h-14! group-data-[collapsible=icon]:w-full! group-data-[collapsible=icon]:py-3! group-data-[collapsible=icon]:px-0! group-data-[collapsible=icon]:p-0! flex items-center justify-center"
                          : "h-11 w-full justify-start px-3 py-2.5",
                        isActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium border-sidebar-border"
                          : "text-muted-foreground hover:bg-sidebar-accent/40"
                      )}
                    >
                      <item.icon className={cn(
                        "transition-colors duration-150 shrink-0",
                        isCollapsed ? "size-6!" : "size-5",
                        isActive ? "text-sidebar-accent-foreground" : "text-muted-foreground"
                      )} />
                      {!isCollapsed && (
                        <span className={cn("text-sm", isActive ? "text-sidebar-accent-foreground" : "text-muted-foreground")}>{item.label}</span>
                      )}
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

      <SidebarFooter className={cn("p-2", isCollapsed && "px-0")}>
        <SidebarMenu className="gap-0.5">
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => setConfigOpen(true)}
                title="Configurações"
                className={cn(
                  "text-muted-foreground transition-all duration-150 hover:bg-sidebar-accent/40 rounded-none!",
                  isCollapsed
                    ? "group-data-[collapsible=icon]:h-12! group-data-[collapsible=icon]:w-full! group-data-[collapsible=icon]:py-3! group-data-[collapsible=icon]:px-0! group-data-[collapsible=icon]:p-0! flex items-center justify-center"
                    : "h-11 w-full justify-start px-3 py-2.5"
                )}
              >
                <IconSettings className={cn(isCollapsed ? "size-6!" : "size-5", "shrink-0")} />
                {!isCollapsed && <span className="text-sm">Configurações</span>}
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => setTheme(isDark ? "light" : "dark")}
                title={isDark ? "Modo Claro" : "Modo Escuro"}
                className={cn(
                  "text-muted-foreground transition-all duration-150 hover:bg-sidebar-accent/40 rounded-none!",
                  isCollapsed
                    ? "group-data-[collapsible=icon]:h-12! group-data-[collapsible=icon]:w-full! group-data-[collapsible=icon]:py-3! group-data-[collapsible=icon]:px-0! group-data-[collapsible=icon]:p-0! flex items-center justify-center"
                    : "h-11 w-full justify-start px-3 py-2.5"
                )}
              >
                {isDark ? (
                  <IconSun className={cn(isCollapsed ? "size-6!" : "size-5", "shrink-0")} />
                ) : (
                  <IconMoon className={cn(isCollapsed ? "size-6!" : "size-5", "shrink-0")} />
                )}
                {!isCollapsed && (
                  <span className="text-sm">
                    {isDark ? "Modo Claro" : "Modo Escuro"}
                  </span>
                )}
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
