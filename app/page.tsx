"use client";

import { useState, useEffect } from "react";
import { Menu, ChevronLeft, ChevronRight } from "lucide-react";
import { Sidebar } from "@/components/sidebar";
import { Reader } from "@/components/reader";
import { NoteEditorDialog } from "@/components/note-editor-dialog";
import { useNotes } from "@/lib/store";

const BOOK_KEY = "openbible:book";
const CHAPTER_KEY = "openbible:chapter";

export default function Home() {
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [noteDialog, setNoteDialog] = useState<{
    verseIds: string[];
    noteId: string | null;
  } | null>(null);

  const { notes, upsertNote, deleteNote } = useNotes();

  // Restore last position from localStorage on mount
  useEffect(() => {
    try {
      const book = localStorage.getItem(BOOK_KEY);
      const chapter = localStorage.getItem(CHAPTER_KEY);
      if (book) setSelectedBookId(book);
      if (chapter) setSelectedChapter(Number(chapter));
    } catch { /* ignore */ }
  }, []);

  // Persist position when it changes
  useEffect(() => {
    if (selectedBookId) {
      try { localStorage.setItem(BOOK_KEY, selectedBookId); } catch { /* ignore */ }
    }
  }, [selectedBookId]);

  useEffect(() => {
    if (selectedChapter !== null) {
      try { localStorage.setItem(CHAPTER_KEY, String(selectedChapter)); } catch { /* ignore */ }
    }
  }, [selectedChapter]);

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

  return (
    <main className="h-dvh flex overflow-hidden bg-background">
      {/* Sidebar — handles both desktop and mobile drawer */}
      <Sidebar
        selectedBookId={selectedBookId}
        selectedChapter={selectedChapter}
        onSelectBook={handleSelectBook}
        onSelectChapter={handleSelectChapter}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onJumpTo={handleJumpTo}
        sidebarCollapsed={sidebarCollapsed}
        onToggleSidebar={() => setSidebarCollapsed((v) => !v)}
        onOpenNoteEditor={(verseIds, noteId) => setNoteDialog({ verseIds, noteId })}
      />

      {/* Desktop sidebar toggle — always visible */}
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

      {/* Main content area */}
      <div className="flex flex-1 flex-col min-w-0 h-full overflow-hidden">
        {/* Mobile top bar */}
        <div className="md:hidden flex items-center gap-3 px-4 py-3 border-b border-border shrink-0 bg-sidebar">
          <button
            onClick={() => setSidebarOpen(true)}
            aria-label="Abrir menu"
            className="flex items-center justify-center w-8 h-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <Menu className="h-4 w-4" />
          </button>
          <span className="font-serif text-sm font-medium text-foreground">
            {selectedBookId && selectedChapter
              ? `${selectedBookId} · Cap. ${selectedChapter}`
              : "Open Bible"}
          </span>
        </div>

        {/* Reader or empty state */}
        <div className="flex-1 overflow-hidden">
          {selectedBookId && selectedChapter ? (
            <Reader
              bookId={selectedBookId}
              chapter={selectedChapter}
              onChapterChange={handleChapterChange}
              onBack={() => setSidebarOpen(true)}
              onOpenNoteEditor={(verseIds, noteId) => setNoteDialog({ verseIds, noteId })}
            />
          ) : (
            <EmptyReader onOpenSidebar={() => setSidebarOpen(true)} />
          )}
        </div>
      </div>
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
    </main>
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
      {/* Mobile shortcut */}
      <button
        onClick={onOpenSidebar}
        className="md:hidden mt-2 rounded-md px-4 py-2 text-sm bg-secondary text-secondary-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
      >
        Escolher livro
      </button>
    </div>
  );
}
