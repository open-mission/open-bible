"use client"

import { useState } from "react"
import { Check, Copy, X } from "lucide-react"

interface InspectorPanelProps {
  verseReference: string
  isOpen: boolean
  onClose: () => void
}

export function InspectorPanel({ verseReference, isOpen, onClose }: InspectorPanelProps) {
  const [copied, setCopied] = useState(false)
  if (!isOpen) return null

  async function copyReference() {
    try {
      await navigator.clipboard.writeText(verseReference)
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="h-full flex flex-col bg-background border-l border-border">
      <header className="p-6 pb-4 flex flex-col gap-1 border-b border-border">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold tracking-tight">Detalhes</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-accent rounded-md text-muted-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </header>

      <div className="flex-1 flex flex-col gap-3 p-6">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Referência
        </p>
        <p className="text-base font-semibold text-foreground">{verseReference}</p>
        <button
          onClick={copyReference}
          className="flex w-fit items-center gap-2 rounded-md border border-border px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer"
        >
          {copied ? (
            <Check className="h-4 w-4 text-primary" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
          {copied ? "Copiado" : "Copiar referência"}
        </button>

        <div className="mt-4 border-t border-border pt-4">
          <p className="text-xs text-muted-foreground/70 leading-relaxed">
            Notas, destaques e outros recursos aparecerão aqui quando você
            interagir com um versículo na área de leitura.
          </p>
        </div>
      </div>
    </div>
  )
}
