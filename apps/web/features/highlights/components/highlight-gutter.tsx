"use client"

import * as React from "react"
import type { HighlightData } from "../context/highlights-context"
import { useHighlightsContext } from "../context/highlights-context"
import { GutterIndicator } from "./gutter-indicator"
import { cn } from "@/lib/utils"

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
  const { activeHighlightId, setActiveHighlightId, gutterPosition, getHighlightLane } = useHighlightsContext()
  const isLeft = gutterPosition === "left"

  // Sort highlights by their assigned global lane index to ensure correct rendering order in DOM
  const sortedHighlights = React.useMemo(() => {
    return [...highlights].sort((a, b) => {
      const aLane = getHighlightLane(a.highlight.id)
      const bLane = getHighlightLane(b.highlight.id)
      return aLane - bLane
    })
  }, [highlights, getHighlightLane])

  return (
    <div 
      className={cn(
        "absolute top-0 bottom-0 w-7 select-none pointer-events-none z-10",
        isLeft 
          ? "left-1.5 sm:left-4" 
          : "right-1.5 sm:right-4"
      )}
      data-highlight-gutter
    >
      {sortedHighlights.map((h) => {
        const globalLane = getHighlightLane(h.highlight.id)

        // Calculate dynamic dot placement (exactly one dot per highlight, staggered based on globalLane)
        const sorted = [...h.verses].sort((a, b) => a.verse - b.verse)
        let showDot = false
        if (sorted.length > 0) {
          const min = sorted[0].verse
          const max = sorted[sorted.length - 1].verse
          const rangeLength = max - min + 1
          const dotOffset = globalLane % rangeLength
          const dotVerse = min + dotOffset
          showDot = currentVerse === dotVerse
        }

        return (
          <GutterIndicator
            key={h.highlight.id}
            highlight={h}
            position={computePosition(h, currentVerse)}
            lane={globalLane}
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
