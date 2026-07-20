"use client"

import { useMemo } from "react"
import { IconPencil } from "@tabler/icons-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { HighlightColorPicker } from "./highlight-color-picker"
import type { HighlightColor } from "../utils/highlight-colors"
import type { HighlightCategory } from "@/lib/database/user/schema"
import { useHighlightsContext } from "../context/highlights-context"

interface HighlightMenuProps {
  selectedVerseIds: string[]
  bookId: string
  chapter: number
  versionId: string
  isMobile: boolean
  onCreateHighlight: (input: {
    color: string
    book: string
    chapter: number
    verses: number[]
    bible: string
  }) => Promise<void>
  onDeleteHighlight: (id: string) => Promise<void>
  onUpdateHighlight: (id: string, patch: { color: string }) => Promise<void>
  listCategories: () => Promise<HighlightCategory[]>
  createCategory: (name: string) => Promise<HighlightCategory>
  onClose: () => void
  onOpenEditor: () => void
}

export function HighlightMenu({
  selectedVerseIds,
  bookId,
  chapter,
  versionId,
  isMobile,
  onCreateHighlight,
  onDeleteHighlight,
  onUpdateHighlight,
  onClose,
  onOpenEditor,
}: HighlightMenuProps) {
  const { highlightsByVerse } = useHighlightsContext()

  // Find highlights that cover the selected verses
  const selectedVersesHighlights = useMemo(() => {
    if (selectedVerseIds.length === 0) return []
    const firstVerseId = selectedVerseIds[0]
    return highlightsByVerse.get(firstVerseId) ?? []
  }, [selectedVerseIds, highlightsByVerse])

  // Get active highlight color if any (using first highlight's color for color picker visual state)
  const activeColor = useMemo(() => {
    if (selectedVerseIds.length === 0) return ""
    const firstVerseId = selectedVerseIds[0]
    const verseHighlights = highlightsByVerse.get(firstVerseId) ?? []
    return verseHighlights[0]?.highlight.color ?? ""
  }, [selectedVerseIds, highlightsByVerse])

  async function handleColorSelect(color: HighlightColor) {
    try {
      const verseNumbers = selectedVerseIds.map((id) => {
        const parts = id.split("-")
        return parseInt(parts[parts.length - 1], 10)
      })

      // Find any existing highlight on these exact verses (regardless of color)
      const existingExact = selectedVersesHighlights.find((h) => {
        const hVerses = h.verses.map((v) => v.verse)
        if (hVerses.length !== selectedVerseIds.length) return false
        return selectedVerseIds.every((id) => {
          const num = parseInt(id.split("-").pop()!, 10)
          return hVerses.includes(num)
        })
      })

      if (existingExact) {
        if (existingExact.highlight.color.toLowerCase() === color.toLowerCase()) {
          // Toggle off: delete this specific highlight
          await onDeleteHighlight(existingExact.highlight.id)
          toast.success("Destaque removido")
        } else {
          // Update color of the existing highlight
          await onUpdateHighlight(existingExact.highlight.id, { color })
          toast.success("Destaque atualizado")
        }
      } else {
        // Create new highlight with this color
        await onCreateHighlight({
          color,
          book: bookId,
          chapter,
          verses: verseNumbers,
          bible: versionId,
        })
        toast.success("Destaque criado")
      }

      // Close the selection popover
      onClose()
    } catch {
      toast.error("Falha ao atualizar destaque.")
    }
  }

  return (
    <div className="flex items-center justify-center gap-3">
      <HighlightColorPicker
        value={activeColor}
        onChange={handleColorSelect}
      />
      <Button
        type="button"
        variant="ghost"
        size={isMobile ? "icon-xs" : "sm"}
        onClick={onOpenEditor}
        className="text-muted-foreground hover:text-foreground shrink-0 font-medium text-xs gap-1.5"
        aria-label="Mais informações"
      >
        <IconPencil data-icon="inline-start" />
        {!isMobile && <span>Mais informações</span>}
      </Button>
    </div>
  )
}