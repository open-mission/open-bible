"use client"

import { BottomSheet } from "@/components/ui/bottom-sheet"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { getColorValue } from "../utils/highlight-colors"
import type { HighlightData } from "../context/highlights-context"

interface HighlightListSheetProps {
  open: boolean
  onClose: () => void
  highlights: HighlightData[]
  onEdit: (highlight: HighlightData) => void
  onDelete: (id: string) => void
}

export function HighlightListSheet({
  open,
  onClose,
  highlights,
  onEdit,
  onDelete,
}: HighlightListSheetProps) {
  return (
    <BottomSheet open={open} onClose={onClose}>
      <div className="flex flex-col">
        <div className="px-4 py-3">
          <h3 className="text-base font-semibold">Destaques deste verso</h3>
        </div>
        <Separator />
        <div className="max-h-[60vh] overflow-y-auto">
          {highlights.map((h) => (
            <div key={h.highlight.id}>
              <div className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <div
                    className="size-4 rounded-full shrink-0"
                    style={{ backgroundColor: getColorValue(h.highlight.color) }}
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium capitalize">
                      {h.category?.name ?? h.highlight.color}
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      onEdit(h)
                      onClose()
                    }}
                  >
                    Editar
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-destructive"
                    onClick={() => {
                      onDelete(h.highlight.id)
                      onClose()
                    }}
                  >
                    Excluir
                  </Button>
                </div>
                {h.highlight.content && (
                  <p className="text-sm text-muted-foreground mt-2 ml-7 leading-relaxed whitespace-pre-wrap">
                    {h.highlight.content}
                  </p>
                )}
              </div>
              <Separator />
            </div>
          ))}
        </div>
      </div>
    </BottomSheet>
  )
}
