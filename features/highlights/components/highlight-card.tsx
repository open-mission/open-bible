"use client"

import { useCallback } from "react"
import { IconPencil, IconTrash } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { getNeonStyle, getColorName } from "../utils/highlight-colors"
import { getBookName } from "@/lib/books"
import type { AllHighlightEntry } from "../hooks/use-all-highlights"

interface HighlightCardProps {
  entry: AllHighlightEntry
  onEdit: (id: string) => void
  onDelete: (id: string) => void
}

export function HighlightCard({
  entry,
  onEdit,
  onDelete,
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
    <article className="group relative w-full shrink-0 overflow-hidden rounded-2xl border border-border/60 bg-card/40 backdrop-blur-xs shadow-xs transition-all duration-300 hover:border-border/80 hover:shadow-md">
      <div className="flex flex-col gap-3.5 p-4.5">
        {/* Header */}
        <header className="flex items-center gap-2.5">
          {/* Glowing color dot */}
          <div
            className="h-2.5 w-2.5 shrink-0 rounded-full"
            style={{
              backgroundColor: style.hex,
              boxShadow: style.glow,
            }}
          />

          {/* Color pill / category badge */}
          <span
            className="rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wide select-none capitalize border border-transparent font-sans"
            style={{
              backgroundColor: style.pillBg,
              color: style.pillText,
              boxShadow: style.pillRing,
            }}
          >
            {entry.category?.name ?? getColorName(style.hex)}
          </span>

          {/* Reference Range */}
          <span className="text-xs font-semibold text-muted-foreground truncate max-w-[150px] font-sans">
            {getReferenceText()}
          </span>

          {/* Edit / Delete Actions */}
          <div className="ml-auto flex items-center gap-0.5">
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              onClick={() => onEdit(entry.highlight.id)}
              className="text-muted-foreground hover:text-foreground shrink-0"
              title="Editar destaque"
            >
              <IconPencil className="size-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              className="text-destructive/80 hover:text-destructive hover:bg-destructive/10 shrink-0"
              onClick={() => onDelete(entry.highlight.id)}
              title="Excluir destaque"
            >
              <IconTrash className="size-3.5" />
            </Button>
          </div>
        </header>

        {/* Verses body with decorative background */}
        {entry.verseItems.length > 0 && (
          <div className="relative overflow-hidden rounded-xl bg-muted/40 p-4 border border-border/20">
            {/* Big decorative quotation mark */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -right-2 -top-6 select-none font-serif text-[7.5rem] leading-none z-0"
              style={{ color: `${style.hex}1a` }}
            >
              &rdquo;
            </span>

            {/* Soft radial glow shape */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-16 -left-10 h-40 w-40 rounded-full blur-3xl opacity-[0.07] z-0"
              style={{ backgroundColor: style.hex }}
            />

            {/* Stacked verses list */}
            <div className="relative z-10 flex flex-col gap-3">
              {entry.verseItems.map((v, idx) => (
                <div key={idx} className="flex flex-col gap-1">
                  <p className="font-serif text-sm italic leading-relaxed text-foreground/90 break-words text-pretty">
                    {v.text}
                  </p>
                  <span
                    className="text-[9px] font-bold uppercase tracking-wider mt-0.5 font-sans"
                    style={{ color: `${style.hex}b3` }}
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
