"use client"

import { useState, useEffect } from "react"
import { Reader } from "@/features/bible-reader/components/reader"
import { ReaderEmpty } from "@/features/bible-reader/components/reader-empty"
import { PanelLayout } from "@/features/layout/components/panel-layout"
import { InspectorPanel } from "@/features/bible-reader/components/inspector-panel"
import { BookChapterDialog } from "@/features/bible-reader/components/book-chapter-dialog"
import { getBook } from "@/features/bible-reader/utils/bible-data"
import { useBibleVersion } from "@/features/bible-reader/context/bible-version-context"
import { useToast } from "@/features/layout/hooks/use-toast"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { useReaderPosition } from "@/features/bible-reader/hooks/use-reader-position"
import { usePanelState } from "@/features/layout/hooks/use-panel-state"
import { MobileNav } from "@/features/layout/components/mobile-nav"
import { useIsMobile } from "@/hooks/use-mobile"

export default function Home() {
  const isMobile = useIsMobile()
  const {
    selectedBookId, setSelectedBookId,
    selectedChapter, setSelectedChapter,
    readerMode, setReaderMode,
    fontSize, setFontSize,
    verseSpacing, setVerseSpacing,
    readerFont, setReaderFont,
  } = useReaderPosition()

  const {
    sidebarOpen, setSidebarOpen,
    sidebarCollapsed, setSidebarCollapsed,
    inspectorOpen, setInspectorOpen,
    activeNav,
    handleNavClick,
  } = usePanelState()

  const {
    versionId,
    installedVersions,
    installVersion,
    isInstalling,
    downloadProgress,
    setVersionId,
    isVersionsLoaded,
  } = useBibleVersion()
  const { addToast, updateToast, removeToast } = useToast()
  const [activeToastId, setActiveToastId] = useState<string | null>(null)

  // Auto-download ARA on first visit if no version is installed
  useEffect(() => {
    if (isVersionsLoaded && installedVersions !== undefined && installedVersions.length === 0 && !isInstalling && !activeToastId) {
      const id = addToast({
        message: "Primeiro acesso: baixando Bíblia Almeida Revista e Atualizada (ARA)...",
        type: "loading",
      })
      setActiveToastId(id)

      installVersion("ara")
        .then(() => {
          updateToast(id, {
            message: "Bíblia ARA configurada com sucesso!",
            type: "success",
            progress: undefined,
          })
          setVersionId("ara")
          setTimeout(() => {
            removeToast(id)
            setActiveToastId(null)
          }, 4000)
        })
        .catch((e) => {
          console.error("Auto download failed:", e)
          updateToast(id, {
            message: "Falha ao baixar Bíblia ARA.",
            type: "error",
            progress: undefined,
          })
          setTimeout(() => {
            removeToast(id)
            setActiveToastId(null)
          }, 4000)
        })
    }
  }, [isVersionsLoaded, installedVersions, isInstalling, installVersion, addToast, updateToast, removeToast, setVersionId, activeToastId])

  // Sync progress bar to the auto-download toast
  useEffect(() => {
    if (activeToastId && isInstalling && downloadProgress) {
      updateToast(activeToastId, {
        progress: downloadProgress,
      })
    }
  }, [activeToastId, isInstalling, downloadProgress, updateToast])

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
                      key={`${selectedBookId}-${selectedChapter}`}
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
                      readerFont={readerFont}
                      onChangeReaderFont={setReaderFont}
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
