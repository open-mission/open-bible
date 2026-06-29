"use client"

import { X } from "lucide-react"

interface InspectorPanelProps {
  verseReference: string
  isOpen: boolean
  onClose: () => void
}

export function InspectorPanel({ verseReference, isOpen, onClose }: InspectorPanelProps) {
  if (!isOpen) return null

  return (
    <div className="h-full flex flex-col bg-background border-l border-border">
      <header className="p-6 pb-4 flex flex-col gap-1 border-b border-border">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold tracking-tight">Inspector</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-accent rounded-md text-muted-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="text-xs text-muted-foreground">{verseReference}</p>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <p className="text-sm text-muted-foreground font-medium">Inspector</p>
        <p className="text-xs text-muted-foreground/60 mt-1">
          Recursos adicionais serão disponibilizados em breve.
        </p>
      </div>
    </div>
  )
}
