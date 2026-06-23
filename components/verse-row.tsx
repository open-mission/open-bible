"use client"

import { StickyNote } from "lucide-react"
import type { Verse, Highlight, Note } from "@/lib/types"

const HIGHLIGHT_BG: Record<string, string> = {
  amber: "bg-highlight-amber/40",
  green: "bg-highlight-green/40",
  blue: "bg-highlight-blue/40",
  rose: "bg-highlight-rose/40",
}

interface VerseRowProps {
  verse: Verse
  highlight?: Highlight
  note?: Note
  isActive: boolean
  onClick: () => void
}

export function VerseRow({ verse, highlight, note, isActive, onClick }: VerseRowProps) {
  const highlightClass = highlight ? HIGHLIGHT_BG[highlight.color] : ""

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onClick()}
      className={`group relative flex gap-4 px-6 py-2.5 cursor-pointer rounded-md transition-colors select-text ${
        isActive
          ? "bg-accent/60"
          : "hover:bg-secondary/60"
      } ${highlightClass}`}
      aria-pressed={isActive}
    >
      {/* Verse number */}
      <span className="mt-0.5 w-6 shrink-0 text-right text-xs font-mono text-muted-foreground leading-relaxed select-none">
        {verse.verse}
      </span>

      {/* Verse text */}
      <p className="flex-1 font-serif text-base leading-relaxed text-foreground">
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
