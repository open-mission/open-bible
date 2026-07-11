"use client"

import { useCallback } from "react"
import { database } from "@/lib/database/database"
import { useNotesContext } from "../context/notes-context"
import type { NoteTarget } from "../types"

export function useNoteMutations() {
  const { refresh } = useNotesContext()

  const createNote = useCallback(
    async (input: { target: NoteTarget; content: string; title?: string | null }) => {
      await database.initialize()
      const note = await database.notes.create({
        title: input.title ?? null,
        content: input.content,
      })
      await database.noteReferences.add({
        noteId: note.id,
        bible: input.target.bible,
        book: input.target.book,
        chapter: input.target.chapter,
        verseStart: input.target.verseStart,
        verseEnd: input.target.verseEnd ?? null,
        order: 0,
      })
      await refresh()
      return note
    },
    [refresh],
  )

  const updateNote = useCallback(
    async (id: string, patch: { title?: string | null; content?: string }) => {
      await database.initialize()
      await database.notes.update(id, patch)
      await refresh()
    },
    [refresh],
  )

  const deleteNote = useCallback(
    async (id: string) => {
      await database.initialize()
      await database.notes.delete(id)
      await database.noteReferences.removeByNote(id)
      await refresh()
    },
    [refresh],
  )

  return { createNote, updateNote, deleteNote }
}
