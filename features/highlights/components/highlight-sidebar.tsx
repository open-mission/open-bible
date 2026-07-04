"use client"

import { badgeVariants } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
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

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {highlights.map((h) => (
        <button
          key={h.highlight.id}
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onShowAll(highlights)
          }}
          className={cn(
            badgeVariants({ variant: isSelected ? "outline" : "ghost" }),
            isSelected ? "gap-1" : "gap-0 p-1",
            "cursor-pointer",
          )}
          aria-label={h.category?.name ?? h.highlight.color}
          title={h.category?.name ?? h.highlight.color}
        >
          <span
            className="size-3 rounded-full shrink-0"
            style={{ backgroundColor: getColorValue(h.highlight.color) }}
          />
          {isSelected && (
            <span className="truncate max-w-[16ch]">
              {h.category?.name ?? h.highlight.color}
            </span>
          )}
        </button>
      ))}
    </div>
  )
}
