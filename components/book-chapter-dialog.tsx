"use client"

import { useState, useMemo } from "react"
import { Search, X, ChevronLeft, BookOpen } from "lucide-react"
import { BottomSheet } from "@/components/ui/bottom-sheet"
import { getBook, OLD_TESTAMENT, NEW_TESTAMENT } from "@/lib/bible-data"
import { useIsMobile } from "@/lib/use-media-query"
import type { Book } from "@/lib/types"

interface BookChapterDialogProps {
  open: boolean
  onClose: () => void
  onSelectBook: (bookId: string) => void
  onSelectChapter: (chapter: number) => void
  selectedBookId: string | null
  selectedChapter: number | null
  versionAbbreviation?: string
}

export function BookChapterDialog({
  open,
  onClose,
  onSelectBook,
  onSelectChapter,
  selectedBookId,
  selectedChapter,
  versionAbbreviation,
}: BookChapterDialogProps) {
  const isMobile = useIsMobile()
  const [query, setQuery] = useState("")
  const [activeBookId, setActiveBookId] = useState<string | null>(selectedBookId)
  const [showChapters, setShowChapters] = useState(false)

  const activeBook = activeBookId ? getBook(activeBookId) : null

  const filteredBooks = useMemo(() => {
    if (!query) return null
    const q = query.toLowerCase()
    return [...OLD_TESTAMENT, ...NEW_TESTAMENT].filter(
      (b) => b.name.toLowerCase().includes(q) || b.abbreviation.toLowerCase().includes(q)
    )
  }, [query])

  function handleSelectBook(bookId: string) {
    setActiveBookId(bookId)
    setShowChapters(true)
  }

  function handleSelectChapter(chapter: number) {
    if (activeBookId) {
      onSelectBook(activeBookId)
      onSelectChapter(chapter)
    }
    onClose()
  }

  function handleBack() {
    setShowChapters(false)
  }

  function handleClose() {
    setShowChapters(false)
    setQuery("")
    setActiveBookId(selectedBookId)
    onClose()
  }

  const content = (
    <div className="flex flex-col h-full max-h-[85dvh]">
      {/* Search Header */}
      <header className="flex items-center border-b border-border px-4 h-12 shrink-0">
        <Search className="h-4 w-4 text-muted-foreground mr-2 shrink-0" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Pesquisar livro ou capítulo..."
          className="flex-1 h-full bg-transparent border-none focus:ring-0 text-sm placeholder:text-muted-foreground outline-none"
        />
        <div className="flex items-center gap-2 border-l border-border pl-4 ml-2">
          {versionAbbreviation && (
            <button className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium hover:bg-accent transition-colors border border-border group">
              <BookOpen className="h-4 w-4 text-muted-foreground" />
              <span className="font-semibold uppercase">{versionAbbreviation}</span>
            </button>
          )}
          <button
            onClick={handleClose}
            className="p-1 hover:bg-accent rounded-md text-muted-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Content Split */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Books Column */}
        <div className={`${showChapters ? "hidden md:flex" : "flex"} w-full md:w-1/2 border-r border-border flex-col`}>
          <div className="flex-1 overflow-y-auto p-2 space-y-4">
            {filteredBooks ? (
              <div className="space-y-0.5">
                {filteredBooks.map((book) => (
                  <BookButton
                    key={book.id}
                    book={book}
                    isSelected={book.id === activeBookId}
                    onClick={() => handleSelectBook(book.id)}
                  />
                ))}
              </div>
            ) : (
              <>
                <BookSection
                  title="Antigo Testamento"
                  books={OLD_TESTAMENT}
                  selectedBookId={activeBookId}
                  onSelectBook={handleSelectBook}
                />
                <BookSection
                  title="Novo Testamento"
                  books={NEW_TESTAMENT}
                  selectedBookId={activeBookId}
                  onSelectBook={handleSelectBook}
                />
              </>
            )}
          </div>
        </div>

        {/* Right: Chapters Grid */}
        <div className={`${!showChapters ? "hidden md:flex" : "flex"} w-full md:w-1/2 flex-col`}>
          {activeBook ? (
            <>
              <div className="h-10 px-4 border-b border-border flex items-center justify-between shrink-0">
                <button
                  onClick={handleBack}
                  className="md:hidden flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Voltar
                </button>
                <span className="text-xs font-semibold mx-auto md:mx-0">Capítulos</span>
                <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-sm border border-border">
                  {activeBook.name}
                </span>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                <div className="grid grid-cols-5 gap-2">
                  {Array.from({ length: activeBook.chapters }, (_, i) => i + 1).map((ch) => (
                    <button
                      key={ch}
                      onClick={() => handleSelectChapter(ch)}
                      className={`aspect-square flex items-center justify-center text-xs font-semibold rounded-md transition-colors ${
                        ch === selectedChapter
                          ? "bg-primary text-primary-foreground"
                          : "border border-border text-foreground hover:bg-accent"
                      }`}
                    >
                      {ch}
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">
              Selecione um livro
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="px-4 py-3 border-t border-border flex items-center justify-between bg-muted/30 shrink-0">
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
          {activeBook && selectedChapter ? (
            <span>{activeBook.name} {selectedChapter}</span>
          ) : activeBook ? (
            <span>{activeBook.name} — selecione um capítulo</span>
          ) : (
            <span>Selecione um livro e capítulo</span>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleClose}
            className="h-9 px-4 rounded-md text-sm font-medium border border-border bg-background hover:bg-accent transition-colors"
          >
            Cancelar
          </button>
        </div>
      </footer>
    </div>
  )

  if (isMobile) {
    return (
      <BottomSheet open={open} onClose={handleClose}>
        <div className="flex flex-col">
          {content}
        </div>
      </BottomSheet>
    )
  }

  return (
    <DesktopDialog open={open} onClose={handleClose}>
      {content}
    </DesktopDialog>
  )
}

function BookSection({ title, books, selectedBookId, onSelectBook }: {
  title: string
  books: Book[]
  selectedBookId: string | null
  onSelectBook: (id: string) => void
}) {
  return (
    <div>
      <h3 className="px-2 py-1.5 text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-1">
        {title}
      </h3>
      <div className="space-y-0.5">
        {books.map((book) => (
          <BookButton
            key={book.id}
            book={book}
            isSelected={book.id === selectedBookId}
            onClick={() => onSelectBook(book.id)}
          />
        ))}
      </div>
    </div>
  )
}

function BookButton({ book, isSelected, onClick }: {
  book: Book
  isSelected: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-2 py-1.5 text-sm rounded-md transition-colors ${
        isSelected
          ? "bg-primary text-primary-foreground font-medium"
          : "text-foreground hover:bg-accent"
      }`}
    >
      {book.name}
    </button>
  )
}

function DesktopDialog({ open, onClose, children }: {
  open: boolean
  onClose: () => void
  children: React.ReactNode
}) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-background w-full max-w-4xl h-full max-h-[80vh] rounded-lg shadow-lg flex flex-col overflow-hidden border border-border animate-in fade-in zoom-in-95 duration-200">
        {children}
      </div>
    </div>
  )
}
