"use client"

import { createContext, useContext, useState, useCallback, useEffect, useMemo } from "react"
import type { AppView, AppNavigationContextValue, ViewHistoryEntry } from "../types"

const STORAGE_KEY = "openbible:active-view"
const MAX_HISTORY = 20

const AppNavigationContext = createContext<AppNavigationContextValue | null>(null)

function getInitialView(): AppView {
  if (typeof window === "undefined") return "reader"
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === "notes" || stored === "highlights") return stored
  } catch { /* ignore */ }
  return "reader"
}

export function AppNavigationProvider({ children }: { children: React.ReactNode }) {
  const [activeView, setActiveView] = useState<AppView>("reader")
  const [history, setHistory] = useState<ViewHistoryEntry[]>([])
  const [canGoBack, setCanGoBack] = useState(false)

  useEffect(() => {
    const initial = getInitialView()
    setHistory([{ view: initial, timestamp: Date.now() }])
    if (initial !== "reader") {
      setActiveView(initial)
    }
  }, [])

  const navigate = useCallback((view: AppView) => {
    setActiveView(view)
    try { localStorage.setItem(STORAGE_KEY, view) } catch { /* ignore */ }

    setHistory((prev) => [
      ...prev.slice(-MAX_HISTORY + 1),
      { view, timestamp: Date.now() },
    ])
    setCanGoBack(true)

    const url = view === "reader" ? "/" : `/${view}`
    window.history.pushState({ view }, "", url)
  }, [])

  const goBack = useCallback(() => {
    setHistory((prev) => {
      if (prev.length <= 1) return prev
      const next = prev.slice(0, -1)
      const entry = next[next.length - 1]
      setActiveView(entry.view)
      try { localStorage.setItem(STORAGE_KEY, entry.view) } catch { /* ignore */ }
      setCanGoBack(next.length > 1)
      return next
    })
  }, [])

  const value = useMemo<AppNavigationContextValue>(
    () => ({ activeView, history, canGoBack, navigate, goBack }),
    [activeView, history, canGoBack, navigate, goBack],
  )

  return (
    <AppNavigationContext.Provider value={value}>
      {children}
    </AppNavigationContext.Provider>
  )
}

export function useAppNavigation() {
  const ctx = useContext(AppNavigationContext)
  if (!ctx) throw new Error("useAppNavigation must be used within AppNavigationProvider")
  return ctx
}
