"use client"

import { useState, useEffect, useCallback } from "react"

/**
 * Reading mode toggle: "simple" (single reader, the classic experience) vs
 * "advanced" (workspace with tabs/grid). Persisted to localStorage so the
 * choice survives sessions. Defaults to "simple" to preserve the existing UX
 * for current users.
 *
 * For the advanced mode, a default `layout` can be chosen: "tabs" (browser
 * style), "columns" (panes side-by-side) or "rows" (panes stacked). This is
 * read by the workspace provider to set the initial grid orientation.
 */
export type WorkspaceMode = "simple" | "advanced"
export type WorkspaceLayout = "tabs" | "columns" | "rows"
export type TabsOrientation = "horizontal" | "vertical"

const WORKSPACE_MODE_KEY = "openbible:workspace-mode"
const WORKSPACE_LAYOUT_KEY = "openbible:workspace-layout"
const TABS_ORIENTATION_KEY = "openbible:tabs-orientation"

function loadMode(): WorkspaceMode {
  if (typeof window === "undefined") return "simple"
  try {
    const v = localStorage.getItem(WORKSPACE_MODE_KEY)
    return v === "advanced" ? "advanced" : "simple"
  } catch {
    return "simple"
  }
}

export function loadLayout(): WorkspaceLayout {
  if (typeof window === "undefined") return "tabs"
  try {
    const v = localStorage.getItem(WORKSPACE_LAYOUT_KEY)
    return v === "columns" || v === "rows" ? v : "tabs"
  } catch {
    return "tabs"
  }
}

function loadTabsOrientation(): TabsOrientation {
  if (typeof window === "undefined") return "horizontal"
  try {
    const v = localStorage.getItem(TABS_ORIENTATION_KEY)
    return v === "vertical" ? "vertical" : "horizontal"
  } catch {
    return "horizontal"
  }
}

export function useWorkspaceMode() {
  const [mode, setModeState] = useState<WorkspaceMode>("simple")
  const [layout, setLayoutState] = useState<WorkspaceLayout>("tabs")
  const [tabsOrientation, setTabsOrientationState] = useState<TabsOrientation>("horizontal")
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setModeState(loadMode())
      setLayoutState(loadLayout())
      setTabsOrientationState(loadTabsOrientation())
      setLoaded(true)
    }, 0)
    return () => clearTimeout(timer)
  }, [])

  const setMode = useCallback((m: WorkspaceMode) => {
    setModeState(m)
    try {
      localStorage.setItem(WORKSPACE_MODE_KEY, m)
    } catch {
      /* ignore */
    }
  }, [])

  const setLayout = useCallback((l: WorkspaceLayout) => {
    setLayoutState(l)
    try {
      localStorage.setItem(WORKSPACE_LAYOUT_KEY, l)
    } catch {
      /* ignore */
    }
  }, [])

  const setTabsOrientation = useCallback((o: TabsOrientation) => {
    setTabsOrientationState(o)
    try {
      localStorage.setItem(TABS_ORIENTATION_KEY, o)
    } catch {
      /* ignore */
    }
  }, [])

  return { mode, setMode, layout, setLayout, tabsOrientation, setTabsOrientation, loaded }
}

