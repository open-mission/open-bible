"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { toast } from "sonner"
import { useNotesContext } from "../context/notes-context"
import { useNotes } from "../hooks/use-notes"
import { useNoteMutations } from "../hooks/use-note-mutations"
import { getBook } from "@/features/bible-reader/utils/bible-data"
import { database } from "@/lib/database/database"
import { NoteEditor } from "./note-editor"
import { NoteList } from "./note-list"
import { Button } from "@/components/ui/button"

export function NotesPanel({ embedded = false }: { embedded?: boolean }) {
  const { target, closeNotePanel } = useNotesContext()
  const { notes, loading, reload } = useNotes(target)
  const { createNote } = useNoteMutations()
  const [draft, setDraft] = useState("")
  const [preview, setPreview] = useState<string | null>(null)

  useEffect(() => {
    let cancel = false
    async function loadPreview() {
      if (!target) {
        setPreview(null)
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
        if (!cancel) setPreview(text || null)
      } catch {
        if (!cancel) setPreview(null)
      }
    }
    loadPreview()
    return () => {
      cancel = true
    }
  }, [target])

  if (!target) return null

  const book = getBook(target.book)
  const abbr = target.bible.toUpperCase()
  const sameVerse = (target.verseEnd ?? target.verseStart) === target.verseStart
  const versePart = sameVerse
    ? `${target.verseStart}`
    : `${target.verseStart}-${target.verseEnd}`
  const label = `${book?.name ?? target.book} ${target.chapter}:${versePart} (${abbr})`

  async function handleCreate() {
    if (!draft || draft === "<p></p>") {
      toast.error("Escreva algo na nota antes de salvar.")
      return
    }
    await createNote({ target, content: draft })
    setDraft("")
    await reload()
    toast.success("Nota salva!")
  }

  return (
    <div
      className={`flex h-full min-h-0 flex-col bg-background ${embedded ? "" : "border-l border-border"}`}
    >
      <header className="flex shrink-0 flex-col gap-1 border-b border-border p-6 pb-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold tracking-tight">Notas</h3>
          {!embedded && (
            <button
              type="button"
              onClick={closeNotePanel}
              aria-label="Fechar"
              className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <p className="text-xs text-muted-foreground">{label}</p>
        {preview && (
          <p className="line-clamp-2 text-xs italic text-muted-foreground/80">{preview}</p>
        )}
      </header>

      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4 custom-scrollbar">
        <div className="flex flex-col gap-2">
          <NoteEditor value={draft} onChange={setDraft} autoFocus />
          <div className="flex justify-end">
            <Button onClick={handleCreate} disabled={!draft || draft === "<p></p>"}>
              Salvar nota
            </Button>
          </div>
        </div>

        <div className="h-px bg-border" />

        <NoteList entries={notes} loading={loading} onChanged={reload} />
      </div>
    </div>
  )
}
