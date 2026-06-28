"use client"

import { useState, useEffect } from "react"
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
import { MobileNav } from "@/components/mobile-nav"
import { useIsMobile } from "@/hooks/use-mobile"
import { BottomSheet } from "@/components/ui/bottom-sheet"

export default function Home() {
  const isMobile = useIsMobile()
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

  useEffect(() => {
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search)
      const navParam = searchParams.get("nav")
      if (navParam === "notes") {
        handleNavClick("notes")
        window.history.replaceState({}, "", "/")
      }
    }
  }, [handleNavClick])

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

      <SidebarInset className="w-auto overflow-hidden h-full">

        <PanelLayout
          left={!isMobile && secondarySidebarOpen ? (
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
                className="flex-1 overflow-y-auto custom-scrollbar w-full"
              >
                <div
                  className="w-full pb-36 md:pb-8"
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

        {isMobile && secondarySidebarOpen && (
          <BottomSheet open={secondarySidebarOpen} onClose={handleSecondaryClose}>
            <SecondarySidebar
              isOpen={secondarySidebarOpen}
              onClose={handleSecondaryClose}
              activeTab={secondarySidebarTab}
              onJumpTo={handleJumpTo}
              onOpenNoteEditor={(verseIds, noteId) =>
                setNoteDialog({ verseIds, noteId })
              }
            />
          </BottomSheet>
        )}

        <MobileNav activeNav={activeNav} onNavClick={handleNavClick} />
      </SidebarInset>
    </SidebarProvider>
  )
}
