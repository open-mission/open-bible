"use client"

import { useState } from "react"
import { IconHighlight } from "@tabler/icons-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { HighlightColorPicker } from "./highlight-color-picker"
import type { HighlightColor } from "../utils/highlight-colors"
import type { HighlightCategory } from "@/lib/database/user/schema"



interface HighlightMenuProps {
  selectedVerseIds: string[]
  bookId: string
  chapter: number
  versionId: string
  onCreateHighlight: (input: {
    color: string
    book: string
    chapter: number
    verses: number[]
    bible: string
  }) => Promise<void>
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
  onCreateHighlight,
  onDeleteHighlight,
  listCategories,
  createCategory,
  onClose,
  onOpenEditor,
}: HighlightMenuProps) {
  const [showColors, setShowColors] = useState(false)

  async function handleColorSelect(color: HighlightColor) {
    try {
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
      onClose()
    } catch {
      toast.error("Falha ao criar destaque.")
    }
  }

  return (
    <>
      {!showColors && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setShowColors(true)}
          className="flex-1 text-muted-foreground hover:text-foreground"
        >
          <IconHighlight data-icon="inline-start" />
          Destaque
        </Button>
      )}

      {showColors && (
        <div className="flex flex-col gap-2 p-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Escolha uma cor</span>
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              onClick={() => setShowColors(false)}
            >
              ✕
            </Button>
          </div>
          <HighlightColorPicker
            value="amber"
            onChange={handleColorSelect}
            showCustom={false}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              onClose()
              onOpenEditor()
            }}
            className="text-xs text-muted-foreground"
          >
            Mais opções →
          </Button>
        </div>
      )}
    </>
  )
}