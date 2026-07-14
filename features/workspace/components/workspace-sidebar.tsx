"use client"

import { useState } from "react"
import { X, Plus, LayoutGrid, Monitor, LayoutPanelLeft, LayoutPanelTop, Book, BookOpen, Rows3 } from "lucide-react"
import { IconGripVertical, IconSun, IconMoon, IconSettings } from "@tabler/icons-react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { useWorkspace } from "../context/workspace-context"
import { useWorkspaceMode, type TabsOrientation } from "../hooks/use-workspace-mode"
import { useAppTheme } from "@/features/theme/components/theme-provider"
import { ConfigDialog } from "@/features/config/components/config-dialog"
import { cn } from "@/lib/utils"
import type { Pane, BiblePaneState, LayoutMode } from "../types"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuTrigger,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuGroup,
} from "@/components/ui/context-menu"

interface WorkspaceSidebarProps {
  onOverviewOpen: () => void
}

/**
 * Sidebar displaying workspace panes vertically, allowing dragging to reorder,
 * right-click context menu options to toggle layout orientations, theme, and config.
 */
export function WorkspaceSidebar({ onOverviewOpen }: WorkspaceSidebarProps) {
  const { panes, activePaneId, activatePane, closePane, openPane, layoutMode, setLayoutMode } = useWorkspace()
  const { tabsOrientation, setTabsOrientation } = useWorkspaceMode()
  const { isDark, setTheme } = useAppTheme()
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"
  const [configOpen, setConfigOpen] = useState(false)

  const handleAddNewTab = () => {
    openPane({
      type: "bible",
      bookId: "gen",
      chapter: 1,
      versionId: "ara",
    } as BiblePaneState)
  }

  const sidebarContent = (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border bg-sidebar shrink-0">
      <SidebarHeader className="border-b border-sidebar-border/40 py-3 px-4 flex items-center justify-between min-h-[52px]">
        {!isCollapsed && (
          <h2 className="font-serif font-bold text-base tracking-tight truncate">
            Abas
          </h2>
        )}
        <div className={cn("flex items-center gap-1", isCollapsed && "w-full justify-center")}>
          {!isCollapsed && (
            <button
              type="button"
              onClick={handleAddNewTab}
              title="Nova aba"
              className="flex items-center justify-center rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <Plus className="h-4 w-4" />
            </button>
          )}
          <SidebarTrigger className="h-7 w-7" />
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-3 flex flex-col gap-3">
        {/* Controls Group: Layout Mode Toggle + Overview button (only shown when expanded) */}
        {!isCollapsed && (
          <SidebarGroup className="p-0">
            <SidebarGroupContent className="flex items-center gap-2 px-2 pb-1.5">
              <button
                type="button"
                onClick={onOverviewOpen}
                aria-label="Ver todas as abas"
                title="Ver todas as abas (Estilo Safari)"
                className="flex items-center justify-center rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground shrink-0 outline-none border border-sidebar-border/40 bg-sidebar"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>

              <div className="flex-1 flex items-center gap-0.5 rounded-lg bg-sidebar border border-sidebar-border/40 p-0.5 min-w-0">
                <button
                  type="button"
                  aria-pressed={layoutMode === "tabs"}
                  onClick={() => setLayoutMode("tabs")}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-1 rounded px-2.5 py-1 text-[11px] font-medium transition-colors min-w-0",
                    layoutMode === "tabs"
                      ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Rows3 className="h-3 w-3 shrink-0" />
                  <span className="truncate">Abas</span>
                </button>
                <button
                  type="button"
                  aria-pressed={layoutMode === "grid"}
                  onClick={() => setLayoutMode("grid")}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-1 rounded px-2.5 py-1 text-[11px] font-medium transition-colors min-w-0",
                    layoutMode === "grid"
                      ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <LayoutGrid className="h-3 w-3 shrink-0" />
                  <span className="truncate">Grade</span>
                </button>
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        <SidebarGroup className="p-0">
          <SidebarGroupLabel className="px-2 mb-2 group-data-[collapsible=icon]:hidden text-xs font-semibold text-muted-foreground/60 uppercase tracking-wider">
            Painéis abertos
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {panes.map((pane) => (
                <SortableSidebarTab
                  key={pane.id}
                  pane={pane}
                  active={pane.id === activePaneId}
                  onActivate={() => activatePane(pane.id)}
                  onClose={() => closePane(pane.id)}
                  total={panes.length}
                />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border/40 p-2">
        <SidebarMenu className="gap-1">
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => setConfigOpen(true)}
              tooltip="Configurações"
              className="h-10 px-2.5 rounded-lg justify-start"
            >
              <IconSettings className="size-4 shrink-0" />
              <span className="text-sm font-medium group-data-[collapsible=icon]:hidden ml-2">Configurações</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => setTheme(isDark ? "light" : "dark")}
              tooltip={isDark ? "Modo Claro" : "Modo Escuro"}
              className="h-10 px-2.5 rounded-lg justify-start"
            >
              {isDark ? (
                <IconSun className="size-4 shrink-0" />
              ) : (
                <IconMoon className="size-4 shrink-0" />
              )}
              <span className="text-sm font-medium group-data-[collapsible=icon]:hidden ml-2">
                {isDark ? "Modo Claro" : "Modo Escuro"}
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <ConfigDialog open={configOpen} onOpenChange={setConfigOpen} />
    </Sidebar>
  )

  return (
    <ContextMenu>
      <ContextMenuTrigger className="flex h-full min-h-0 select-none">
        {sidebarContent}
      </ContextMenuTrigger>
      <ContextMenuContent className="w-52">
        <ContextMenuGroup>
          <ContextMenuLabel>Posição das Abas</ContextMenuLabel>
          <ContextMenuRadioGroup
            value={tabsOrientation}
            onValueChange={(val) => setTabsOrientation(val as TabsOrientation)}
          >
            <ContextMenuRadioItem value="horizontal" className="gap-2">
              <LayoutPanelTop className="h-4 w-4" />
              <span>Abas no Topo</span>
            </ContextMenuRadioItem>
            <ContextMenuRadioItem value="vertical" className="gap-2">
              <LayoutPanelLeft className="h-4 w-4" />
              <span>Abas na Lateral</span>
            </ContextMenuRadioItem>
          </ContextMenuRadioGroup>
        </ContextMenuGroup>
        <ContextMenuSeparator />
        <ContextMenuGroup>
          <ContextMenuLabel>Modo de Exibição</ContextMenuLabel>
          <ContextMenuRadioGroup
            value={layoutMode}
            onValueChange={(val) => setLayoutMode(val as LayoutMode)}
          >
            <ContextMenuRadioItem value="tabs" className="gap-2">
              <Monitor className="h-4 w-4" />
              <span>Modo Abas</span>
            </ContextMenuRadioItem>
            <ContextMenuRadioItem value="grid" className="gap-2">
              <LayoutGrid className="h-4 w-4" />
              <span>Modo Grade</span>
            </ContextMenuRadioItem>
          </ContextMenuRadioGroup>
        </ContextMenuGroup>
      </ContextMenuContent>
    </ContextMenu>
  )
}

interface SortableSidebarTabProps {
  pane: Pane
  active: boolean
  onActivate: () => void
  onClose: () => void
  total: number
}

function SortableSidebarTab({
  pane,
  active,
  onActivate,
  onClose,
  total,
}: SortableSidebarTabProps) {
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: pane.id, disabled: isCollapsed })

  // Lock X-axis: vertical dragging only.
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(
      transform ? { ...transform, x: 0 } : null
    ),
    transition,
    zIndex: isDragging ? 50 : undefined,
  }

  return (
    <SidebarMenuItem
      ref={setNodeRef}
      style={style}
      className={cn(
        "group/tab relative flex items-center select-none rounded-md transition-all border border-transparent",
        isDragging
          ? "opacity-40 scale-95 border-primary/20 bg-primary/5 cursor-grabbing"
          : isCollapsed
            ? "cursor-pointer hover:bg-sidebar-accent/50 justify-center"
            : "cursor-grab active:cursor-grabbing hover:bg-sidebar-accent/50",
        active && "bg-sidebar-accent/80 text-sidebar-accent-foreground border-sidebar-border/30"
      )}
    >
      <div
        className={cn(
          "flex-1 flex items-center text-sm text-left min-w-0 transition-colors",
          isCollapsed ? "justify-center py-2.5 px-0" : "gap-2 px-2 py-2"
        )}
        onClick={onActivate}
        {...(!isCollapsed ? attributes : {})}
        {...(!isCollapsed ? listeners : {})}
      >
        {isCollapsed ? (
          active ? (
            <BookOpen className="h-4.5 w-4.5 text-primary shrink-0" />
          ) : (
            <Book className="h-4.5 w-4.5 text-muted-foreground shrink-0" />
          )
        ) : (
          <>
            {total > 1 && (
              <IconGripVertical className="h-3.5 w-3.5 shrink-0 opacity-20 group-hover/tab:opacity-70 transition-opacity" />
            )}
            <span className="truncate flex-1 font-medium select-none">{pane.title}</span>
          </>
        )}
      </div>

      {!isCollapsed && total > 1 && (
        <button
          type="button"
          aria-label="Fechar aba"
          onClick={(e) => {
            e.stopPropagation()
            onClose()
          }}
          onPointerDown={(e) => e.stopPropagation()}
          className="absolute right-2 opacity-0 group-hover/tab:opacity-100 focus:opacity-100 hover:bg-sidebar-accent hover:text-foreground text-muted-foreground p-1 rounded transition-opacity shrink-0 z-10"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </SidebarMenuItem>
  )
}
