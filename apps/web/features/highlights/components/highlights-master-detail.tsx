"use client"

import { useEffect, useMemo, useState } from "react"
import { ArrowLeft, BookOpen, Copy, Highlighter, Pencil, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { cn } from "@/lib/utils"
import { useAllHighlights, type AllHighlightEntry } from "../hooks/use-all-highlights"
import { useHighlightMutations } from "../hooks/use-highlight-mutations"
import { HighlightEditDialog } from "./highlight-edit-dialog"
import { getColorName, getNeonStyle } from "../utils/highlight-colors"
import { getBookName } from "@/lib/books"
import { getBibleVersionName } from "./highlights-filter-bar"
import { EMPTY_HIGHLIGHT_FILTERS, filterHighlights, HighlightsFilterBar, type HighlightFilters } from "./highlights-filter-bar"
import { copyReference, formatHighlightReference } from "../lib/copy"

interface MasterDetailProps {
  active?: boolean
  initialQuery?: string
  onClose?: () => void
  onNavigate?: (verse: AllHighlightEntry["verses"][number]) => void
}

function buildNavigation(verse: AllHighlightEntry["verses"][number]) {
  return {
    book: verse.book,
    chapter: verse.chapter,
    verse: verse.verse,
    version: verse.bible,
    href: `/?book=${encodeURIComponent(verse.book)}&chapter=${verse.chapter}&verse=${verse.verse}`,
  }
}

function referenceLine(entry: AllHighlightEntry): string {
  const verses = entry.verses
  if (verses.length === 0) return ""
  const first = verses[0]
  const book = getBookName(first.book)
  const sameChapter = verses.every((v) => v.book === first.book && v.chapter === first.chapter)
  const sorted = [...verses].sort((a, b) => a.verse - b.verse)
  if (sameChapter) {
    const start = sorted[0].verse
    const end = sorted.at(-1)!.verse
    return `${book} ${first.chapter}:${start}${start === end ? "" : `-${end}`}`
  }
  return `${book} ${sorted.map((v) => v.chapter + ":" + v.verse).join(", ")}`
}

interface RailItemProps {
  entry: AllHighlightEntry
  selected: boolean
  onSelect: () => void
}

function RailItem({ entry, selected, onSelect }: RailItemProps) {
  const style = getNeonStyle(entry.highlight.color)
  const excerpt = entry.verseItems[0]?.text ?? entry.highlight.content ?? ""
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        "group w-full rounded-xl border px-3.5 py-3 text-left transition-colors",
        selected
          ? "border-primary/50 bg-primary/5 shadow-xs"
          : "border-border/60 bg-transparent hover:bg-muted/50",
      )}
    >
      <div className="flex items-center gap-2.5">
        <span
          className="size-2.5 shrink-0 rounded-full"
          style={{ backgroundColor: style.hex, boxShadow: style.glow }}
          aria-hidden="true"
        />
        <span className="truncate text-xs font-semibold text-foreground">{referenceLine(entry)}</span>
        <span className="ml-auto shrink-0 text-[10px] font-semibold text-muted-foreground">
          {getColorName(style.hex)}
        </span>
      </div>
      {excerpt && (
        <span className="mt-1.5 line-clamp-2 block text-xs leading-relaxed text-muted-foreground/80">
          {excerpt}
        </span>
      )}
    </button>
  )
}

