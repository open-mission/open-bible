"use client"

import { createContext, useContext, useState, useCallback, useEffect } from "react"
import { database } from "@/lib/database/database"
import type { Note } from "@/lib/database/user/schema"
import type { NoteTarget, NoteWithRefs } from "../types"

interface NotesContextValue {
  /** Active target the notes panel is annotating. */
  target: NoteTarget | null
  /** Whether the notes panel/sheet is open. */
  open: boolean
  /** Notes grouped by verse id (`${book}-${chapter}-${verse}`) for the current chapter. */
  notesByVerse: Map<string, NoteWithRefs[]>
  loading: boolean
  openNotePanel: (target: NoteTarget) => void
  closeNotePanel: () => void
  refresh: () => Promise<void>
}

const NotesContext = createContext<NotesContextValue | null>(null)

export function NotesProvider({
  bookId,
  chapter,
  versionId,
  open,
  target,
  onOpen,
  onClose,
  children,
}: {
  bookId: string | null
  chapter: number | null
  versionId: string
  open: boolean
  target: NoteTarget | null
  onOpen: (target: NoteTarget) => void
  onClose: () => void
  children: React.ReactNode
}) {
  const [notesByVerse, setNotesByVerse] = useState<Map<string, NoteWithRefs[]>>(new Map())
  const [loading, setLoading] = useState(true)

  const loadChapter = useCallback(async () => {
    if (!bookId || !chapter) {
      setNotesByVerse(new Map())
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      await database.initialize()
      const refs = await database.noteReferences.listForRange({
        bible: versionId,
        book: bookId,
        chapter,
        verseStart: 1,
        verseEnd: 9999,
      })

      const noteIds = [...new Set(refs.map((r) => r.noteId))]
      const noteMap = new Map<string, Note>()
      for (const id of noteIds) {
        const n = await database.notes.findById(id)
        if (n) noteMap.set(id, n)
      }

      const result = new Map<string, NoteWithRefs[]>()
      for (const ref of refs) {
        const note = noteMap.get(ref.noteId)
        if (!note) continue
        const entry: NoteWithRefs = { note, references: [ref] }
        const start = ref.verseStart
        const end = ref.verseEnd ?? ref.verseStart
        for (let v = start; v <= end; v++) {
          const verseId = `${ref.book}-${ref.chapter}-${v}`
          const existing = result.get(verseId) ?? []
          if (!existing.some((e) => e.note.id === note.id)) existing.push(entry)
          result.set(verseId, existing)
        }
      }
      setNotesByVerse(result)
    } catch (e) {
      console.error("[Notes] Failed to load chapter notes:", e)
    } finally {
      setLoading(false)
    }
  }, [bookId, chapter, versionId])

  useEffect(() => {
    const timer = setTimeout(() => {
      loadChapter()
    }, 0)
    return () => clearTimeout(timer)
  }, [loadChapter])

  const openNotePanel = useCallback((t: NoteTarget) => onOpen(t), [onOpen])
  const closeNotePanel = useCallback(() => onClose(), [onClose])

  return (
    <NotesContext.Provider
      value={{
        target,
        open,
        notesByVerse,
        loading,
        openNotePanel,
        closeNotePanel,
        refresh: loadChapter,
      }}
    >
      {children}
    </NotesContext.Provider>
  )
}

export function useNotesContext(): NotesContextValue {
  const ctx = useContext(NotesContext)
  if (!ctx) throw new Error("useNotesContext must be used within NotesProvider")
  return ctx
}
