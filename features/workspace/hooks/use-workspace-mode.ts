"use client"

import { useState, useEffect, useCallback } from "react"

/**
 * Reading mode toggle: "simple" (single reader, the classic experience) vs
 * "advanced" (workspace with tabs/grid). Persisted to localStorage so the
 * choice survives sessions. Defaults to "simple" to preserve the existing UX
 * for current users.
 */
export type WorkspaceMode = "simple" | "advanced"

const WORKSPACE_MODE_KEY = "openbible:workspace-mode"

function loadMode(): WorkspaceMode {
  if (typeof window === "undefined") return "simple"
  try {
    const v = localStorage.getItem(WORKSPACE_MODE_KEY)
    return v === "advanced" ? "advanced" : "simple"
  } catch {
    return "simple"
  }
}

export function useWorkspaceMode() {
  const [mode, setModeState] = useState<WorkspaceMode>("simple")
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setModeState(loadMode())
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

  return { mode, setMode, loaded }
}
