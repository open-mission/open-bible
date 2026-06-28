"use client"

import { useState } from "react"
import { Menu } from "lucide-react"
import { AppSidebar } from "@/components/sidebar"
import { Reader } from "@/components/reader"
import { ReaderEmpty } from "@/components/reader-empty"
import { PanelLayout } from "@/components/panel-layout"
import { SecondarySidebar } from "@/components/secondary-sidebar"
import { InspectorPanel } from "@/components/inspector-panel"
import { BookChapterDialog } from "@/components/book-chapter-dialog"
import { NoteEditorDialog } from "@/components/note-editor-dialog"
import { useNotes } from "@/lib/store"
import { getBook } from "@/lib/bible-data"
import { useBibleVersion } from "@/lib/bible-version-context"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { useReaderPosition } from "@/lib/use-reader-position"
import { usePanelState } from "@/lib/use-panel-state"

export default function Home() {
  const {
    selectedBookId, setSelectedBookId,
    selectedChapter, setSelectedChapter,
    readerMode, setReaderMode,
  } = useReaderPosition()

  const {
    sidebarOpen, setSidebarOpen,
    sidebarCollapsed, setSidebarCollapsed,
    inspectorOpen, setInspectorOpen,
    secondarySidebarOpen,
    secondarySidebarTab,
    activeNav,
    handleNavClick,
    handleSecondaryClose,
  } = usePanelState()

  const { notes, upsertNote, deleteNote } = useNotes()
  const { versionId, installedVersions } = useBibleVersion()

  const [bookChapterDialogOpen, setBookChapterDialogOpen] = useState(false)
  const [noteDialog, setNoteDialog] = useState<{
    verseIds: string[]
    noteId: string | null
  } | null>(null)

  function handleSelectBook(bookId: string) {
    setSelectedBookId(bookId)
    setSelectedChapter(null)
  }

  function handleSelectChapter(chapter: number) {
    setSelectedChapter(chapter)
  }

  function handleJumpTo(bookId: string, chapter: number) {
    setSelectedBookId(bookId)
    setSelectedChapter(chapter)
  }

  function toggleReaderMode() {
    setReaderMode((v) => (v === "wide" ? "readable" : "wide"))
  }

  const currentBook = selectedBookId ? getBook(selectedBookId) : null
  const currentVersion = installedVersions.find((v) => v.id === versionId)
  const verseReference =
    currentBook && selectedChapter
      ? `${currentBook.abbreviation} ${selectedChapter}:1`
      : "Select a verse"

  return (
    <SidebarProvider defaultOpen={!sidebarCollapsed} className="h-dvh">
      <AppSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onNavClick={handleNavClick}
        activeNav={activeNav}
        sidebarCollapsed={sidebarCollapsed}
        onToggleSidebar={() => setSidebarCollapsed((v) => !v)}
      />

      <SidebarInset className="overflow-hidden h-full">
        <div className="md:hidden flex items-center gap-3 px-4 py-3 border-b border-border shrink-0 bg-background">
          <button
            onClick={() => setSidebarOpen(true)}
            aria-label="Abrir menu"
            className="flex items-center justify-center w-8 h-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <Menu className="h-4 w-4" />
          </button>
          <span className="font-serif text-sm font-medium text-foreground">
            {selectedBookId && selectedChapter
              ? `${currentBook?.abbreviation} · Cap. ${selectedChapter}`
              : "Open Bible"}
          </span>
        </div>

        <PanelLayout
          left={secondarySidebarOpen ? (
            <SecondarySidebar
              isOpen={secondarySidebarOpen}
              onClose={handleSecondaryClose}
              activeTab={secondarySidebarTab}
              onJumpTo={handleJumpTo}
              onOpenNoteEditor={(verseIds, noteId) =>
                setNoteDialog({ verseIds, noteId })
              }
            />
          ) : undefined}
          main={
            <main className="overflow-hidden reading-area flex flex-col h-full">
              <div
                className={`flex-1 overflow-y-auto custom-scrollbar ${readerMode === "wide" ? "w-full" : "flex justify-center"}`}
              >
                <div
                  className={`${readerMode === "wide" ? "w-full px-4 md:px-8 py-8" : "max-w-3xl w-full px-4 md:px-12 py-8"}`}
                >
                  {selectedBookId && selectedChapter ? (
                    <Reader
                      bookId={selectedBookId}
                      chapter={selectedChapter}
                      onChapterChange={setSelectedChapter}
                      onBookChapterClick={() => setBookChapterDialogOpen(true)}
                      onInspectorToggle={() => setInspectorOpen((v) => !v)}
                      isInspectorOpen={inspectorOpen}
                      readerMode={readerMode}
                      onToggleReaderMode={toggleReaderMode}
                      onOpenNoteEditor={(verseIds, noteId) =>
                        setNoteDialog({ verseIds, noteId })
                      }
                    />
                  ) : (
                    <ReaderEmpty
                      onOpenSidebar={() => setBookChapterDialogOpen(true)}
                    />
                  )}
                </div>
              </div>
            </main>
          }
          right={inspectorOpen ? (
            <InspectorPanel
              verseReference={verseReference}
              onVerseClick={(verseId) =>
                console.log("Verse clicked:", verseId)
              }
              isOpen={inspectorOpen}
              onClose={() => setInspectorOpen(false)}
            />
          ) : undefined}
        />

        <BookChapterDialog
          open={bookChapterDialogOpen}
          onClose={() => setBookChapterDialogOpen(false)}
          onSelectBook={handleSelectBook}
          onSelectChapter={handleSelectChapter}
          selectedBookId={selectedBookId}
          selectedChapter={selectedChapter}
          versionAbbreviation={currentVersion?.name || versionId.toUpperCase()}
        />

        {noteDialog && (
          <NoteEditorDialog
            verseIds={noteDialog.verseIds}
            noteId={noteDialog.noteId}
            existingNote={
              noteDialog.noteId
                ? notes.find((n) => n.id === noteDialog.noteId)
                : undefined
            }
            onSave={(noteId, content, verseIds) => {
              upsertNote(noteId, content, verseIds)
              setNoteDialog(null)
            }}
            onDelete={(noteId) => {
              deleteNote(noteId)
              setNoteDialog(null)
            }}
            onClose={() => setNoteDialog(null)}
          />
        )}
      </SidebarInset>
    </SidebarProvider>
  )
}
