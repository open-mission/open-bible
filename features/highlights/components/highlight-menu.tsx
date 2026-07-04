"use client"

import { useState } from "react"
import { IconHighlight } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { HighlightColorPicker } from "./highlight-color-picker"
import { HighlightEditor } from "./highlight-editor"
import type { HighlightColor } from "../utils/highlight-colors"



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
  onUpdateHighlight: (id: string, patch: { color: string; categoryId: string | null }) => Promise<void>
  onDeleteHighlight: (id: string) => Promise<void>
  listCategories: () => Promise<any[]>
  createCategory: (name: string) => Promise<any>
  onClose: () => void
}

export function HighlightMenu({
  selectedVerseIds,
  bookId,
  chapter,
  versionId,
  onCreateHighlight,
  onUpdateHighlight,
  onDeleteHighlight,
  listCategories,
  createCategory,
  onClose,
}: HighlightMenuProps) {
  const [showColors, setShowColors] = useState(false)
  const [showEditor, setShowEditor] = useState(false)

  async function handleColorSelect(color: HighlightColor) {
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
  }

  return (
    <>
      {!showColors && !showEditor && (
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
              setShowColors(false)
              setShowEditor(true)
            }}
            className="text-xs text-muted-foreground"
          >
            Mais opções →
          </Button>
        </div>
      )}

      {showEditor && (
        <HighlightEditor
          open={showEditor}
          onClose={() => {
            setShowEditor(false)
            onClose()
          }}
          highlight={null}
          onSave={async () => {}}
          onCreate={async (patch) => {
            const verseNumbers = selectedVerseIds.map((id) => {
              const parts = id.split("-")
              return parseInt(parts[parts.length - 1], 10)
            })
            await onCreateHighlight({
              color: patch.color,
              book: bookId,
              chapter,
              verses: verseNumbers,
              bible: versionId,
            })
          }}
          onDelete={onDeleteHighlight}
          listCategories={listCategories}
          createCategory={createCategory}
        />
      )}
    </>
  )
}