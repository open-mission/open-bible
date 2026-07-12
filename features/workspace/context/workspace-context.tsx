"use client"

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react"
import type { Pane, PaneState, BiblePaneState, LayoutMode, LayoutNode, LayoutDirection } from "../types"
import { paneTitleFor } from "../lib/pane-title"
import {
  makeLeaf,
  makeSplit,
  replaceLeaf,
  removeLeaf,
  appendLeaf,
  collectPaneIds,
  autoArrange,
} from "../lib/layout-tree"
import { loadLayout } from "../hooks/use-workspace-mode"

/**
 * Workspace state: the set of open panes (tabs), which one is active, and the
 * layout mode (tabs today, grid in Phase 2). Persisted to a single localStorage
 * key so the workspace survives reloads. On first run, migrates the legacy
 * book/chapter/version keys so the user keeps their last reading position.
 */

const WORKSPACE_KEY = "openbible:workspace"
const LEGACY_BOOK_KEY = "openbible:book"
const LEGACY_CHAPTER_KEY = "openbible:chapter"
const LEGACY_VERSION_KEY = "openbible:version"
const FALLBACK_VERSION = "ara"

interface WorkspaceContextValue {
  panes: Pane[]
  activePaneId: string | null
  layoutMode: LayoutMode
  layout: LayoutNode | null
  openPane: (state: PaneState) => string
  closePane: (id: string) => void
  activatePane: (id: string) => void
  reorderPanes: (newOrderIds: string[]) => void
  updatePaneState: (id: string, state: Partial<BiblePaneState>) => void
  setLayoutMode: (mode: LayoutMode) => void
  splitPane: (paneId: string, direction: "horizontal" | "vertical", newState?: PaneState) => string
  activePane: Pane | null
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null)

