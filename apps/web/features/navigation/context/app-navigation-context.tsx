"use client"

import { createContext, useContext, useState, useCallback, useEffect, useMemo } from "react"
import { usePathname, useRouter } from "next/navigation"
import type { AppView, AppNavigationContextValue, ViewHistoryEntry } from "../types"

const STORAGE_KEY = "openbible:active-view"
const MAX_HISTORY = 20

const AppNavigationContext = createContext<AppNavigationContextValue | null>(null)

const VIEW_TO_PATH: Record<AppView, string> = {
  reader: "/",
  notes: "/notes",
  highlights: "/highlights",
}

function viewFromPath(pathname: string): AppView {
  if (pathname === "/notes") return "notes"
  if (pathname === "/highlights") return "highlights"
  return "reader"
}

function readStoredView(): AppView | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === "notes" || stored === "highlights") return stored
  } catch { /* ignore */ }
  return null
}

export function AppNavigationProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()

  const [view, setView] = useState<AppView>(() => viewFromPath(pathname))
  const [history, setHistory] = useState<ViewHistoryEntry[]>([])
  const [canGoBack, setCanGoBack] = useState(false)

  // The URL is the source of truth for the active view. Derive `view` from the
  // pathname so deep links, reloads and browser back/forward all stay in sync.
  useEffect(() => {
    const next = viewFromPath(pathname)
    setView(next)
    try { localStorage.setItem(STORAGE_KEY, next) } catch { /* ignore */ }
  }, [pathname])

  // Persist an initial history entry once on first mount.
  useEffect(() => {
    const initial = viewFromPath(pathname) || readStoredView() || "reader"
    const frame = requestAnimationFrame(() => {
      setHistory([{ view: initial, timestamp: Date.now() }])
      setCanGoBack(false)
    })
    return () => cancelAnimationFrame(frame)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const navigate = useCallback((nextView: AppView) => {
    const url = VIEW_TO_PATH[nextView]
    if (url === pathname) return
    router.push(url)
  }, [router, pathname])

  const goBack = useCallback(() => {
    setHistory((prev) => {
      if (prev.length <= 1) return prev
      const next = prev.slice(0, -1)
      const entry = next[next.length - 1]
      setCanGoBack(next.length > 1)
      return next
    })
    router.back()
  }, [router])

  const value = useMemo<AppNavigationContextValue>(
    () => ({ activeView: view, history, canGoBack, navigate, goBack }),
    [view, history, canGoBack, navigate, goBack],
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