export function HighlightsMasterDetail({ active = true, initialQuery = "", onClose, onNavigate }: MasterDetailProps) {
  const router = useRouter()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [editing, setEditing] = useState<AllHighlightEntry | null>(null)
  const [mobileSelected, setMobileSelected] = useState(false)
  const [filters, setFilters] = useState<HighlightFilters>({ ...EMPTY_HIGHLIGHT_FILTERS, query: initialQuery })
  const { entries, loading, error, reload, deleteHighlight, restoreHighlight } = useAllHighlights(active)
  const { updateHighlight, listCategories, createCategory } = useHighlightMutations()

  useEffect(() => {
    if (!active) {
      setSelectedId(null)
      setEditing(null)
      setMobileSelected(false)
    }
  }, [active])

  const filtered = useMemo(() => filterHighlights(entries, filters), [entries, filters])

  const selected = useMemo(
    () => filtered.find((entry) => entry.highlight.id === selectedId) ?? null,
    [filtered, selectedId],
  )

  const firstVerse = selected?.verses[0] ?? null

  function navigateToVerse(entry: AllHighlightEntry) {
    const verse = entry.verses[0]
    if (!verse) return
    if (onNavigate) {
      onNavigate(verse)
      return
    }
    const navigation = buildNavigation(verse)
    try {
      localStorage.setItem("openbible:book", navigation.book)
      localStorage.setItem("openbible:chapter", String(navigation.chapter))
      localStorage.setItem("openbible:version", navigation.version)
    } catch { /* ignore */ }
    onClose?.()
    router.push(navigation.href)
  }

  async function saveEdit(patch: { color: string; categoryId: string | null; content: string }) {
    if (!editing) return
    await updateHighlight(editing.highlight.id, patch)
    setEditing(null)
    await reload()
    toast.success("Destaque atualizado")
  }

  async function deleteEntry(entry: AllHighlightEntry) {
    const deleted = await deleteHighlight(entry.highlight.id)
    if (!deleted) {
      toast.error("Não foi possível excluir o destaque")
      return
    }
    if (selectedId === entry.highlight.id) {
      setSelectedId(null)
      setMobileSelected(false)
    }
    toast("Destaque excluído", {
      duration: 8000,
      action: {
        label: "Desfazer",
        onClick: () => {
          void restoreHighlight(entry).then((restored) => {
            if (restored) toast.success("Destaque restaurado")
            else toast.error("Não foi possível restaurar o destaque")
          })
        },
      },
    })
  }

  async function copyEntry(entry: AllHighlightEntry) {
    const text = formatHighlightReference({ verses: entry.verses, content: entry.highlight.content })
    const copied = await copyReference(text)
    if (copied) toast.success("Referência copiada")
    else toast.error("Não foi possível copiar a referência")
  }

  const emptyContent = (
    <Empty className="border-0 py-10">
      <EmptyHeader>
        <EmptyMedia variant="icon"><Highlighter /></EmptyMedia>
        <EmptyTitle>{entries.length === 0 ? "Nenhum destaque ainda" : "Nenhum resultado"}</EmptyTitle>
        <EmptyDescription>
          {entries.length === 0 ? "Crie seu primeiro destaque no leitor." : "Tente ajustar a busca ou os filtros."}
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  )

  return (
    <div className="grid h-full min-h-0 grid-cols-1 md:grid-cols-[20rem_minmax(0,1fr)]">
      {/* Rail */}
      <aside className={cn("min-h-0 flex-col border-r border-border/60 bg-muted/20 md:flex", mobileSelected ? "hidden md:flex" : "flex")}>
        <header className="shrink-0 space-y-3 p-4">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-semibold text-foreground">Destaques</h2>
              <p className="text-xs text-muted-foreground">
                {entries.length} {entries.length === 1 ? "trecho destacado" : "trechos destacados"}
              </p>
            </div>
            <Highlighter className="size-5 text-primary" aria-hidden="true" />
          </div>
          <HighlightsFilterBar value={filters} entries={entries} onChange={setFilters} />
        </header>

        <div className="no-scrollbar min-h-0 flex-1 space-y-2 overflow-y-auto px-3 pb-3">
          {loading ? (
            <div className="flex flex-col gap-2" aria-label="Carregando destaques">
              {Array.from({ length: 3 }, (_, index) => <div key={index} className="h-20 animate-pulse rounded-xl bg-muted" />)}
            </div>
          ) : error ? (
            <Empty className="border-0 py-8">
              <EmptyHeader>
                <EmptyTitle>Não foi possível carregar</EmptyTitle>
                <EmptyDescription>{error}</EmptyDescription>
              </EmptyHeader>
              <Button type="button" variant="outline" onClick={() => reload()}>Tentar novamente</Button>
            </Empty>
          ) : filtered.length === 0 ? (
            emptyContent
          ) : (
            filtered.map((entry) => (
              <RailItem
                key={entry.highlight.id}
                entry={entry}
                selected={selectedId === entry.highlight.id}
                onSelect={() => {
                  setSelectedId(entry.highlight.id)
                  setMobileSelected(true)
                }}
              />
            ))
          )}
        </div>
      </aside>

      {/* Canvas */}
      <section className={cn("min-h-0 flex-col bg-background md:flex", mobileSelected ? "flex" : "hidden md:flex")}>
        {selected ? (
          <div className="flex h-full min-h-0 flex-col">
            <header className="flex shrink-0 items-center gap-2 border-b border-border/60 px-4 py-3 sm:px-6">
              <Button type="button" variant="ghost" size="icon-sm" className="md:hidden" onClick={() => setMobileSelected(false)} aria-label="Voltar para a lista">
                <ArrowLeft />
              </Button>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foreground">{referenceLine(selected)}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {selected.verses[0] && getBibleVersionName(selected.verses[0].bible)}
                  {selected.category?.name ? ` · ${selected.category.name}` : ""}
                </p>
              </div>
              <Button type="button" variant="ghost" size="icon-sm" onClick={() => setEditing(selected)} aria-label="Editar destaque"><Pencil /></Button>
              <Button type="button" variant="ghost" size="icon-sm" onClick={() => copyEntry(selected)} aria-label="Copiar referência"><Copy /></Button>
              <Button type="button" variant="ghost" size="icon-sm" className="text-destructive" onClick={() => deleteEntry(selected)} aria-label="Excluir destaque"><Trash2 /></Button>
            </header>

            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6 sm:px-10 sm:py-10">
              <div className="mx-auto max-w-3xl">
                {selected.verseItems.length > 0 ? (
                  <div className="space-y-2">
                    {selected.verseItems.map((item) => (
                      <p key={item.reference} className="font-serif text-[1.15rem] leading-relaxed text-foreground/90">
                        <span className="mr-2 align-baseline text-xs font-semibold text-muted-foreground/70">{item.reference}</span>
                        {item.text}
                      </p>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Texto do versículo não disponível (versão não instalada).</p>
                )}

                {selected.highlight.content && (
                  <p className="mt-6 whitespace-pre-wrap border-l-2 border-border/60 pl-4 text-sm leading-relaxed text-muted-foreground">
                    {selected.highlight.content}
                  </p>
                )}

                {firstVerse && (
                  <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-border/60 pt-6">
                    <Button type="button" onClick={() => navigateToVerse(selected)} className="gap-2">
                      <BookOpen className="size-4" />
                      Abrir no leitor
                    </Button>
                    <Button type="button" variant="outline" onClick={() => copyEntry(selected)} className="gap-2">
                      <Copy className="size-4" />
                      Copiar
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex h-full min-h-0 items-center justify-center p-6">
            <div className="flex flex-col items-center text-center">
              <Highlighter className="mb-3 size-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">Escolha um destaque na lista para rever o trecho.</p>
            </div>
          </div>
        )}
      </section>

      <HighlightEditDialog
        open={editing !== null}
        highlight={editing}
        onClose={() => setEditing(null)}
        onSave={saveEdit}
        onDelete={async () => {
          const entry = editing
          if (entry) await deleteEntry(entry)
          setEditing(null)
        }}
        listCategories={listCategories}
        createCategory={createCategory}
      />
    </div>
  )
}
