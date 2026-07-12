"use client"

import { useState, useEffect, createContext, useContext } from "react"
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
  rectSortingStrategy,
} from "@dnd-kit/sortable"
import { useWorkspace } from "../context/workspace-context"
import { useReaderSettings } from "../hooks/use-reader-settings"
import { BiblePaneView } from "./bible-pane-view"
import { NotePaneView } from "./note-pane-view"
import { SermonPaneView } from "./sermon-pane-view"
import { WorkspaceTabs } from "./workspace-tabs"
import { WorkspaceToolbar } from "./workspace-toolbar"
import { WorkspaceGrid } from "./workspace-grid"
import { WorkspaceMobileBar } from "./workspace-mobile-bar"
import { ConfigButton } from "./config-button"
import { ReaderEmpty } from "@/features/bible-reader/components/reader-empty"
import { cn } from "@/lib/utils"
import type { BiblePaneState } from "../types"

/** Shares the currently dragged pane id so tabs/grid panes can render an overlay. */
const WorkspaceDndContext = createContext<{
  activeId: string | null
  setActiveId: (id: string | null) => void
}>({ activeId: null, setActiveId: () => {} })

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
  const { activePane, activePaneId, openPane, panes, updatePaneState, layoutMode, activatePane, reorderPanes } = useWorkspace()
  const settings = useReaderSettings()
  const [headerCollapsed, setHeaderCollapsed] = useState(false)
  const [activeDragId, setActiveDragId] = useState<string | null>(null)

  // DnD sensors: small movement threshold so clicks still activate panes.
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor),
  )

  const handleDragStart = (e: DragStartEvent) => {
    setActiveDragId(String(e.active.id))
  }

  const handleDragEnd = (e: DragEndEvent) => {
    setActiveDragId(null)
    const { active, over } = e
    if (!over || active.id === over.id) return
    const ids = panes.map((p) => p.id)
    const from = ids.indexOf(String(active.id))
    const to = ids.indexOf(String(over.id))
    if (from === -1 || to === -1) return
    reorderPanes(arrayMove(ids, from, to))
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
  const activePaneTitle = panes.find((p) => p.id === activeDragId)?.title

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
      strategy={layoutMode === "grid" ? rectSortingStrategy : horizontalListSortingStrategy}
    >
    <div className="relative flex flex-col h-full min-h-0">
      {/* Desktop header — tabs + Abas/Grade toggle + picker on one line */}
      {panes.length > 0 && !headerCollapsed && (
        <div className="hidden md:flex items-center gap-2 border-b border-border bg-muted/40 px-2 py-1.5 shrink-0">
          <WorkspaceTabs />
          <WorkspaceToolbar />
          <ConfigButton />
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
      )}

      {/* Floating reveal handle when header is collapsed (desktop) */}
      {panes.length > 0 && headerCollapsed && (
        <button
          type="button"
          onClick={toggleHeader}
          aria-label="Mostrar barra"
          title="Mostrar barra"
          className={cn(
            "hidden md:flex absolute top-0 left-2 z-30 items-center justify-center",
            "rounded-b-lg border border-t-0 border-border/60 bg-background/85 backdrop-blur px-4 py-0.5",
            "text-muted-foreground shadow-sm transition-colors hover:bg-background hover:text-foreground",
            "outline-none focus-visible:ring-2 focus-visible:ring-ring",
          )}
        >
          <ChevronDown className="h-4 w-4" />
        </button>
      )}

      {/* Content */}
      <div className="relative flex-1 min-h-0 h-full overflow-hidden pb-[calc(7rem+env(safe-area-inset-bottom))] md:pb-0">
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

    {activeDragId && activePaneTitle && (
      <DragOverlay>
        <div className="rounded-md border border-border bg-background px-3 py-1.5 text-sm font-medium shadow-lg">
          {activePaneTitle}
        </div>
      </DragOverlay>
    )}
    </SortableContext>
    </DndContext>
    </WorkspaceDndContext.Provider>
  )
}
