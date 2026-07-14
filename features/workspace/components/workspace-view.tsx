"use client"

import { useState, useEffect, createContext, useContext, useMemo } from "react"
import { ChevronUp, ChevronDown } from "lucide-react"
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
import { useWorkspaceMode, type TabsOrientation } from "../hooks/use-workspace-mode"
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
} from "@/components/ui/context-menu"
import { LayoutPanelTop, LayoutPanelLeft, Monitor, LayoutGrid } from "lucide-react"
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

/**
 * The workspace content area. On desktop (md+) a single header line combines
 * the tab list with the Abas/Grade toggle and the new-pane picker. The header
 * can be collapsed (a chevron pushes it up) for a distraction-free / fullscreen
 * feel — handy in grid mode. On mobile the tab bar moves to the bottom (near
 * the global nav). Panes can be Bible passages, notes, or sermons (Phase 3).
 * When no pane exists, an empty state with a call-to-action is shown.
 */
export function WorkspaceView() {
  const { activePane, activePaneId, openPane, panes, updatePaneState, layoutMode, activatePane, reorderPanes, swapPanes, setLayoutMode } = useWorkspace()
  const { tabsOrientation, setTabsOrientation } = useWorkspaceMode()
  const settings = useReaderSettings()
  const isTauriMacOS = useIsTauriMacOS()
  const [headerCollapsed, setHeaderCollapsed] = useState(false)
  const [activeDragId, setActiveDragId] = useState<string | null>(null)
  const [overviewOpen, setOverviewOpen] = useState(false)

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
    if (panes.length === 0) return
    const handler = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey)) return
      const target = e.target as HTMLElement | null
      const tag = target?.tagName
      if (
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        target?.isContentEditable
      ) {
        return
      }

      // ⌘/Ctrl + Tab  and  ⌘/Ctrl + Shift + Tab  → cycle
      if (e.key === "Tab") {
        e.preventDefault()
        const idx = panes.findIndex((p) => p.id === activePaneId)
        const current = idx === -1 ? 0 : idx
        const delta = e.shiftKey ? -1 : 1
        const nextIdx = (current + delta + panes.length) % panes.length
        activatePane(panes[nextIdx].id)
        return
      }

      // ⌘/Ctrl + 1..9  → jump to that pane
      if (/^[1-9]$/.test(e.key)) {
        e.preventDefault()
        const idx = Number(e.key) - 1
        if (idx < panes.length) activatePane(panes[idx].id)
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [panes, activePaneId, activatePane])

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
            <SidebarProvider className="h-full min-h-0">
              <WorkspaceSidebar onOverviewOpen={() => setOverviewOpen(true)} />
              <SidebarInset className="flex flex-col h-full min-h-0 overflow-hidden bg-background">
                {workspaceContent}
              </SidebarInset>
            </SidebarProvider>
          ) : (
            workspaceContent
          )}

          <WorkspaceTabOverview open={overviewOpen} onClose={() => setOverviewOpen(false)} />

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
