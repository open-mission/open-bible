"use client"

import { useEffect, useMemo, useState } from "react"
import {
  IconSearch,
  IconX,
  IconNotebook,
  IconPlus,
  IconCheck,
  IconArrowLeft,
} from "@tabler/icons-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { InputGroup, InputGroupAddon } from "@/components/ui/input-group"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { NoteEditor } from "./note-editor"
import { NoteListItem } from "./note-list-item"
import { NoteDetail } from "./note-detail"
import { useAllNotes, type AllNoteEntry } from "../hooks/use-all-notes"
import { useNotes } from "../hooks/use-notes"
import { useNoteMutations } from "../hooks/use-note-mutations"
import { stripHtml, isEmptyHtml } from "../utils/html"
import { referenceLabel } from "../utils/reference-label"
import { getBook } from "@/features/bible-reader/utils/bible-data"
import { database } from "@/lib/database/database"
import { cn } from "@/lib/utils"
import type { NoteTarget, NoteWithRefs } from "../types"
import type { Note, NoteReference } from "@/lib/database/user/schema"

type BrowserView = "list" | "detail" | "edit" | "compose"

export type NotesBrowserMode = "all" | "target"

export interface NotesBrowserProps {
  mode: NotesBrowserMode
  /** When mode is target, filter and create against this range */
  target?: NoteTarget | null
  /** Gate data loading (e.g. sheet open). Defaults true. */
  active?: boolean
  /** Side panel / sheet embedding */
  embedded?: boolean
  onRequestClose?: () => void
  className?: string
  /** Show close control in list header (desktop sheet / full-screen) */
  showCloseButton?: boolean
}

type BrowserEntry = {
  note: Note
  references: NoteReference[]
}

function toBrowserEntry(entry: AllNoteEntry | NoteWithRefs): BrowserEntry {
  return { note: entry.note, references: entry.references }
}

