"use client";

import { useState, useEffect } from "react";
import { Menu, ChevronLeft, ChevronRight } from "lucide-react";
import { Sidebar } from "@/components/sidebar";
import { SecondarySidebar } from "@/components/secondary-sidebar";
import { Reader } from "@/components/reader";
import { NoteEditorDialog } from "@/components/note-editor-dialog";
import { InspectorPanel } from "@/components/inspector-panel";
import { BookChapterDialog } from "@/components/book-chapter-dialog";
import { useNotes } from "@/lib/store";
import { getBook } from "@/lib/bible-data";
import { useBibleVersion } from "@/lib/bible-version-context";

const BOOK_KEY = "openbible:book";
const CHAPTER_KEY = "openbible:chapter";

export default function Home() {
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [inspectorOpen, setInspectorOpen] = useState(true);
  const [bookChapterDialogOpen, setBookChapterDialogOpen] = useState(false);
  const [secondarySidebarOpen, setSecondarySidebarOpen] = useState(false);
  const [secondarySidebarTab, setSecondarySidebarTab] = useState<
    "highlights" | "notes"
  >("highlights");
  const [readerMode, setReaderMode] = useState<"wide" | "readable">("wide");
  const [activeNav, setActiveNav] = useState<string | null>("library");
  const [noteDialog, setNoteDialog] = useState<{
    verseIds: string[];
    noteId: string | null;
  } | null>(null);

  const { notes, upsertNote, deleteNote } = useNotes();
  const { versionId, installedVersions } = useBibleVersion();

  // Restore last position from localStorage on mount
  useEffect(() => {
    try {
      const book = localStorage.getItem(BOOK_KEY);
      const chapter = localStorage.getItem(CHAPTER_KEY);
      if (book) setSelectedBookId(book);
      if (chapter) setSelectedChapter(Number(chapter));
    } catch {
      /* ignore */
    }
  }, []);

  // Persist position when it changes
  useEffect(() => {
    if (selectedBookId) {
      try {
        localStorage.setItem(BOOK_KEY, selectedBookId);
      } catch {
        /* ignore */
      }
    }
  }, [selectedBookId]);

  useEffect(() => {
    if (selectedChapter !== null) {
      try {
        localStorage.setItem(CHAPTER_KEY, String(selectedChapter));
      } catch {
        /* ignore */
      }
    }
  }, [selectedChapter]);

  // Restore reader mode from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("openbible:reader-mode");
      if (saved === "wide" || saved === "readable") {
        setReaderMode(saved);
      }
    } catch {
      /* ignore */
    }
  }, []);

  // Persist reader mode
  useEffect(() => {
    try {
      localStorage.setItem("openbible:reader-mode", readerMode);
    } catch {
      /* ignore */
    }
  }, [readerMode]);

  function toggleReaderMode() {
    setReaderMode((v) => (v === "wide" ? "readable" : "wide"));
  }

  function handleSelectBook(bookId: string) {
    setSelectedBookId(bookId);
    setSelectedChapter(null);
  }

  function handleSelectChapter(chapter: number) {
    setSelectedChapter(chapter);
  }

  function handleChapterChange(chapter: number) {
    setSelectedChapter(chapter);
  }

  function handleJumpTo(bookId: string, chapter: number) {
    setSelectedBookId(bookId);
    setSelectedChapter(chapter);
  }

  function handleBookChapterClick() {
    setBookChapterDialogOpen(true);
  }

  function handleSelectFromDialog(bookId: string) {
    setSelectedBookId(bookId);
    setSelectedChapter(null);
  }

  function handleSelectChapterFromDialog(chapter: number) {
    setSelectedChapter(chapter);
    setBookChapterDialogOpen(false);
  }

  function handleNavClick(navId: string) {
    setActiveNav(navId);
    if (navId === "highlights") {
      setSecondarySidebarTab("highlights");
      setSecondarySidebarOpen(true);
    } else if (navId === "notes") {
      setSecondarySidebarTab("notes");
      setSecondarySidebarOpen(true);
    } else if (navId === "library") {
      setSecondarySidebarOpen(false);
      setBookChapterDialogOpen(true);
    } else {
      setSecondarySidebarOpen(false);
    }
  }

  function handleSecondaryClose() {
    setSecondarySidebarOpen(false);
    setActiveNav(null);
  }

  // Get current book and version info
  const currentBook = selectedBookId ? getBook(selectedBookId) : null;
  const currentVersion = installedVersions.find((v) => v.id === versionId);
  const verseReference =
    currentBook && selectedChapter
      ? `${currentBook.abbreviation} ${selectedChapter}:1`
      : "Select a verse";

  return (
    <div className="h-dvh flex overflow-hidden bg-background">
      {/* Main Sidebar — nav-only */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onNavClick={handleNavClick}
        activeNav={activeNav}
        sidebarCollapsed={sidebarCollapsed}
        onToggleSidebar={() => setSidebarCollapsed((v) => !v)}
      />

      {/* Desktop sidebar collapse toggle */}
      <button
        onClick={() => setSidebarCollapsed((v) => !v)}
        aria-label={sidebarCollapsed ? "Abrir sidebar" : "Fechar sidebar"}
        className="hidden md:flex items-center justify-center w-6 h-12 self-center z-10 rounded-r-md border border-l-0 border-border bg-sidebar text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors shrink-0"
      >
        {sidebarCollapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </button>

      {/* Secondary Sidebar — highlights/notes */}
      <SecondarySidebar
        isOpen={secondarySidebarOpen}
        onClose={handleSecondaryClose}
        activeTab={secondarySidebarTab}
        onJumpTo={handleJumpTo}
        onOpenNoteEditor={(verseIds, noteId) =>
          setNoteDialog({ verseIds, noteId })
        }
      />

      {/* Main content area */}
      <main
        className={`flex-1 overflow-hidden reading-area flex flex-col transition-all duration-200 ${
          inspectorOpen ? "mr-0 md:mr-87.5" : ""
        }`}
      >
        {/* Mobile top bar - full width */}
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

        {/* Reader container - flexible width */}
        <div className={`flex-1 overflow-y-auto custom-scrollbar ${readerMode === 'wide' ? 'w-full' : 'flex justify-center'}`}>
          <div className={`${readerMode === 'wide' ? 'w-full px-4 md:px-8 py-8' : 'max-w-3xl w-full px-4 md:px-12 py-8'}`}>
            {/* Reader or empty state */}
            {selectedBookId && selectedChapter ? (
              <Reader
                bookId={selectedBookId}
                chapter={selectedChapter}
                onChapterChange={handleChapterChange}
                onBack={() => setSidebarOpen(true)}
                onBookChapterClick={handleBookChapterClick}
                onInspectorToggle={() => setInspectorOpen((v) => !v)}
                isInspectorOpen={inspectorOpen}
                readerMode={readerMode}
                onToggleReaderMode={toggleReaderMode}
                onOpenNoteEditor={(verseIds, noteId) =>
                  setNoteDialog({ verseIds, noteId })
                }
              />
            ) : (
              <EmptyReader onOpenSidebar={() => setBookChapterDialogOpen(true)} />
            )}
          </div>
        </div>
      </main>

      {/* Inspector Panel */}
      <InspectorPanel
        verseReference={verseReference}
        onVerseClick={(verseId) => console.log("Verse clicked:", verseId)}
        isOpen={inspectorOpen}
        onClose={() => setInspectorOpen(false)}
      />

      {/* Book/Chapter Dialog */}
      <BookChapterDialog
        open={bookChapterDialogOpen}
        onClose={() => setBookChapterDialogOpen(false)}
        onSelectBook={handleSelectFromDialog}
        onSelectChapter={handleSelectChapterFromDialog}
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
            upsertNote(noteId, content, verseIds);
            setNoteDialog(null);
          }}
          onDelete={(noteId) => {
            deleteNote(noteId);
            setNoteDialog(null);
          }}
          onClose={() => setNoteDialog(null)}
        />
      )}
    </div>
  );
}

function EmptyReader({ onOpenSidebar }: { onOpenSidebar: () => void }) {
  return (
    <div className="flex flex-1 h-full flex-col items-center justify-center gap-4 p-8">
      <p className="font-serif text-xl text-muted-foreground/60 text-balance text-center">
        Selecione um livro e um capítulo para começar a ler.
      </p>
      <p className="text-xs text-muted-foreground/40 text-center text-balance">
        Clique em qualquer versículo para destacar ou adicionar uma nota.
      </p>
      <p className="text-[10px] text-muted-foreground/30 mt-2">
        v{process.env.NEXT_PUBLIC_APP_VERSION}
      </p>
      <button
        onClick={onOpenSidebar}
        className="md:hidden mt-2 rounded-md px-4 py-2 text-sm bg-secondary text-secondary-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
      >
        Escolher livro
      </button>
    </div>
  );
}
