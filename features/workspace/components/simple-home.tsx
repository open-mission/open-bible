"use client"

import { useState, useCallback } from "react"
import { Reader } from "@/features/bible-reader/components/reader"
import { ReaderEmpty } from "@/features/bible-reader/components/reader-empty"
import { PanelLayout } from "@/features/layout/components/panel-layout"
import { InspectorPanel } from "@/features/bible-reader/components/inspector-panel"
import { BookChapterDialog } from "@/features/bible-reader/components/book-chapter-dialog/book-chapter-dialog"
import { getBook } from "@/features/bible-reader/utils/bible-data"
import { useBibleVersion } from "@/features/bible-reader/context/bible-version-context"
import { useAutoDownloadAra } from "@/features/bible-reader/hooks/use-auto-download-ara"
import { useReaderPosition } from "@/features/bible-reader/hooks/use-reader-position"
import { usePanelState } from "@/features/layout/hooks/use-panel-state"
import { useIsMobile } from "@/lib/use-media-query"
import { cn } from "@/lib/utils"
import { NotesProvider } from "@/features/notes/context/notes-context"
import { NotesPanel } from "@/features/notes/components/notes-panel"
import { NoteSheet } from "@/features/notes/components/note-sheet"
import type { NoteTarget } from "@/features/notes/types"

/**
 * The "Simple" reading mode — a single Bible passage, preserving the classic
 * Open Bible experience. This is the default and what existing users see.
 * Extracted from the original app/page.tsx so both modes can coexist.
 */
export function SimpleHome() {
  const {
    selectedBookId,
    setSelectedBookId,
    selectedChapter,
    setSelectedChapter,
    readerMode,
    setReaderMode,
    fontSize,
    setFontSize,
    verseSpacing,
    setVerseSpacing,
    readerFont,
    setReaderFont,
  } = useReaderPosition()

  const { inspectorOpen, setInspectorOpen } = usePanelState()
  const { versionId } = useBibleVersion()
  useAutoDownloadAra()

  const isMobile = useIsMobile()
  const [notesTarget, setNotesTarget] = useState<NoteTarget | null>(null)
  const [notesOpen, setNotesOpen] = useState(false)
  const [bookChapterDialogOpen, setBookChapterDialogOpen] = useState(false)
  const [dialogInitialView, setDialogInitialView] = useState<"books" | "chapters">("books")

  const handleSelectBook = useCallback(
    (bookId: string) => {
      setSelectedBookId(bookId)
      setSelectedChapter(null)
    },
    [setSelectedBookId, setSelectedChapter],
  )

  const handleSelectChapter = useCallback(
    (chapter: number) => {
      setSelectedChapter(chapter)
    },
    [setSelectedChapter],
  )

  const currentBook = selectedBookId ? getBook(selectedBookId) : null
  const verseReference =
    currentBook && selectedChapter
      ? `${currentBook.abbreviation} ${selectedChapter}:1`
      : "Select a verse"

  return (
    <NotesProvider
      bookId={selectedBookId}
      chapter={selectedChapter}
      versionId={versionId}
      open={notesOpen}
      target={notesTarget}
      onOpen={(t) => {
        setNotesTarget(t)
        setNotesOpen(true)
      }}
      onClose={() => {
        setNotesOpen(false)
        setNotesTarget(null)
      }}
    >
      <PanelLayout
        main={
          <main className={cn(
            "relative overflow-hidden reading-area flex flex-col h-full",
            isMobile && "pb-[calc(3.5rem+env(safe-area-inset-bottom))]"
          )}>
            {selectedBookId && selectedChapter ? (
              <Reader
                key={`${selectedBookId}-${selectedChapter}`}
                bookId={selectedBookId}
                chapter={selectedChapter}
                onChapterChange={setSelectedChapter}
                onBookChapterClick={() => {
                  setDialogInitialView("books")
                  setBookChapterDialogOpen(true)
                }}
                onChapterClick={() => {
                  setDialogInitialView("chapters")
                  setBookChapterDialogOpen(true)
                }}
                readerMode={readerMode}
                onChangeReaderMode={setReaderMode}
                fontSize={fontSize}
                onChangeFontSize={setFontSize}
                verseSpacing={verseSpacing}
                onChangeVerseSpacing={setVerseSpacing}
                readerFont={readerFont}
                onChangeReaderFont={setReaderFont}
                showConfigButton={true}
              />
            ) : (
              <ReaderEmpty
                onOpenSidebar={() => setBookChapterDialogOpen(true)}
              />
            )}
          </main>
        }
        right={
          !isMobile && notesOpen ? (
            <NotesPanel />
          ) : inspectorOpen ? (
            <InspectorPanel
              verseReference={verseReference}
              isOpen={inspectorOpen}
              onClose={() => setInspectorOpen(false)}
            />
          ) : undefined
        }
      />

      <BookChapterDialog
        open={bookChapterDialogOpen}
        onClose={() => setBookChapterDialogOpen(false)}
        onSelectBook={handleSelectBook}
        onSelectChapter={handleSelectChapter}
        selectedBookId={selectedBookId}
        selectedChapter={selectedChapter}
        versionAbbreviation={versionId.toUpperCase()}
        initialView={dialogInitialView}
      />

      {isMobile && notesOpen && <NoteSheet />}
    </NotesProvider>
  )
}
