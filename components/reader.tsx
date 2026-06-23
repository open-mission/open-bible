"use client"

import { useState, useRef } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { getBook, getVerses } from "@/lib/bible-data"
import { useHighlights, useNotes } from "@/lib/store"
import type { HighlightColor } from "@/lib/types"
import { VerseRow } from "./verse-row"
import { HighlightToolbar } from "./highlight-toolbar"
import { NotesPanel } from "./notes-panel"

interface ReaderProps {
  bookId: string
  chapter: number
  onChapterChange: (chapter: number) => void
  onBack: () => void
}

export function Reader({ bookId, chapter, onChapterChange, onBack }: ReaderProps) {
  const book = getBook(bookId)
  const verses = getVerses(bookId, chapter)
  const { addHighlight, removeHighlight, getHighlight } = useHighlights()
  const { upsertNote, deleteNote, getNote } = useNotes()

  const [activeVerseId, setActiveVerseId] = useState<string | null>(null)
  const [noteVerseId, setNoteVerseId] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  if (!book) return null

  const activeVerse = verses.find((v) => v.id === activeVerseId) ?? null
  const noteVerse = verses.find((v) => v.id === noteVerseId) ?? null

  function handleVerseClick(verseId: string) {
    // Toggle: clicking the same verse deselects
    setActiveVerseId((prev) => (prev === verseId ? null : verseId))
    setNoteVerseId(null)
  }

  function handleHighlight(color: HighlightColor) {
    if (!activeVerseId) return
    addHighlight(activeVerseId, color)
  }

  function handleRemoveHighlight() {
    if (!activeVerseId) return
    removeHighlight(activeVerseId)
  }

  function handleOpenNote() {
    if (!activeVerseId) return
    setNoteVerseId(activeVerseId)
    setActiveVerseId(null)
  }

  function handleCloseNote() {
    setNoteVerseId(null)
  }

  function handleCloseToolbar() {
    setActiveVerseId(null)
  }

  function prevChapter() {
    if (chapter > 1) {
      onChapterChange(chapter - 1)
      setActiveVerseId(null)
      setNoteVerseId(null)
    }
  }

  function nextChapter() {
    if (chapter < book!.chapters) {
      onChapterChange(chapter + 1)
      setActiveVerseId(null)
      setNoteVerseId(null)
    }
  }

  const activeVerseRef = activeVerse
    ? `${book.abbreviation} ${chapter}:${activeVerse.verse}`
    : ""

  return (
    <div className="flex h-full">
      {/* Main reading pane */}
      <div className="flex flex-1 flex-col min-w-0 h-full">
        {/* Chapter header */}
        <div className="flex items-center justify-between border-b border-border px-4 py-3 shrink-0">
          <div className="flex items-center gap-2">
            {/* Mobile back button */}
            <button
              onClick={onBack}
              className="flex md:hidden items-center justify-center w-7 h-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              aria-label="Voltar"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div>
              <h2 className="font-serif text-base font-semibold text-foreground leading-tight">
                {book.name}
              </h2>
              <p className="text-xs text-muted-foreground leading-tight">
                Capítulo {chapter}
              </p>
            </div>
          </div>

          {/* Chapter navigation */}
          <div className="flex items-center gap-1">
            <button
              onClick={prevChapter}
              disabled={chapter <= 1}
              aria-label="Capítulo anterior"
              className="flex items-center justify-center w-8 h-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="w-12 text-center text-sm font-mono text-muted-foreground">
              {chapter}/{book.chapters}
            </span>
            <button
              onClick={nextChapter}
              disabled={chapter >= book.chapters}
              aria-label="Próximo capítulo"
              className="flex items-center justify-center w-8 h-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Floating toolbar */}
        {activeVerse && (
          <div className="flex justify-center pt-2 px-4 shrink-0 z-10">
            <HighlightToolbar
              verseRef={activeVerseRef}
              activeHighlight={getHighlight(activeVerse.id)}
              onHighlight={handleHighlight}
              onRemoveHighlight={handleRemoveHighlight}
              onOpenNote={handleOpenNote}
              onClose={handleCloseToolbar}
            />
          </div>
        )}

        {/* Verses */}
        <div ref={containerRef} className="flex-1 overflow-y-auto py-4 px-2">
          {verses.map((verse) => (
            <VerseRow
              key={verse.id}
              verse={verse}
              highlight={getHighlight(verse.id)}
              note={getNote(verse.id)}
              isActive={verse.id === activeVerseId}
              onClick={() => handleVerseClick(verse.id)}
            />
          ))}

          {/* Chapter navigation footer */}
          <div className="flex items-center justify-between mt-8 px-4">
            <button
              onClick={prevChapter}
              disabled={chapter <= 1}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4" />
              Capítulo {chapter - 1}
            </button>
            <button
              onClick={nextChapter}
              disabled={chapter >= book.chapters}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Capítulo {chapter + 1}
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Notes panel — slide in on the right */}
      {noteVerse && (
        <div className="w-80 shrink-0 border-l border-border bg-card flex flex-col h-full">
          <NotesPanel
            verse={noteVerse}
            note={getNote(noteVerse.id)}
            onSave={(content) => upsertNote(noteVerse.id, content)}
            onDelete={() => deleteNote(noteVerse.id)}
            onClose={handleCloseNote}
          />
        </div>
      )}
    </div>
  )
}
