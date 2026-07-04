"use client"

import { useCallback } from "react"
import { database } from "@/lib/database/database"
import { useHighlightsContext } from "../context/highlights-context"

export function useHighlightMutations() {
  const { refresh } = useHighlightsContext()

  const createHighlight = useCallback(
    async (input: {
      color: string
      book: string
      chapter: number
      verses: number[]
      bible: string
      categoryId?: string | null
      noteId?: string | null
    }) => {
      const h = await database.highlights.create({
        color: input.color,
        categoryId: input.categoryId ?? null,
        noteId: input.noteId ?? null,
      })

      for (const verse of input.verses) {
        await database.highlightVerses.add({
          highlightId: h.id,
          book: input.book,
          chapter: input.chapter,
          verse,
          bible: input.bible,
        })
      }

      await refresh()
      return h
    },
    [refresh]
  )

  const updateHighlight = useCallback(
    async (id: string, patch: { color?: string; categoryId?: string | null }) => {
      await database.highlights.update(id, patch)
      await refresh()
    },
    [refresh]
  )

  const deleteHighlight = useCallback(
    async (id: string) => {
      await database.highlights.delete(id)
      await refresh()
    },
    [refresh]
  )

  const createCategory = useCallback(async (name: string) => {
    return database.highlightCategories.create(name)
  }, [])

  const listCategories = useCallback(async () => {
    return database.highlightCategories.list()
  }, [])

  return { createHighlight, updateHighlight, deleteHighlight, createCategory, listCategories }
}
