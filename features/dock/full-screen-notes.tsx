"use client"

import { useState, useMemo } from "react"
import { IconSearch, IconX, IconNotebook } from "@tabler/icons-react"
import { InputGroup, InputGroupAddon } from "@/components/ui/input-group"
import { NoteRenderer } from "@/features/notes/components/note-renderer"
import { useAllNotes, type AllNoteEntry } from "@/features/notes/hooks/use-all-notes"

interface FullScreenNotesProps {
  open: boolean
  onClose: () => void
  onOpenNote: (entry: AllNoteEntry) => void
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

export function FullScreenNotes({ open, onClose, onOpenNote }: FullScreenNotesProps) {
  const [query, setQuery] = useState("")
  const { entries, loading } = useAllNotes(open)

  const filtered = useMemo(() => {
    if (!query.trim()) return entries
    const q = query.toLowerCase()
    return entries.filter((e) => {
      if (stripHtml(e.note.content).toLowerCase().includes(q)) return true
      if (referenceLabel(e).toLowerCase().includes(q)) return true
      if (
        e.verseItems.some(
          (vi) => vi.text.toLowerCase().includes(q) || vi.reference.toLowerCase().includes(q),
        )
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
              <IconNotebook className="size-4 text-primary" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-foreground">Notas</h2>
              <p className="text-xs text-muted-foreground">
                {entries.length} {entries.length === 1 ? "anotação" : "anotações"}
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

        {/* List */}
        <div className="no-scrollbar flex-1 overflow-y-auto px-6 pb-8">
          {loading ? (
            <p className="py-12 text-center text-sm text-muted-foreground">Carregando...</p>
          ) : filtered.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">
              {query ? "Nenhuma nota encontrada" : "Nenhuma nota ainda"}
            </p>
          ) : (
            <div className="mx-auto grid max-w-2xl grid-cols-1 gap-4 sm:grid-cols-2">
              {filtered.map((entry) => {
                const plain = stripHtml(entry.note.content)
                return (
                  <button
                    key={entry.note.id}
                    type="button"
                    onClick={() => onOpenNote(entry)}
                    className="group relative w-full rounded-2xl border border-border/60 bg-card/40 p-4.5 text-left shadow-xs transition-all duration-300 hover:border-border/80 hover:shadow-md"
                  >
                    <span className="text-xs font-semibold text-muted-foreground font-sans">
                      {referenceLabel(entry)}
                    </span>
                    {plain ? (
                      <NoteRenderer html={entry.note.content} className="mt-2" />
                    ) : (
                      <p className="mt-2 text-sm italic text-muted-foreground/70">Nota sem texto</p>
                    )}
                    {entry.references.length > 1 && (
                      <p className="mt-2 text-[10px] text-muted-foreground/70">
                        Vinculada a {entry.references.length} referências
                      </p>
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
