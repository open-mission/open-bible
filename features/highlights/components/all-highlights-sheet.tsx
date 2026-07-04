"use client"

import { useState, useEffect, useMemo } from "react"
import { IconSearch, IconX } from "@tabler/icons-react"
import { BottomSheet } from "@/components/ui/bottom-sheet"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { InputGroup, InputGroupAddon } from "@/components/ui/input-group"
import { neonColors } from "../utils/highlight-colors"
import { getBookName } from "@/lib/books"
import { useIsMobile } from "@/lib/use-media-query"
import { useAllHighlights } from "../hooks/use-all-highlights"
import { HighlightCard } from "./highlight-card"

interface AllHighlightsSheetProps {
  open: boolean
  onClose: () => void
  onEdit: (highlightId: string) => void
  initialQuery?: string
}

export function AllHighlightsSheet({
  open,
  onClose,
  onEdit,
  initialQuery = "",
}: AllHighlightsSheetProps) {
  const [query, setQuery] = useState(initialQuery)
  const isMobile = useIsMobile()
  const { entries, loading, deleteHighlight } = useAllHighlights(open)

  useEffect(() => {
    const timer = setTimeout(() => {
      if (open) {
        setQuery(initialQuery)
      } else {
        setQuery("")
      }
    }, 0)
    return () => clearTimeout(timer)
  }, [open, initialQuery])

  const filtered = useMemo(() => {
    if (!query.trim()) return entries
    const q = query.toLowerCase()
    return entries.filter((e) => {
      // Search matching neon color name or hex
      const colorMatch = neonColors.find(
        (c) => c.name.toLowerCase() === q || c.hex.toLowerCase() === q
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

  const content = (
    <div className="flex flex-col h-full pb-6 sm:pb-4 bg-background">
      <div className="px-5 py-4 flex items-center justify-between shrink-0">
        <div className="flex flex-col gap-0.5">
          <h3 className="text-base font-semibold text-foreground">Todos os destaques</h3>
          <p className="text-xs text-muted-foreground">Visualize e organize seus trechos destacados.</p>
        </div>
        {!isMobile && (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground shrink-0"
          >
            <IconX className="size-4" />
          </Button>
        )}
      </div>
      <div className="px-5 pb-3 shrink-0">
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
              className="shrink-0 px-1 opacity-50 hover:opacity-100 cursor-pointer"
              onClick={() => setQuery("")}
              aria-label="Limpar busca"
            >
              <IconX className="size-4" />
            </button>
          )}
        </InputGroup>
      </div>
      <Separator />
      <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4.5 no-scrollbar">
        {loading ? (
          <p className="py-8 text-center text-sm text-muted-foreground">Carregando...</p>
        ) : filtered.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            {query ? "Nenhum destaque encontrado" : "Nenhum destaque ainda"}
          </p>
        ) : (
          filtered.map((e) => (
            <HighlightCard
              key={e.highlight.id}
              entry={e}
              onEdit={onEdit}
              onDelete={async (id) => {
                if (confirm("Excluir este destaque?")) {
                  await deleteHighlight(id)
                }
              }}
            />
          ))
        )}
      </div>
    </div>
  )

  if (isMobile) {
    return (
      <BottomSheet open={open} onClose={onClose}>
        {content}
      </BottomSheet>
    )
  }

  return (
    <Sheet open={open} onOpenChange={(val) => !val && onClose()}>
      <SheetContent
        side="right"
        showCloseButton={false}
        className="p-0 flex flex-col gap-0 h-full border-l border-border"
      >
        {content}
      </SheetContent>
    </Sheet>
  )
}
