"use client"

import { useState, useEffect, createContext, useContext, useMemo } from "react"
import { ChevronUp, ChevronDown, X, FolderX } from "lucide-react"
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { useWorkspace } from "../context/workspace-context"
import { useReaderSettings } from "../hooks/use-reader-settings"
import { type TabsOrientation } from "../hooks/use-workspace-mode"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { WorkspaceSidebar } from "./workspace-sidebar"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuTrigger,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuGroup,
  ContextMenuItem,
} from "@/components/ui/context-menu"
import { LayoutPanelTop, LayoutPanelLeft, Monitor, LayoutGrid, BookOpen, Book, Notebook, Presentation } from "lucide-react"
import { BiblePaneView } from "./bible-pane-view"
import { NotePaneView } from "./note-pane-view"
import { SermonPaneView } from "./sermon-pane-view"
import { WorkspaceTabs } from "./workspace-tabs"
import { WorkspaceToolbar } from "./workspace-toolbar"
import { WorkspaceGrid } from "./workspace-grid"
import { WorkspaceMobileBar } from "./workspace-mobile-bar"
import { ConfigButton } from "./config-button"
import { IconLayoutGrid } from "@tabler/icons-react"
import { WorkspaceTabOverview } from "./workspace-tab-overview"
import { ReaderEmpty } from "@/features/bible-reader/components/reader-empty"
import { cn } from "@/lib/utils"
import { useIsTauriMacOS } from "@/features/layout/hooks/use-is-tauri-macos"
import type { BiblePaneState, LayoutMode } from "../types"

/** Shares the currently dragged pane id so tabs/grid panes can render an overlay. */
const WorkspaceDndContext = createContext<{
  activeId: string | null
  setActiveId: (id: string | null) => void
}>({ activeId: null, setActiveId: () => { } })

export function useWorkspaceDnd() {
  return useContext(WorkspaceDndContext)
}

const HEADER_COLLAPSED_KEY = "openbible:workspace-header-collapsed"

const getPaneIcon = (paneType: string, isActive: boolean) => {
  if (paneType === "bible") {
    return isActive ? BookOpen : Book
  }
  if (paneType === "note") {
    return Notebook
  }
  if (paneType === "sermon") {
    return Presentation
  }
  return Book
}

/**
 * The workspace content area. On desktop (md+) a single header line combines
 * the tab list with the Abas/Grade toggle and the new-pane picker. The header
 * can be collapsed (a chevron pushes it up) for a distraction-free / fullscreen
 * feel — handy in grid mode. On mobile the tab bar moves to the bottom (near
 * the global nav). Panes can be Bible passages, notes, or sermons (Phase 3).
 * When no pane exists, an empty state with a call-to-action is shown.
 */
