"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import type { Highlight, HighlightColor, Note } from "./types"

const HIGHLIGHTS_KEY = "openbible:highlights"
const NOTES_KEY = "openbible:notes"

function migrateNotes(raw: unknown[]): Note[] {
  return raw.map((n: any) => ({
    ...n,
    verseIds: n.verseIds ?? (n.verseId ? [n.verseId] : []),
  }))
}

function makeId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

// ---------------------------------------------------------------------------
// Highlights
// ---------------------------------------------------------------------------

export function useHighlights() {
  const lastSaved = useRef("")
  const [highlights, setHighlights] = useState<Highlight[]>(() => {
    if (typeof window === "undefined") return []
    try {
      const raw = localStorage.getItem(HIGHLIGHTS_KEY)
      const data: Highlight[] = raw ? JSON.parse(raw) : []
      lastSaved.current = JSON.stringify(data)
      return data
    } catch {
      return []
    }
  })

  // Sync to localStorage when highlights change
  useEffect(() => {
    const json = JSON.stringify(highlights)
    if (json !== lastSaved.current) {
      lastSaved.current = json
      localStorage.setItem(HIGHLIGHTS_KEY, json)
      window.dispatchEvent(new CustomEvent("openbible:storage", { detail: { key: HIGHLIGHTS_KEY } }))
    }
  }, [highlights])

  // Listen for storage changes from other hook instances / tabs
  useEffect(() => {
    function handleStorage(e: CustomEvent) {
      if (!e.detail?.key || e.detail.key !== HIGHLIGHTS_KEY) return
      try {
        const raw = localStorage.getItem(HIGHLIGHTS_KEY)
        const loaded: Highlight[] = raw ? JSON.parse(raw) : []
        const json = JSON.stringify(loaded)
        if (json !== lastSaved.current) {
          lastSaved.current = json
          setHighlights(loaded)
        }
      } catch { /* ignore */ }
    }
    window.addEventListener("openbible:storage", handleStorage as EventListener)
    return () => window.removeEventListener("openbible:storage", handleStorage as EventListener)
  }, [])

  const addHighlight = useCallback(
    (verseId: string, color: HighlightColor, versionId?: string, customHex?: string) => {
      setHighlights((prev) => {
        const filtered = prev.filter((h) =>
          versionId
            ? !(h.verseId === verseId && h.versionId === versionId)
            : h.verseId !== verseId
        )
        return [
          ...filtered,
          {
            id: makeId(verseId),
            verseId,
            ...(versionId ? { versionId } : {}),
            color,
            ...(color === "custom" && customHex ? { customHex } : {}),
            createdAt: new Date().toISOString(),
          },
        ]
      })
    },
    []
  )

  const removeHighlight = useCallback((verseId: string) => {
    setHighlights((prev) => prev.filter((h) => h.verseId !== verseId))
  }, [])

  const getHighlight = useCallback(
    (verseId: string, versionId?: string): Highlight | undefined => {
      return highlights.find(
        (h) => h.verseId === verseId && (!versionId || !h.versionId || h.versionId === versionId)
      )
    },
    [highlights]
  )

  return { highlights, addHighlight, removeHighlight, getHighlight }
}

// ---------------------------------------------------------------------------
// Notes
// ---------------------------------------------------------------------------

export function useNotes() {
  const lastSaved = useRef("")
  const [notes, setNotes] = useState<Note[]>(() => {
    if (typeof window === "undefined") return []
    try {
      const raw = localStorage.getItem(NOTES_KEY)
      const data: unknown[] = raw ? JSON.parse(raw) : []
      const migrated = migrateNotes(data)
      lastSaved.current = JSON.stringify(migrated)
      return migrated
    } catch {
      return []
    }
  })

  // Sync to localStorage when notes change
  useEffect(() => {
    const json = JSON.stringify(notes)
    if (json !== lastSaved.current) {
      lastSaved.current = json
      localStorage.setItem(NOTES_KEY, json)
      window.dispatchEvent(new CustomEvent("openbible:storage", { detail: { key: NOTES_KEY } }))
    }
  }, [notes])

  // Listen for storage changes from other hook instances / tabs
  useEffect(() => {
    function handleStorage(e: CustomEvent) {
      if (!e.detail?.key || e.detail.key !== NOTES_KEY) return
      try {
        const raw = localStorage.getItem(NOTES_KEY)
        const data: unknown[] = raw ? JSON.parse(raw) : []
        const migrated = migrateNotes(data)
        const json = JSON.stringify(migrated)
        if (json !== lastSaved.current) {
          lastSaved.current = json
          setNotes(migrated)
        }
      } catch { /* ignore */ }
    }
    window.addEventListener("openbible:storage", handleStorage as EventListener)
    return () => window.removeEventListener("openbible:storage", handleStorage as EventListener)
  }, [])

  const upsertNote = useCallback(
    (noteId: string | null, content: string, verseIds: string[]) => {
      setNotes((prev) => {
        const now = new Date().toISOString()
        if (noteId) {
          const existing = prev.find((n) => n.id === noteId)
          if (existing) {
            return prev.map((n) =>
              n.id === noteId
                ? {
                    ...n,
                    content,
                    verseIds: verseIds.length > 0 ? verseIds : n.verseIds,
                    updatedAt: now,
                  }
                : n
            )
          }
          return [
            ...prev,
            { id: noteId, verseIds, content, createdAt: now, updatedAt: now },
          ]
        }
        return [
          ...prev,
          {
            id: makeId("note"),
            verseIds,
            content,
            createdAt: now,
            updatedAt: now,
          },
        ]
      })
    },
    []
  )

  const deleteNote = useCallback((noteId: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== noteId))
  }, [])

  const getNotesForVerse = useCallback(
    (verseId: string): Note[] => {
      return notes.filter((n) => n.verseIds.includes(verseId))
    },
    [notes]
  )

  const getNote = useCallback(
    (verseId: string): Note | undefined => {
      return notes.find((n) => n.verseIds.includes(verseId))
    },
    [notes]
  )

  return { notes, upsertNote, deleteNote, getNote, getNotesForVerse }
}
