"use client"

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
}: HighlightSidebarProps) {
  if (!highlights || highlights.length === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
      {highlights.map((h) => {
        const hasCategory = !!h.category?.name
        return (
          <button
            key={h.highlight.id}
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onShowAll([h])
            }}
            className={cn(
              "cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none shrink-0",
              hasCategory
                ? "px-2 py-0.5 text-[9px] font-bold text-white rounded-full flex items-center justify-center min-h-[18px]"
                : "w-8 h-2 rounded-full"
            )}
            style={{ backgroundColor: getColorValue(h.highlight.color) }}
            aria-label={h.category?.name ?? "Destaque"}
            title={h.category?.name ?? "Destaque"}
          >
            {hasCategory && h.category.name}
          </button>
        )
      })}
    </div>
  )
}
