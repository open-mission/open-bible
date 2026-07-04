import { forwardRef, memo } from "react"
import type { Verse } from "@/lib/types"
import { HighlightSidebar } from "@/features/highlights/components/highlight-sidebar"
import type { HighlightData } from "@/features/highlights/context/highlights-context"

interface VerseRowProps {
  verse: Verse
  isActive: boolean
  isSelected?: boolean
  highlights?: HighlightData[]
  onShowAll?: (highlights: HighlightData[]) => void
  verseSpacing?: "small" | "medium" | "large"
}

export const VerseRow = memo(forwardRef<HTMLDivElement, VerseRowProps>(function VerseRow(
  { verse, isActive, isSelected, highlights, onShowAll, verseSpacing = "medium" },
  ref,
) {
  const spacingClasses = {
    small: "py-1.5 mb-1",
    medium: "py-2.5 mb-2",
    large: "py-4 mb-4",
  }

  return (
    <div
      ref={ref}
      data-verse-id={verse.id}
      data-verse-row=""
      role="button"
      tabIndex={0}
      style={
        isSelected
          ? { backgroundColor: "color-mix(in srgb, var(--color-primary) 12%, transparent)" }
          : undefined
      }
      className={`group px-4 sm:px-6 ${spacingClasses[verseSpacing]} cursor-pointer rounded-md transition-colors select-text ${isActive
          ? "bg-accent/60"
          : isSelected
            ? "ring-1 ring-inset ring-primary/30"
            : "hover:bg-secondary/60"
        }`}
      aria-pressed={isActive}
    >
      <div className="flex items-start">
        <span className="font-verse-number text-xs font-bold text-muted-foreground/60 shrink-0 leading-[1.8] mr-1.5">
          {verse.verse}
        </span>
        <div className="flex-1 flex flex-col gap-1">
          <p className="leading-[1.8] text-foreground">
            {verse.text}
          </p>
          {highlights && highlights.length > 0 && (
            <HighlightSidebar
              highlights={highlights}
              onShowAll={onShowAll ?? (() => {})}
              isSelected={isSelected}
            />
          )}
        </div>
      </div>
    </div>
  )
}))

