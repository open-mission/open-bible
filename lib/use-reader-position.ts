"use client"

import { useState, useEffect } from "react"

const BOOK_KEY = "openbible:book"
const CHAPTER_KEY = "openbible:chapter"
const READER_MODE_KEY = "openbible:reader-mode"
const FONT_SIZE_KEY = "openbible:font-size"
const VERSE_SPACING_KEY = "openbible:verse-spacing"

export function useReaderPosition() {
  const [selectedBookId, setSelectedBookId] = useState<string | null>("gen")
  const [selectedChapter, setSelectedChapter] = useState<number | null>(1)
  const [readerMode, setReaderMode] = useState<"narrow" | "medium" | "wide">("medium")
  const [fontSize, setFontSize] = useState<number>(20)
  const [verseSpacing, setVerseSpacing] = useState<"small" | "medium" | "large">("medium")

  useEffect(() => {
    try {
      const book = localStorage.getItem(BOOK_KEY)
      const chapter = localStorage.getItem(CHAPTER_KEY)
      const mode = localStorage.getItem(READER_MODE_KEY)
      const storedFontSize = localStorage.getItem(FONT_SIZE_KEY)
      const storedSpacing = localStorage.getItem(VERSE_SPACING_KEY)
      if (book) setSelectedBookId(book)
      if (chapter) setSelectedChapter(Number(chapter))
      if (mode === "narrow" || mode === "medium" || mode === "wide") {
        setReaderMode(mode)
      } else if (mode === "readable") {
        setReaderMode("narrow")
      }
      if (storedFontSize) setFontSize(Number(storedFontSize))
      if (storedSpacing === "small" || storedSpacing === "medium" || storedSpacing === "large") {
        setVerseSpacing(storedSpacing)
      }
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

  useEffect(() => {
    try { localStorage.setItem(FONT_SIZE_KEY, String(fontSize)) } catch { /* ignore */ }
  }, [fontSize])

  useEffect(() => {
    try { localStorage.setItem(VERSE_SPACING_KEY, verseSpacing) } catch { /* ignore */ }
  }, [verseSpacing])

  return {
    selectedBookId, setSelectedBookId,
    selectedChapter, setSelectedChapter,
    readerMode, setReaderMode,
    fontSize, setFontSize,
    verseSpacing, setVerseSpacing,
  }
}