export function WorkspaceView() {
  const { activePane, activePaneId, openPane, closePane, closeAllPanes, splitPane, panes, updatePaneState, layoutMode, activatePane, reorderPanes, swapPanes, setLayoutMode, tabsOrientation, setTabsOrientation } = useWorkspace()
  const settings = useReaderSettings()
  const [sidebarWidth, setSidebarWidth] = useState(256)
  const isTauriMacOS = useIsTauriMacOS()
  const [headerCollapsed, setHeaderCollapsed] = useState(false)
  const [activeDragId, setActiveDragId] = useState<string | null>(null)
  const [overviewOpen, setOverviewOpen] = useState(false)
  const [switcherOpen, setSwitcherOpen] = useState(false)
  const [switcherSelectedIndex, setSwitcherSelectedIndex] = useState(0)
  const [switcherModifier, setSwitcherModifier] = useState<"control" | "meta" | null>(null)

  const strategy = tabsOrientation === "vertical" ? verticalListSortingStrategy : horizontalListSortingStrategy

  // DnD sensors: 8px threshold to reduce false-positive drags when clicking.
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor),
  )

  const handleDragStart = (e: DragStartEvent) => {
    setActiveDragId(String(e.active.id))
  }

  const handleDragEnd = (e: DragEndEvent) => {
    setActiveDragId(null)
    const { active, over } = e
    if (!over || active.id === over.id) return

    if (layoutMode === "grid") {
      // Grid mode: swap pane positions in the layout tree.
      swapPanes(String(active.id), String(over.id))
    } else {
      // Tabs mode: reorder the flat pane list.
      const ids = panes.map((p) => p.id)
      const from = ids.indexOf(String(active.id))
      const to = ids.indexOf(String(over.id))
      if (from === -1 || to === -1) return
      reorderPanes(arrayMove(ids, from, to))
    }
  }

  // Load persisted collapse preference (client-only).
  useEffect(() => {
    try {
      setHeaderCollapsed(localStorage.getItem(HEADER_COLLAPSED_KEY) === "1")
    } catch {
      /* ignore */
    }
  }, [])

  const toggleHeader = () => {
    setHeaderCollapsed((prev) => {
      const next = !prev
      try {
        localStorage.setItem(HEADER_COLLAPSED_KEY, next ? "1" : "0")
      } catch {
        /* ignore */
      }
      return next
    })
  }

  // Keyboard shortcuts: ⌘/Ctrl + 1..9 jump to a pane by index; ⌘/Ctrl + Tab
  // (and Shift) cycle through panes. Works in both tabs and grid modes.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Block workspace shortcuts while the tab overview modal is open
      if (overviewOpen) return

      const target = e.target as HTMLElement | null
      const tag = target?.tagName
      if (
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        target?.isContentEditable
      ) {
        return
      }

      const isModKey = e.metaKey || e.ctrlKey
      const isShift = e.shiftKey

      // Create new tab/split: ⌘/Ctrl (+ Shift) + T or Alt (+ Shift) + T
      if ((isModKey || e.altKey) && e.key.toLowerCase() === "t") {
        e.preventDefault()
        if (panes.length === 0) {
          openPane({ type: "bible", bookId: "gen", chapter: 1, versionId: "ara" } as BiblePaneState)
        } else {
          // If shift is pressed, split vertically (row). Otherwise split horizontally (column).
          splitPane(activePaneId!, isShift ? "vertical" : "horizontal", { type: "bible", bookId: "gen", chapter: 1, versionId: "ara" } as BiblePaneState)
        }
        return
      }

      // If no panes, other shortcuts don't apply
      if (panes.length === 0) return

      // Close active tab: ⌘/Ctrl + W or Alt + W
      if ((isModKey || e.altKey) && e.key.toLowerCase() === "w") {
        e.preventDefault()
        if (activePaneId) {
          closePane(activePaneId)
        }
        return
      }

      // Tab switcher toggles: ⌘/Ctrl + Tab or Alt + E
      const isAltE = e.key.toLowerCase() === "e" && e.altKey
      const isCtrlTab = e.key === "Tab" && isModKey

      if (isCtrlTab || isAltE) {
        e.preventDefault()
        const modifier = isCtrlTab ? (e.ctrlKey ? "control" : "meta") : "alt"

        setSwitcherOpen((prevOpen) => {
          if (!prevOpen) {
            const currentIdx = panes.findIndex((p) => p.id === activePaneId)
            const nextIdx = (currentIdx + (isShift ? -1 : 1) + panes.length) % panes.length
            setSwitcherSelectedIndex(nextIdx)
            setSwitcherModifier(modifier)
            return true
          } else {
            setSwitcherSelectedIndex((prevIdx) => {
              const delta = isShift ? -1 : 1
              return (prevIdx + delta + panes.length) % panes.length
            })
            return true
          }
        })
        return
      }

      // ⌘/Ctrl + 1..9  → jump to that pane
      if (isModKey && /^[1-9]$/.test(e.key)) {
        e.preventDefault()
        const idx = Number(e.key) - 1
        if (idx < panes.length) activatePane(panes[idx].id)
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [panes, activePaneId, activatePane, openPane, closePane, splitPane, overviewOpen])

  // KeyUp handler to commit selected tab switch
  useEffect(() => {
    if (!switcherOpen || !switcherModifier) return

    const handleKeyUp = (e: KeyboardEvent) => {
      let targetKey = "Control"
      if (switcherModifier === "meta") targetKey = "Meta"
      if (switcherModifier === "alt") targetKey = "Alt"

      const isReleased =
        e.key === targetKey ||
        (switcherModifier === "control" && !e.ctrlKey) ||
        (switcherModifier === "meta" && !e.metaKey) ||
        (switcherModifier === "alt" && !e.altKey)

      if (isReleased) {
        if (panes[switcherSelectedIndex]) {
          activatePane(panes[switcherSelectedIndex].id)
        }
        setSwitcherOpen(false)
        setSwitcherModifier(null)
      }
    }

    window.addEventListener("keyup", handleKeyUp)
    return () => window.removeEventListener("keyup", handleKeyUp)
  }, [switcherOpen, switcherModifier, switcherSelectedIndex, panes, activatePane])

  const openFirstPane = () =>
    openPane({ type: "bible", bookId: "gen", chapter: 1, versionId: "ara" } as BiblePaneState)

  const paneIds = panes.map((p) => p.id)
  const activeDragPane = panes.find((p) => p.id === activeDragId)

  // Memoize the drag overlay content to avoid re-renders
  const dragOverlayContent = useMemo(() => {
    if (!activeDragId || !activeDragPane) return null
    return (
      <div className="rounded-lg border border-primary/30 bg-background/95 backdrop-blur-sm px-4 py-2 shadow-xl ring-1 ring-primary/10">
        <span className="text-sm font-medium">{activeDragPane.title}</span>
      </div>
    )
  }, [activeDragId, activeDragPane])

  const workspaceContent = (
    <div className="relative flex flex-col h-full min-h-0 flex-1 min-w-0">
      {/* Desktop header — tabs + Abas/Grade toggle + picker on one line */}
      {panes.length > 0 && tabsOrientation !== "vertical" && !headerCollapsed && (
        <ContextMenu>
          <ContextMenuTrigger className="w-full">
            <div
              data-tauri-drag-region={isTauriMacOS ? "" : undefined}
              className={cn(
                "hidden md:flex items-center gap-2 px-2 pt-1.5 shrink-0",
                isTauriMacOS && "pl-[75px] pt-3 pb-1"
              )}
            >
              <button
                type="button"
                onClick={() => setOverviewOpen(true)}
                aria-label="Ver todas as abas"
                title="Ver todas as abas (Estilo Safari)"
                className="flex items-center justify-center rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-background/60 hover:text-foreground shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <IconLayoutGrid className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={closeAllPanes}
                aria-label="Fechar todas as abas"
                title="Fechar todas as abas"
                className="flex items-center justify-center rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-background/60 hover:text-destructive shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <FolderX className="h-4 w-4" />
              </button>
              {tabsOrientation !== "vertical" && <WorkspaceTabs />}
              <WorkspaceToolbar />
              {tabsOrientation !== "vertical" && <ConfigButton />}
              <button
                type="button"
                onClick={toggleHeader}
                aria-label="Ocultar barra"
                title="Ocultar barra"
                className="flex items-center justify-center rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-background/60 hover:text-foreground shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <ChevronUp className="h-4 w-4" />
              </button>
            </div>
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
              <ContextMenuItem onClick={closeAllPanes} className="gap-2 text-destructive focus:text-destructive">
                <X className="h-4 w-4" />
                <span>Fechar todas as abas</span>
              </ContextMenuItem>
            </ContextMenuGroup>
          </ContextMenuContent>
        </ContextMenu>
      )}

      {/* Floating reveal handle when header is collapsed (desktop) */}
      {panes.length > 0 && tabsOrientation !== "vertical" && headerCollapsed && (
        <button
          type="button"
          onClick={toggleHeader}
          aria-label="Mostrar barra"
          title="Mostrar barra"
          className={cn(
            "hidden md:flex absolute top-0 left-2 z-30 items-center justify-center",
            isTauriMacOS && "left-[80px]",
            "rounded-b-lg border border-t-0 border-border/60 bg-background/85 backdrop-blur px-4 py-0.5",
            "text-muted-foreground shadow-sm transition-colors hover:bg-background hover:text-foreground",
            "outline-none focus-visible:ring-2 focus-visible:ring-ring",
          )}
        >
          <ChevronDown className="h-4 w-4" />
        </button>
      )}

      {/* Content */}
      <div className="relative flex-1 min-h-0 h-full overflow-hidden pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-0">
        {panes.length === 0 ? (
          <ReaderEmpty onOpenSidebar={openFirstPane} />
        ) : layoutMode === "grid" ? (
          <WorkspaceGrid />
        ) : !activePane ? (
          <ReaderEmpty onOpenSidebar={openFirstPane} />
        ) : activePane.state.type === "bible" ? (
          <BiblePaneView
            key={activePane.id}
            pane={activePane}
            readerMode={settings.readerMode}
            onChangeReaderMode={settings.setReaderMode}
            fontSize={settings.fontSize}
            onChangeFontSize={settings.setFontSize}
            verseSpacing={settings.verseSpacing}
            onChangeVerseSpacing={settings.setVerseSpacing}
            readerFont={settings.readerFont}
            onChangeReaderFont={settings.setReaderFont}
            onPaneUpdate={updatePaneState}
          />
        ) : activePane.state.type === "note" ? (
          <NotePaneView key={activePane.id} />
        ) : activePane.state.type === "sermon" ? (
          <SermonPaneView key={activePane.id} paneId={activePane.id} />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            Em breve
          </div>
        )}
      </div>

      {/* Mobile bottom bar — tabs + toggle + picker + settings, above MobileNav */}
      {panes.length > 0 && <WorkspaceMobileBar />}
    </div>
  )

  return (
    <WorkspaceDndContext.Provider value={{ activeId: activeDragId, setActiveId: setActiveDragId }}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={paneIds}
          strategy={strategy}
        >
          {tabsOrientation === "vertical" && panes.length > 0 ? (
            <SidebarProvider
              style={{ "--sidebar-width": `${sidebarWidth}px` } as React.CSSProperties}
              className="h-full min-h-0"
            >
              <WorkspaceSidebar
                sidebarWidth={sidebarWidth}
                onSidebarResize={setSidebarWidth}
              />
              <SidebarInset className="flex flex-col h-full min-h-0 overflow-hidden bg-background">
                {workspaceContent}
              </SidebarInset>
            </SidebarProvider>
          ) : (
            workspaceContent
          )}

          <WorkspaceTabOverview open={overviewOpen} onClose={() => setOverviewOpen(false)} />

          {switcherOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-xs pointer-events-auto" onClick={() => setSwitcherOpen(false)}>
              <div 
                className="w-full max-w-sm rounded-lg border border-border/60 bg-background/95 p-2 shadow-2xl backdrop-blur-md outline-none pointer-events-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="px-3 py-1.5 text-[11px] font-semibold text-muted-foreground/60 uppercase tracking-wider">
                  Alternar Abas
                </div>
                <div className="flex flex-col gap-0.5 mt-1">
                  {panes.map((pane, idx) => {
                    const isSelected = idx === switcherSelectedIndex
                    const Icon = getPaneIcon(pane.state.type, pane.id === activePaneId)
                    return (
                      <button
                        key={pane.id}
                        type="button"
                        onClick={() => {
                          activatePane(pane.id)
                          setSwitcherOpen(false)
                          setSwitcherModifier(null)
                        }}
                        className={cn(
                          "flex items-center gap-2.5 w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors select-none outline-none",
                          isSelected
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-accent hover:text-accent-foreground text-foreground"
                        )}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        <span className="truncate flex-1">{pane.title}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {activeDragId && (
            <DragOverlay dropAnimation={null}>
              {dragOverlayContent}
            </DragOverlay>
          )}
        </SortableContext>
      </DndContext>
    </WorkspaceDndContext.Provider>
  )
}
