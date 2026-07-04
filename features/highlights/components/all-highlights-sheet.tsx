"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { IconSearch, IconX, IconPencil, IconTrash } from "@tabler/icons-react"
import { BottomSheet } from "@/components/ui/bottom-sheet"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { InputGroup, InputGroupAddon } from "@/components/ui/input-group"
import { getColorValue, PREDEFINED_COLORS } from "../utils/highlight-colors"
import { getBookName } from "@/lib/books"
import type { Highlight, HighlightVerse } from "@/lib/database/user/schema"
import type { HighlightCategory } from "@/lib/database/user/schema"
import { database } from "@/lib/database/database"
import { useIsMobile } from "@/lib/use-media-query"
import { useHighlightsContext } from "../context/highlights-context"

interface AllHighlightEntry {
  highlight: Highlight
  category: HighlightCategory | null
  verses: HighlightVerse[]
  text?: string
}

interface AllHighlightsSheetProps {
  open: boolean
  onClose: () => void
  onEdit: (highlightId: string) => void
}

export function AllHighlightsSheet({
  open,
  onClose,
  onEdit,
}: AllHighlightsSheetProps) {
  const [entries, setEntries] = useState<AllHighlightEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [query, setQuery] = useState("")
  const isMobile = useIsMobile()
  const { refresh: refreshContext } = useHighlightsContext()

  useEffect(() => {
    if (!open) {
      setQuery("")
      return
    }

    async function load() {
      setLoading(true)
      try {
        await database.initialize()
        const allHighlights = await database.highlights.findAll()
        const results: AllHighlightEntry[] = await Promise.all(
          allHighlights.map(async (h) => {
            const verses = await database.highlightVerses.findByHighlightId(h.id)
            let category: HighlightCategory | null = null
            if (h.categoryId) {
              const cats = await database.highlightCategories.findById(h.categoryId)
              category = cats
            }
            
            // Load actual verse texts for the card view
            let text = ""
            if (verses.length > 0) {
              try {
                const first = verses[0]
                const bibleDb = await database.openBible(first.bible)
                const chapterVerses = await bibleDb.getChapterVerses(first.book, first.chapter)
                const targetVerseNums = verses.map((v) => v.verse)
                text = chapterVerses
                  .filter((v) => targetVerseNums.includes(v.verse))
                  .map((v) => v.text)
                  .join(" ")
              } catch (e) {
                console.error("Failed to load verse text inside list:", e)
              }
            }

            return { highlight: h, category, verses, text }
          }),
        )
        setEntries(results)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [open])

  const filtered = useMemo(() => {
    if (!query.trim()) return entries
    const q = query.toLowerCase()
    return entries.filter((e) => {
      if (PREDEFINED_COLORS.includes(q as typeof PREDEFINED_COLORS[number]) && e.highlight.color === q) return true
      if (e.category?.name.toLowerCase().includes(q)) return true
      if (e.highlight.content?.toLowerCase().includes(q)) return true
      if (e.text?.toLowerCase().includes(q)) return true
      if (e.verses.some((v) => {
        const ref = `${v.book} ${v.chapter}:${v.verse}`
        const refFull = `${getBookName(v.book)} ${v.chapter}:${v.verse}`
        return ref.includes(q) || refFull.toLowerCase().includes(q)
      })) return true
      return false
    })
  }, [entries, query])

  const reference = useCallback((verses: HighlightVerse[]) => {
    if (verses.length === 0) return ""
    const first = verses[0]
    const bookName = getBookName(first.book)
    if (verses.length === 1) return `${bookName} ${first.chapter}:${first.verse}`
    const vStart = Math.min(...verses.map((v) => v.verse))
    const vEnd = Math.max(...verses.map((v) => v.verse))
    const refs = verses.map((v) => `${v.chapter}:${v.verse}`).join(", ")
    if (refs.length > 30) return `${bookName} ${first.chapter}:${vStart}-${vEnd} (${verses.length}v)`
    return `${bookName} ${refs}`
  }, [])

  const content = (
    <div className="flex flex-col h-full pb-6 sm:pb-4">
      <div className="px-4 py-4 flex items-center justify-between shrink-0">
        <h3 className="text-base font-semibold text-foreground">Todos os destaques</h3>
        {!isMobile && (
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <IconX className="size-4" />
          </Button>
        )}
      </div>
      <div className="px-4 pb-3 shrink-0">
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
              className="shrink-0 px-1 opacity-50 hover:opacity-100"
              onClick={() => setQuery("")}
              aria-label="Limpar busca"
            >
              <IconX className="size-4" />
            </button>
          )}
        </InputGroup>
      </div>
      <Separator />
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 no-scrollbar">
        {loading ? (
          <p className="py-8 text-center text-sm text-muted-foreground">Carregando...</p>
        ) : filtered.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            {query ? "Nenhum destaque encontrado" : "Nenhum destaque ainda"}
          </p>
        ) : (
          filtered.map((e) => (
            <div
              key={e.highlight.id}
              className="p-3.5 flex flex-col gap-2.5 bg-card border border-border/50 rounded-xl shadow-xs transition-all hover:border-border/80 hover:shadow-sm"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 truncate">
                  <div
                    className="size-3 rounded-full shrink-0"
                    style={{ backgroundColor: getColorValue(e.highlight.color) }}
                  />
                  {e.category?.name && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary truncate max-w-[14ch]">
                      {e.category.name}
                    </span>
                  )}
                  <span className="text-xs text-muted-foreground truncate font-medium">
                    {reference(e.verses)}
                  </span>
                </div>
                <div className="flex items-center gap-0.5 shrink-0">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => {
                      onEdit(e.highlight.id)
                      onClose()
                    }}
                    className="text-muted-foreground hover:text-foreground"
                    title="Editar"
                  >
                    <IconPencil />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    className="text-destructive/80 hover:text-destructive hover:bg-destructive/10"
                    onClick={async () => {
                      if (confirm("Excluir este destaque?")) {
                        await database.initialize()
                        await database.highlights.delete(e.highlight.id)
                        await refreshContext()
                        setEntries((prev) => prev.filter((item) => item.highlight.id !== e.highlight.id))
                      }
                    }}
                    title="Excluir"
                  >
                    <IconTrash />
                  </Button>
                </div>
              </div>

              {e.text && (
                <p className="text-xs text-foreground/80 leading-relaxed italic bg-muted/40 px-3 py-2 rounded-lg border-l-2 border-border/80">
                  &ldquo;{e.text}&rdquo;
                </p>
              )}

              {e.highlight.content && (
                <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap pl-1 border-l border-border/40">
                  {e.highlight.content}
                </p>
              )}
            </div>
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
      <SheetContent side="right" showCloseButton={false} className="p-0 flex flex-col gap-0 h-full border-l border-border">
        {content}
      </SheetContent>
    </Sheet>
  )
}
