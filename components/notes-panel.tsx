"use client"

import { useEffect, useRef, useState } from "react"
import { X, Trash2 } from "lucide-react"
import type { Note, Verse } from "@/lib/types"

interface NotesPanelProps {
  verse: Verse
  note?: Note
  onSave: (content: string) => void
  onDelete: () => void
  onClose: () => void
}

export function NotesPanel({ verse, note, onSave, onDelete, onClose }: NotesPanelProps) {
  const [content, setContent] = useState(note?.content ?? "")
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    setContent(note?.content ?? "")
  }, [note, verse.id])

  useEffect(() => {
    textareaRef.current?.focus()
  }, [])

  const isDirty = content !== (note?.content ?? "")
  const isEmpty = content.trim() === ""

  function handleSave() {
    if (!isEmpty) {
      onSave(content.trim())
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if ((e.metaKey || e.ctrlKey) && e.key === "s") {
      e.preventDefault()
      handleSave()
    }
  }

  const verseRef = `${verse.chapter}:${verse.verse}`

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3 shrink-0">
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground font-mono">Versículo {verseRef}</p>
          <p className="mt-0.5 font-serif text-sm text-foreground line-clamp-2 leading-snug">
            {verse.text}
          </p>
        </div>
        <button
          onClick={onClose}
          aria-label="Fechar painel de notas"
          className="ml-3 shrink-0 flex items-center justify-center w-7 h-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Textarea */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        <label htmlFor="note-textarea" className="sr-only">
          Nota para {verseRef}
        </label>
        <textarea
          id="note-textarea"
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Escreva sua nota aqui..."
          className="w-full h-full min-h-40 resize-none bg-transparent font-serif text-sm leading-relaxed text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
          spellCheck
        />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-border px-4 py-3 shrink-0">
        <div className="flex items-center gap-2">
          {note && (
            <button
              onClick={() => {
                onDelete()
                onClose()
              }}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive transition-colors"
              aria-label="Excluir nota"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Excluir
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground/60 hidden sm:inline">
            {(note || !isEmpty) && "Ctrl+S para salvar"}
          </span>
          <button
            onClick={handleSave}
            disabled={isEmpty || !isDirty}
            className="rounded-md px-3 py-1.5 text-xs font-medium bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  )
}
