"use client"

import { useEffect, useRef, useState } from "react"
import { X, Trash2, Link2, Link2Off, Bold, Italic, Strikethrough, Highlighter } from "lucide-react"
import { BottomSheet } from "@/components/ui/bottom-sheet"
import { useIsMobile } from "@/lib/use-media-query"
import type { Note } from "@/lib/types"
import { parseVerseId } from "@/lib/verse-utils"

interface NoteEditorDialogProps {
  verseIds: string[]
  noteId: string | null
  existingNote?: Note
  onSave: (noteId: string | null, content: string, verseIds: string[]) => void
  onDelete: (noteId: string) => void
  onClose: () => void
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, "").trim()
}

function wrapSelection(tag: string) {
  const sel = window.getSelection()
  if (!sel || !sel.rangeCount || sel.isCollapsed) return
  const range = sel.getRangeAt(0)
  const selected = range.extractContents()
  const wrapper = document.createElement(tag)
  wrapper.appendChild(selected)
  range.insertNode(wrapper)
  sel.removeAllRanges()
  sel.addRange(range)
}

export function NoteEditorDialog({
  verseIds: initialVerseIds,
  noteId,
  existingNote,
  onSave,
  onDelete,
  onClose,
}: NoteEditorDialogProps) {
  const [content, setContent] = useState(existingNote?.content ?? "")
  const [linkedVerseIds, setLinkedVerseIds] = useState<string[]>(
    existingNote?.verseIds ?? initialVerseIds
  )
  const editorRef = useRef<HTMLDivElement>(null)
  const isMobile = useIsMobile()

  useEffect(() => {
    setContent(existingNote?.content ?? "")
    setLinkedVerseIds(existingNote?.verseIds ?? initialVerseIds)
  }, [noteId, existingNote, initialVerseIds.join(",")])

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = existingNote?.content ?? ""
      editorRef.current.focus()
    }
  }, [])

  function getCurrentHtml(): string {
    return editorRef.current?.innerHTML ?? ""
  }

  function handleFormat(command: string) {
    document.execCommand(command, false)
    editorRef.current?.focus()
  }

  function handleHighlight() {
    wrapSelection("mark")
    editorRef.current?.focus()
  }

  const isEmpty = stripHtml(content) === ""
  const isDirty =
    content !== (existingNote?.content ?? "") ||
    JSON.stringify(linkedVerseIds) !== JSON.stringify(existingNote?.verseIds ?? initialVerseIds)

  function handleSave() {
    const html = getCurrentHtml()
    if (stripHtml(html) === "") return
    onSave(noteId, html, linkedVerseIds)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if ((e.metaKey || e.ctrlKey) && e.key === "s") {
      e.preventDefault()
      handleSave()
    }
    if ((e.metaKey || e.ctrlKey) && e.key === "b") {
      e.preventDefault()
      handleFormat("bold")
    }
    if ((e.metaKey || e.ctrlKey) && e.key === "i") {
      e.preventDefault()
      handleFormat("italic")
    }
  }

  function removeVerseLink(verseId: string) {
    setLinkedVerseIds((prev) => prev.filter((id) => id !== verseId))
  }

  return (
    <BottomSheet open onClose={onClose}>
      {isMobile && (
        <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
          <p className="text-sm font-medium text-foreground">
            {noteId ? "Editar nota" : "Nova nota"}
          </p>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="flex items-center justify-center w-7 h-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {linkedVerseIds.length > 0 && (
        <div className="shrink-0 border-b border-border px-4 py-2.5 space-y-1.5">
          <p className="text-xs sm:text-[10px] uppercase tracking-wide text-muted-foreground font-medium mb-1.5 flex items-center gap-1">
            <Link2 className="h-3 w-3" />
            Versículos vinculados
          </p>
          {linkedVerseIds.map((vId) => {
            const meta = parseVerseId(vId)
            if (!meta) return null
            const ref = `${meta.book.abbreviation} ${meta.chapter}:${meta.verse}`
            return (
              <div
                key={vId}
                className="flex items-start gap-2 rounded-md bg-secondary/60 px-2.5 py-1.5"
              >
                <span className="font-mono text-xs sm:text-[10px] text-primary shrink-0 mt-0.5">{ref}</span>
                <p className="flex-1 font-serif text-sm sm:text-xs text-muted-foreground line-clamp-2 leading-snug">
                  {meta.text}
                </p>
                <button
                  onClick={() => removeVerseLink(vId)}
                  aria-label={`Remover vínculo com ${ref}`}
                  className="shrink-0 mt-0.5 text-muted-foreground/50 hover:text-destructive transition-colors"
                >
                  <Link2Off className="h-3 w-3" />
                </button>
              </div>
            )
          })}
        </div>
      )}

      {linkedVerseIds.length === 0 && (
        <div className="shrink-0 border-b border-border px-4 py-2.5">
          <p className="text-xs text-muted-foreground/60 italic">
            Nenhum versículo vinculado. Selecione versículos no leitor para vincular.
          </p>
        </div>
      )}

      {/* Formatting toolbar */}
      <div className="shrink-0 flex items-center gap-0.5 px-4 py-1.5 border-b border-border">
        <button
          onClick={() => handleFormat("bold")}
          aria-label="Negrito"
          className="flex items-center justify-center w-7 h-7 rounded text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        >
          <Bold className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => handleFormat("italic")}
          aria-label="Itálico"
          className="flex items-center justify-center w-7 h-7 rounded text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        >
          <Italic className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => handleFormat("strikeThrough")}
          aria-label="Riscado"
          className="flex items-center justify-center w-7 h-7 rounded text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        >
          <Strikethrough className="h-3.5 w-3.5" />
        </button>
        <div className="mx-1 h-4 w-px bg-border" />
        <button
          onClick={handleHighlight}
          aria-label="Destacar"
          className="flex items-center justify-center w-7 h-7 rounded text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        >
          <Highlighter className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3">
        <div
          ref={editorRef}
          contentEditable
          role="textbox"
          aria-multiline="true"
          aria-label="Nota"
          onKeyDown={handleKeyDown}
          onInput={() => setContent(getCurrentHtml())}
          data-placeholder="Escreva sua nota aqui..."
          className="w-full min-h-32 font-serif text-base sm:text-sm leading-relaxed text-foreground focus:outline-none empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/50"
        />
      </div>

      <div className="flex items-center justify-between border-t border-border px-4 py-3 shrink-0">
        <div className="flex items-center gap-2">
          {noteId && (
            <button
              onClick={() => { onDelete(noteId); onClose() }}
              className="flex items-center gap-1.5 text-sm sm:text-xs text-muted-foreground hover:text-destructive transition-colors"
              aria-label="Excluir nota"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Excluir
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground/50 hidden sm:inline">Ctrl+S</span>
          <button
            onClick={handleSave}
            disabled={isEmpty || !isDirty}
            className="rounded-md px-3 py-1.5 text-xs font-medium bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Salvar
          </button>
        </div>
      </div>
    </BottomSheet>
  )
}
