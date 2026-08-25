"use client"

import { useState, useEffect, useCallback } from "react"
import { database } from "@/lib/database/database"
import { isOpfsAvailable } from "@/lib/opfs-available"
import { useHighlightsContext } from "../context/highlights-context"
import { getBookName } from "@/lib/books"
import type { Highlight, HighlightVerse, HighlightCategory } from "@/lib/database/user/schema"

export interface AllHighlightsSheetVerseItem {
  reference: string
  text: string
}

export interface AllHighlightEntry {
  highlight: Highlight
  category: HighlightCategory | null
  verses: HighlightVerse[]
  verseItems: AllHighlightsSheetVerseItem[]
}

export function sortHighlightEntries(entries: AllHighlightEntry[]): AllHighlightEntry[] {
  return [...entries].sort(
    (a, b) => b.highlight.updatedAt.getTime() - a.highlight.updatedAt.getTime(),
  )
}

export function removeHighlightFromEntries(entries: AllHighlightEntry[], id: string): AllHighlightEntry[] {
  return entries.filter((entry) => entry.highlight.id !== id)
}

export function buildHighlightRestoreInput(entry: AllHighlightEntry) {
  return {
    highlight: {
      color: entry.highlight.color,
      content: entry.highlight.content,
      categoryId: entry.highlight.categoryId,
      noteId: entry.highlight.noteId,
    },
    verses: entry.verses.map((verse) => ({
      book: verse.book,
      chapter: verse.chapter,
      verse: verse.verse,
      bible: verse.bible,
    })),
  }
}

export function useAllHighlights(open: boolean) {
  const [entries, setEntries] = useState<AllHighlightEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { refresh: refreshContext } = useHighlightsContext()

  const loadEntries = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      if (!isOpfsAvailable()) {
        throw new Error("Este ambiente não suporta armazenamento offline (OPFS).")
      }
      await database.initialize()
      const allHighlights = await database.highlights.findAll()
      const results: AllHighlightEntry[] = await Promise.all(
        allHighlights.map(async (h) => {
          const verses = await database.highlightVerses.findByHighlightId(h.id)
          let category: HighlightCategory | null = null
          if (h.categoryId) {
            category = await database.highlightCategories.findById(h.categoryId)
          }

          // Load verse items (text + reference)
          const verseItems: AllHighlightsSheetVerseItem[] = []
          if (verses.length > 0) {
            try {
              const first = verses[0]
              const bibleDb = await database.openBible(first.bible)
              const chapterVerses = await bibleDb.getChapterVerses(
                first.book,
                first.chapter
              )
              const sortedVerses = [...verses].sort((a, b) => a.verse - b.verse)

              for (const v of sortedVerses) {
                const dbVerse = chapterVerses.find((cv) => cv.verse === v.verse)
                if (dbVerse) {
                  const bookName = getBookName(v.book)
                  verseItems.push({
                    reference: `${bookName} ${v.chapter}:${v.verse}`,
                    text: dbVerse.text,
                  })
                }
              }
            } catch (e) {
              console.error("Failed to load verse text inside hook:", e)
            }
          }

          return { highlight: h, category, verses, verseItems }
        })
      )

      // Sort highlights by book, chapter, and verse range
      setEntries(sortHighlightEntries(results))
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não foi possível carregar os destaques.")
      console.error("Failed to load all highlights:", e)
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

  const deleteHighlight = useCallback(async (id: string) => {
    try {
      await database.initialize()
      await database.highlights.delete(id)
      await refreshContext()
      setEntries((prev) => removeHighlightFromEntries(prev, id))
      return true
    } catch (e) {
      console.error("Failed to delete highlight:", e)
      return false
    }
  }, [refreshContext])

  const restoreHighlight = useCallback(async (entry: AllHighlightEntry) => {
    try {
      await database.initialize()
      const restoreInput = buildHighlightRestoreInput(entry)
      const restored = await database.highlights.create(restoreInput.highlight)
      for (const verse of restoreInput.verses) {
        await database.highlightVerses.add({
          highlightId: restored.id,
          ...verse,
        })
      }
      await refreshContext()
      await loadEntries()
      return true
    } catch (e) {
      console.error("Failed to restore highlight:", e)
      return false
    }
  }, [loadEntries, refreshContext])

  return {
    entries,
    loading,
    error,
    deleteHighlight,
    restoreHighlight,
    reload: loadEntries,
  }
}
