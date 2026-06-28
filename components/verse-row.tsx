"use client"

import { StickyNote } from "lucide-react"
import type { Verse, Highlight, Note } from "@/lib/types"
import { resolveHighlightHex } from "@/lib/verse-utils"

interface VerseRowProps {
  verse: Verse
  highlight?: Highlight
  note?: Note
  isActive: boolean
  isSelected?: boolean
  onClick: () => void
}

export function VerseRow({ verse, highlight, note, isActive, isSelected, onClick }: VerseRowProps) {
  const highlightHex = highlight ? resolveHighlightHex(highlight) : undefined

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onClick()}
      style={
        highlightHex
          ? { backgroundColor: `${highlightHex}55` }
          : isSelected
            ? { backgroundColor: "color-mix(in srgb, var(--color-primary) 12%, transparent)" }
            : undefined
      }
      className={`group relative flex gap-4 px-4 sm:px-6 py-2.5 mb-2 cursor-pointer rounded-md transition-colors select-text ${isActive
          ? "bg-accent/60"
          : isSelected
            ? "ring-1 ring-inset ring-primary/30"
            : "hover:bg-secondary/60"
        }`}
      aria-pressed={isActive}
    >
      {/* Verse number */}
      <sup className="font-verse-number text-xs font-bold text-muted-foreground/60 shrink-0">
        {verse.verse}
      </sup>

      {/* Verse text */}
      <p className="flex-1 font-serif text-[20px] leading-[1.8] text-foreground">
        {verse.text}
      </p>

      {/* Note indicator */}
      {note && (
        <span
          className="mt-1 shrink-0 text-muted-foreground/60"
          aria-label="Tem nota"
        >
          <StickyNote className="h-3.5 w-3.5" />
        </span>
      )}
    </div>
  )
}
