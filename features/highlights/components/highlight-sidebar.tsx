"use client"

import { getColorValue } from "../utils/highlight-colors"
import type { HighlightData } from "../context/highlights-context"

interface HighlightSidebarProps {
  highlights: HighlightData[]
  onShowAll: (highlights: HighlightData[]) => void
}

const MULTI_COLORS = ["amber", "green", "blue", "rose"] as const

function getMultiColorGradient(highlights: HighlightData[]): string {
  const colors = highlights.map((h) => getColorValue(h.highlight.color))
  if (colors.length === 1) return colors[0]
  const stops = colors.map((c, i) => `${c} ${(i / (colors.length - 1)) * 100}%`).join(", ")
  return `linear-gradient(90deg, ${stops})`
}

export function HighlightSidebar({
  highlights,
  onShowAll,
}: HighlightSidebarProps) {
  if (!highlights || highlights.length === 0) return null

  const firstHighlight = highlights[0]
  const highlightLabel =
    highlights.length === 1
      ? firstHighlight.category?.name ?? firstHighlight.highlight.color
      : `${highlights.length} destaques`

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        onShowAll(highlights)
      }}
      className="block w-2 h-1.5 rounded-full cursor-pointer transition-opacity hover:opacity-80 shrink-0"
      style={{
        background:
          highlights.length === 1
            ? getColorValue(firstHighlight.highlight.color)
            : getMultiColorGradient(highlights),
      }}
      aria-label={highlightLabel}
      title={highlightLabel}
    />
  )
}
