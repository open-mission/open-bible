"use client"

import { useState, useEffect, useCallback } from "react"
import { database } from "@/lib/database/database"
import { getBookName } from "@/lib/books"
import type { Note, NoteReference } from "@/lib/database/user/schema"

export interface AllNoteVerseItem {
  reference: string
  text: string
}

export interface AllNoteEntry {
  note: Note
  references: NoteReference[]
  verseItems: AllNoteVerseItem[]
}

export function useAllNotes(open: boolean) {
  const [entries, setEntries] = useState<AllNoteEntry[]>([])
  const [loading, setLoading] = useState(false)

  const loadEntries = useCallback(async () => {
    setLoading(true)
    try {
      await database.initialize()
      const allNotes = await database.notes.list()
      const results: AllNoteEntry[] = await Promise.all(
        allNotes.map(async (note) => {
          const refs = await database.noteReferences.listByNote(note.id)
          const verseItems: AllNoteVerseItem[] = []
          if (refs.length > 0) {
            try {
              const first = refs[0]
              const bibleDb = await database.openBible(first.bible)
              const chapterVerses = await bibleDb.getChapterVerses(first.book, first.chapter)
              const sorted = [...refs].sort((a, b) => a.verseStart - b.verseStart)
              for (const r of sorted) {
                const end = r.verseEnd ?? r.verseStart
                for (let v = r.verseStart; v <= end; v++) {
                  const dbVerse = chapterVerses.find((cv) => cv.verse === v)
                  if (dbVerse) {
                    verseItems.push({
                      reference: `${getBookName(r.book)} ${r.chapter}:${v}`,
                      text: dbVerse.text,
                    })
                  }
                }
              }
            } catch (e) {
              console.error("[Notes] Failed to load verse text:", e)
            }
          }
          return { note, references: refs, verseItems }
        }),
      )

      results.sort((a, b) => {
        const rA = a.references[0]
        const rB = b.references[0]
        if (!rA || !rB) return 0
        if (rA.bible !== rB.bible) return rA.bible.localeCompare(rB.bible)
        if (rA.book !== rB.book) return rA.book.localeCompare(rB.book)
        if (rA.chapter !== rB.chapter) return rA.chapter - rB.chapter
        return rA.verseStart - rB.verseStart
      })

      setEntries(results)
    } catch (e) {
      console.error("[Notes] Failed to load all notes:", e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        loadEntries()
      }, 0)
      return () => clearTimeout(timer)
    }
  }, [open, loadEntries])

  return { entries, loading, reload: loadEntries }
}
