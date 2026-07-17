"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { Reader } from "@/features/bible-reader/components/reader"
import { PanelLayout } from "@/features/layout/components/panel-layout"
import { InspectorPanel } from "@/features/bible-reader/components/inspector-panel"
import { BookChapterDialog } from "@/features/bible-reader/components/book-chapter-dialog/book-chapter-dialog"
import { getBook } from "@/features/bible-reader/utils/bible-data"
import { BibleVersionScopeProvider } from "@/features/bible-reader/context/bible-version-context"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { NotesProvider } from "@/features/notes/context/notes-context"
import { NotesPanel } from "@/features/notes/components/notes-panel"
import { NoteSheet } from "@/features/notes/components/note-sheet"
import { useIsMobile } from "@/lib/use-media-query"
import { usePanelState } from "@/features/layout/hooks/use-panel-state"
import type { NoteTarget } from "@/features/notes/types"
import type { Pane, BiblePaneState } from "../types"
import type { ReaderMode, VerseSpacing, ReaderFont } from "../hooks/use-reader-settings"

interface BiblePaneViewProps {
  pane: Pane
  readerMode: ReaderMode
  onChangeReaderMode: (m: ReaderMode) => void
  fontSize: number
  onChangeFontSize: (n: number) => void
  verseSpacing: VerseSpacing
  onChangeVerseSpacing: (s: VerseSpacing) => void
  readerFont: ReaderFont
  onChangeReaderFont: (f: ReaderFont) => void
  onPaneUpdate: (id: string, state: Partial<BiblePaneState>) => void
  /** Whether this pane is the active one in the grid. Controls verse selection
   *  isolation. Defaults to true (tabs/simple mode always active). */
  isActive?: boolean
}


/**
 * A self-contained Bible reading pane. Each pane gets its own version scope
 * (via BibleVersionScopeProvider) and its own notes context, so multiple
 * passages/translations can be open simultaneously in the workspace. Navigation
 * within a pane uses the BookChapterDialog — no global sidebar needed.
 */
export function BiblePaneView({
  pane,
  readerMode,
  onChangeReaderMode,
  fontSize,
  onChangeFontSize,
  verseSpacing,
  onChangeVerseSpacing,
  readerFont,
  onChangeReaderFont,
  onPaneUpdate,
  isActive = true,
}: BiblePaneViewProps) {
  const state = pane.state as BiblePaneState
  const isMobile = useIsMobile()
  const { inspectorOpen, setInspectorOpen } = usePanelState()
  const [notesTarget, setNotesTarget] = useState<NoteTarget | null>(null)
  const [notesOpen, setNotesOpen] = useState(false)
  const [bookChapterDialogOpen, setBookChapterDialogOpen] = useState(!!state.isNew)
  const [dialogInitialView, setDialogInitialView] = useState<"books" | "chapters">("books")
  /** Captures the book chosen in the dialog before the chapter is selected. */
  const pendingBookRef = useRef<string | null>(null)

  // Cmd+K / Ctrl+K keyboard shortcut to toggle the dialog (desktop only)
  useEffect(() => {
    if (isMobile) return
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setBookChapterDialogOpen((prev) => {
          if (!prev) setDialogInitialView("books")
          return !prev
        })
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [isMobile])

  const handleSelectBook = useCallback((bookId: string) => {
    pendingBookRef.current = bookId
  }, [])

  const handleSelectChapter = useCallback(
    (chapter: number) => {
      const bookId = pendingBookRef.current ?? state.bookId
      onPaneUpdate(pane.id, { bookId, chapter, isNew: false })
      pendingBookRef.current = null
    },
    [pane.id, state.bookId, onPaneUpdate],
  )

  const currentBook = getBook(state.bookId)
  const verseReference = currentBook
    ? `${currentBook.abbreviation} ${state.chapter}:1`
    : ""

  return (
    <BibleVersionScopeProvider
      versionId={state.versionId}
      setVersionId={(id) => onPaneUpdate(pane.id, { versionId: id })}
    >
      <NotesProvider
        bookId={state.bookId}
        chapter={state.chapter}
        versionId={state.versionId}
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
        <SidebarProvider open={false} className="h-full min-h-0">
          <SidebarInset className="w-auto overflow-hidden h-full">
            <PanelLayout
              main={
                <main className="relative overflow-hidden reading-area flex flex-col h-full">
                  <Reader
                    key={`${state.bookId}-${state.chapter}-${state.versionId}`}
                    bookId={state.bookId}
                    chapter={state.chapter}
                    onChapterChange={(ch) => onPaneUpdate(pane.id, { chapter: ch })}
                    onBookChapterClick={() => {
                      setDialogInitialView("books")
                      setBookChapterDialogOpen(true)
                    }}
                    onChapterClick={() => {
                      setDialogInitialView("chapters")
                      setBookChapterDialogOpen(true)
                    }}
                    readerMode={readerMode}
                    onChangeReaderMode={onChangeReaderMode}
                    fontSize={fontSize}
                    onChangeFontSize={onChangeFontSize}
                    verseSpacing={verseSpacing}
                    onChangeVerseSpacing={onChangeVerseSpacing}
                    readerFont={readerFont}
                    onChangeReaderFont={onChangeReaderFont}
                    isActive={isActive}
                  />
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
              onClose={() => {
                setBookChapterDialogOpen(false)
                if (state.isNew) {
                  onPaneUpdate(pane.id, { isNew: false })
                }
              }}
              onSelectBook={handleSelectBook}
              onSelectChapter={handleSelectChapter}
              selectedBookId={state.bookId}
              selectedChapter={state.chapter}
              versionAbbreviation={state.versionId.toUpperCase()}
              initialView={dialogInitialView}
            />
          </SidebarInset>
        </SidebarProvider>

        {isMobile && notesOpen && <NoteSheet />}
      </NotesProvider>
    </BibleVersionScopeProvider>
  )
}