"use client"

import { useState, useRef } from "react"
import type { HighlightData } from "../context/highlights-context"
import { getNeonStyle } from "../utils/highlight-colors"
import { IconPencil, IconTrash } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { useIsMobile } from "@/lib/use-media-query"
import { cn } from "@/lib/utils"

interface HighlightPopoverProps {
  highlight: HighlightData
  verseReference: string
  onEdit: (highlightId: string) => void
  onDelete: (highlightId: string) => void
  onClose: () => void
  embedded?: boolean
}

export function HighlightPopover({
  highlight,
  verseReference,
  onEdit,
  onDelete,
  onClose,
  embedded = false,
}: HighlightPopoverProps) {
  const style = getNeonStyle(highlight.highlight.color)
  const isMobile = useIsMobile()

  // Drag state using modern PointerEvents (Desktop only)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const dragStartRef = useRef({ x: 0, y: 0 })
  const dragOffsetStartRef = useRef({ x: 0, y: 0 })

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return // Left click only
    setIsDragging(true)
    dragStartRef.current = { x: e.clientX, y: e.clientY }
    dragOffsetStartRef.current = { ...dragOffset }
    e.currentTarget.setPointerCapture(e.pointerId)
    e.stopPropagation()
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return
    const dx = e.clientX - dragStartRef.current.x
    const dy = e.clientY - dragStartRef.current.y
    setDragOffset({
      x: dragOffsetStartRef.current.x + dx,
      y: dragOffsetStartRef.current.y + dy,
    })
    e.stopPropagation()
  }

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return
    setIsDragging(false)
    e.currentTarget.releasePointerCapture(e.pointerId)
    e.stopPropagation()
  }

  return (
    <div 
      className={cn(
        "rounded-xl border border-border bg-popover p-3 shadow-xl flex flex-col gap-3 select-none",
        embedded 
          ? "w-full border-none bg-transparent shadow-none p-0 gap-4" 
          : "w-64"
      )}
      style={embedded || isMobile ? undefined : {
        transform: `translate(${dragOffset.x}px, ${dragOffset.y}px)`,
        transition: isDragging ? "none" : "transform 120ms cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      {/* Drag Handle (Desktop only) */}
      {!embedded && !isMobile && (
        <div
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className="h-4 flex items-center justify-center cursor-grab active:cursor-grabbing hover:bg-muted/40 rounded-t-lg -mt-3 -mx-3 mb-1 shrink-0"
          style={{ touchAction: "none" }}
        >
          <div className="h-1 w-12 rounded-full bg-muted-foreground/30" />
        </div>
      )}

      <div className="flex items-center gap-2">
        <div
          className="h-3 w-3 rounded-full animate-pulse"
          style={{ backgroundColor: style.hex, boxShadow: style.glow }}
        />
        {highlight.category && (
          <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
            {highlight.category.name}
          </span>
        )}
      </div>

      <div className="text-xs text-muted-foreground font-semibold">
        {verseReference}
      </div>

      {highlight.highlight.content && (
        <p className="text-sm italic text-foreground leading-relaxed">
          {highlight.highlight.content}
        </p>
      )}

      <div className="flex justify-end gap-2 pt-2 border-t border-border mt-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            onEdit(highlight.highlight.id)
            onClose()
          }}
          className="h-9 px-3 text-xs gap-1.5"
        >
          <IconPencil className="h-3.5 w-3.5" />
          Editar
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            onDelete(highlight.highlight.id)
            onClose()
          }}
          className="h-9 px-3 text-xs gap-1.5 text-destructive hover:bg-destructive/10 hover:text-destructive"
        >
          <IconTrash className="h-3.5 w-3.5" />
          Excluir
        </Button>
      </div>
    </div>
  )
}
