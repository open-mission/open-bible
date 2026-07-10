"use client"

import { useState, useEffect, useMemo } from "react"
import { IconSearch, IconX, IconTrash, IconNotebook } from "@tabler/icons-react"
import { BottomSheet } from "@/components/ui/bottom-sheet"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { InputGroup, InputGroupAddon } from "@/components/ui/input-group"
import { useIsMobile } from "@/lib/use-media-query"
import { useAllNotes, type AllNoteEntry } from "../hooks/use-all-notes"
import { useNoteMutations } from "../hooks/use-note-mutations"

interface AllNotesSheetProps {
  open: boolean
  onClose: () => void
  onOpen: (entry: AllNoteEntry) => void
}

function stripHtml(html?: string | null): string {
  if (!html) return ""
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

function referenceLabel(entry: AllNoteEntry): string {
  const refs = entry.references
  if (refs.length === 0) return "Sem referência"
  const first = refs[0]
  const base = `${first.book.toUpperCase()} ${first.chapter}:${first.verseStart}`
  if (refs.length === 1) return base
  return `${base} +${refs.length - 1}`
}

function NoteSummaryCard({
  entry,
  onOpen,
  onDelete,
}: {
  entry: AllNoteEntry
  onOpen: (entry: AllNoteEntry) => void
  onDelete: (entry: AllNoteEntry) => void
}) {
  const plain = stripHtml(entry.note.content)
  return (
    <article className="group relative w-full shrink-0 overflow-hidden rounded-2xl border border-border/60 bg-card/40 backdrop-blur-xs shadow-xs transition-all duration-300 hover:border-border/80 hover:shadow-md">
      <div className="flex flex-col gap-3 p-4.5">
        <header className="flex items-center gap-2.5">
          <IconNotebook className="size-4 shrink-0 text-primary" />
          <span className="text-xs font-semibold text-muted-foreground truncate font-sans">
            {referenceLabel(entry)}
          </span>
          <div className="ml-auto flex items-center gap-0.5">
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              onClick={() => onOpen(entry)}
              className="text-muted-foreground hover:text-foreground shrink-0"
              title="Abrir no painel"
            >
              <IconNotebook className="size-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              className="text-destructive/80 hover:text-destructive hover:bg-destructive/10 shrink-0"
              onClick={() => onDelete(entry)}
              title="Excluir nota"
            >
              <IconTrash className="size-3.5" />
            </Button>
          </div>
        </header>

        {plain ? (
          <p className="text-sm text-foreground/90 leading-relaxed line-clamp-4 whitespace-pre-wrap break-words">
            {plain}
          </p>
        ) : (
          <p className="text-sm italic text-muted-foreground/70">Nota sem texto</p>
        )}

        {entry.references.length > 1 && (
          <p className="text-[10px] text-muted-foreground/70">
            Vinculada a {entry.references.length} referências
          </p>
        )}
      </div>
    </article>
  )
}

export function AllNotesSheet({ open, onClose, onOpen }: AllNotesSheetProps) {
  const [query, setQuery] = useState("")
  const isMobile = useIsMobile()
  const { entries, loading, reload } = useAllNotes(open)
  const { deleteNote } = useNoteMutations()

  useEffect(() => {
    if (!open) {
      const timer = setTimeout(() => setQuery(""), 0)
      return () => clearTimeout(timer)
    }
  }, [open])

  const filtered = useMemo(() => {
    if (!query.trim()) return entries
    const q = query.toLowerCase()
    return entries.filter((e) => {
      if (stripHtml(e.note.content).toLowerCase().includes(q)) return true
      if (referenceLabel(e).toLowerCase().includes(q)) return true
      if (e.verseItems.some((vi) => vi.text.toLowerCase().includes(q) || vi.reference.toLowerCase().includes(q)))
        return true
      return false
    })
  }, [entries, query])

  const content = (
    <div className="flex h-full flex-col bg-background pb-6 sm:pb-4">
      <div className="flex shrink-0 items-center justify-between px-5 py-4">
        <div className="flex flex-col gap-0.5">
          <h3 className="text-base font-semibold text-foreground">Todas as notas</h3>
          <p className="text-xs text-muted-foreground">
            Visualize e gerencie suas anotações.
          </p>
        </div>
        {!isMobile && (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            className="shrink-0 text-muted-foreground hover:text-foreground"
          >
            <IconX className="size-4" />
          </Button>
        )}
      </div>
      <div className="shrink-0 px-5 pb-3">
        <InputGroup className="h-9! rounded-lg! border-input/30 bg-input/30 shadow-none!">
          <InputGroupAddon>
            <IconSearch className="size-4 shrink-0 opacity-50" />
          </InputGroupAddon>
          <input
            className="w-full bg-transparent text-sm outline-hidden placeholder:text-muted-foreground/50 text-foreground"
            placeholder="Buscar por texto ou referência..."
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
      <div className="no-scrollbar flex flex-1 flex-col gap-4.5 overflow-y-auto p-5">
        {loading ? (
          <p className="py-8 text-center text-sm text-muted-foreground">Carregando...</p>
        ) : filtered.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            {query ? "Nenhuma nota encontrada" : "Nenhuma nota ainda"}
          </p>
        ) : (
          filtered.map((e) => (
            <NoteSummaryCard
              key={e.note.id}
              entry={e}
              onOpen={onOpen}
              onDelete={async (entry) => {
                if (window.confirm("Excluir esta nota? Esta ação não pode ser desfeita.")) {
                  await deleteNote(entry.note.id)
                  await reload()
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
        className="flex h-full flex-col gap-0 border-l border-border p-0"
      >
        {content}
      </SheetContent>
    </Sheet>
  )
}
