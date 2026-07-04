"use client"

import { useState, useMemo, useEffect } from "react"
import { BookOpen } from "lucide-react"
import { BottomSheet } from "@/components/ui/bottom-sheet"
import { getBook, OLD_TESTAMENT, NEW_TESTAMENT } from "@/features/bible-reader/utils/bible-data"
import { useIsMobile } from "@/lib/use-media-query"
import { useBibleVersion } from "@/features/bible-reader/context/bible-version-context"
import { BookChapterDialogOverlay } from "./book-chapter-dialog-overlay"
import { BookChapterDialogSearchHeader } from "./book-chapter-dialog-search-header"
import { BookChapterDialogBookList } from "./book-chapter-dialog-book-list"
import { BookChapterDialogChapterGrid } from "./book-chapter-dialog-chapter-grid"

interface BookChapterDialogProps {
  open: boolean
  onClose: () => void
  onSelectBook: (bookId: string) => void
  onSelectChapter: (chapter: number) => void
  selectedBookId: string | null
  selectedChapter: number | null
  versionAbbreviation?: string
}

/**
 * Dialog rico de seleção de livro/capítulo: header fixo com busca + seletor
 * de versão + grid de livros (AT/NT) + grid de capítulos (bingo card).
 * Branch mobile (BottomSheet 95%) x desktop (overlay central).
 *
 * Usa Composition Pattern - os sub-componentes podem ser usados individualmente
 * para customização avançada.
 */
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

  useEffect(() => {
    if (open) {
      setActiveBookId(selectedBookId)
      setShowChapters(false)
      setQuery("")
    }
  }, [open, selectedBookId])

  const activeBook = activeBookId ? getBook(activeBookId) : null
  const isSearching = query.trim().length > 0
  const shouldShowBooks = !showChapters || isSearching

  const filteredBooks = useMemo(() => {
    if (!query) return null
    const q = query.toLowerCase()
    return [...OLD_TESTAMENT, ...NEW_TESTAMENT].filter(
      (b) => b.name.toLowerCase().includes(q) || b.abbreviation.toLowerCase().includes(q)
    )
  }, [query])

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
    setQuery("")
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
      {shouldShowBooks && (
        <BookChapterDialogSearchHeader
          query={query}
          onQueryChange={setQuery}
          versionAbbreviation={versionAbbreviation}
          versionId={versionId}
          allVersions={allVersions}
          onVersionChange={setVersionId}
          onClose={handleClose}
        />
      )}

      {shouldShowBooks && (
        <div className="absolute top-14 left-0 right-0 h-6 bg-linear-to-b from-background to-transparent pointer-events-none z-10" />
      )}

      <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-background custom-scrollbar">
        {shouldShowBooks ? (
          <BookChapterDialogBookList
            books={filteredBooks}
            selectedBookId={activeBookId}
            onSelectBook={handleSelectBook}
          />
        ) : (
          activeBook ? (
            <BookChapterDialogChapterGrid
              book={activeBook}
              selectedChapter={selectedChapter}
              selectedBookId={selectedBookId}
              onSelectChapter={handleSelectChapter}
              onBack={handleBack}
            />
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
    <BookChapterDialogOverlay open={open}>
      {content}
    </BookChapterDialogOverlay>
  )
}

/**
 * Composition API - sub-componentes para uso avançado.
 */
BookChapterDialog.Overlay = BookChapterDialogOverlay
BookChapterDialog.SearchHeader = BookChapterDialogSearchHeader
BookChapterDialog.BookList = BookChapterDialogBookList
BookChapterDialog.ChapterGrid = BookChapterDialogChapterGrid