export function NotesBrowser({
  mode,
  target = null,
  active = true,
  embedded = false,
  onRequestClose,
  className,
  showCloseButton = false,
}: NotesBrowserProps) {
  const [view, setView] = useState<BrowserView>("list")
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [draft, setDraft] = useState("")
  const [query, setQuery] = useState("")
  const [versePreview, setVersePreview] = useState<string | null>(null)

  const allNotes = useAllNotes(mode === "all" && active)
  const targetNotes = useNotes(mode === "target" && active ? target : null)
  const { createNote, updateNote, deleteNote } = useNoteMutations()

  const entries: BrowserEntry[] = useMemo(() => {
    if (mode === "all") return allNotes.entries.map(toBrowserEntry)
    return targetNotes.notes.map(toBrowserEntry)
  }, [mode, allNotes.entries, targetNotes.notes])

  const loading = mode === "all" ? allNotes.loading : targetNotes.loading
  const reload = mode === "all" ? allNotes.reload : targetNotes.reload

  const selected = useMemo(
    () => entries.find((e) => e.note.id === selectedId) ?? null,
    [entries, selectedId],
  )

  // Reset navigation when shell deactivates or target changes
  useEffect(() => {
    if (!active) {
      const t = setTimeout(() => {
        setView("list")
        setSelectedId(null)
        setDraft("")
        setQuery("")
      }, 0)
      return () => clearTimeout(t)
    }
  }, [active])

  useEffect(() => {
    if (mode !== "target") return
    setView("list")
    setSelectedId(null)
    setDraft("")
  }, [mode, target?.bible, target?.book, target?.chapter, target?.verseStart, target?.verseEnd])

  // Verse text preview for target mode
  useEffect(() => {
    let cancel = false
    async function loadPreview() {
      if (mode !== "target" || !target) {
        setVersePreview(null)
        return
      }
      try {
        await database.initialize()
        const bible = await database.openBible(target.bible)
        const verses = await bible.getChapterVerses(target.book, target.chapter)
        const end = target.verseEnd ?? target.verseStart
        const text = verses
          .filter((v) => v.verse >= target.verseStart && v.verse <= end)
          .map((v) => v.text)
          .join(" ")
        if (!cancel) setVersePreview(text || null)
      } catch {
        if (!cancel) setVersePreview(null)
      }
    }
    loadPreview()
    return () => {
      cancel = true
    }
  }, [mode, target])

  const filtered = useMemo(() => {
    if (mode !== "all" || !query.trim()) return entries
    const q = query.toLowerCase()
    return entries.filter((e) => {
      if (stripHtml(e.note.content).toLowerCase().includes(q)) return true
      if (referenceLabel(e.references).toLowerCase().includes(q)) return true
      return false
    })
  }, [entries, query, mode])

  const targetLabel = useMemo(() => {
    if (!target) return "Notas"
    const book = getBook(target.book)
    const abbr = target.bible.toUpperCase()
    const sameVerse = (target.verseEnd ?? target.verseStart) === target.verseStart
    const versePart = sameVerse
      ? `${target.verseStart}`
      : `${target.verseStart}-${target.verseEnd}`
    return `${book?.name ?? target.book} ${target.chapter}:${versePart} (${abbr})`
  }, [target])

  function openDetail(id: string) {
    setSelectedId(id)
    setView("detail")
  }

  function openEdit() {
    if (!selected) return
    setDraft(selected.note.content)
    setView("edit")
  }

  function openCompose() {
    setDraft("")
    setSelectedId(null)
    setView("compose")
  }

  function goList() {
    setView("list")
    setSelectedId(null)
    setDraft("")
  }

  async function handleSaveEdit() {
    if (!selectedId) return
    if (isEmptyHtml(draft)) {
      toast.error("Escreva algo na nota antes de salvar.")
      return
    }
    await updateNote(selectedId, { content: draft })
    await reload()
    setView("detail")
    toast.success("Nota atualizada")
  }

  async function handleSaveCompose() {
    if (!target) return
    if (isEmptyHtml(draft)) {
      toast.error("Escreva algo na nota antes de salvar.")
      return
    }
    const note = await createNote({ target, content: draft })
    await reload()
    setSelectedId(note.id)
    setDraft("")
    setView("detail")
    toast.success("Nota salva!")
  }

  async function handleDelete() {
    if (!selectedId) return
    if (!window.confirm("Excluir esta nota? Esta ação não pode ser desfeita.")) return
    await deleteNote(selectedId)
    await reload()
    goList()
    toast.success("Nota excluída")
  }

  if (view === "detail" && selected) {
    return (
      <div className={cn("flex h-full min-h-0 flex-col bg-background", className)}>
        <NoteDetail
          entry={selected}
          onBack={goList}
          onEdit={openEdit}
          onDelete={handleDelete}
          subtitle={mode === "target" ? versePreview : null}
        />
      </div>
    )
  }

  if (view === "edit" && selected) {
    return (
      <div className={cn("flex h-full min-h-0 flex-col bg-background", className)}>
        <header className="flex shrink-0 items-center gap-1 border-b border-border/60 px-3 py-2 sm:px-4">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => {
              setDraft(selected.note.content)
              setView("detail")
            }}
            aria-label="Cancelar"
            className="shrink-0 text-muted-foreground hover:text-foreground"
          >
            <IconArrowLeft />
          </Button>
          <p className="min-w-0 flex-1 truncate px-1 text-sm font-semibold">Editar nota</p>
          <Button type="button" size="sm" onClick={handleSaveEdit}>
            <IconCheck data-icon="inline-start" />
            Salvar
          </Button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">
          <NoteEditor value={draft} onChange={setDraft} autoFocus />
        </div>
      </div>
    )
  }

  if (view === "compose") {
    return (
      <div className={cn("flex h-full min-h-0 flex-col bg-background", className)}>
        <header className="flex shrink-0 items-center gap-1 border-b border-border/60 px-3 py-2 sm:px-4">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={goList}
            aria-label="Cancelar"
            className="shrink-0 text-muted-foreground hover:text-foreground"
          >
            <IconArrowLeft />
          </Button>
          <p className="min-w-0 flex-1 truncate px-1 text-sm font-semibold">Nova nota</p>
          <Button type="button" size="sm" onClick={handleSaveCompose}>
            <IconCheck data-icon="inline-start" />
            Salvar
          </Button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">
          {mode === "target" && (
            <p className="mb-3 text-xs text-muted-foreground">{targetLabel}</p>
          )}
          <NoteEditor value={draft} onChange={setDraft} autoFocus />
        </div>
      </div>
    )
  }

  // list view
  return (
    <div className={cn("flex h-full min-h-0 flex-col bg-background", className)}>
      <div
        className={cn(
          "flex shrink-0 items-center justify-between gap-3",
          embedded ? "px-4 py-3" : "px-5 py-4 sm:px-6",
        )}
      >
        <div className="flex min-w-0 items-center gap-3">
          {!embedded && (
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <IconNotebook className="size-4 text-primary" />
            </div>
          )}
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-foreground sm:text-base">
              {mode === "all" ? "Todas as notas" : "Notas"}
            </h2>
            <p className="truncate text-xs text-muted-foreground">
              {mode === "all"
                ? `${entries.length} ${entries.length === 1 ? "anotação" : "anotações"}`
                : targetLabel}
            </p>
            {mode === "target" && versePreview && view === "list" && (
              <p className="mt-0.5 line-clamp-2 text-xs italic text-muted-foreground/80">
                {versePreview}
              </p>
            )}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {mode === "target" && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={openCompose}
            >
              <IconPlus data-icon="inline-start" />
              Nova
            </Button>
          )}
          {showCloseButton && onRequestClose && (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={onRequestClose}
              aria-label="Fechar"
              className="text-muted-foreground hover:text-foreground"
            >
              <IconX />
            </Button>
          )}
        </div>
      </div>

      {mode === "all" && (
        <div className={cn("shrink-0 pb-3", embedded ? "px-4" : "px-5 sm:px-6")}>
          <InputGroup className="h-9! rounded-lg! border-input/30 bg-input/30 shadow-none!">
            <InputGroupAddon>
              <IconSearch className="size-4 shrink-0 opacity-50" />
            </InputGroupAddon>
            <input
              className="w-full bg-transparent text-sm outline-hidden placeholder:text-muted-foreground/50 text-foreground"
              placeholder="Buscar por texto ou referência..."
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
      )}

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
                <IconNotebook />
              </EmptyMedia>
              <EmptyTitle>
                {query ? "Nenhuma nota encontrada" : "Nenhuma nota ainda"}
              </EmptyTitle>
              <EmptyDescription>
                {query
                  ? "Tente outro termo de busca."
                  : mode === "target"
                    ? "Toque em Nova para anotar este trecho."
                    : "Selecione um versículo e crie sua primeira nota."}
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : mode === "all" && !embedded ? (
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-4 px-1 sm:grid-cols-2 lg:grid-cols-4">
            {filtered.map((entry) => (
              <NoteListItem
                key={entry.note.id}
                entry={entry}
                onOpen={() => openDetail(entry.note.id)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((entry) => (
              <NoteListItem
                key={entry.note.id}
                entry={entry}
                onOpen={() => openDetail(entry.note.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
