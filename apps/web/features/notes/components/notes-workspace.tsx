"use client"

import { useEffect, useMemo, useState } from "react"
import { ArrowLeft, Download, FileText, Pencil, Plus, Search, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { InputGroup, InputGroupAddon } from "@/components/ui/input-group"
import { cn } from "@/lib/utils"
import { useAllNotes } from "../hooks/use-all-notes"
import { useNoteMutations } from "../hooks/use-note-mutations"
import { NoteEditor } from "./note-editor"
import { NoteRenderer } from "./note-renderer"
import { exportMarkdown } from "../lib/markdown-export"
import { createEmptyNoteDocument, getNotesViewState } from "../lib/note-document"
import { isEmptyHtml, stripHtml } from "../utils/html"
import { referenceLabel } from "../utils/reference-label"

export function NotesWorkspace() {
  const { entries, loading, reload } = useAllNotes(true)
  const { createNote, updateNote, deleteNote } = useNoteMutations()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [draft, setDraft] = useState("")
  const [editing, setEditing] = useState(false)
  const [mobileList, setMobileList] = useState(true)
  const [query, setQuery] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [saveState, setSaveState] = useState<"idle" | "draft" | "saving" | "saved">("idle")

  const selected = entries.find((entry) => entry.note.id === selectedId) ?? null
  const filtered = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("pt-BR")
    if (!normalized) return entries
    return entries.filter((entry) =>
      `${stripHtml(entry.note.content)} ${referenceLabel(entry.references)}`
        .toLocaleLowerCase("pt-BR")
        .includes(normalized),
    )
  }, [entries, query])
  const viewState = getNotesViewState({ loading, error, count: entries.length })

  useEffect(() => {
    if (!editing) return
    if (!selectedId) {
      setSaveState("draft")
      return
    }
    if (isEmptyHtml(draft)) return
    setSaveState("saving")
    const timer = setTimeout(() => {
      updateNote(selectedId, { content: draft })
        .then(() => {
          setSaveState("saved")
          setError(null)
        })
        .catch(() => {
          setError("Não foi possível salvar a nota.")
          setSaveState("draft")
        })
    }, 800)
    return () => clearTimeout(timer)
  }, [draft, editing, selectedId, updateNote])

  const openNote = (id: string) => {
    const entry = entries.find((item) => item.note.id === id)
    if (!entry) return
    setSelectedId(id)
    setDraft(entry.note.content)
    setEditing(false)
    setMobileList(false)
    setSaveState("idle")
  }

  const compose = () => {
    setSelectedId(null)
    setDraft(JSON.stringify(createEmptyNoteDocument()))
    setEditing(true)
    setMobileList(false)
    setSaveState("draft")
  }

  const save = async () => {
    if (isEmptyHtml(draft)) {
      setError("Escreva algo na nota antes de salvar.")
      return
    }
    try {
      if (selectedId) {
        await updateNote(selectedId, { content: draft })
      } else {
        const note = await createNote({ content: draft })
        setSelectedId(note.id)
      }
      await reload()
      setEditing(false)
      setSaveState("saved")
      setError(null)
    } catch {
      setError("Não foi possível salvar a nota.")
    }
  }

  const remove = async () => {
    if (!selectedId || !window.confirm("Excluir esta nota? Esta ação não pode ser desfeita.")) return
    await deleteNote(selectedId)
    setSelectedId(null)
    setDraft("")
    setEditing(false)
    setSaveState("idle")
    setMobileList(true)
    await reload()
  }

  const download = () => {
    if (!selected) return
    const blob = new Blob([exportMarkdown(selected.note.content)], { type: "text/markdown;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement("a")
    anchor.href = url
    anchor.download = "nota.md"
    anchor.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="grid h-full min-h-0 grid-cols-1 md:grid-cols-[18rem_minmax(0,1fr)]">
      <aside className={cn("min-h-0 flex-col border-r border-border/60 bg-muted/20 md:flex", mobileList ? "flex" : "hidden")}>
        <header className="shrink-0 space-y-3 p-4">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h1 className="text-base font-semibold text-foreground">Notas</h1>
              <p className="text-xs text-muted-foreground">Seu espaço de reflexão</p>
            </div>
            <Button type="button" size="sm" onClick={compose}>
              <Plus data-icon="inline-start" />
              Nova nota
            </Button>
          </div>
          <InputGroup className="h-9! rounded-lg! border-input/30 bg-background shadow-none!">
            <InputGroupAddon><Search className="size-4 opacity-50" /></InputGroupAddon>
            <input className="w-full bg-transparent text-sm outline-hidden placeholder:text-muted-foreground/50" placeholder="Buscar notas..." value={query} onChange={(event) => setQuery(event.target.value)} />
          </InputGroup>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-3">
          {viewState === "loading" ? <p className="px-3 py-8 text-center text-sm text-muted-foreground">Carregando...</p> : null}
          {viewState === "error" ? <p className="px-3 py-8 text-center text-sm text-destructive">{error}</p> : null}
          {viewState === "empty" ? <p className="px-3 py-8 text-center text-sm text-muted-foreground">Nenhuma nota ainda.</p> : null}
          {viewState === "ready" && filtered.length === 0 ? <p className="px-3 py-8 text-center text-sm text-muted-foreground">Nenhuma nota encontrada.</p> : null}
          {filtered.map((entry) => (
            <button key={entry.note.id} type="button" onClick={() => openNote(entry.note.id)} className={cn("mb-1 block w-full rounded-lg px-3 py-3 text-left transition-colors hover:bg-accent/70", selectedId === entry.note.id && "bg-accent")}>
              <span className="block truncate text-sm font-medium text-foreground">{referenceLabel(entry.references)}</span>
              <span className="mt-1 block line-clamp-2 text-xs leading-relaxed text-muted-foreground">{stripHtml(entry.note.content) || "Nota sem texto"}</span>
            </button>
          ))}
        </div>
      </aside>

      <section className={cn("min-h-0 flex-col bg-background md:flex", mobileList ? "hidden md:flex" : "flex")}>
        <header className="flex shrink-0 items-center gap-2 border-b border-border/60 px-4 py-3 sm:px-6">
          <Button type="button" variant="ghost" size="icon-sm" className="md:hidden" onClick={() => setMobileList(true)} aria-label="Voltar para notas"><ArrowLeft /></Button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-foreground">{selected ? referenceLabel(selected.references) : editing ? "Nova nota" : "Selecione uma nota"}</p>
            <p className="text-xs text-muted-foreground">
              {editing
                ? saveState === "saving"
                  ? "Salvando…"
                  : saveState === "saved"
                    ? "Salva neste dispositivo"
                    : "Rascunho não salvo"
                : "Canvas de leitura"}
            </p>
          </div>
          {selected && !editing ? <Button type="button" variant="ghost" size="icon-sm" onClick={() => setEditing(true)} aria-label="Editar nota"><Pencil /></Button> : null}
          {selected ? <Button type="button" variant="ghost" size="icon-sm" onClick={download} aria-label="Exportar Markdown"><Download /></Button> : null}
          {selected ? <Button type="button" variant="ghost" size="icon-sm" className="text-destructive" onClick={remove} aria-label="Excluir nota"><Trash2 /></Button> : null}
          {editing ? <Button type="button" size="sm" onClick={save}>Salvar</Button> : null}
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6 sm:px-10 sm:py-10">
          <div className="mx-auto max-w-3xl">
            {error ? <p className="mb-3 text-sm text-destructive">{error}</p> : null}
            {editing ? <NoteEditor value={draft} onChange={setDraft} autoFocus className="min-h-[24rem]" /> : selected ? <NoteRenderer content={selected.note.content} className="note-rich-content" /> : <div className="flex min-h-[22rem] flex-col items-center justify-center text-center"><FileText className="mb-3 size-8 text-muted-foreground/40" /><p className="text-sm text-muted-foreground">Escolha uma nota ou comece uma nova.</p><Button type="button" variant="outline" size="sm" className="mt-4" onClick={compose}><Plus data-icon="inline-start" />Nova nota</Button></div>}
          </div>
        </div>
      </section>
    </div>
  )
}
