"use client"

import { useEffect, useMemo, useState } from "react"
import { Highlighter, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { cn } from "@/lib/utils"
import { useAllHighlights, type AllHighlightEntry } from "../hooks/use-all-highlights"
import { useHighlightMutations } from "../hooks/use-highlight-mutations"
import { HighlightCard } from "./highlight-card"
import { HighlightEditDialog } from "./highlight-edit-dialog"
import {
  EMPTY_HIGHLIGHT_FILTERS,
  filterHighlights,
  HighlightsFilterBar,
  type HighlightFilters,
} from "./highlights-filter-bar"
import { copyReference, formatHighlightReference } from "../lib/copy"

interface AllHighlightsBrowserProps {
  active?: boolean
  embedded?: boolean
  showCloseButton?: boolean
  onClose: () => void
  onEdit?: (highlightId: string) => void | Promise<void>
  onDelete?: (id: string) => Promise<boolean>
  initialQuery?: string
}

export function getHighlightEmptyState(hasFilters: boolean) {
  return hasFilters
    ? { title: "Nenhum destaque encontrado", description: "Tente ajustar os filtros.", showCta: false }
    : { title: "Nenhum destaque ainda", description: "Crie seu primeiro destaque no leitor.", showCta: true }
}

export function buildHighlightNavigation(verse: AllHighlightEntry["verses"][number]) {
  return {
    book: verse.book,
    chapter: verse.chapter,
    version: verse.bible,
    href: `/?book=${encodeURIComponent(verse.book)}&chapter=${verse.chapter}&verse=${verse.verse}`,
  }
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
  const router = useRouter()
  const [filters, setFilters] = useState<HighlightFilters>({
    ...EMPTY_HIGHLIGHT_FILTERS,
    query: initialQuery,
  })
  const [editing, setEditing] = useState<AllHighlightEntry | null>(null)
  const { entries, loading, error, reload, deleteHighlight, restoreHighlight } = useAllHighlights(active)
  const { updateHighlight, listCategories, createCategory } = useHighlightMutations()

  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters({
        ...EMPTY_HIGHLIGHT_FILTERS,
        query: active ? initialQuery : "",
      })
    }, 0)
    return () => clearTimeout(timer)
  }, [active, initialQuery])

  const filtered = useMemo(() => filterHighlights(entries, filters), [entries, filters])

  async function removeEntry(id: string): Promise<boolean> {
    if (onDelete) {
      const deleted = await onDelete(id)
      if (deleted) await reload()
      return deleted
    }
    return deleteHighlight(id)
  }

  async function saveEdit(patch: { color: string; categoryId: string | null; content: string }) {
    if (!editing) return
    await updateHighlight(editing.highlight.id, patch)
    setEditing(null)
    await reload()
    toast.success("Destaque atualizado")
  }

  function navigateToVerse(verse: AllHighlightEntry["verses"][number]) {
    const navigation = buildHighlightNavigation(verse)
    try {
      localStorage.setItem("openbible:book", navigation.book)
      localStorage.setItem("openbible:chapter", String(navigation.chapter))
      localStorage.setItem("openbible:version", navigation.version)
    } catch {
      // Navigation still works when localStorage is unavailable.
    }
    onClose()
    router.push(navigation.href)
  }

  async function copyEntry(entry: AllHighlightEntry) {
    const text = formatHighlightReference({ verses: entry.verses, content: entry.highlight.content })
    const copied = await copyReference(text)
    if (copied) toast.success("Referência copiada")
    else toast.error("Não foi possível copiar a referência")
  }

  function showDeleteToast(entry: AllHighlightEntry) {
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

  async function deleteEntry(entry: AllHighlightEntry) {
    if (onDelete) {
      const deleted = await onDelete(entry.highlight.id)
      if (deleted) await reload()
      return
    }

    const deleted = await deleteHighlight(entry.highlight.id)
    if (!deleted) {
      toast.error("Não foi possível excluir o destaque")
      return
    }

    showDeleteToast(entry)
  }

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
              <Highlighter className="size-4 text-primary" />
            </div>
          )}
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-foreground sm:text-base">Destaques</h2>
            <p className="truncate text-xs text-muted-foreground">
              {filtered.length === entries.length ? entries.length : `${filtered.length} de ${entries.length}`} {filtered.length === 1 ? "trecho destacado" : "trechos destacados"}
            </p>
          </div>
        </div>
        {showCloseButton && (
          <Button type="button" variant="ghost" size="icon-sm" onClick={onClose} aria-label="Fechar" className="shrink-0 text-muted-foreground hover:text-foreground">
            <X />
          </Button>
        )}
      </div>

      <HighlightsFilterBar value={filters} onChange={setFilters} entries={entries} />
      <Separator />

      <div className={cn("no-scrollbar min-h-0 flex-1 overflow-y-auto", embedded ? "p-4" : "px-5 py-5 sm:px-6")}>
        {loading ? (
          <div className="flex flex-col gap-3" aria-label="Carregando destaques">
            {Array.from({ length: 3 }, (_, index) => <div key={index} className="h-32 animate-pulse rounded-2xl bg-muted" />)}
          </div>
        ) : error ? (
          <Empty className="border-0 py-10">
            <EmptyHeader>
              <EmptyMedia variant="icon"><Highlighter /></EmptyMedia>
              <EmptyTitle>Não foi possível carregar</EmptyTitle>
              <EmptyDescription>{error}</EmptyDescription>
            </EmptyHeader>
            <Button type="button" variant="outline" onClick={() => reload()}>Tentar novamente</Button>
          </Empty>
        ) : filtered.length === 0 ? (
          <Empty className="border-0 py-10">
            <EmptyHeader>
              <EmptyMedia variant="icon"><Highlighter /></EmptyMedia>
              <EmptyTitle>{getHighlightEmptyState(Object.values(filters).some(Boolean)).title}</EmptyTitle>
              <EmptyDescription>{getHighlightEmptyState(Object.values(filters).some(Boolean)).description}</EmptyDescription>
            </EmptyHeader>
            {getHighlightEmptyState(Object.values(filters).some(Boolean)).showCta && <Button type="button" onClick={onClose}>Criar no leitor</Button>}
          </Empty>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((entry) => (
              <HighlightCard
                key={entry.highlight.id}
                entry={entry}
                onEdit={async (id) => {
                  if (onEdit) {
                    await onEdit(id)
                    return
                  }
                  const selected = entries.find((item) => item.highlight.id === id)
                  if (selected) setEditing(selected)
                }}
                onDelete={(id) => {
                  const entryToDelete = entries.find((item) => item.highlight.id === id)
                  if (entryToDelete) void deleteEntry(entryToDelete)
                }}
                onNavigate={navigateToVerse}
                onCopy={() => copyEntry(entry)}
              />
            ))}
          </div>
        )}
      </div>

      <HighlightEditDialog
        open={editing !== null}
        highlight={editing}
        onClose={() => setEditing(null)}
        onSave={saveEdit}
        onDelete={async (id) => {
          const entryToDelete = editing
          const deleted = await removeEntry(id)
          if (deleted) {
            setEditing(null)
            if (!onDelete && entryToDelete) showDeleteToast(entryToDelete)
          }
        }}
        listCategories={listCategories}
        createCategory={createCategory}
      />
    </div>
  )
}
