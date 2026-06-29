"use client"

import { useState, useMemo, useEffect } from "react"
import { Search, X, ChevronLeft, BookOpen, Check, ArrowRight } from "lucide-react"
import { BottomSheet } from "@/components/ui/bottom-sheet"
import { getBook, OLD_TESTAMENT, NEW_TESTAMENT } from "@/lib/bible-data"
import { useIsMobile } from "@/lib/use-media-query"
import type { Book } from "@/lib/types"
import { useBibleVersion } from "@/lib/bible-version-context"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "./ui/button"
import { InputGroup, InputGroupAddon, InputGroupInput } from "./ui/input-group"

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
  const { versionId, setVersionId, installedVersions, availableVersions } = useBibleVersion()
  const [query, setQuery] = useState("")
  const [activeBookId, setActiveBookId] = useState<string | null>(selectedBookId)
  const [showChapters, setShowChapters] = useState(false)
  const [versionDropdownOpen, setVersionDropdownOpen] = useState(false)

  // Reset state when dialog opens - ALWAYS start on books selection
  useEffect(() => {
    if (open) {
      setActiveBookId(selectedBookId)
      setShowChapters(false)
      setQuery("")
    }
  }, [open, selectedBookId])

  const activeBook = activeBookId ? getBook(activeBookId) : null

  // Auto-switch back to books list when typing a search query
  const isSearching = query.trim().length > 0
  const shouldShowBooks = !showChapters || isSearching

  const filteredBooks = useMemo(() => {
    if (!query) return null
    const q = query.toLowerCase()
    return [...OLD_TESTAMENT, ...NEW_TESTAMENT].filter(
      (b) => b.name.toLowerCase().includes(q) || b.abbreviation.toLowerCase().includes(q)
    )
  }, [query])

  // Combine installed and available versions for a comprehensive list
  const allVersions = useMemo(() => {
    const list = [...installedVersions]
    availableVersions.forEach((av) => {
      if (!list.some((iv) => iv.id === av.id)) {
        list.push({
          id: av.id,
          name: av.name,
          books: [],
        } as any)
      }
    })
    return list
  }, [installedVersions, availableVersions])

  function handleSelectBook(bookId: string) {
    setActiveBookId(bookId)
    setShowChapters(true)
    setQuery("") // Clear search query to transition cleanly to chapters view
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
    <div className="relative flex flex-col h-full max-h-[90vh] bg-background md:max-h-[75vh] overflow-hidden">
      {/* Search & Action Header */}
      <header className="flex items-center px-4 h-14 shrink-0 gap-3 z-10">
        <InputGroup className="flex-1 h-10 shadow-none border-border bg-background">
          <InputGroupAddon align="inline-start">
            <Search className="h-4 w-4 text-muted-foreground" />
          </InputGroupAddon>

          <InputGroupInput
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Pesquisar livro ou capítulo..."
            className="text-sm placeholder:text-muted-foreground h-full"
          />

          <InputGroupAddon align="inline-end">
            {/* Quick Version Dropdown inside InputGroup */}
            <Popover open={versionDropdownOpen} onOpenChange={setVersionDropdownOpen}>
              <PopoverTrigger render={
                <Button variant="ghost" size="sm" className="h-7 px-2 gap-1.5 font-semibold text-xs cursor-pointer hover:bg-accent">
                  <BookOpen className="h-3.5 w-3.5 text-primary" />
                  <span className="uppercase">{versionAbbreviation || versionId}</span>
                </Button>
              } />
              <PopoverContent className="w-64 p-1.5 space-y-0.5" align="end">
                <div className="px-2.5 py-1.5 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  Versões da Bíblia
                </div>
                <div className="max-h-60 overflow-y-auto custom-scrollbar space-y-0.5">
                  {allVersions.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => {
                        setVersionId(v.id)
                        setVersionDropdownOpen(false)
                      }}
                      className={`w-full flex items-center justify-between rounded-md px-2.5 py-2 text-left text-xs transition-colors cursor-pointer ${versionId === v.id
                        ? "bg-accent text-accent-foreground font-semibold"
                        : "hover:bg-secondary text-foreground"
                        }`}
                    >
                      <span className="truncate mr-2">{v.name}</span>
                      {versionId === v.id && (
                        <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </InputGroupAddon>
        </InputGroup>

        <button
          onClick={handleClose}
          className="p-1.5 hover:bg-accent rounded-md text-muted-foreground transition-colors cursor-pointer shrink-0"
        >
          <X className="h-5 w-5" />
        </button>
      </header>

      {/* Elegant Fade Gradient Overlay below InputGroup */}
      <div className="absolute top-14 left-0 right-0 h-6 bg-linear-to-b from-background to-transparent pointer-events-none z-10" />

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-background custom-scrollbar">
        {shouldShowBooks ? (
          /* Step 1: Books selection (3 columns on desktop, 2 on tablet, 1 on mobile) */
          <div className="space-y-6">
            {filteredBooks ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
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
        ) : (
          /* Step 2: Chapters selection */
          activeBook ? (
            <div className="space-y-6">
              <div className="flex items-center gap-3 pb-3 border-b border-border">
                <button
                  onClick={handleBack}
                  className="flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80 transition-colors cursor-pointer bg-primary/5 hover:bg-primary/10 px-2.5 py-1.5 rounded-md"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Voltar para Livros
                </button>
                <div className="ml-auto flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Selecionado:</span>
                  <span className="text-xs font-bold text-foreground bg-accent border border-border px-2 py-1 rounded-md">
                    {activeBook.name}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  Selecione o Capítulo
                </h3>

                {/* Bingo Card/Keyboard Style Grid */}
                <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-px bg-border border border-border rounded-xl overflow-hidden shadow-xs">
                  {Array.from({ length: activeBook.chapters }, (_, i) => i + 1).map((ch) => {
                    const isSelected = ch === selectedChapter && activeBookId === selectedBookId
                    return (
                      <button
                        key={ch}
                        onClick={() => handleSelectChapter(ch)}
                        className={`aspect-square flex items-center justify-center text-sm font-bold transition-all cursor-pointer ${isSelected
                          ? "bg-primary text-primary-foreground font-extrabold"
                          : "bg-background text-foreground hover:bg-accent/80"
                          }`}
                      >
                        {ch}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-sm text-muted-foreground gap-2">
              <BookOpen className="h-8 w-8 text-muted-foreground/50 animate-pulse" />
              <span>Selecione um livro primeiro</span>
            </div>
          )
        )}
      </div>
    </div>
  )

  if (isMobile) {
    return (
      <BottomSheet open={open} onClose={handleClose} size="95">
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
    <div className="space-y-3">
      <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
        {title}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
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
      className={`w-full group text-left px-4 py-3.5 text-base md:text-sm rounded-lg border transition-all cursor-pointer flex items-center justify-between ${isSelected
        ? "bg-primary text-primary-foreground font-semibold border-primary shadow-sm"
        : "border-border hover:bg-accent/60 text-foreground"
        }`}
    >
      <div className="flex flex-col gap-0.5">
        <span className="font-semibold">{book.name}</span>
        <span className={`text-[10px] uppercase tracking-wider font-semibold ${isSelected ? "text-primary-foreground/75" : "text-muted-foreground/75"}`}>
          {book.abbreviation}
        </span>
      </div>
      <ArrowRight className={`h-4 w-4 transition-transform duration-200 ${isSelected ? "text-primary-foreground translate-x-0.5" : "text-muted-foreground/50 group-hover:translate-x-0.5"}`} />
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
      <div className="bg-background w-full max-w-4xl h-full max-h-[80vh] rounded-xl shadow-2xl flex flex-col overflow-hidden border border-border animate-in fade-in zoom-in-95 duration-200">
        {children}
      </div>
    </div>
  )
}
