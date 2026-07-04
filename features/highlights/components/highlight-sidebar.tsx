"use client"

import { cn } from "@/lib/utils"
import { getNeonStyle } from "../utils/highlight-colors"
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
    <div className="flex flex-wrap items-center gap-1.5 mt-1 select-none">
      {highlights.map((h) => {
        const style = getNeonStyle(h.highlight.color)
        const showLabel = isSelected && !!h.category?.name
        
        return (
          <button
            key={h.highlight.id}
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onShowAll([h])
            }}
            className="cursor-pointer focus:outline-none shrink-0 rounded-full flex items-center justify-center overflow-hidden hover:scale-105 active:scale-95 border"
            style={{
              backgroundColor: showLabel ? style.pillBg : style.hex,
              borderColor: showLabel ? `${style.hex}33` : "transparent",
              boxShadow: showLabel ? style.pillRing : style.glow,
              transition: "all 300ms cubic-bezier(0.16, 1, 0.3, 1)",
              height: showLabel ? "18px" : "8px",
              paddingLeft: showLabel ? "8px" : "0px",
              paddingRight: showLabel ? "8px" : "0px",
              maxWidth: showLabel ? "160px" : "32px",
              minWidth: showLabel ? "48px" : "32px",
            }}
            aria-label={h.category?.name ?? "Destaque"}
            title={h.category?.name ?? "Destaque"}
          >
            {h.category?.name && (
              <span
                className="truncate font-bold text-[9px] font-sans"
                style={{
                  color: style.pillText,
                  transition: "all 200ms ease-out",
                  transitionDelay: showLabel ? "100ms" : "0ms",
                  opacity: showLabel ? 1 : 0,
                  transform: showLabel ? "scale(1)" : "scale(0.9)",
                  maxWidth: showLabel ? "120px" : "0px",
                  display: "inline-block",
                }}
              >
                {h.category.name}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
