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

  const loadHighlights = useCallback(async () => {
    setLoading(true)
    try {
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
    loadHighlights()
  }, [loadHighlights])

  return (
    <HighlightsContext.Provider value={{ highlightsByVerse, loading, refresh: loadHighlights }}>
      {children}
    </HighlightsContext.Provider>
  )
}

export function useHighlightsContext() {
  const ctx = useContext(HighlightsContext)
  if (!ctx) throw new Error("useHighlightsContext must be used within HighlightsProvider")
  return ctx
}