function generateId(): string {
  return `pane-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

interface PersistedWorkspace {
  panes: Pane[]
  activePaneId: string | null
  layoutMode: LayoutMode
  layout?: LayoutNode | null
}

function migrateFromLegacy(): PersistedWorkspace | null {
  if (typeof window === "undefined") return null
  try {
    const bookId = localStorage.getItem(LEGACY_BOOK_KEY)
    const chapterStr = localStorage.getItem(LEGACY_CHAPTER_KEY)
    const versionId = localStorage.getItem(LEGACY_VERSION_KEY) || FALLBACK_VERSION
    if (bookId && chapterStr) {
      const chapter = Number(chapterStr)
      if (!Number.isNaN(chapter) && chapter > 0) {
        const state: BiblePaneState = { type: "bible", bookId, chapter, versionId }
        const pane: Pane = { id: generateId(), title: paneTitleFor(state), state }
        return { panes: [pane], activePaneId: pane.id, layoutMode: "tabs", layout: makeLeaf(pane.id) }
      }
    }
  } catch {
    /* ignore */
  }
  return null
}

function loadWorkspace(): PersistedWorkspace {
  if (typeof window === "undefined") {
    return { panes: [], activePaneId: null, layoutMode: "tabs" }
  }
  try {
    const raw = localStorage.getItem(WORKSPACE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as PersistedWorkspace
      if (parsed.panes && Array.isArray(parsed.panes) && parsed.panes.length > 0) {
        // Backward compat: if layout is missing or doesn't cover all panes,
        // auto-arrange from the pane list.
        let layout = parsed.layout ?? null
        if (layout) {
          const layoutIds = new Set(collectPaneIds(layout))
          const paneIds = parsed.panes.map((p) => p.id)
          if (!paneIds.every((id) => layoutIds.has(id))) {
            layout = autoArrange(paneIds)
          }
        } else {
          layout = autoArrange(parsed.panes.map((p) => p.id))
        }
        return { ...parsed, layout }
      }
    }
    const migrated = migrateFromLegacy()
    if (migrated) return migrated
  } catch {
    /* ignore */
  }
  // No persisted workspace: respect the user's default layout preference
  // (columns/rows => grid, tabs => tabs).
  const preferred = loadLayout()
  return {
    panes: [],
    activePaneId: null,
    layoutMode: preferred === "tabs" ? "tabs" : "grid",
    layout: null,
  }
}

function saveWorkspace(ws: PersistedWorkspace) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(WORKSPACE_KEY, JSON.stringify(ws))
  } catch {
    /* ignore */
  }
}

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const initialLayout = loadLayout()
  const [panes, setPanes] = useState<Pane[]>([])
  const [activePaneId, setActivePaneId] = useState<string | null>(null)
  const [layoutMode, setLayoutModeState] = useState<LayoutMode>(
    initialLayout === "tabs" ? "tabs" : "grid",
  )
  const [layout, setLayout] = useState<LayoutNode | null>(null)
  const [loaded, setLoaded] = useState(false)
  // Default split direction for grid arrangements: columns => horizontal,
  // rows => vertical, tabs => horizontal (ignored in tabs mode).
  const defaultSplitDirection: LayoutDirection =
    initialLayout === "rows" ? "vertical" : "horizontal"

  // Load persisted workspace on mount (deferred to avoid SSR mismatch).
  useEffect(() => {
    const timer = setTimeout(() => {
      const ws = loadWorkspace()
      setPanes(ws.panes)
      setActivePaneId(ws.activePaneId)
      setLayoutModeState(ws.layoutMode)
      setLayout(ws.layout ?? null)
      setLoaded(true)
    }, 0)
    return () => clearTimeout(timer)
  }, [])

  // Persist whenever workspace changes (after initial load).
  useEffect(() => {
    if (!loaded) return
    saveWorkspace({ panes, activePaneId, layoutMode, layout })
  }, [panes, activePaneId, layoutMode, layout, loaded])

  // Keep activePaneId valid: if it points to a closed/non-existent pane, fall
  // back to the last pane (or null if empty).
  useEffect(() => {
    if (!loaded) return
    if (panes.length === 0) {
      if (activePaneId !== null) setActivePaneId(null)
    } else if (!panes.some((p) => p.id === activePaneId)) {
      setActivePaneId(panes[panes.length - 1].id)
    }
  }, [panes, activePaneId, loaded])

  // Sync the active Bible pane's position back to the legacy localStorage keys
  // so Simple mode picks up where Advanced mode left off when switching modes.
  useEffect(() => {
    if (!loaded) return
    const active = panes.find((p) => p.id === activePaneId)
    if (!active || active.state.type !== "bible") return
    try {
      localStorage.setItem(LEGACY_BOOK_KEY, active.state.bookId)
      localStorage.setItem(LEGACY_CHAPTER_KEY, String(active.state.chapter))
      localStorage.setItem(LEGACY_VERSION_KEY, active.state.versionId)
    } catch {
      /* ignore */
    }
  }, [panes, activePaneId, loaded])

  const openPane = useCallback((state: PaneState): string => {
    const id = generateId()
    const pane: Pane = { id, title: paneTitleFor(state), state }
    setPanes((prev) => [...prev, pane])
    setActivePaneId(id)
    // Keep layout tree in sync: append the new pane as a leaf.
    setLayout((prev) => {
      const leaf = makeLeaf(id)
      if (!prev) return leaf
      return appendLeaf(prev, leaf, defaultSplitDirection)
    })
    return id
  }, [defaultSplitDirection])

  const closePane = useCallback((id: string) => {
    setPanes((prev) => prev.filter((p) => p.id !== id))
    setLayout((prev) => (prev ? removeLeaf(prev, id) : null))
  }, [])

  const activatePane = useCallback((id: string) => {
    setActivePaneId(id)
  }, [])

  /**
   * Reorder panes (tabs and grid) by a new ordered list of pane IDs. The layout
   * tree is re-mapped so its shape (splits/ratios) is preserved while panes move.
   */
  const reorderPanes = useCallback((newOrderIds: string[]) => {
    setPanes((prevPanes) =>
      newOrderIds
        .map((id) => prevPanes.find((p) => p.id === id))
        .filter((p): p is Pane => !!p)
        .concat(prevPanes.filter((p) => !newOrderIds.includes(p.id))),
    )
    setLayout((prevLayout) => {
      if (!prevLayout) return prevLayout
      const ids = collectPaneIds(prevLayout)
      let cursor = 0
      const remap = (node: LayoutNode): LayoutNode => {
        if (node.type === "leaf") {
          const next = ids[Math.min(cursor, ids.length - 1)]
          cursor++
          return { ...node, paneId: next }
        }
        return { ...node, children: node.children.map(remap) }
      }
      return remap(prevLayout)
    })
  }, [])

  const updatePaneState = useCallback(
    (id: string, state: Partial<BiblePaneState>) => {
      setPanes((prev) =>
        prev.map((p) => {
          if (p.id !== id) return p
          if (p.state.type !== "bible") return p
          const newState = { ...p.state, ...state } as BiblePaneState
          return { ...p, state: newState, title: paneTitleFor(newState) }
        }),
      )
    },
    [],
  )

  const setLayoutMode = useCallback((mode: LayoutMode) => {
    setLayoutModeState(mode)
    // When switching to grid, ensure the layout tree covers all panes.
    if (mode === "grid") {
      setPanes((currentPanes) => {
        setLayout((currentLayout) => {
          if (!currentLayout || currentPanes.length === 0) return currentLayout
          const layoutIds = new Set(collectPaneIds(currentLayout))
          const paneIds = currentPanes.map((p) => p.id)
          if (!paneIds.every((id) => layoutIds.has(id))) {
            return autoArrange(paneIds, defaultSplitDirection)
          }
          return currentLayout
        })
        return currentPanes
      })
    }
  }, [defaultSplitDirection])

  /**
   * Split a pane in the layout tree. The existing pane stays in place; a new
   * pane (with `newState`, or a duplicate of the original for Bible panes) is
   * added as the second child of a new split node. Returns the new pane ID.
   */
  const splitPane = useCallback(
    (paneId: string, direction: "horizontal" | "vertical", newState?: PaneState): string => {
      const newId = generateId()
      const sourcePane = panes.find((p) => p.id === paneId)
      // Default: duplicate the source pane's state (common for comparing translations).
      const state: PaneState =
        newState ??
        (sourcePane?.state ?? { type: "bible", bookId: "gen", chapter: 1, versionId: "ara" })
      const newPane: Pane = { id: newId, title: paneTitleFor(state), state }

      setPanes((prev) => [...prev, newPane])
      setActivePaneId(newId)
      setLayout((prev) => {
        if (!prev) return makeLeaf(newId)
        const sourceLeaf = makeLeaf(paneId)
        const newLeaf = makeLeaf(newId)
        const split = makeSplit(direction, [sourceLeaf, newLeaf])
        return replaceLeaf(prev, paneId, split)
      })
      return newId
    },
    [panes],
  )

  const activePane = panes.find((p) => p.id === activePaneId) ?? null

  const value: WorkspaceContextValue = {
    panes,
    activePaneId,
    layoutMode,
    layout,
    openPane,
    closePane,
    activatePane,
    reorderPanes,
    updatePaneState,
    setLayoutMode,
    splitPane,
    activePane,
  }

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext)
  if (!ctx) throw new Error("useWorkspace must be used within WorkspaceProvider")
  return ctx
}
