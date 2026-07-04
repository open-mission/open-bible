"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { IconSearch, IconX, IconPencil, IconTrash } from "@tabler/icons-react"
import { BottomSheet } from "@/components/ui/bottom-sheet"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { InputGroup, InputGroupAddon } from "@/components/ui/input-group"
import { getNeonStyle, getColorName, neonColors } from "../utils/highlight-colors"
import { getBookName } from "@/lib/books"
import type { Highlight, HighlightVerse } from "@/lib/database/user/schema"
import type { HighlightCategory } from "@/lib/database/user/schema"
import { database } from "@/lib/database/database"
import { useIsMobile } from "@/lib/use-media-query"
import { useHighlightsContext } from "../context/highlights-context"
import { cn } from "@/lib/utils"

interface AllHighlightsSheetVerseItem {
  reference: string
  text: string
}

interface AllHighlightEntry {
  highlight: Highlight
  category: HighlightCategory | null
  verses: HighlightVerse[]
  verseItems: AllHighlightsSheetVerseItem[]
}

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
  const [entries, setEntries] = useState<AllHighlightEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [query, setQuery] = useState(initialQuery)
  const isMobile = useIsMobile()
  const { refresh: refreshContext } = useHighlightsContext()

  useEffect(() => {
    if (open) {
      setQuery(initialQuery)
    } else {
      setQuery("")
    }
  }, [open, initialQuery])

  useEffect(() => {
    if (!open) {
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
            
            // Load verse items (text + reference)
            const verseItems: AllHighlightsSheetVerseItem[] = []
            if (verses.length > 0) {
              try {
                const first = verses[0]
                const bibleDb = await database.openBible(first.bible)
                const chapterVerses = await bibleDb.getChapterVerses(first.book, first.chapter)
                const sortedVerses = [...verses].sort((a, b) => a.verse - b.verse)
                
                for (const v of sortedVerses) {
                  const dbVerse = chapterVerses.find((cv) => cv.verse === v.verse)
                  if (dbVerse) {
                    const bookName = getBookName(v.book)
                    verseItems.push({
                      reference: `${bookName} ${v.chapter}:${v.verse}`,
                      text: dbVerse.text,
                    })
                  }
                }
              } catch (e) {
                console.error("Failed to load verse text inside list:", e)
              }
            }

            return { highlight: h, category, verses, verseItems }
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
      // Search matching neon color name or hex
      const colorMatch = neonColors.find(
        (c) => c.name.toLowerCase() === q || c.hex.toLowerCase() === q
      )
      if (colorMatch && e.highlight.color.toLowerCase() === colorMatch.hex.toLowerCase()) return true
      if (e.category?.name.toLowerCase().includes(q)) return true
      if (e.highlight.content?.toLowerCase().includes(q)) return true
      if (e.verseItems.some((vi) => vi.text.toLowerCase().includes(q))) return true
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
          filtered.map((e) => {
            const style = getNeonStyle(e.highlight.color)

            return (
              <article
                key={e.highlight.id}
                className="group relative w-full shrink-0 overflow-hidden rounded-2xl border border-border/60 bg-card/40 backdrop-blur-xs shadow-xs transition-all duration-300 hover:border-border/80 hover:shadow-md"
              >
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
                      {e.category?.name ?? getColorName(style.hex)}
                    </span>

                    {/* Reference Range */}
                    <span className="text-xs font-semibold text-muted-foreground truncate max-w-[150px] font-sans">
                      {reference(e.verses)}
                    </span>

                    {/* Edit / Delete Actions */}
                    <div className="ml-auto flex items-center gap-0.5">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => {
                          onEdit(e.highlight.id)
                          onClose()
                        }}
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
                        onClick={async () => {
                          if (confirm("Excluir este destaque?")) {
                            await database.initialize()
                            await database.highlights.delete(e.highlight.id)
                            await refreshContext()
                            setEntries((prev) => prev.filter((item) => item.highlight.id !== e.highlight.id))
                          }
                        }}
                        title="Excluir destaque"
                      >
                        <IconTrash className="size-3.5" />
                      </Button>
                    </div>
                  </header>

                  {/* Verses body with decorative background */}
                  {e.verseItems.length > 0 && (
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
                        {e.verseItems.map((v, idx) => (
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
                            {idx < e.verseItems.length - 1 && (
                              <div aria-hidden="true" className="mt-1 h-px w-full bg-border/40" />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Personal note content */}
                  {e.highlight.content && (
                    <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap pl-2 border-l border-border/60">
                      {e.highlight.content}
                    </p>
                  )}
                </div>
              </article>
            )
          })
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
