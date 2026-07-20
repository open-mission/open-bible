import { useMemo } from "react"
import { forwardRef, memo } from "react"
import { StickyNote } from "lucide-react"
import type { Verse } from "@/lib/types"
import { HighlightGutter } from "@/features/highlights/components/highlight-gutter"
import { getNeonStyle } from "@/features/highlights/utils/highlight-colors"
import type { HighlightData } from "@/features/highlights/context/highlights-context"
import { useHighlightsContext } from "@/features/highlights/context/highlights-context"
import type { NoteWithRefs } from "@/features/notes/types"

interface VerseRowProps {
  verse: Verse
  isActive: boolean
  isSelected?: boolean
  highlights?: HighlightData[]
  onEditHighlight?: (highlightId: string) => void
  onDeleteHighlight?: (highlightId: string) => void
  bookName?: string
  chapter?: number
  notes?: NoteWithRefs[]
  onOpenNote?: () => void
  verseSpacing?: "small" | "medium" | "large"
}

export const VerseRow = memo(forwardRef<HTMLDivElement, VerseRowProps>(function VerseRow(
  { verse, isActive, isSelected, highlights, onEditHighlight, onDeleteHighlight, bookName, chapter, notes, onOpenNote, verseSpacing = "medium" },
  ref,
) {
  const { activeHighlightId, gutterPosition } = useHighlightsContext()

  const activeColor = useMemo(() => {
    if (!activeHighlightId || !highlights?.length) return undefined
    const match = highlights.find(h => h.highlight.id === activeHighlightId)
    return match ? match.highlight.color : undefined
  }, [activeHighlightId, highlights])

  const spacingClasses = {
    small: "py-0 mb-1",
    medium: "py-0 mb-2",
    large: "py-0 mb-4",
  }

  const paddingClass = gutterPosition === "left"
    ? "pl-11 pr-4 sm:pl-16 sm:pr-6"
    : "pl-4 pr-11 sm:pl-6 sm:pr-16"

  const hasNotes = !!notes && notes.length > 0

  // Marker-style inline tint so the highlighted text is visible at a glance
  // (first highlight color wins; the pills below still list every highlight).
  const tintHex = highlights?.length
    ? getNeonStyle(highlights[0].highlight.color).hex
    : null

  const showGutter = !!highlights && highlights.length > 0
  const gutterElement = showGutter && (
    <HighlightGutter
      highlights={highlights!}
      currentVerse={verse.verse}
      onEdit={onEditHighlight ?? (() => {})}
      onDelete={onDeleteHighlight ?? (() => {})}
      bookName={bookName ?? ""}
      chapter={chapter ?? 0}
      verseSpacing={verseSpacing}
    />
  )

  return (
    <div
      className={`relative ${paddingClass} ${spacingClasses[verseSpacing]}`}
    >
      {gutterElement}
      <div
        ref={ref}
        data-verse-id={verse.id}
        data-verse-row=""
        role="button"
        tabIndex={0}
        className="group cursor-pointer rounded-md transition-colors select-text px-1.5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1"
        aria-pressed={isActive}
      >
        <div className="flex items-start">
          <span className="font-verse-number text-xs font-bold text-muted-foreground/60 shrink-0 leading-[1.8] mr-1.5">
            {verse.verse}
          </span>
          <div className="flex-1 flex flex-col gap-1">
            <p
              className={`leading-[1.8] text-foreground ${isSelected ? "underline underline-offset-4 decoration-current/40" : ""}`}
              style={{ color: activeColor || undefined, transition: 'color 200ms ease' }}
            >
              {tintHex ? (
                <span
                  className="box-decoration-clone rounded-[3px] px-0.5 -mx-0.5 py-0.5"
                  style={{
                    backgroundColor: `${tintHex}2e`,
                    borderBottom: `1.5px solid ${tintHex}80`,
                  }}
                >
                  {verse.text}
                </span>
              ) : (
                verse.text
              )}
            </p>
            {hasNotes && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onOpenNote?.()
                }}
                className="flex w-fit items-center gap-1 rounded-full border border-border bg-muted/40 px-2 py-0.5 text-[10px] font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                aria-label="Ver notas deste versículo"
              >
                <StickyNote className="size-3" />
                {notes!.length} {notes!.length === 1 ? "nota" : "notas"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}))

