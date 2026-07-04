"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { IconSearch, IconX } from "@tabler/icons-react"
import { BottomSheet } from "@/components/ui/bottom-sheet"
import { Separator } from "@/components/ui/separator"
import { InputGroup, InputGroupAddon } from "@/components/ui/input-group"
import { getColorValue, PREDEFINED_COLORS } from "../utils/highlight-colors"
import { getBookName } from "@/lib/books"
import type { Highlight, HighlightVerse } from "@/lib/database/user/schema"
import type { HighlightCategory } from "@/lib/database/user/schema"
import { database } from "@/lib/database/database"

interface AllHighlightEntry {
  highlight: Highlight
  category: HighlightCategory | null
  verses: HighlightVerse[]
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
            return { highlight: h, category, verses }
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
      if (e.highlight.content.toLowerCase().includes(q)) return true
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

  return (
    <BottomSheet open={open} onClose={onClose}>
      <div className="flex flex-col pb-6 sm:pb-4">
        <div className="px-4 py-3">
          <h3 className="text-base font-semibold">Todos os destaques</h3>
        </div>
        <div className="px-4 pb-2">
          <InputGroup className="h-9! rounded-lg! border-input/30 bg-input/30 shadow-none!">
            <InputGroupAddon>
              <IconSearch className="size-4 shrink-0 opacity-50" />
            </InputGroupAddon>
            <input
              className="w-full bg-transparent text-sm outline-hidden placeholder:text-muted-foreground/50"
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
        <div className="max-h-[60vh] overflow-y-auto">
          {loading ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Carregando...</p>
          ) : filtered.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              {query ? "Nenhum destaque encontrado" : "Nenhum destaque ainda"}
            </p>
          ) : (
            filtered.map((e) => (
              <div key={e.highlight.id}>
                <button
                  type="button"
                  className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => {
                    onEdit(e.highlight.id)
                    onClose()
                  }}
                >
                  <div
                    className="mt-0.5 size-4 rounded-full shrink-0"
                    style={{ backgroundColor: getColorValue(e.highlight.color) }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium capitalize">
                        {e.category?.name ?? e.highlight.color}
                      </span>
                      <span className="text-xs text-muted-foreground/60">
                        {reference(e.verses)}
                      </span>
                    </div>
                    {e.highlight.content && (
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                        {e.highlight.content}
                      </p>
                    )}
                  </div>
                </button>
                <Separator />
              </div>
            ))
          )}
        </div>
      </div>
    </BottomSheet>
  )
}
