"use client"

import { useState, useEffect } from "react"

const BOOK_KEY = "openbible:book"
const CHAPTER_KEY = "openbible:chapter"
const READER_MODE_KEY = "openbible:reader-mode"

export function useReaderPosition() {
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null)
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null)
  const [readerMode, setReaderMode] = useState<"wide" | "readable">("wide")

  useEffect(() => {
    try {
      const book = localStorage.getItem(BOOK_KEY)
      const chapter = localStorage.getItem(CHAPTER_KEY)
      const mode = localStorage.getItem(READER_MODE_KEY)
      if (book) setSelectedBookId(book)
      if (chapter) setSelectedChapter(Number(chapter))
      if (mode === "wide" || mode === "readable") setReaderMode(mode)
    } catch { /* ignore */ }
  }, [])

  useEffect(() => {
    if (selectedBookId) {
      try { localStorage.setItem(BOOK_KEY, selectedBookId) } catch { /* ignore */ }
    }
  }, [selectedBookId])

  useEffect(() => {
    if (selectedChapter !== null) {
      try { localStorage.setItem(CHAPTER_KEY, String(selectedChapter)) } catch { /* ignore */ }
    }
  }, [selectedChapter])

  useEffect(() => {
    try { localStorage.setItem(READER_MODE_KEY, readerMode) } catch { /* ignore */ }
  }, [readerMode])

  return {
    selectedBookId, setSelectedBookId,
    selectedChapter, setSelectedChapter,
    readerMode, setReaderMode,
  }
}
