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
  onUpdateHighlight: (id: string, patch: { color?: string; categoryId?: string | null }) => Promise<void>
  onDeleteHighlight: (id: string) => Promise<void>
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
  onUpdateHighlight,
  onDeleteHighlight,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onClose: _onClose, // forwarded by parent — reserved for future use
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

      // Check if there is an existing highlight on these exact verses with this exact color
      const existingWithColor = selectedVersesHighlights.find((h) => {
        if (h.highlight.color.toLowerCase() !== color.toLowerCase()) return false
        const hVerses = h.verses.map((v) => v.verse)
        return selectedVerseIds.every((id) => {
          const num = parseInt(id.split("-").pop()!, 10)
          return hVerses.includes(num)
        })
      })

      if (existingWithColor) {
        // Toggle off: delete this specific highlight
        await onDeleteHighlight(existingWithColor.highlight.id)
        toast.success("Destaque removido")
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
    } catch {
      toast.error("Falha ao atualizar destaque.")
    }
  }

  return (
    <div className="flex items-center justify-between w-full gap-4">
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