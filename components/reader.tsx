"use client";

import { useState, useRef, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { getBook } from "@/lib/bible-data";
import { useHighlights, useNotes } from "@/lib/store";
import { useBibleVerses } from "@/lib/use-bible";
import { VerseRow } from "./verse-row";
import { ReaderHeader } from "./reader-header";
import { ReaderChapterNav } from "./reader-chapter-nav";

interface ReaderProps {
  bookId: string;
  chapter: number;
  onChapterChange: (chapter: number) => void;
  onBookChapterClick: () => void;
  onInspectorToggle: () => void;
  isInspectorOpen: boolean;
  readerMode: "wide" | "readable";
  onToggleReaderMode: () => void;
  onOpenNoteEditor?: (verseIds: string[], noteId: string | null) => void;
}

export function Reader({
  bookId,
  chapter,
  onChapterChange,
  onBookChapterClick,
  onInspectorToggle,
  isInspectorOpen,
  readerMode,
  onToggleReaderMode,
  onOpenNoteEditor,
}: ReaderProps) {
  const book = getBook(bookId);
  const { verses, loading } = useBibleVerses(bookId, chapter);
  const { getHighlight } = useHighlights();
  const { getNote } = useNotes();

  const [activeVerseId, setActiveVerseId] = useState<string | null>(null);
  const [selectedVerseIds, setSelectedVerseIds] = useState<Set<string>>(
    new Set(),
  );
  const [multiSelectMode, setMultiSelectMode] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setActiveVerseId(null);
    setSelectedVerseIds(new Set());
  }, [bookId, chapter]);

  if (!book) return null;

  function handleVerseClick(verseId: string) {
    if (multiSelectMode) {
      setSelectedVerseIds((prev) => {
        const next = new Set(prev);
        if (next.has(verseId)) next.delete(verseId);
        else next.add(verseId);
        return next;
      });
      return;
    }
    setActiveVerseId((prev) => (prev === verseId ? null : verseId));
  }

  function prevChapter() {
    if (chapter > 1) onChapterChange(chapter - 1);
  }

  function nextChapter() {
    if (book && chapter < book.chapters) onChapterChange(chapter + 1);
  }

  return (
    <div className="flex flex-col min-w-0 h-full">
      <ReaderHeader
        book={book}
        chapter={chapter}
        readerMode={readerMode}
        isInspectorOpen={isInspectorOpen}
        onBookChapterClick={onBookChapterClick}
        onToggleReaderMode={onToggleReaderMode}
        onInspectorToggle={onInspectorToggle}
      />

      <header className="mb-12 text-center">
        <h2 className="font-serif text-4xl font-semibold text-foreground mb-3">
          {book.name}
        </h2>
        <div className="flex items-center justify-center gap-3">
          <div className="h-px w-8 bg-border" />
          <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-muted-foreground">
            Chapter {chapter}
          </p>
          <div className="h-px w-8 bg-border" />
        </div>
      </header>

      {multiSelectMode && (
        <div className="flex items-center justify-between bg-primary/10 border-b border-primary/20 px-4 py-1.5 mb-4 shrink-0">
          <span className="text-xs text-primary font-medium">
            {selectedVerseIds.size === 0
              ? "Clique nos versículos para selecionar"
              : `${selectedVerseIds.size} versículo${selectedVerseIds.size > 1 ? "s" : ""} selecionado${selectedVerseIds.size > 1 ? "s" : ""}`}
          </span>
          <button
            onClick={() => setSelectedVerseIds(new Set())}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Limpar
          </button>
        </div>
      )}

      <article
        ref={containerRef}
        className="font-serif text-[20px] leading-[1.8] text-foreground selection:bg-highlight"
      >
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          verses.map((verse, index) => (
            <VerseRow
              key={verse.id}
              verse={verse}
              highlight={getHighlight(verse.id)}
              note={getNote(verse.id)}
              isActive={verse.id === activeVerseId}
              isSelected={selectedVerseIds.has(verse.id)}
              isFirst={index === 0}
              onClick={() => handleVerseClick(verse.id)}
            />
          ))
        )}
      </article>

      <ReaderChapterNav
        book={book}
        chapter={chapter}
        onPrevChapter={prevChapter}
        onNextChapter={nextChapter}
      />
    </div>
  );
}
