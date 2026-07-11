"use client"

import { useState, useEffect, useMemo } from "react"
import {
  IconSearch,
  IconX,
  IconHighlight,
} from "@tabler/icons-react"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { InputGroup, InputGroupAddon } from "@/components/ui/input-group"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { cn } from "@/lib/utils"
import { neonColors } from "../utils/highlight-colors"
import { getBookName } from "@/lib/books"
import { useAllHighlights } from "../hooks/use-all-highlights"
import { HighlightCard } from "./highlight-card"

interface AllHighlightsBrowserProps {
  /** Gate data loading (e.g. panel open). Defaults true. */
  active?: boolean
  /** Side panel / sheet embedding */
  embedded?: boolean
  /** Show close control in header */
  showCloseButton?: boolean
  onClose: () => void
  onEdit: (highlightId: string) => void | Promise<void>
  onDelete: (id: string) => Promise<boolean>
  initialQuery?: string
}

export function AllHighlightsBrowser({
  active = true,
  embedded = false,
  showCloseButton = false,
  onClose,
  onEdit,
  onDelete,
  initialQuery = "",
}: AllHighlightsBrowserProps) {
  const [query, setQuery] = useState(initialQuery)
  const { entries, loading } = useAllHighlights(active)

  useEffect(() => {
    const timer = setTimeout(() => {
      if (active) setQuery(initialQuery)
      else setQuery("")
    }, 0)
    return () => clearTimeout(timer)
  }, [active, initialQuery])

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

  return (
    <div className="flex h-full min-h-0 flex-col bg-background">
      <div
        className={cn(
          "flex shrink-0 items-center justify-between gap-3",
          embedded ? "px-4 py-3" : "px-5 py-4 sm:px-6",
        )}
      >
        <div className="flex min-w-0 items-center gap-3">
          {!embedded && (
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <IconHighlight className="size-4 text-primary" />
            </div>
          )}
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-foreground sm:text-base">
              Destaques
            </h2>
            <p className="truncate text-xs text-muted-foreground">
              {entries.length} {entries.length === 1 ? "trecho destacado" : "trechos destacados"}
            </p>
          </div>
        </div>
        {showCloseButton && (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            aria-label="Fechar"
            className="shrink-0 text-muted-foreground hover:text-foreground"
          >
            <IconX />
          </Button>
        )}
      </div>

      <div className={cn("shrink-0 pb-3", embedded ? "px-4" : "px-5 sm:px-6")}>
        <InputGroup className="h-9! rounded-lg! border-input/30 bg-input/30 shadow-none!">
          <InputGroupAddon>
            <IconSearch className="size-4 shrink-0 opacity-50" />
          </InputGroupAddon>
          <input
            className="w-full bg-transparent text-sm outline-hidden placeholder:text-muted-foreground/50 text-foreground"
            placeholder="Buscar por cor, categoria ou referência..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
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

      <div
        className={cn(
          "no-scrollbar min-h-0 flex-1 overflow-y-auto",
          embedded ? "p-4" : "px-5 py-5 sm:px-6",
        )}
      >
        {loading ? (
          <p className="py-12 text-center text-sm text-muted-foreground">Carregando...</p>
        ) : filtered.length === 0 ? (
          <Empty className="border-0 py-10">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <IconHighlight />
              </EmptyMedia>
              <EmptyTitle>
                {query ? "Nenhum destaque encontrado" : "Nenhum destaque ainda"}
              </EmptyTitle>
              <EmptyDescription>
                {query ? "Tente outro termo de busca." : "Selecione um versículo e destaque-o."}
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="flex flex-col gap-3">
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
  )
}
