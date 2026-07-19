"use client"

import { createContext, useContext, useState, useCallback, useEffect } from "react"
import { database } from "@/lib/database/database"
import type { Highlight, HighlightVerse, HighlightCategory } from "@/lib/database/user/schema"

export interface HighlightData {
  highlight: Highlight
  category: HighlightCategory | null
  verses: HighlightVerse[]
}

interface HighlightsContextValue {
  highlightsByVerse: Map<string, HighlightData[]>
  loading: boolean
  refresh: () => Promise<void>
  activeHighlightId: string | null
  setActiveHighlightId: (id: string | null) => void
  gutterPosition: "left" | "right"
  setGutterPosition: (pos: "left" | "right") => void
  mobileInteraction: "popover" | "drawer"
  setMobileInteraction: (val: "popover" | "drawer") => void
  desktopInteraction: "popover" | "drawer"
  setDesktopInteraction: (val: "popover" | "drawer") => void
}

const HighlightsContext = createContext<HighlightsContextValue | null>(null)

export function HighlightsProvider({
  bookId,
  chapter,
  versionId,
  children,
}: {
  bookId: string
  chapter: number
  versionId: string
  children: React.ReactNode
}) {
  const [highlightsByVerse, setHighlightsByVerse] = useState<Map<string, HighlightData[]>>(new Map())
  const [loading, setLoading] = useState(true)
  const [activeHighlightId, setActiveHighlightId] = useState<string | null>(null)

  // Settings states
  const [gutterPosition, setGutterPositionState] = useState<"left" | "right">("left")
  const [mobileInteraction, setMobileInteractionState] = useState<"popover" | "drawer">("drawer")
  const [desktopInteraction, setDesktopInteractionState] = useState<"popover" | "drawer">("popover")

  // Load from localStorage
  useEffect(() => {
    try {
      const pos = localStorage.getItem("openbible:highlight-gutter-position")
      if (pos === "left" || pos === "right") setGutterPositionState(pos)

      const mob = localStorage.getItem("openbible:highlight-mobile-interaction")
      if (mob === "popover" || mob === "drawer") setMobileInteractionState(mob)

      const desk = localStorage.getItem("openbible:highlight-desktop-interaction")
      if (desk === "popover" || desk === "drawer") setDesktopInteractionState(desk)
    } catch { /* ignore */ }
  }, [])

  const setGutterPosition = (pos: "left" | "right") => {
    setGutterPositionState(pos)
    try { localStorage.setItem("openbible:highlight-gutter-position", pos) } catch {}
  }

  const setMobileInteraction = (val: "popover" | "drawer") => {
    setMobileInteractionState(val)
    try { localStorage.setItem("openbible:highlight-mobile-interaction", val) } catch {}
  }

  const setDesktopInteraction = (val: "popover" | "drawer") => {
    setDesktopInteractionState(val)
    try { localStorage.setItem("openbible:highlight-desktop-interaction", val) } catch {}
  }

  const loadHighlights = useCallback(async () => {
    setActiveHighlightId(null)
    setLoading(true)
    try {
      await database.initialize()
      const hvRepo = database.highlightVerses
      const hRepo = database.highlights
      const catRepo = database.highlightCategories

      const verseRows = await hvRepo.listByChapter(bookId, chapter, versionId)

      const highlightIds = [...new Set(verseRows.map((v) => v.highlightId))]
      const highlightMap = new Map<string, Highlight>()
      const categoryMap = new Map<string, HighlightCategory>()

      for (const id of highlightIds) {
        const h = await hRepo.findById(id)
        if (h) {
          highlightMap.set(id, h)
          if (h.categoryId && !categoryMap.has(h.categoryId)) {
            const cat = await catRepo.findById(h.categoryId)
            if (cat) {
              categoryMap.set(h.categoryId, cat)
            }
          }
        }
      }

      const result = new Map<string, HighlightData[]>()
      for (const hv of verseRows) {
        const verseId = `${hv.book}-${hv.chapter}-${hv.verse}`
        const h = highlightMap.get(hv.highlightId)
        if (!h) continue

        const category = h.categoryId ? (categoryMap.get(h.categoryId) ?? null) : null
        const verses = verseRows.filter((v) => v.highlightId === h.id)

        const existing = result.get(verseId) ?? []
        existing.push({ highlight: h, category, verses })
        result.set(verseId, existing)
      }

      setHighlightsByVerse(result)
    } catch (e) {
      console.error("[Highlights] Failed to load:", e)
    } finally {
      setLoading(false)
    }
  }, [bookId, chapter, versionId])

  useEffect(() => {
    const timer = setTimeout(() => {
      loadHighlights()
    }, 0)
    return () => clearTimeout(timer)
  }, [loadHighlights])

  return (
    <HighlightsContext.Provider value={{ 
      highlightsByVerse, 
      loading, 
      refresh: loadHighlights, 
      activeHighlightId, 
      setActiveHighlightId,
      gutterPosition,
      setGutterPosition,
      mobileInteraction,
      setMobileInteraction,
      desktopInteraction,
      setDesktopInteraction
    }}>
      {children}
    </HighlightsContext.Provider>
  )
}

const DEFAULT_CONTEXT: HighlightsContextValue = {
  highlightsByVerse: new Map(),
  loading: false,
  refresh: async () => {},
  activeHighlightId: null,
  setActiveHighlightId: () => {},
  gutterPosition: "left",
  setGutterPosition: () => {},
  mobileInteraction: "drawer",
  setMobileInteraction: () => {},
  desktopInteraction: "popover",
  setDesktopInteraction: () => {},
}

export function useHighlightsContext() {
  const ctx = useContext(HighlightsContext)
  return ctx ?? DEFAULT_CONTEXT
}
