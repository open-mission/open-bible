"use client"

import type { HighlightData } from "../context/highlights-context"
import { getNeonStyle } from "../utils/highlight-colors"
import { IconPencil, IconTrash } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"

interface HighlightPopoverProps {
  highlight: HighlightData
  verseReference: string
  onEdit: (highlightId: string) => void
  onDelete: (highlightId: string) => void
  onClose: () => void
}

export function HighlightPopover({
  highlight,
  verseReference,
  onEdit,
  onDelete,
  onClose,
}: HighlightPopoverProps) {
  const style = getNeonStyle(highlight.highlight.color)

  return (
    <div className="w-64 rounded-xl border border-border bg-popover p-3 shadow-xl flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <div
          className="h-3 w-3 rounded-full"
          style={{ backgroundColor: style.hex, boxShadow: style.glow }}
        />
        {highlight.category && (
          <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
            {highlight.category.name}
          </span>
        )}
      </div>

      <div className="text-xs text-muted-foreground font-medium">
        {verseReference}
      </div>

      {highlight.highlight.content && (
        <p className="text-sm italic text-foreground">
          {highlight.highlight.content}
        </p>
      )}

      <div className="flex justify-end gap-2 pt-2 border-t border-border">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            onEdit(highlight.highlight.id)
            onClose()
          }}
          className="h-8 px-2 text-xs"
        >
          <IconPencil className="mr-1 h-3.5 w-3.5" />
          Editar
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            onDelete(highlight.highlight.id)
            onClose()
          }}
          className="h-8 px-2 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
        >
          <IconTrash className="mr-1 h-3.5 w-3.5" />
          Excluir
        </Button>
      </div>
    </div>
  )
}
