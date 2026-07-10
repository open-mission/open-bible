"use client"

import { useState, useMemo } from "react"
import { IconSearch, IconX, IconHighlight } from "@tabler/icons-react"
import { Separator } from "@/components/ui/separator"
import { InputGroup, InputGroupAddon } from "@/components/ui/input-group"
import { getBookName } from "@/lib/books"
import { useAllHighlights } from "@/features/highlights/hooks/use-all-highlights"
import { HighlightCard } from "@/features/highlights/components/highlight-card"
import { neonColors } from "@/features/highlights/utils/highlight-colors"

interface FullScreenHighlightsProps {
  open: boolean
  onClose: () => void
  onEdit: (highlightId: string) => void
  onDelete: (id: string) => Promise<boolean>
}

export function FullScreenHighlights({ open, onClose, onEdit, onDelete }: FullScreenHighlightsProps) {
  const [query, setQuery] = useState("")
  const { entries, loading } = useAllHighlights(open)

  const filtered = useMemo(() => {
    if (!query.trim()) return entries
    const q = query.toLowerCase()
    return entries.filter((e) => {
      const colorMatch = neonColors.find(
        (c) => c.name.toLowerCase() === q || c.hex.toLowerCase() === q,
      )
      if (colorMatch && e.highlight.color.toLowerCase() === colorMatch.hex.toLowerCase()) return true
      if (e.category?.name.toLowerCase().includes(q)) return true
      if (e.highlight.content?.toLowerCase().includes(q)) return true
      if (e.verseItems.some((vi) => vi.text.toLowerCase().includes(q))) return true
      if (
        e.verses.some((v) => {
          const ref = `${v.book} ${v.chapter}:${v.verse}`
          const refFull = `${getBookName(v.book)} ${v.chapter}:${v.verse}`
          return ref.includes(q) || refFull.toLowerCase().includes(q)
        })
      )
        return true
      return false
    })
  }, [entries, query])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-40 flex animate-in fade-in duration-200">
      <div className="flex h-full w-full flex-col bg-background">
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-border/60 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
              <IconHighlight className="size-4 text-primary" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-foreground">Destaques</h2>
              <p className="text-xs text-muted-foreground">
                {entries.length} {entries.length === 1 ? "trecho destacado" : "trechos destacados"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            aria-label="Fechar"
          >
            <IconX className="size-4" />
          </button>
        </div>

        {/* Search */}
        <div className="shrink-0 px-6 py-3">
          <InputGroup className="h-9! rounded-lg! border-input/30 bg-input/30 shadow-none!">
            <InputGroupAddon>
              <IconSearch className="size-4 shrink-0 opacity-50" />
            </InputGroupAddon>
            <input
              className="w-full bg-transparent text-sm outline-hidden placeholder:text-muted-foreground/50 text-foreground"
              placeholder="Buscar por cor, categoria ou referência..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
            {query && (
              <button
                type="button"
                className="shrink-0 cursor-pointer px-1 opacity-50 hover:opacity-100"
                onClick={() => setQuery("")}
                aria-label="Limpar busca"
              >
                <IconX className="size-4" />
              </button>
            )}
          </InputGroup>
        </div>

        <Separator />

        {/* List */}
        <div className="no-scrollbar flex-1 overflow-y-auto px-6 pb-8 pt-6">
          {loading ? (
            <p className="py-12 text-center text-sm text-muted-foreground">Carregando...</p>
          ) : filtered.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">
              {query ? "Nenhum destaque encontrado" : "Nenhum destaque ainda"}
            </p>
          ) : (
            <div className="mx-auto grid max-w-2xl grid-cols-1 gap-4 sm:grid-cols-2">
              {filtered.map((e) => (
                <HighlightCard
                  key={e.highlight.id}
                  entry={e}
                  onEdit={onEdit}
                  onDelete={async (id) => {
                    if (confirm("Excluir este destaque?")) {
                      await onDelete(id)
                    }
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
