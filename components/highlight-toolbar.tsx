"use client"

import { useRef } from "react"
import { X, StickyNote, Pipette } from "lucide-react"
import type { HighlightColor, Highlight } from "@/lib/types"

const PRESET_COLORS: { value: HighlightColor; label: string; hex: string }[] = [
  { value: "amber", label: "Amarelo", hex: "#f5c842" },
  { value: "green", label: "Verde",   hex: "#6aba7a" },
  { value: "blue",  label: "Azul",    hex: "#6aabd2" },
  { value: "rose",  label: "Rosa",    hex: "#e87b8c" },
]

interface HighlightToolbarProps {
  verseRef: string
  /** Number of verses currently selected */
  selectionCount?: number
  activeHighlight?: Highlight
  onHighlight: (color: HighlightColor, customHex?: string) => void
  onRemoveHighlight: () => void
  onOpenNote: () => void
  onClose: () => void
}

export function HighlightToolbar({
  verseRef,
  selectionCount = 1,
  activeHighlight,
  onHighlight,
  onRemoveHighlight,
  onOpenNote,
  onClose,
}: HighlightToolbarProps) {
  const colorInputRef = useRef<HTMLInputElement>(null)

  /** Resolve the display hex for the active highlight */
  function activeHex(): string | undefined {
    if (!activeHighlight) return undefined
    if (activeHighlight.color === "custom") return activeHighlight.customHex
    return PRESET_COLORS.find((c) => c.value === activeHighlight.color)?.hex
  }

  return (
    <div className="flex items-center gap-1 rounded-lg border border-border bg-card shadow-md px-2 py-1.5">
      {/* Verse ref / selection label */}
      <span className="mr-1.5 text-xs text-muted-foreground font-mono select-none pr-2 border-r border-border whitespace-nowrap">
        {selectionCount > 1 ? `${selectionCount} versículos` : verseRef}
      </span>

      {/* Preset color swatches */}
      {PRESET_COLORS.map((c) => {
        const isActive = activeHighlight?.color === c.value
        return (
          <button
            key={c.value}
            onClick={() => onHighlight(c.value)}
            aria-label={`Destacar com ${c.label}`}
            style={{ backgroundColor: c.hex, outlineColor: isActive ? c.hex : undefined }}
            className={`w-5 h-5 rounded-full transition-all hover:scale-110 ${
              isActive
                ? "scale-110 outline outline-2 outline-offset-2"
                : "hover:outline hover:outline-2 hover:outline-offset-2 hover:outline-border"
            }`}
          />
        )
      })}

      {/* Custom color picker */}
      <div className="relative">
        <button
          onClick={() => colorInputRef.current?.click()}
          aria-label="Cor personalizada"
          title="Cor personalizada"
          style={
            activeHighlight?.color === "custom" && activeHighlight.customHex
              ? { backgroundColor: activeHighlight.customHex, outlineColor: activeHighlight.customHex }
              : undefined
          }
          className={`w-5 h-5 rounded-full transition-all hover:scale-110 flex items-center justify-center border border-border overflow-hidden ${
            activeHighlight?.color === "custom"
              ? "scale-110 outline outline-2 outline-offset-2"
              : "bg-gradient-to-br from-rose-400 via-violet-400 to-blue-400 hover:outline hover:outline-2 hover:outline-offset-2 hover:outline-border"
          }`}
        >
          {!(activeHighlight?.color === "custom") && (
            <Pipette className="h-2.5 w-2.5 text-white drop-shadow" />
          )}
        </button>
        <input
          ref={colorInputRef}
          type="color"
          defaultValue={activeHighlight?.customHex ?? "#a78bfa"}
          onChange={(e) => onHighlight("custom", e.target.value)}
          className="sr-only"
          aria-hidden="true"
          tabIndex={-1}
        />
      </div>

      {/* Remove highlight */}
      {activeHighlight && (
        <button
          onClick={onRemoveHighlight}
          aria-label="Remover destaque"
          className="ml-0.5 flex items-center justify-center w-5 h-5 rounded-full bg-secondary hover:bg-muted transition-colors text-muted-foreground"
        >
          <X className="h-3 w-3" />
        </button>
      )}

      {/* Divider */}
      <div className="mx-1 h-4 w-px bg-border" />

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
        className="ml-0.5 flex items-center justify-center w-5 h-5 rounded text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}
