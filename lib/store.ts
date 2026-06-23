"use client"

import { useState, useEffect, useCallback } from "react"
import type { Highlight, HighlightColor, Note } from "./types"

const HIGHLIGHTS_KEY = "openbible:highlights"
const NOTES_KEY = "openbible:notes"

function loadFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function saveToStorage<T>(key: string, value: T): void {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // ignore
  }
}

// ---------------------------------------------------------------------------
// Highlights
// ---------------------------------------------------------------------------

export function useHighlights() {
  const [highlights, setHighlights] = useState<Highlight[]>([])

  useEffect(() => {
    setHighlights(loadFromStorage<Highlight[]>(HIGHLIGHTS_KEY, []))
  }, [])

  const addHighlight = useCallback(
    (verseId: string, color: HighlightColor, customHex?: string) => {
      setHighlights((prev) => {
        const filtered = prev.filter((h) => h.verseId !== verseId)
        const next: Highlight[] = [
          ...filtered,
          {
            id: `${verseId}-${Date.now()}`,
            verseId,
            color,
            ...(color === "custom" && customHex ? { customHex } : {}),
            createdAt: new Date().toISOString(),
          },
        ]
        saveToStorage(HIGHLIGHTS_KEY, next)
        return next
      })
    },
    []
  )

  const removeHighlight = useCallback((verseId: string) => {
    setHighlights((prev) => {
      const next = prev.filter((h) => h.verseId !== verseId)
      saveToStorage(HIGHLIGHTS_KEY, next)
      return next
    })
  }, [])

  const getHighlight = useCallback(
    (verseId: string): Highlight | undefined => {
      return highlights.find((h) => h.verseId === verseId)
    },
    [highlights]
  )

  return { highlights, addHighlight, removeHighlight, getHighlight }
}

// ---------------------------------------------------------------------------
// Notes  — a note can reference multiple verses
// ---------------------------------------------------------------------------

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>([])

  useEffect(() => {
    // Migrate old notes that used a single `verseId` field
    const raw = loadFromStorage<unknown[]>(NOTES_KEY, [])
    const migrated: Note[] = raw.map((n: any) => ({
      ...n,
      verseIds: n.verseIds ?? (n.verseId ? [n.verseId] : []),
    }))
    setNotes(migrated)
  }, [])

  /** Create or update a note by ID. Pass verseIds=[] to keep existing ones. */
  const upsertNote = useCallback(
    (noteId: string | null, content: string, verseIds: string[]) => {
      setNotes((prev) => {
        const now = new Date().toISOString()
        let next: Note[]
        if (noteId) {
          const existing = prev.find((n) => n.id === noteId)
          if (existing) {
            next = prev.map((n) =>
              n.id === noteId
                ? {
                    ...n,
                    content,
                    verseIds: verseIds.length > 0 ? verseIds : n.verseIds,
                    updatedAt: now,
                  }
                : n
            )
          } else {
            // ID provided but not found — create new with that ID
            next = [
              ...prev,
              {
                id: noteId,
                verseIds,
                content,
                createdAt: now,
                updatedAt: now,
              },
            ]
          }
        } else {
          // New note
          next = [
            ...prev,
            {
              id: `note-${Date.now()}`,
              verseIds,
              content,
              createdAt: now,
              updatedAt: now,
            },
          ]
        }
        saveToStorage(NOTES_KEY, next)
        return next
      })
    },
    []
  )

  const deleteNote = useCallback((noteId: string) => {
    setNotes((prev) => {
      const next = prev.filter((n) => n.id !== noteId)
      saveToStorage(NOTES_KEY, next)
      return next
    })
  }, [])

  /** Get all notes that reference this verseId */
  const getNotesForVerse = useCallback(
    (verseId: string): Note[] => {
      return notes.filter((n) => n.verseIds.includes(verseId))
    },
    [notes]
  )

  /** Get the first note for a verse (for legacy single-note display) */
  const getNote = useCallback(
    (verseId: string): Note | undefined => {
      return notes.find((n) => n.verseIds.includes(verseId))
    },
    [notes]
  )

  return { notes, upsertNote, deleteNote, getNote, getNotesForVerse }
}
