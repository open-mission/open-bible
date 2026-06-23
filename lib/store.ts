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

export function useHighlights() {
  const [highlights, setHighlights] = useState<Highlight[]>([])

  useEffect(() => {
    setHighlights(loadFromStorage<Highlight[]>(HIGHLIGHTS_KEY, []))
  }, [])

  const addHighlight = useCallback((verseId: string, color: HighlightColor) => {
    setHighlights((prev) => {
      // Remove any existing highlight for this verse
      const filtered = prev.filter((h) => h.verseId !== verseId)
      const next: Highlight[] = [
        ...filtered,
        {
          id: `${verseId}-${Date.now()}`,
          verseId,
          color,
          createdAt: new Date().toISOString(),
        },
      ]
      saveToStorage(HIGHLIGHTS_KEY, next)
      return next
    })
  }, [])

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

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>([])

  useEffect(() => {
    setNotes(loadFromStorage<Note[]>(NOTES_KEY, []))
  }, [])

  const upsertNote = useCallback((verseId: string, content: string) => {
    setNotes((prev) => {
      const existing = prev.find((n) => n.verseId === verseId)
      let next: Note[]
      if (existing) {
        next = prev.map((n) =>
          n.verseId === verseId ? { ...n, content, updatedAt: new Date().toISOString() } : n
        )
      } else {
        const now = new Date().toISOString()
        next = [
          ...prev,
          { id: `note-${verseId}-${Date.now()}`, verseId, content, createdAt: now, updatedAt: now },
        ]
      }
      saveToStorage(NOTES_KEY, next)
      return next
    })
  }, [])

  const deleteNote = useCallback((verseId: string) => {
    setNotes((prev) => {
      const next = prev.filter((n) => n.verseId !== verseId)
      saveToStorage(NOTES_KEY, next)
      return next
    })
  }, [])

  const getNote = useCallback(
    (verseId: string): Note | undefined => {
      return notes.find((n) => n.verseId === verseId)
    },
    [notes]
  )

  return { notes, upsertNote, deleteNote, getNote }
}
