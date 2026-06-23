"use client"

import { X, StickyNote } from "lucide-react"
import type { HighlightColor, Highlight } from "@/lib/types"

const COLORS: { value: HighlightColor; label: string; bg: string; ring: string }[] = [
  { value: "amber", label: "Amarelo", bg: "bg-highlight-amber", ring: "ring-highlight-amber" },
  { value: "green", label: "Verde", bg: "bg-highlight-green", ring: "ring-highlight-green" },
  { value: "blue", label: "Azul", bg: "bg-highlight-blue", ring: "ring-highlight-blue" },
  { value: "rose", label: "Rosa", bg: "bg-highlight-rose", ring: "ring-highlight-rose" },
]

interface HighlightToolbarProps {
  verseRef: string
  activeHighlight?: Highlight
  onHighlight: (color: HighlightColor) => void
  onRemoveHighlight: () => void
  onOpenNote: () => void
  onClose: () => void
}

export function HighlightToolbar({
  verseRef,
  activeHighlight,
  onHighlight,
  onRemoveHighlight,
  onOpenNote,
  onClose,
}: HighlightToolbarProps) {
  return (
    <div className="flex items-center gap-1 rounded-lg border border-border bg-card shadow-md px-2 py-1.5">
      {/* Verse ref label */}
      <span className="mr-1.5 text-xs text-muted-foreground font-mono select-none pr-2 border-r border-border">
        {verseRef}
      </span>

      {/* Highlight color buttons */}
      {COLORS.map((c) => (
        <button
          key={c.value}
          onClick={() => onHighlight(c.value)}
          aria-label={`Destacar com ${c.label}`}
          className={`w-5 h-5 rounded-full transition-all ${c.bg} ${
            activeHighlight?.color === c.value
              ? `ring-2 ring-offset-1 ring-offset-card ${c.ring} scale-110`
              : "hover:scale-110 hover:ring-2 hover:ring-offset-1 hover:ring-offset-card hover:ring-border"
          }`}
        />
      ))}

      {/* Remove highlight */}
      {activeHighlight && (
        <button
          onClick={onRemoveHighlight}
          aria-label="Remover destaque"
          className="ml-1 flex items-center justify-center w-5 h-5 rounded-full bg-secondary hover:bg-muted transition-colors text-muted-foreground"
        >
          <X className="h-3 w-3" />
        </button>
      )}

      {/* Divider */}
      <div className="mx-1.5 h-4 w-px bg-border" />

      {/* Note button */}
      <button
        onClick={onOpenNote}
        aria-label="Adicionar nota"
        className="flex items-center gap-1 rounded px-2 py-0.5 text-xs text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
      >
        <StickyNote className="h-3.5 w-3.5" />
        <span>Nota</span>
      </button>

      {/* Close */}
      <button
        onClick={onClose}
        aria-label="Fechar"
        className="ml-1 flex items-center justify-center w-5 h-5 rounded text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}
