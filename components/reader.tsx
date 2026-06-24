"use client"

import { useState, useRef, useEffect } from "react"
import { ChevronLeft, ChevronRight, CheckSquare, Loader2 } from "lucide-react"
import { getBook } from "@/lib/bible-data"
import { useHighlights, useNotes } from "@/lib/store"
import { useBibleVerses } from "@/lib/use-bible"
import { useBibleVersion } from "@/lib/bible-version-context"
import type { HighlightColor } from "@/lib/types"
import { VerseRow } from "./verse-row"
import { HighlightToolbar } from "./highlight-toolbar"
import { ReaderVersionBadge } from "./reader-version-badge"

interface ReaderProps {
  bookId: string
  chapter: number
  onChapterChange: (chapter: number) => void
  onBack: () => void
  onOpenNoteEditor?: (verseIds: string[], noteId: string | null) => void
}

export function Reader({ bookId, chapter, onChapterChange, onBack, onOpenNoteEditor }: ReaderProps) {
  const book = getBook(bookId)
  const { verses, loading } = useBibleVerses(bookId, chapter)
  const { addHighlight, removeHighlight, getHighlight } = useHighlights()
  const { getNote } = useNotes()
  const { versionId } = useBibleVersion()

  const [activeVerseId, setActiveVerseId] = useState<string | null>(null)
  const [selectedVerseIds, setSelectedVerseIds] = useState<Set<string>>(new Set())
  const [multiSelectMode, setMultiSelectMode] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setActiveVerseId(null)
    setSelectedVerseIds(new Set())
  }, [bookId, chapter])

  if (!book) return null

  const activeVerse = verses.find((v) => v.id === activeVerseId) ?? null

  const showToolbar = multiSelectMode
    ? selectedVerseIds.size > 0
    : activeVerse !== null

  const toolbarVerseRef = activeVerse
    ? `${book.abbreviation} ${chapter}:${activeVerse.verse}`
    : ""

  const activeHighlight = activeVerse ? getHighlight(activeVerse.id) : undefined

  function handleVerseClick(verseId: string) {
    if (multiSelectMode) {
      setSelectedVerseIds((prev) => {
        const next = new Set(prev)
        if (next.has(verseId)) {
          next.delete(verseId)
        } else {
          next.add(verseId)
        }
        return next
      })
      return
    }
    setActiveVerseId((prev) => (prev === verseId ? null : verseId))
  }

  function toggleMultiSelect() {
    setMultiSelectMode((v) => !v)
    setSelectedVerseIds(new Set())
    setActiveVerseId(null)
  }

  function handleHighlight(color: HighlightColor, customHex?: string) {
    const ids = multiSelectMode ? Array.from(selectedVerseIds) : activeVerseId ? [activeVerseId] : []
    ids.forEach((id) => addHighlight(id, color, versionId, customHex))
  }

  function handleRemoveHighlight() {
    const ids = multiSelectMode ? Array.from(selectedVerseIds) : activeVerseId ? [activeVerseId] : []
    ids.forEach((id) => removeHighlight(id))
  }

  function handleOpenNote() {
    const ids = multiSelectMode
      ? Array.from(selectedVerseIds)
      : activeVerseId
      ? [activeVerseId]
      : []
    if (ids.length === 0) return
    onOpenNoteEditor?.(ids, null)
    setActiveVerseId(null)
  }

  function handleCloseToolbar() {
    setActiveVerseId(null)
    if (multiSelectMode) {
      setSelectedVerseIds(new Set())
    }
  }

  function prevChapter() {
    if (chapter > 1) {
      onChapterChange(chapter - 1)
    }
  }

  function nextChapter() {
    if (chapter < book!.chapters) {
      onChapterChange(chapter + 1)
    }
  }

  return (
    <div className="flex h-full">
      {/* Main reading pane */}
      <div className="flex flex-1 flex-col min-w-0 h-full">
        {/* Chapter header */}
        <div className="flex items-center justify-between border-b border-border px-4 py-3 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={onBack}
              className="flex md:hidden items-center justify-center w-7 h-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              aria-label="Abrir menu"
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

          <div className="flex items-center gap-2">
            <button
              onClick={toggleMultiSelect}
              aria-label={multiSelectMode ? "Sair da seleção múltipla" : "Selecionar múltiplos versículos"}
              aria-pressed={multiSelectMode}
              title={multiSelectMode ? "Sair da seleção múltipla" : "Selecionar múltiplos versículos"}
              className={`flex items-center justify-center w-8 h-8 rounded-md transition-colors ${
                multiSelectMode
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              <CheckSquare className="h-4 w-4" />
            </button>

            <ReaderVersionBadge />

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
        </div>

        {/* Multi-select hint bar */}
        {multiSelectMode && (
          <div className="flex items-center justify-between bg-primary/10 border-b border-primary/20 px-4 py-1.5 shrink-0">
            <span className="text-xs text-primary font-medium">
              {selectedVerseIds.size === 0
                ? "Clique nos versículos para selecionar"
                : `${selectedVerseIds.size} versículo${selectedVerseIds.size > 1 ? "s" : ""} selecionado${selectedVerseIds.size > 1 ? "s" : ""}`}
            </span>
            <button
              onClick={() => setSelectedVerseIds(new Set())}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Limpar
            </button>
          </div>
        )}

        {/* Verses */}
        <div ref={containerRef} className="flex-1 overflow-y-auto py-4">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            verses.map((verse) => (
              <VerseRow
                key={verse.id}
                verse={verse}
                highlight={getHighlight(verse.id)}
                note={getNote(verse.id)}
                isActive={verse.id === activeVerseId}
                isSelected={selectedVerseIds.has(verse.id)}
                onClick={() => handleVerseClick(verse.id)}
              />
            ))
          )}

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

        {/* Floating toolbar at bottom */}
        {showToolbar && (
          <div className="flex justify-center px-4 pb-3 shrink-0 border-t border-border pt-2 bg-card/95 backdrop-blur-sm">
            <HighlightToolbar
              verseRef={toolbarVerseRef}
              selectionCount={multiSelectMode ? selectedVerseIds.size : 1}
              activeHighlight={multiSelectMode ? undefined : activeHighlight}
              onHighlight={handleHighlight}
              onRemoveHighlight={handleRemoveHighlight}
              onOpenNote={handleOpenNote}
              onClose={handleCloseToolbar}
            />
          </div>
        )}
      </div>

    </div>
  )
}
