"use client"

import { useState } from "react"
import { BookOpen, FileText, Highlighter, X, ChevronRight } from "lucide-react"
import { BookList } from "./book-list"
import { ChapterGrid } from "./chapter-grid"
import { useNotes, useHighlights } from "@/lib/store"
import { getBook, getVerses } from "@/lib/bible-data"
import type { HighlightColor } from "@/lib/types"

type SidebarTab = "bible" | "notes" | "highlights"
type BiblePane = "books" | "chapters"

const HIGHLIGHT_HEX: Record<HighlightColor, string> = {
  amber: "#f5c842",
  green: "#6aba7a",
  blue:  "#6aabd2",
  rose:  "#e87b8c",
}

const HIGHLIGHT_LABEL: Record<HighlightColor, string> = {
  amber: "Amarelo",
  green: "Verde",
  blue:  "Azul",
  rose:  "Rosa",
}

interface SidebarProps {
  selectedBookId: string | null
  selectedChapter: number | null
  onSelectBook: (bookId: string) => void
  onSelectChapter: (chapter: number) => void
  // mobile
  isOpen: boolean
  onClose: () => void
  // jump to passage from notes
  onJumpTo: (bookId: string, chapter: number) => void
}

export function Sidebar({
  selectedBookId,
  selectedChapter,
  onSelectBook,
  onSelectChapter,
  isOpen,
  onClose,
  onJumpTo,
}: SidebarProps) {
  const [tab, setTab] = useState<SidebarTab>("bible")
  const [biblePane, setBiblePane] = useState<BiblePane>("books")
  const { notes } = useNotes()
  const { highlights } = useHighlights()

  function handleSelectBook(bookId: string) {
    onSelectBook(bookId)
    setBiblePane("chapters")
  }

  function handleSelectChapter(chapter: number) {
    onSelectChapter(chapter)
    onClose() // close sidebar on mobile after picking chapter
  }

  function handleBackToBooks() {
    setBiblePane("books")
  }

  // Resolve highlight metadata for display
  const highlightsWithMeta = highlights
    .map((h) => {
      const [, bookId, chapterStr, verseStr] = h.verseId.match(/^(.+)-(\d+)-(\d+)$/) ?? []
      if (!bookId) return null
      const book = getBook(bookId)
      if (!book) return null
      const chapter = parseInt(chapterStr, 10)
      const verse = parseInt(verseStr, 10)
      const verseData = getVerses(bookId, chapter).find((v) => v.verse === verse)
      return { highlight: h, book, chapter, verse, verseText: verseData?.text ?? "" }
    })
    .filter(Boolean)
    .sort((a, b) => new Date(b!.highlight.createdAt).getTime() - new Date(a!.highlight.createdAt).getTime())

  // Resolve note metadata for display
  const notesWithMeta = notes
    .map((note) => {
      const [, bookId, chapterStr, verseStr] = note.verseId.match(/^(.+)-(\d+)-(\d+)$/) ?? []
      if (!bookId) return null
      const book = getBook(bookId)
      if (!book) return null
      const chapter = parseInt(chapterStr, 10)
      const verse = parseInt(verseStr, 10)
      const verseData = getVerses(bookId, chapter).find((v) => v.verse === verse)
      return { note, book, chapter, verse, verseText: verseData?.text ?? "" }
    })
    .filter(Boolean)
    .sort(
      (a, b) =>
        new Date(b!.note.updatedAt).getTime() - new Date(a!.note.updatedAt).getTime()
    )

  const content = (
    <div className="flex h-full flex-col bg-sidebar">
      {/* Tab bar */}
      <div className="flex items-center border-b border-sidebar-border shrink-0">
        <button
          onClick={() => setTab("bible")}
          aria-selected={tab === "bible"}
          role="tab"
          className={`flex flex-1 items-center justify-center gap-1.5 py-3 text-xs font-medium transition-colors border-b-2 ${
            tab === "bible"
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <BookOpen className="h-3.5 w-3.5" />
          Bíblia
        </button>
        <button
          onClick={() => setTab("highlights")}
          aria-selected={tab === "highlights"}
          role="tab"
          className={`flex flex-1 items-center justify-center gap-1.5 py-3 text-xs font-medium transition-colors border-b-2 ${
            tab === "highlights"
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Highlighter className="h-3.5 w-3.5" />
          Destaques
          {highlights.length > 0 && (
            <span className="ml-0.5 rounded-full bg-accent text-accent-foreground px-1.5 py-px text-[10px] font-semibold leading-none">
              {highlights.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setTab("notes")}
          aria-selected={tab === "notes"}
          role="tab"
          className={`flex flex-1 items-center justify-center gap-1.5 py-3 text-xs font-medium transition-colors border-b-2 ${
            tab === "notes"
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <FileText className="h-3.5 w-3.5" />
          Notas
          {notes.length > 0 && (
            <span className="ml-0.5 rounded-full bg-accent text-accent-foreground px-1.5 py-px text-[10px] font-semibold leading-none">
              {notes.length}
            </span>
          )}
        </button>

        {/* Mobile close button */}
        <button
          onClick={onClose}
          aria-label="Fechar menu"
          className="md:hidden flex items-center justify-center w-10 h-10 text-muted-foreground hover:text-foreground transition-colors shrink-0"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {tab === "bible" && (
          <>
            {biblePane === "books" || !selectedBookId ? (
              <BookList
                selectedBookId={selectedBookId}
                onSelectBook={handleSelectBook}
              />
            ) : (
              <ChapterGrid
                bookId={selectedBookId}
                selectedChapter={selectedChapter}
                onSelectChapter={handleSelectChapter}
                onBack={handleBackToBooks}
              />
            )}
          </>
        )}

        {tab === "highlights" && (
          <div className="flex-1 overflow-y-auto">
            {highlightsWithMeta.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-3 px-6 py-12">
                <Highlighter className="h-8 w-8 text-muted-foreground/30" />
                <p className="text-center text-sm text-muted-foreground leading-relaxed">
                  Nenhum destaque ainda. Clique em um versículo para destacar.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {highlightsWithMeta.map((item) => {
                  if (!item) return null
                  const { highlight, book, chapter, verse, verseText } = item
                  const ref = `${book.abbreviation} ${chapter}:${verse}`
                  return (
                    <li key={highlight.id}>
                      <button
                        onClick={() => {
                          onJumpTo(book.id, chapter)
                          onClose()
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-sidebar-accent transition-colors group"
                        style={{ borderLeft: `3px solid ${HIGHLIGHT_HEX[highlight.color]}` }}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-1.5">
                            <span
                              className="inline-block w-2 h-2 rounded-full shrink-0"
                              style={{ backgroundColor: HIGHLIGHT_HEX[highlight.color] }}
                              aria-label={HIGHLIGHT_LABEL[highlight.color]}
                            />
                            <span className="text-xs font-mono font-medium text-primary">
                              {ref}
                            </span>
                          </div>
                          <ChevronRight className="h-3 w-3 text-muted-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        {verseText && (
                          <p className="text-xs text-muted-foreground line-clamp-2 font-serif leading-snug"
                            style={{ backgroundColor: `${HIGHLIGHT_HEX[highlight.color]}33`, borderRadius: 3, padding: "2px 4px" }}>
                            {verseText}
                          </p>
                        )}
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        )}

        {tab === "notes" && (
          <div className="flex-1 overflow-y-auto">
            {notesWithMeta.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-3 px-6 py-12">
                <FileText className="h-8 w-8 text-muted-foreground/30" />
                <p className="text-center text-sm text-muted-foreground leading-relaxed">
                  Nenhuma anotação ainda. Clique em um versículo para adicionar notas.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {notesWithMeta.map((item) => {
                  if (!item) return null
                  const { note, book, chapter, verse, verseText } = item
                  const ref = `${book.abbreviation} ${chapter}:${verse}`
                  const date = new Date(note.updatedAt).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "short",
                  })
                  // Check if this verse also has a highlight
                  const verseHighlight = highlights.find((h) => h.verseId === note.verseId)
                  return (
                    <li key={note.id}>
                      <button
                        onClick={() => {
                          onJumpTo(book.id, chapter)
                          onClose()
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-sidebar-accent transition-colors group"
                        style={verseHighlight ? { borderLeft: `3px solid ${HIGHLIGHT_HEX[verseHighlight.color]}` } : undefined}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-1.5">
                            {verseHighlight && (
                              <span
                                className="inline-block w-2 h-2 rounded-full shrink-0"
                                style={{ backgroundColor: HIGHLIGHT_HEX[verseHighlight.color] }}
                                aria-label={`Destaque ${HIGHLIGHT_LABEL[verseHighlight.color]}`}
                                title={`Destaque: ${HIGHLIGHT_LABEL[verseHighlight.color]}`}
                              />
                            )}
                            <span className="text-xs font-mono font-medium text-primary">
                              {ref}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-muted-foreground/60">
                            <span className="text-[10px]">{date}</span>
                            <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </div>
                        {verseText && (
                          <p className="text-xs text-muted-foreground line-clamp-1 font-serif leading-snug mb-1.5">
                            {verseText}
                          </p>
                        )}
                        <p className="text-xs text-foreground line-clamp-2 leading-relaxed">
                          {note.content}
                        </p>
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 shrink-0 border-r border-border h-full flex-col overflow-hidden">
        {content}
      </aside>

      {/* Mobile drawer overlay */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-foreground/20 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />
          {/* Drawer panel */}
          <div className="relative z-50 w-72 h-full flex flex-col shadow-xl">
            {content}
          </div>
        </div>
      )}
    </>
  )
}
