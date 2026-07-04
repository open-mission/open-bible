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
      className={cn(badgeVariants({ variant: "outline" }), "gap-1 cursor-pointer")}
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
      className="size-2.5 rounded-full cursor-pointer hover:opacity-80 transition-opacity shrink-0"
      style={{ backgroundColor: firstColor }}
      aria-label={label}
      title={label}
    />
  )
}
