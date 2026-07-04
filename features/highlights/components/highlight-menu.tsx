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

  // Find if there is an active highlight for the exact selected verses
  const activeHighlight = useMemo(() => {
    if (selectedVerseIds.length === 0) return null
    const firstVerseId = selectedVerseIds[0]
    const verseHighlights = highlightsByVerse.get(firstVerseId) ?? []
    return verseHighlights.find((h) => {
      const hVerses = h.verses.map((v) => v.verse)
      return selectedVerseIds.every((id) => {
        const num = parseInt(id.split("-").pop()!, 10)
        return hVerses.includes(num)
      })
    }) || null
  }, [selectedVerseIds, highlightsByVerse])

  async function handleColorSelect(color: HighlightColor) {
    try {
      if (activeHighlight) {
        if (color === activeHighlight.highlight.color) {
          // Toggle off: if clicking the active color, delete the highlight
          await onDeleteHighlight(activeHighlight.highlight.id)
          toast.success("Destaque removido")
        } else {
          // Update color of existing highlight
          await onUpdateHighlight(activeHighlight.highlight.id, { color })
          toast.success("Cor do destaque atualizada")
        }
      } else {
        // Create new highlight
        const verseNumbers = selectedVerseIds.map((id) => {
          const parts = id.split("-")
          return parseInt(parts[parts.length - 1], 10)
        })

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
        value={activeHighlight?.highlight.color ?? ""}
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