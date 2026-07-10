"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Reader } from "@/features/bible-reader/components/reader";
import { ReaderEmpty } from "@/features/bible-reader/components/reader-empty";
import { PanelLayout } from "@/features/layout/components/panel-layout";
import { InspectorPanel } from "@/features/bible-reader/components/inspector-panel";
import { BookChapterDialog } from "@/features/bible-reader/components/book-chapter-dialog";
import { getBook } from "@/features/bible-reader/utils/bible-data";
import { useBibleVersion, useDownloadProgress } from "@/features/bible-reader/context/bible-version-context";
import {
  showDownloadStart,
  showDownloadProgress,
  showDownloadSuccess,
  showDownloadError,
} from "@/features/bible-reader/lib/download-toast";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { useReaderPosition } from "@/features/bible-reader/hooks/use-reader-position";
import { usePanelState } from "@/features/layout/hooks/use-panel-state";
import { useIsMobile } from "@/lib/use-media-query";
import { NotesProvider } from "@/features/notes/context/notes-context";
import { NotesPanel } from "@/features/notes/components/notes-panel";
import { NoteSheet } from "@/features/notes/components/note-sheet";
import type { NoteTarget } from "@/features/notes/types";

export default function Home() {
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
  } = useReaderPosition();

  const { inspectorOpen, setInspectorOpen, handleNavClick } = usePanelState();

  const {
    versionId,
    installedVersions,
    installVersion,
    setVersionId,
    isVersionsLoaded,
  } = useBibleVersion();
  const { isInstalling, downloadProgress } = useDownloadProgress();
  const activeToastIdRef = useRef<string | number | null>(null);

  const isMobile = useIsMobile();
  const [notesTarget, setNotesTarget] = useState<NoteTarget | null>(null);
  const [notesOpen, setNotesOpen] = useState(false);

  // Auto-download ARA on first visit if no version is installed
  useEffect(() => {
    if (
      isVersionsLoaded &&
      installedVersions !== undefined &&
      installedVersions.length === 0 &&
      !isInstalling &&
      !activeToastIdRef.current
    ) {
      activeToastIdRef.current = showDownloadStart(
        "Bíblia Almeida Revista e Atualizada (ARA)"
      );

      installVersion("ara")
        .then(() => {
          if (activeToastIdRef.current) {
            showDownloadSuccess(activeToastIdRef.current, "Bíblia ARA");
            activeToastIdRef.current = null;
          }
          setVersionId("ara");
        })
        .catch((e) => {
          console.error("Auto download failed:", e);
          if (activeToastIdRef.current) {
            showDownloadError(activeToastIdRef.current, "Bíblia ARA");
            activeToastIdRef.current = null;
          }
        });
    }
  }, [
    isVersionsLoaded,
    installedVersions,
    isInstalling,
    installVersion,
    setVersionId,
  ]);

  // Sync progress bar to the auto-download toast
  useEffect(() => {
    if (activeToastIdRef.current && isInstalling && downloadProgress) {
      showDownloadProgress(
        activeToastIdRef.current,
        "Bíblia ARA",
        downloadProgress
      );
    }
  }, [isInstalling, downloadProgress]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      const navParam = searchParams.get("nav");
      if (navParam) {
        handleNavClick(navParam);
        window.history.replaceState({}, "", "/");
      }
    }
  }, [handleNavClick]);

  const [bookChapterDialogOpen, setBookChapterDialogOpen] = useState(false);

  const handleSelectBook = useCallback((bookId: string) => {
    setSelectedBookId(bookId);
    setSelectedChapter(null);
  }, [setSelectedBookId, setSelectedChapter]);

  const handleSelectChapter = useCallback((chapter: number) => {
    setSelectedChapter(chapter);
  }, [setSelectedChapter]);

  const prevChapter = useCallback(() => {
    if (selectedChapter && selectedChapter > 1) {
      setSelectedChapter(selectedChapter - 1);
    }
  }, [selectedChapter, setSelectedChapter]);

  const nextChapter = useCallback(() => {
    const book = selectedBookId ? getBook(selectedBookId) : null
    if (book && selectedChapter && selectedChapter < book.chapters) {
      setSelectedChapter(selectedChapter + 1);
    }
  }, [selectedBookId, selectedChapter, setSelectedChapter]);

  const currentBook = selectedBookId ? getBook(selectedBookId) : null;
  const verseReference =
    currentBook && selectedChapter
      ? `${currentBook.abbreviation} ${selectedChapter}:1`
      : "Select a verse";

  return (
    <NotesProvider
      bookId={selectedBookId}
      chapter={selectedChapter}
      versionId={versionId}
      open={notesOpen}
      target={notesTarget}
      onOpen={(t) => {
        setNotesTarget(t);
        setNotesOpen(true);
      }}
      onClose={() => {
        setNotesOpen(false);
        setNotesTarget(null);
      }}
    >
      <SidebarProvider open={false} className="h-dvh">
        <SidebarInset className="w-auto overflow-hidden h-full">
          <PanelLayout
            main={
              <main className="relative overflow-hidden reading-area flex flex-col h-full">
                <div className="flex-1 overflow-y-auto custom-scrollbar w-full">
                  <div className="w-full pb-36 md:pb-8">
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

                {/* Desktop chapter navigation — fixed within the reading column (not over the inspector) */}
                <div className="absolute inset-0 z-40 hidden pointer-events-none md:flex">
                  <button
                    onClick={prevChapter}
                    disabled={selectedChapter === null || selectedChapter <= 1}
                    className="pointer-events-auto absolute left-4 top-1/2 -translate-y-1/2 inline-flex items-center justify-center rounded-full size-12 bg-background/80 backdrop-blur-sm border border-border shadow-lg hover:bg-accent hover:text-accent-foreground transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
                    aria-label="Capítulo anterior"
                  >
                    <ChevronLeft className="size-5" />
                  </button>
                  <button
                    onClick={nextChapter}
                    disabled={
                      selectedChapter === null ||
                      !(selectedBookId ? getBook(selectedBookId) : null) ||
                      selectedChapter >= (selectedBookId ? getBook(selectedBookId)!.chapters : 0)
                    }
                    className="pointer-events-auto absolute right-4 top-1/2 -translate-y-1/2 inline-flex items-center justify-center rounded-full size-12 bg-background/80 backdrop-blur-sm border border-border shadow-lg hover:bg-accent hover:text-accent-foreground transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
                    aria-label="Próximo capítulo"
                  >
                    <ChevronRight className="size-5" />
                  </button>
                </div>
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
              ) : (
                undefined
              )
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
          />
        </SidebarInset>
      </SidebarProvider>

      {isMobile && notesOpen && <NoteSheet />}
    </NotesProvider>
  );
}
