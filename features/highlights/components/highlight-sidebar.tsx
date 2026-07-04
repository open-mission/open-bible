"use client"

import { getColorValue } from "../utils/highlight-colors"
import type { HighlightData } from "../context/highlights-context"

interface HighlightSidebarProps {
  highlights: HighlightData[]
  onHighlightClick: (highlightId: string) => void
  onShowAll: (highlights: HighlightData[]) => void
}

const MAX_VISIBLE = 4

export function HighlightSidebar({
  highlights,
  onHighlightClick,
  onShowAll,
}: HighlightSidebarProps) {
  if (!highlights || highlights.length === 0) return null

  const visible = highlights.slice(0, MAX_VISIBLE)
  const remaining = highlights.length - MAX_VISIBLE

  function handleClick(highlightId: string) {
    if (highlights.length > MAX_VISIBLE) {
      onShowAll(highlights)
    } else {
      onHighlightClick(highlightId)
    }
  }

  return (
    <div
      className="flex shrink-0 gap-px mr-2 py-1"
      data-highlight-sidebar=""
    >
      {visible.map((h) => (
        <button
          key={h.highlight.id}
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            handleClick(h.highlight.id)
          }}
          className="h-4 w-1 rounded-full transition-opacity hover:opacity-80 cursor-pointer"
          style={{ backgroundColor: getColorValue(h.highlight.color) }}
          aria-label={`Destaque ${h.highlight.color}${h.category ? ` (${h.category.name})` : ""}`}
        />
      ))}
      {remaining > 0 && (
        <span className="text-[10px] text-muted-foreground leading-none self-center ml-0.5">
          +{remaining}
        </span>
      )}
    </div>
  )
}
