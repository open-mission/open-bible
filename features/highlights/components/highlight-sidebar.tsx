"use client"

import { getColorValue } from "../utils/highlight-colors"
import type { HighlightData } from "../context/highlights-context"

interface HighlightSidebarProps {
  highlights: HighlightData[]
  onShowAll: (highlights: HighlightData[]) => void
}

export function HighlightSidebar({
  highlights,
  onShowAll,
}: HighlightSidebarProps) {
  if (!highlights || highlights.length === 0) return null

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        onShowAll(highlights)
      }}
      className="inline-flex items-center gap-1 shrink-0 cursor-pointer"
      aria-label={`${highlights.length} destaque${highlights.length > 1 ? "s" : ""}`}
    >
      {highlights.map((h, i) => (
        <span key={h.highlight.id} className="inline-flex items-center gap-1">
          {i > 0 && <span className="text-xs text-muted-foreground/40">,</span>}
          <span
            className="size-2 rounded-full shrink-0"
            style={{ backgroundColor: getColorValue(h.highlight.color) }}
          />
          <span className="text-xs text-muted-foreground max-w-[8ch] truncate">
            {h.category?.name ?? h.highlight.color}
          </span>
        </span>
      ))}
    </button>
  )
}
