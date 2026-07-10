"use client"

import { useState } from "react"
import { IconEdit, IconTrash, IconCheck, IconX } from "@tabler/icons-react"
import { NoteRenderer } from "./note-renderer"
import { NoteEditor } from "./note-editor"
import { useNoteMutations } from "../hooks/use-note-mutations"
import { Button } from "@/components/ui/button"
import type { NoteWithRefs } from "../types"

function isEmptyHtml(html?: string | null): boolean {
  if (!html) return true
  const text = html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim()
  return text.length === 0
}

export function NoteCard({
  entry,
  onChanged,
}: {
  entry: NoteWithRefs
  onChanged?: () => void
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(entry.note.content)
  const { updateNote, deleteNote } = useNoteMutations()

  async function handleSave() {
    await updateNote(entry.note.id, { content: draft })
    setEditing(false)
    onChanged?.()
  }

  async function handleDelete() {
    if (!window.confirm("Excluir esta nota? Esta ação não pode ser desfeita.")) return
    await deleteNote(entry.note.id)
    onChanged?.()
  }

  if (editing) {
    return (
      <div className="flex flex-col gap-2 rounded-xl border border-border bg-muted/30 p-3">
        <NoteEditor value={draft} onChange={setDraft} autoFocus />
        <div className="flex justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setEditing(false)
              setDraft(entry.note.content)
            }}
          >
            <IconX className="size-4" /> Cancelar
          </Button>
          <Button size="sm" onClick={handleSave}>
            <IconCheck className="size-4" /> Salvar
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="group flex flex-col gap-1.5 rounded-xl border border-border bg-background p-3">
      {isEmptyHtml(entry.note.content) ? (
        <p className="text-sm text-muted-foreground/70 italic">Nota sem texto</p>
      ) : (
        <NoteRenderer html={entry.note.content} />
      )}
      <div className="flex justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={() => setEditing(true)}
          aria-label="Editar nota"
          className="text-muted-foreground hover:text-foreground"
        >
          <IconEdit className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={handleDelete}
          aria-label="Excluir nota"
          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
        >
          <IconTrash className="size-4" />
        </Button>
      </div>
    </div>
  )
}
