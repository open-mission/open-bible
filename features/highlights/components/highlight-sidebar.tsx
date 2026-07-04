"use client"

import { getColorValue } from "../utils/highlight-colors"
import type { HighlightData } from "../context/highlights-context"

interface HighlightSidebarProps {
  highlights: HighlightData[]
  onShowAll: (highlights: HighlightData[]) => void
  isSelected?: boolean
}

export function HighlightSidebar({
  highlights,
  onShowAll,
  isSelected,
}: HighlightSidebarProps) {
  if (!highlights || highlights.length === 0) return null

  const label =
    highlights.length === 1
      ? (highlights[0].category?.name ?? highlights[0].highlight.color)
      : `${highlights.length} destaques`

  const firstColor = getColorValue(highlights[0].highlight.color)

  return isSelected ? (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        onShowAll(highlights)
      }}
      className="inline-flex items-center gap-1 rounded-full bg-accent/60 px-2 py-0.5 text-xs text-muted-foreground cursor-pointer hover:bg-accent transition-colors"
      aria-label={label}
    >
      <span
        className="size-2 rounded-full shrink-0"
        style={{ backgroundColor: firstColor }}
      />
      <span className="truncate max-w-[16ch]">{label}</span>
    </button>
  ) : (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        onShowAll(highlights)
      }}
      className="size-3 rounded-full cursor-pointer hover:opacity-80 transition-opacity shrink-0"
      style={{ backgroundColor: firstColor }}
      aria-label={label}
      title={label}
    />
  )
}
