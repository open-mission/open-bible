"use client"

import { useState, useEffect, useCallback } from "react"
import { database } from "@/lib/database/database"
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

export function useAllHighlights(open: boolean) {
  const [entries, setEntries] = useState<AllHighlightEntry[]>([])
  const [loading, setLoading] = useState(false)
  const { refresh: refreshContext } = useHighlightsContext()

  const loadEntries = useCallback(async () => {
    setLoading(true)
    try {
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
      results.sort((a, b) => {
        const vA = a.verses[0]
        const vB = b.verses[0]
        if (!vA || !vB) return 0
        if (vA.book !== vB.book) return vA.book.localeCompare(vB.book)
        if (vA.chapter !== vB.chapter) return vA.chapter - vB.chapter
        return vA.verse - vB.verse
      })

      setEntries(results)
    } catch (e) {
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
      setEntries((prev) => prev.filter((item) => item.highlight.id !== id))
      return true
    } catch (e) {
      console.error("Failed to delete highlight:", e)
      return false
    }
  }, [refreshContext])

  return {
    entries,
    loading,
    deleteHighlight,
    reload: loadEntries,
  }
}
