"use client"

import { useState } from "react"
import { BookList } from "@/components/book-list"
import { ChapterGrid } from "@/components/chapter-grid"
import { Reader } from "@/components/reader"

type Panel = "books" | "chapters" | "reader"

export default function Home() {
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null)
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null)
  // Mobile panel navigation
  const [mobilePanel, setMobilePanel] = useState<Panel>("books")

  function handleSelectBook(bookId: string) {
    setSelectedBookId(bookId)
    setSelectedChapter(null)
    setMobilePanel("chapters")
  }

  function handleSelectChapter(chapter: number) {
    setSelectedChapter(chapter)
    setMobilePanel("reader")
  }

  function handleBackToBooks() {
    setSelectedChapter(null)
    setMobilePanel("books")
  }

  function handleBackToChapters() {
    setMobilePanel("chapters")
  }

  function handleChapterChange(chapter: number) {
    setSelectedChapter(chapter)
  }

  return (
    <main className="h-dvh flex overflow-hidden bg-background">
      {/* ── Desktop 3-column layout ── */}
      <div className="hidden md:flex w-full h-full">
        {/* Column 1: Book list */}
        <aside className="w-56 shrink-0 border-r border-border bg-sidebar overflow-hidden flex flex-col">
          <BookList
            selectedBookId={selectedBookId}
            onSelectBook={handleSelectBook}
          />
        </aside>

        {/* Column 2: Chapter grid */}
        <aside className="w-52 shrink-0 border-r border-border bg-sidebar overflow-hidden flex flex-col">
          {selectedBookId ? (
            <ChapterGrid
              bookId={selectedBookId}
              selectedChapter={selectedChapter}
              onSelectChapter={handleSelectChapter}
              onBack={handleBackToBooks}
            />
          ) : (
            <EmptyChapters />
          )}
        </aside>

        {/* Column 3: Reader */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {selectedBookId && selectedChapter ? (
            <Reader
              bookId={selectedBookId}
              chapter={selectedChapter}
              onChapterChange={handleChapterChange}
              onBack={handleBackToChapters}
            />
          ) : (
            <EmptyReader />
          )}
        </div>
      </div>

      {/* ── Mobile stacked navigation ── */}
      <div className="flex md:hidden w-full h-full">
        {mobilePanel === "books" && (
          <div className="flex-1 overflow-hidden flex flex-col bg-sidebar">
            <BookList
              selectedBookId={selectedBookId}
              onSelectBook={handleSelectBook}
            />
          </div>
        )}

        {mobilePanel === "chapters" && selectedBookId && (
          <div className="flex-1 overflow-hidden flex flex-col bg-sidebar">
            <ChapterGrid
              bookId={selectedBookId}
              selectedChapter={selectedChapter}
              onSelectChapter={handleSelectChapter}
              onBack={handleBackToBooks}
            />
          </div>
        )}

        {mobilePanel === "reader" && selectedBookId && selectedChapter && (
          <div className="flex-1 overflow-hidden flex flex-col">
            <Reader
              bookId={selectedBookId}
              chapter={selectedChapter}
              onChapterChange={handleChapterChange}
              onBack={handleBackToChapters}
            />
          </div>
        )}
      </div>
    </main>
  )
}

function EmptyChapters() {
  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <p className="text-center text-sm text-muted-foreground leading-relaxed">
        Selecione um livro para ver os capítulos.
      </p>
    </div>
  )
}

function EmptyReader() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8">
      <p className="font-serif text-xl text-muted-foreground/60 text-balance text-center">
        Selecione um livro e um capítulo para começar a ler.
      </p>
      <p className="text-xs text-muted-foreground/40 text-center text-balance">
        Clique em qualquer versículo para destacar ou adicionar uma nota.
      </p>
    </div>
  )
}
