"use client"

import { useState, useEffect } from "react"

/**
 * Global reader display settings (font size, reader mode, verse spacing,
 * font family). These are shared preferences applied to every pane — only
 * book/chapter/version are per-pane. Uses the SAME localStorage keys as the
 * classic `useReaderPosition` hook so settings stay in sync when the user
 * switches between Simple and Advanced modes.
 */
export type ReaderMode = "narrow" | "medium" | "wide"
export type VerseSpacing = "small" | "medium" | "large"
export type ReaderFont = "sans" | "serif" | "mono"

const READER_MODE_KEY = "openbible:reader-mode"
const FONT_SIZE_KEY = "openbible:font-size"
const VERSE_SPACING_KEY = "openbible:verse-spacing"
const READER_FONT_KEY = "openbible:reader-font"

export function useReaderSettings() {
  const [readerMode, setReaderMode] = useState<ReaderMode>("medium")
  const [fontSize, setFontSize] = useState<number>(20)
  const [verseSpacing, setVerseSpacing] = useState<VerseSpacing>("medium")
  const [readerFont, setReaderFont] = useState<ReaderFont>("serif")

  useEffect(() => {
    try {
      const mode = localStorage.getItem(READER_MODE_KEY)
      const storedFontSize = localStorage.getItem(FONT_SIZE_KEY)
      const storedSpacing = localStorage.getItem(VERSE_SPACING_KEY)
      const storedFont = localStorage.getItem(READER_FONT_KEY)

      const timer = setTimeout(() => {
        if (mode === "narrow" || mode === "medium" || mode === "wide") {
          setReaderMode(mode)
        } else if (mode === "readable") {
          setReaderMode("narrow")
        }
        if (storedFontSize) setFontSize(Number(storedFontSize))
        if (
          storedSpacing === "small" ||
          storedSpacing === "medium" ||
          storedSpacing === "large"
        ) {
          setVerseSpacing(storedSpacing)
        }
        if (storedFont === "sans" || storedFont === "serif" || storedFont === "mono") {
          setReaderFont(storedFont)
        }
      }, 0)
      return () => clearTimeout(timer)
    } catch {
      /* ignore */
    }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(READER_MODE_KEY, readerMode)
    } catch {
      /* ignore */
    }
  }, [readerMode])

  useEffect(() => {
    try {
      localStorage.setItem(FONT_SIZE_KEY, String(fontSize))
    } catch {
      /* ignore */
    }
  }, [fontSize])

  useEffect(() => {
    try {
      localStorage.setItem(VERSE_SPACING_KEY, verseSpacing)
    } catch {
      /* ignore */
    }
  }, [verseSpacing])

  useEffect(() => {
    try {
      localStorage.setItem(READER_FONT_KEY, readerFont)
    } catch {
      /* ignore */
    }
  }, [readerFont])

  return {
    readerMode,
    setReaderMode,
    fontSize,
    setFontSize,
    verseSpacing,
    setVerseSpacing,
    readerFont,
    setReaderFont,
  }
}
