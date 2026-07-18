"use client"

import { useEffect, useState, useCallback } from "react"
import { database } from "@/lib/database/database"
import type { NoteTarget, NoteWithRefs } from "../types"

export function useNotes(target: NoteTarget | null) {
  const bible = target?.bible
  const book = target?.book
  const chapter = target?.chapter
  const verseStart = target?.verseStart
  const verseEnd = target?.verseEnd

  const [notes, setNotes] = useState<NoteWithRefs[]>([])
  const [loading, setLoading] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const reload = useCallback(() => setRefreshKey((k) => k + 1), [])

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      if (!bible || !book || !chapter || !verseStart) {
        setNotes([])
        return
      }
      setLoading(true)
      try {
        await database.initialize()
        const refs = await database.noteReferences.listForRange({
          bible,
          book,
          chapter,
          verseStart,
          verseEnd,
        })
        const noteIds = [...new Set(refs.map((r) => r.noteId))]
        const out: NoteWithRefs[] = []
        for (const id of noteIds) {
          const note = await database.notes.findById(id)
          if (note) {
            out.push({ note, references: refs.filter((r) => r.noteId === id) })
          }
        }
        if (!cancelled) setNotes(out)
      } catch (e) {
        console.error("[Notes] Failed to load notes for range:", e)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    run()
    return () => { cancelled = true }
  }, [bible, book, chapter, verseStart, verseEnd, refreshKey])

  return { notes, loading, reload }
}
