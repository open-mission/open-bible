"use client"

import { useState, useEffect } from "react"
import { Reader } from "@/components/reader"
import { ReaderEmpty } from "@/components/reader-empty"
import { PanelLayout } from "@/components/panel-layout"
import { InspectorPanel } from "@/components/inspector-panel"
import { BookChapterDialog } from "@/components/book-chapter-dialog"
import { getBook } from "@/lib/bible-data"
import { useBibleVersion } from "@/lib/bible-version-context"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { useReaderPosition } from "@/lib/use-reader-position"
import { usePanelState } from "@/lib/use-panel-state"
import { MobileNav } from "@/components/mobile-nav"
import { useIsMobile } from "@/hooks/use-mobile"

export default function Home() {
  const isMobile = useIsMobile()
  const {
    selectedBookId, setSelectedBookId,
    selectedChapter, setSelectedChapter,
    readerMode, setReaderMode,
    fontSize, setFontSize,
    verseSpacing, setVerseSpacing,
  } = useReaderPosition()

  const {
    sidebarOpen, setSidebarOpen,
    sidebarCollapsed, setSidebarCollapsed,
    inspectorOpen, setInspectorOpen,
    activeNav,
    handleNavClick,
  } = usePanelState()

  const { versionId, installedVersions } = useBibleVersion()

  useEffect(() => {
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search)
      const navParam = searchParams.get("nav")
      if (navParam) {
        handleNavClick(navParam)
        window.history.replaceState({}, "", "/")
      }
    }
  }, [handleNavClick])

  const [bookChapterDialogOpen, setBookChapterDialogOpen] = useState(false)

  function handleSelectBook(bookId: string) {
    setSelectedBookId(bookId)
    setSelectedChapter(null)
  }

  function handleSelectChapter(chapter: number) {
    setSelectedChapter(chapter)
  }

  const currentBook = selectedBookId ? getBook(selectedBookId) : null
  const currentVersion = installedVersions.find((v) => v.id === versionId)
  const verseReference =
    currentBook && selectedChapter
      ? `${currentBook.abbreviation} ${selectedChapter}:1`
      : "Select a verse"

  return (
    <SidebarProvider open={false} className="h-dvh">
      <SidebarInset className="w-auto overflow-hidden h-full">

        <PanelLayout
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
                      readerMode={readerMode}
                      onChangeReaderMode={setReaderMode}
                      fontSize={fontSize}
                      onChangeFontSize={setFontSize}
                      verseSpacing={verseSpacing}
                      onChangeVerseSpacing={setVerseSpacing}
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
      </SidebarInset>
    </SidebarProvider>
  )
}
