"use client"

import * as React from "react"
import type { HighlightData } from "../context/highlights-context"
import { useHighlightsContext } from "../context/highlights-context"
import { GutterIndicator } from "./gutter-indicator"

interface HighlightGutterProps {
  highlights: HighlightData[]
  currentVerse: number
  onEdit: (highlightId: string) => void
  onDelete: (highlightId: string) => void
  bookName: string
  chapter: number
  verseSpacing: "small" | "medium" | "large"
}

function computePosition(
  highlight: HighlightData,
  currentVerse: number
): "single" | "top" | "middle" | "bottom" {
  const sorted = [...highlight.verses].sort((a, b) => a.verse - b.verse)
  if (sorted.length === 0) return "single"

  const min = sorted[0].verse
  const max = sorted[sorted.length - 1].verse
  
  if (min === max) return "single"
  if (currentVerse === min) return "top"
  if (currentVerse === max) return "bottom"
  return "middle"
}

function computeReference(
  highlight: HighlightData,
  bookName: string,
  chapter: number
): string {
  const sorted = [...highlight.verses].sort((a, b) => a.verse - b.verse)
  if (sorted.length === 0) return `${bookName} ${chapter}`

  const min = sorted[0].verse
  const max = sorted[sorted.length - 1].verse
  return min === max
    ? `${bookName} ${chapter}:${min}`
    : `${bookName} ${chapter}:${min}-${max}`
}

export function HighlightGutter({
  highlights,
  currentVerse,
  onEdit,
  onDelete,
  bookName,
  chapter,
  verseSpacing,
}: HighlightGutterProps) {
  const { activeHighlightId, setActiveHighlightId } = useHighlightsContext()

  return (
    <div className="relative w-7 shrink-0 select-none" data-highlight-gutter>
      {highlights.map((h, i) => {
        // Calculate dynamic dot placement (exactly one dot per highlight, staggered based on lane)
        const sorted = [...h.verses].sort((a, b) => a.verse - b.verse)
        let showDot = false
        if (sorted.length > 0) {
          const min = sorted[0].verse
          const max = sorted[sorted.length - 1].verse
          const rangeLength = max - min + 1
          const dotOffset = i % rangeLength
          const dotVerse = min + dotOffset
          showDot = currentVerse === dotVerse
        }

        return (
          <GutterIndicator
            key={h.highlight.id}
            highlight={h}
            position={computePosition(h, currentVerse)}
            lane={i}
            isActive={activeHighlightId === h.highlight.id}
            onActivate={(id) => setActiveHighlightId(id)}
            onDeactivate={() => setActiveHighlightId(null)}
            verseReference={computeReference(h, bookName, chapter)}
            onEdit={onEdit}
            onDelete={onDelete}
            showDot={showDot}
            verseSpacing={verseSpacing}
          />
        )
      })}
    </div>
  )
}
