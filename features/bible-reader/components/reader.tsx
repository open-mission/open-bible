"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { getBook } from "@/features/bible-reader/utils/bible-data";
import { useBibleVerses } from "@/features/bible-reader/hooks/use-bible";
import { VerseRow } from "./verse-row";
import { ReaderHeader } from "./reader-header";
import { ReaderChapterNav } from "./reader-chapter-nav";

interface ReaderProps {
  bookId: string;
  chapter: number;
  onChapterChange: (chapter: number) => void;
  onBookChapterClick: () => void;
  readerMode: "narrow" | "medium" | "wide";
  onChangeReaderMode: (mode: "narrow" | "medium" | "wide") => void;
  fontSize: number;
  onChangeFontSize: (size: number) => void;
  verseSpacing: "small" | "medium" | "large";
  onChangeVerseSpacing: (spacing: "small" | "medium" | "large") => void;
  readerFont: "sans" | "serif" | "mono";
  onChangeReaderFont: (font: "sans" | "serif" | "mono") => void;
}

export function Reader({
  bookId,
  chapter,
  onChapterChange,
  onBookChapterClick,
  readerMode,
  onChangeReaderMode,
  fontSize,
  onChangeFontSize,
  verseSpacing,
  onChangeVerseSpacing,
  readerFont,
  onChangeReaderFont,
}: ReaderProps) {
  const book = getBook(bookId);
  const { verses, loading } = useBibleVerses(bookId, chapter);

  const [activeVerseId, setActiveVerseId] = useState<string | null>(null);
  const [selectedVerseIds, setSelectedVerseIds] = useState<Set<string>>(
    new Set(),
  );
  const [multiSelectMode] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const [headerVisible, setHeaderVisible] = useState(true);

  useEffect(() => {
    const target = headerRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setHeaderVisible(entry.isIntersecting);
      },
      { threshold: 0 },
    );
    observer.observe(target);

    return () => {
      observer.unobserve(target);
    };
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

  const spacingClasses = {
    small: "py-1.5 mb-1",
    medium: "py-2.5 mb-2",
    large: "py-4 mb-4",
  };

  const fontClass =
    readerFont === "sans"
      ? "font-sans"
      : readerFont === "mono"
        ? "font-mono"
        : "font-serif";

  return (
    <div className="flex flex-col min-w-0 h-full">
      <ReaderHeader
        book={book}
        chapter={chapter}
        readerMode={readerMode}
        onBookChapterClick={onBookChapterClick}
        onChangeReaderMode={onChangeReaderMode}
        showMiniReference={!headerVisible}
        fontSize={fontSize}
        onChangeFontSize={onChangeFontSize}
        verseSpacing={verseSpacing}
        onChangeVerseSpacing={onChangeVerseSpacing}
        readerFont={readerFont}
        onChangeReaderFont={onChangeReaderFont}
      />

      <div
        className={`flex-1 w-full mx-auto ${
          readerMode === "wide"
            ? "max-w-none px-4 md:px-8 py-8"
            : readerMode === "medium"
              ? "max-w-4xl px-4 md:px-12 py-8"
              : "max-w-2xl px-4 md:px-16 py-8"
        }`}
      >
        <header ref={headerRef} className="mb-12 text-center">
          <h2
            className={`${fontClass} text-4xl font-semibold text-foreground mb-3`}
          >
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
          className={`${fontClass} text-foreground selection:bg-highlight`}
          style={{ fontSize: `${fontSize}px` }}
        >
          {loading ? (
            <div className="space-y-1">
              {Array.from({ length: 15 }).map((_, i) => (
                <div
                  key={i}
                  className={`flex gap-4 px-4 sm:px-6 ${spacingClasses[verseSpacing]} rounded-md`}
                >
                  <sup className="font-verse-number text-xs font-bold text-muted-foreground/60 shrink-0 mt-1">
                    {i + 1}
                  </sup>
                  <div className="flex-1 space-y-2 mt-1">
                    <Skeleton
                      className="h-4 bg-muted/60"
                      style={{ width: `${85 + (i % 4) * 4}%` }}
                    />
                    {i % 3 !== 0 && (
                      <Skeleton
                        className="h-4 bg-muted/40"
                        style={{ width: `${40 + (i % 3) * 15}%` }}
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            verses.map((verse) => (
              <VerseRow
                key={verse.id}
                verse={verse}
                isActive={verse.id === activeVerseId}
                isSelected={selectedVerseIds.has(verse.id)}
                onClick={() => handleVerseClick(verse.id)}
                verseSpacing={verseSpacing}
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

      {/* Floating navigation: bottom on mobile, sides on desktop */}
      <div className="fixed inset-x-0 bottom-36 z-40 flex justify-center pointer-events-none md:hidden">
        <div className="flex gap-5 pointer-events-auto">
          <button
            onClick={prevChapter}
            disabled={chapter <= 1}
            className="inline-flex items-center justify-center rounded-full size-12 bg-background/90 backdrop-blur-sm border border-border shadow-lg hover:bg-accent hover:text-accent-foreground transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
            aria-label="Capítulo anterior"
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            onClick={nextChapter}
            disabled={book && chapter >= book.chapters}
            className="inline-flex items-center justify-center rounded-full size-12 bg-background/90 backdrop-blur-sm border border-border shadow-lg hover:bg-accent hover:text-accent-foreground transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
            aria-label="Próximo capítulo"
          >
            <ChevronRight className="size-5" />
          </button>
        </div>
      </div>

      <div className="hidden md:flex fixed inset-0 z-40 pointer-events-none">
        <button
          onClick={prevChapter}
          disabled={chapter <= 1}
          className="pointer-events-auto absolute left-4 top-1/2 -translate-y-1/2 inline-flex items-center justify-center rounded-full size-12 bg-background/80 backdrop-blur-sm border border-border shadow-lg hover:bg-accent hover:text-accent-foreground transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
          aria-label="Capítulo anterior"
        >
          <ChevronLeft className="size-5" />
        </button>
        <button
          onClick={nextChapter}
          disabled={book && chapter >= book.chapters}
          className="pointer-events-auto absolute right-4 top-1/2 -translate-y-1/2 inline-flex items-center justify-center rounded-full size-12 bg-background/80 backdrop-blur-sm border border-border shadow-lg hover:bg-accent hover:text-accent-foreground transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
          aria-label="Próximo capítulo"
        >
          <ChevronRight className="size-5" />
        </button>
      </div>
    </div>
  );
}
