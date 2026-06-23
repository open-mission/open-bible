"use client"

import { StickyNote } from "lucide-react"
import type { Verse, Highlight, Note } from "@/lib/types"

const HIGHLIGHT_HEX: Record<string, string> = {
  amber: "#f5c842",
  green: "#6aba7a",
  blue:  "#6aabd2",
  rose:  "#e87b8c",
}

function resolveHex(h: Highlight): string {
  if (h.color === "custom") return h.customHex ?? "#a78bfa"
  return HIGHLIGHT_HEX[h.color] ?? "#f5c842"
}

interface VerseRowProps {
  verse: Verse
  highlight?: Highlight
  note?: Note
  isActive: boolean
  isSelected?: boolean
  onClick: () => void
}

export function VerseRow({ verse, highlight, note, isActive, isSelected, onClick }: VerseRowProps) {
  const highlightHex = highlight ? resolveHex(highlight) : undefined

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
      className={`group relative flex gap-4 px-6 py-2.5 cursor-pointer rounded-md transition-colors select-text ${
        isActive
          ? "bg-accent/60"
          : isSelected
          ? "ring-1 ring-inset ring-primary/30"
          : "hover:bg-secondary/60"
      }`}
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
