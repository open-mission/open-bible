"use client"

import { useHighlightsContext } from "../context/highlights-context"
import type { HighlightData } from "../context/highlights-context"

export function useHighlights(verseId?: string): {
  highlights: HighlightData[]
  loading: boolean
} {
  const { highlightsByVerse, loading } = useHighlightsContext()
  const highlights = verseId ? (highlightsByVerse.get(verseId) ?? []) : []
  return { highlights, loading }
}
