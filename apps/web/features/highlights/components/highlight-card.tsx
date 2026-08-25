"use client"

import { useCallback } from "react"
import {
  Copy,
  Pencil,
  Trash2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { getNeonStyle, getColorName } from "../utils/highlight-colors"
import { getBookName } from "@/lib/books"
import type { AllHighlightEntry } from "../hooks/use-all-highlights"

interface HighlightCardProps {
  entry: AllHighlightEntry
  onEdit: (id: string) => void
  onDelete: (id: string) => void
  onNavigate: (verse: AllHighlightEntry["verses"][number]) => void
  onCopy: () => void
}

export function HighlightCard({
  entry,
  onEdit,
  onDelete,
  onNavigate,
  onCopy,
}: HighlightCardProps) {
  const style = getNeonStyle(entry.highlight.color)

  const getReferenceText = useCallback(() => {
    const verses = entry.verses
    if (verses.length === 0) return ""
    const first = verses[0]
    const bookName = getBookName(first.book)
    if (verses.length === 1) return `${bookName} ${first.chapter}:${first.verse}`
    const vStart = Math.min(...verses.map((v) => v.verse))
    const vEnd = Math.max(...verses.map((v) => v.verse))
    const refs = verses.map((v) => `${v.chapter}:${v.verse}`).join(", ")
    if (refs.length > 30) return `${bookName} ${first.chapter}:${vStart}-${vEnd} (${verses.length}v)`
    return `${bookName} ${refs}`
  }, [entry.verses])

  return (
    <article className="group relative w-full shrink-0 overflow-hidden rounded-xl border border-border/70 bg-card transition-colors hover:border-border">
      <div className="flex flex-col gap-3.5 p-4">
        <header className="flex flex-wrap items-center gap-2.5">
          <div
            className="h-2.5 w-2.5 shrink-0 rounded-full"
            style={{
              backgroundColor: style.hex,
              boxShadow: style.glow,
            }}
          />

          <span
            className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold tracking-wide select-none capitalize border border-transparent font-sans"
            style={{
              backgroundColor: style.pillBg,
              color: style.pillText,
              boxShadow: style.pillRing,
            }}
          >
            {entry.category?.name ?? getColorName(style.hex)}
          </span>

          {/* Reference Range */}
          <button
            type="button"
            className="max-w-[150px] truncate text-left text-xs font-semibold text-muted-foreground hover:text-foreground hover:underline font-sans"
            onClick={() => entry.verses[0] && onNavigate(entry.verses[0])}
            disabled={entry.verses.length === 0}
            aria-label={`Abrir ${getReferenceText()} no leitor`}
          >
            {getReferenceText()}
          </button>

          <div className="flex w-full shrink-0 items-center justify-end gap-1 sm:ml-auto sm:w-auto">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onEdit(entry.highlight.id)}
              className="h-8 gap-1.5 px-2 text-xs text-muted-foreground hover:text-foreground"
              aria-label="Editar destaque"
            >
              <Pencil className="size-3.5" />
              <span>Editar</span>
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onCopy}
              className="h-8 gap-1.5 px-2 text-xs text-muted-foreground hover:text-foreground"
              aria-label="Copiar referência"
            >
              <Copy className="size-3.5" />
              <span>Copiar</span>
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 gap-1.5 px-2 text-xs text-destructive/80 hover:bg-destructive/10 hover:text-destructive"
              onClick={() => onDelete(entry.highlight.id)}
              aria-label="Excluir destaque"
            >
              <Trash2 className="size-3.5" />
              <span>Excluir</span>
            </Button>
          </div>
        </header>

        {entry.verseItems.length > 0 && (
          <div className="rounded-lg border border-border/50 bg-muted/20 p-4">
            <div className="flex flex-col gap-3">
              {entry.verseItems.map((v, idx) => (
                <div key={idx} className="flex flex-col gap-1">
                  <button
                    type="button"
                    className="text-left font-serif text-sm italic leading-relaxed text-foreground/90 break-words text-pretty hover:text-primary"
                    onClick={() => entry.verses[idx] && onNavigate(entry.verses[idx])}
                    aria-label={`Abrir ${v.reference} no leitor`}
                  >
                    {v.text}
                  </button>
                  <span
                    className="text-[10px] font-bold uppercase tracking-wider mt-0.5 font-sans"
                    style={{ color: style.hex }}
                  >
                    {v.reference}
                  </span>
                  {idx < entry.verseItems.length - 1 && (
                    <div aria-hidden="true" className="mt-1 h-px w-full bg-border/40" />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Personal note content */}
        {entry.highlight.content && (
          <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap pl-2 border-l border-border/60">
            {entry.highlight.content}
          </p>
        )}
      </div>
    </article>
  )
}
