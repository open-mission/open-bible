"use client";

import { useState, useRef, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  PanelRightOpen,
  PanelRightClose,
  MoreVertical,
  CheckSquare,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { getBook } from "@/lib/bible-data";
import { useHighlights, useNotes } from "@/lib/store";
import { useBibleVerses } from "@/lib/use-bible";
import { useBibleVersion } from "@/lib/bible-version-context";
import type { HighlightColor } from "@/lib/types";
import { VerseRow } from "./verse-row";
import { ReaderVersionBadge } from "./reader-version-badge";

interface ReaderProps {
  bookId: string;
  chapter: number;
  onChapterChange: (chapter: number) => void;
  onBack: () => void;
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
  onBack,
  onBookChapterClick,
  onInspectorToggle,
  isInspectorOpen,
  readerMode,
  onToggleReaderMode,
  onOpenNoteEditor,
}: ReaderProps) {
  const book = getBook(bookId);
  const { verses, loading } = useBibleVerses(bookId, chapter);
  const { addHighlight, removeHighlight, getHighlight } = useHighlights();
  const { getNote } = useNotes();
  const { versionId, installedVersions } = useBibleVersion();

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

  const currentVersion = installedVersions.find((v) => v.id === versionId);
  const versionAbbreviation = currentVersion?.name || versionId.toUpperCase();

  function handleVerseClick(verseId: string) {
    if (multiSelectMode) {
      setSelectedVerseIds((prev) => {
        const next = new Set(prev);
        if (next.has(verseId)) {
          next.delete(verseId);
        } else {
          next.add(verseId);
        }
        return next;
      });
      return;
    }
    setActiveVerseId((prev) => (prev === verseId ? null : verseId));
  }

  function toggleMultiSelect() {
    setMultiSelectMode((v) => !v);
    setSelectedVerseIds(new Set());
    setActiveVerseId(null);
  }

  function prevChapter() {
    if (chapter > 1) {
      onChapterChange(chapter - 1);
    }
  }

  function nextChapter() {
    if (chapter < book!.chapters) {
      onChapterChange(chapter + 1);
    }
  }

  return (
    <div className="flex flex-col min-w-0 h-full">
      {/* Top navigation bar inside Reader */}
      <div className="flex items-center justify-between px-4 md:px-6 pb-3 border-b border-border mb-8">
        <nav className="flex items-center space-x-1 text-sm font-medium">
          <button
            onClick={onBookChapterClick}
            className="inline-flex items-center justify-center gap-2 rounded-md h-9 px-3 py-2 hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <span className="text-sm font-semibold">{book.name}</span>
            <ChevronLeft className="h-4 w-4 text-muted-foreground" />
          </button>
          <span className="text-muted-foreground/40 px-1">/</span>
          <button
            onClick={onBookChapterClick}
            className="inline-flex items-center justify-center gap-2 rounded-md h-9 px-3 py-2 hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <span className="text-sm font-semibold">{chapter}</span>
          </button>
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleMultiSelect}
            aria-label={
              multiSelectMode
                ? "Sair da seleção múltipla"
                : "Selecionar múltiplos versículos"
            }
            aria-pressed={multiSelectMode}
            title={
              multiSelectMode
                ? "Sair da seleção múltipla"
                : "Selecionar múltiplos versículos"
            }
            className={`hidden md:flex items-center justify-center w-8 h-8 rounded-md transition-colors ${
              multiSelectMode
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary"
            }`}
          >
            <CheckSquare className="h-4 w-4" />
          </button>

          <ReaderVersionBadge />

          <button
            onClick={onToggleReaderMode}
            className="hidden md:inline-flex items-center justify-center gap-2 rounded-md h-8 px-3 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
            title={readerMode === "wide" ? "Modo legível" : "Modo largo"}
          >
            {readerMode === "wide" ? (
              <Minimize2 className="h-3.5 w-3.5" />
            ) : (
              <Maximize2 className="h-3.5 w-3.5" />
            )}
            <span className="hidden lg:inline">
              {readerMode === "wide" ? "Legível" : "Largo"}
            </span>
          </button>

          <button
            onClick={onInspectorToggle}
            className={`h-8 w-8 inline-flex items-center justify-center rounded-md transition-colors ${
              isInspectorOpen
                ? "bg-accent text-accent-foreground"
                : "hover:bg-accent text-muted-foreground"
            }`}
            title={isInspectorOpen ? "Fechar inspector" : "Abrir inspector"}
          >
            {isInspectorOpen ? (
              <PanelRightClose className="h-5 w-5" />
            ) : (
              <PanelRightOpen className="h-5 w-5" />
            )}
          </button>

          <button className="h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-accent text-muted-foreground transition-colors">
            <MoreVertical className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Chapter header */}
      <header className="mb-12 text-center">
        <h2 className="font-serif text-4xl font-semibold text-foreground mb-3">
          {book.name}
        </h2>
        <div className="flex items-center justify-center gap-3">
          <div className="h-px w-8 bg-border"></div>
          <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-muted-foreground">
            Chapter {chapter}
          </p>
          <div className="h-px w-8 bg-border"></div>
        </div>
      </header>

      {/* Multi-select hint bar */}
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

      {/* Verses */}
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

      {/* Chapter navigation footer */}
      <div className="mt-16 pt-8 border-t border-border flex justify-between items-center">
        <span className="text-xs italic text-muted-foreground">
          End of {book.name} {chapter}
        </span>
        <div className="flex gap-2">
          <button
            onClick={prevChapter}
            disabled={chapter <= 1}
            className="inline-flex items-center justify-center rounded-md h-9 w-9 border border-border hover:bg-accent hover:text-accent-foreground transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={nextChapter}
            disabled={chapter >= book.chapters}
            className="inline-flex items-center justify-center rounded-md h-9 w-9 border border-border hover:bg-accent hover:text-accent-foreground transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
