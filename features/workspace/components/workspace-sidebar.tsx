"use client"

import { useState, useCallback } from "react"
import { X, LayoutGrid, Monitor, LayoutPanelLeft, LayoutPanelTop, Book, BookOpen, Rows3, MoreVertical, ChevronLeft, ChevronRight } from "lucide-react"
import { IconSun, IconMoon, IconSettings } from "@tabler/icons-react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { useWorkspace } from "../context/workspace-context"
import { type TabsOrientation } from "../hooks/use-workspace-mode"
import { useAppTheme } from "@/features/theme/components/theme-provider"
import { ConfigDialog } from "@/features/config/components/config-dialog"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { APP_VERSION, APP_ENV, ENV_LABEL, isPreRelease } from "@/lib/app-env"
import type { Pane, LayoutMode } from "../types"
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
  ContextMenuItem,
} from "@/components/ui/context-menu"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { PaneTypePicker } from "./pane-type-picker"

interface WorkspaceSidebarProps {
  onOverviewOpen: () => void
}

/**
 * Sidebar displaying workspace panes vertically, allowing dragging to reorder,
 * right-click context menu options to toggle layout orientations, theme, and config.
 */
function SidebarHeaderMenu() {
  const { tabsOrientation, setTabsOrientation, layoutMode, setLayoutMode } = useWorkspace()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        title="Opções da barra lateral"
        className="flex items-center justify-center rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors outline-none focus-visible:ring-1 focus-visible:ring-ring"
      >
        <MoreVertical className="h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Posição das Abas</DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={tabsOrientation}
            onValueChange={(val) => setTabsOrientation(val as TabsOrientation)}
          >
            <DropdownMenuRadioItem value="horizontal" className="gap-2">
              <LayoutPanelTop className="h-4 w-4" />
              <span>Abas no Topo</span>
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="vertical" className="gap-2">
              <LayoutPanelLeft className="h-4 w-4" />
              <span>Abas na Lateral</span>
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuLabel>Modo de Exibição</DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={layoutMode}
            onValueChange={(val) => setLayoutMode(val as LayoutMode)}
          >
            <DropdownMenuRadioItem value="tabs" className="gap-2">
              <Monitor className="h-4 w-4" />
              <span>Modo Abas</span>
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="grid" className="gap-2">
              <LayoutGrid className="h-4 w-4" />
              <span>Modo Grade</span>
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

interface WorkspaceSidebarProps {
  sidebarWidth: number
  onSidebarResize: (width: number) => void
}

/**
 * Sidebar displaying workspace panes vertically, allowing dragging to reorder,
 * right-click context menu options to toggle layout orientations, theme, and config.
 */
export function WorkspaceSidebar({ sidebarWidth, onSidebarResize }: WorkspaceSidebarProps) {
  const { panes, activePaneId, activatePane, closePane, layoutMode, setLayoutMode, tabsOrientation, setTabsOrientation } = useWorkspace()
  const { isDark, setTheme } = useAppTheme()
  const { state, setOpen } = useSidebar()
  const isCollapsed = state === "collapsed"
  const [configOpen, setConfigOpen] = useState(false)

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    const startX = e.clientX
    const startWidth = sidebarWidth

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const targetWidth = startWidth + (moveEvent.clientX - startX)
      if (targetWidth < 120) {
        setOpen(false)
        onSidebarResize(256)
      } else {
        setOpen(true)
        const newWidth = Math.max(180, Math.min(480, targetWidth))
        onSidebarResize(newWidth)
      }
    }

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }

    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)
  }, [sidebarWidth, onSidebarResize, setOpen])

  const sidebarContent = (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border bg-sidebar shrink-0 relative">
      <SidebarHeader className="border-b border-sidebar-border/40 py-2.5 px-3 flex flex-row items-center justify-between min-h-[52px] gap-2 bg-sidebar-accent/10">
        {!isCollapsed ? (
          <>
            {/* Abas vs Grade Layout Mode Toggle using ToggleGroup */}
            <ToggleGroup
              type="single"
              value={[layoutMode]}
              onValueChange={(val) => {
                if (val && val[0]) setLayoutMode(val[0] as LayoutMode)
              }}
              spacing={0}
              variant="outline"
              className="flex-1 min-w-0"
            >
              <ToggleGroupItem
                value="tabs"
                className="flex-1 text-[11px] h-7 px-1.5"
              >
                <Rows3 className="size-3 shrink-0 mr-1" />
                <span>Abas</span>
              </ToggleGroupItem>
              <ToggleGroupItem
                value="grid"
                className="flex-1 text-[11px] h-7 px-1.5"
              >
                <LayoutGrid className="size-3 shrink-0 mr-1" />
                <span>Grade</span>
              </ToggleGroupItem>
            </ToggleGroup>

            {/* Three Dots Menu Dropdown */}
            <SidebarHeaderMenu />

            {/* Collapse button */}
            <button
              type="button"
              onClick={() => setOpen(false)}
              title="Recolher barra lateral"
              className="flex items-center justify-center rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          </>
        ) : (
          /* When collapsed, show vertical stack with expand button and layout toggler */
          <div className="flex flex-col gap-2 items-center w-full">
            <button
              type="button"
              onClick={() => setOpen(true)}
              title="Expandir barra lateral"
              className="flex items-center justify-center rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors outline-none focus-visible:ring-1 focus-visible:ring-ring mx-auto"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <div className="w-full border-t border-sidebar-border/30 my-0.5" />
            <button
              type="button"
              onClick={() => setLayoutMode(layoutMode === "tabs" ? "grid" : "tabs")}
              title={layoutMode === "tabs" ? "Mudar para modo Grade" : "Mudar para modo Abas"}
              className="flex items-center justify-center rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors outline-none focus-visible:ring-1 focus-visible:ring-ring mx-auto"
            >
              {layoutMode === "tabs" ? (
                <Rows3 className="h-4.5 w-4.5 text-primary" />
              ) : (
                <LayoutGrid className="h-4.5 w-4.5 text-primary" />
              )}
            </button>
          </div>
        )}
      </SidebarHeader>

      <SidebarContent className="px-2 py-3 flex flex-col gap-3">
        <SidebarGroup className="p-0">
          <SidebarGroupLabel className="flex items-center justify-between w-full pr-0 px-2 mb-2">
            <span className="group-data-[collapsible=icon]:hidden text-xs font-semibold text-muted-foreground/60 uppercase tracking-wider truncate flex-1">
              Painéis abertos
            </span>
            <div className="flex items-center gap-1 group-data-[collapsible=icon]:hidden shrink-0">
              <PaneTypePicker />
            </div>
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

        {/* Subtle version indicator inside sidebar footer */}
        <div className="px-2.5 py-1.5 flex items-center justify-between border-t border-sidebar-border/20 mt-1 select-none group-data-[collapsible=icon]:hidden">
          <span className="text-[10px] text-muted-foreground/45 font-mono">
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

      {/* Drag-to-resize handle */}
      {!isCollapsed && (
        <div
          onMouseDown={handleMouseDown}
          className="absolute top-0 right-0 w-1.5 h-full cursor-col-resize hover:bg-primary/30 active:bg-primary transition-colors z-50"
        />
      )}
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
        <ContextMenuSeparator />
        <ContextMenuGroup>
          <ContextMenuItem onClick={() => setConfigOpen(true)} className="gap-2">
            <IconSettings className="h-4 w-4" />
            <span>Configurações</span>
          </ContextMenuItem>
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
  const isDragDisabled = isCollapsed

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: pane.id, disabled: isDragDisabled })

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
        {...(!isDragDisabled ? attributes : {})}
        {...(!isDragDisabled ? listeners : {})}
      >
        {isCollapsed ? (
          active ? (
            <BookOpen className="h-4.5 w-4.5 text-primary shrink-0" />
          ) : (
            <Book className="h-4.5 w-4.5 text-muted-foreground shrink-0" />
          )
        ) : (
          <>
            {active ? (
              <BookOpen className="h-4.5 w-4.5 text-primary shrink-0" />
            ) : (
              <Book className="h-4.5 w-4.5 text-muted-foreground shrink-0" />
            )}
            <span className="truncate flex-1 font-medium select-none ml-0.5">{pane.title}</span>
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
