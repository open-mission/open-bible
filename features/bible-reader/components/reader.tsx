"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { getBook } from "@/features/bible-reader/utils/bible-data";
import { useBibleVerses } from "@/features/bible-reader/hooks/use-bible";
import { useBibleVersion } from "@/features/bible-reader/context/bible-version-context";
import { VerseRow } from "./verse-row";
import { VerseSelectionPopover } from "./verse-selection-popover";
import { useKeyboardNavigation } from "../hooks/use-keyboard-navigation";
import { useSwipeNavigation } from "../hooks/use-swipe-navigation";
import { ReaderHeader } from "./reader-header";
import { cn } from "@/lib/utils";
import { HighlightsProvider, useHighlightsContext } from "@/features/highlights/context/highlights-context";
import { useNotesContext } from "@/features/notes/context/notes-context";
import { HighlightEditor } from "@/features/highlights/components/highlight-editor";
import { AllHighlightsBrowser } from "@/features/highlights/components/all-highlights-browser";
import { NotesBrowser } from "@/features/notes/components/notes-browser";
import { useIsMobile } from "@/lib/use-media-query";
import { useHighlightMutations } from "@/features/highlights/hooks/use-highlight-mutations";
import { database } from "@/lib/database/database";
// highlight icon inline (avoids tabler-icons server build issue)
import type { HighlightData } from "@/features/highlights/context/highlights-context";
import type { HighlightCategory } from "@/lib/database/user/schema";

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
  /** Whether this pane is the active one in the workspace grid. When false,
   *  verse selection is cleared and the selection popover is hidden so that
   *  only the focused pane can show a selection. Defaults to true (tabs/simple). */
  isActive?: boolean;
}

function ReaderContent({
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
  versionId,
  isActive = true,
}: ReaderProps & { versionId: string }) {
  const book = getBook(bookId);
  const { verses, loading } = useBibleVerses(bookId, chapter);
  const { highlightsByVerse } = useHighlightsContext();
  const { notesByVerse, openNotePanel, closeNotePanel } = useNotesContext();
  const isMobile = useIsMobile();

  const [activeVerseId, setActiveVerseId] = useState<string | null>(null);
  const [selectedVerseIds, setSelectedVerseIds] = useState<Set<string>>(
    new Set(),
  );
  const [slideDirection, setSlideDirection] = useState<"left" | "right" | null>(
    null,
  );

  const [editingHighlight, setEditingHighlight] = useState<HighlightData | null>(null);
  const [showHighlightEditor, setShowHighlightEditor] = useState(false);
  const [showCreateEditor, setShowCreateEditor] = useState(false);
  const [createEditorVerses, setCreateEditorVerses] = useState<number[]>([]);
  /** Dock inspector: toggled "notes" | "highlights" view (null = closed). */
  const [dockView, setDockView] = useState<"notes" | "highlights" | null>(null);
  const [showToolbar, setShowToolbar] = useState(false);

  /** Clear verse selection when this pane becomes inactive (grid mode) so
   *  only the focused pane shows a selection popover. */
  useEffect(() => {
    if (!isActive) {
      setSelectedVerseIds(new Set());
      setActiveVerseId(null);
      setShowToolbar(false);
    }
  }, [isActive]);

  const { createHighlight, updateHighlight, deleteHighlight, listCategories, createCategory } = useHighlightMutations();

  const containerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [popoverPosition, setPopoverPosition] = useState<{ top: number; position: "top" | "bottom" } | null>(null);

  const prevChapter = useCallback(() => {
    if (chapter > 1) {
      setSlideDirection("right");
      onChapterChange(chapter - 1);
    }
  }, [chapter, onChapterChange]);

  const nextChapter = useCallback(() => {
    if (book && chapter < book.chapters) {
      setSlideDirection("left");
      onChapterChange(chapter + 1);
    }
  }, [book, chapter, onChapterChange]);

  const handleVerseClick = useCallback((verseId: string) => {
    setActiveVerseId(verseId);
    setSelectedVerseIds((prev) => {
      const next = new Set(prev);
      if (next.has(verseId)) next.delete(verseId);
      else next.add(verseId);
      return next;
    });
    setShowToolbar(false);
  }, []);

  const handleArticleClick = useCallback(
    (e: React.MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const verseRow = target?.closest<HTMLElement>("[data-verse-id]");
      if (verseRow?.dataset.verseId) {
        handleVerseClick(verseRow.dataset.verseId);
      }
    },
    [handleVerseClick],
  );

  const open = selectedVerseIds.size > 0;
  const selectedVerses = verses.filter((v) => selectedVerseIds.has(v.id));
  const versionAbbr = versionId.toUpperCase();

  const dockEditHighlight = useCallback(
    async (highlightId: string) => {
      setDockView(null);
      await database.initialize();
      const h = await database.highlights.findById(highlightId);
      if (!h) return;
      let category: HighlightCategory | null = null;
      if (h.categoryId) {
        category = await database.highlightCategories.findById(h.categoryId);
      }
      const verses = await database.highlightVerses.findByHighlightId(highlightId);
      setEditingHighlight({ highlight: h, category, verses });
      setShowHighlightEditor(true);
    },
    [],
  );

  useEffect(() => {
    if (!open) return;
    let pointerDownX = 0;
    let pointerDownY = 0;
    function handlePointerDown(e: PointerEvent) {
      pointerDownX = e.clientX;
      pointerDownY = e.clientY;
    }
    // Only clear selection on a genuine tap outside a verse, not when the
    // user is scrolling/dragging the screen (which also emits pointer events).
    function handlePointerUp(e: PointerEvent) {
      const dx = Math.abs(e.clientX - pointerDownX);
      const dy = Math.abs(e.clientY - pointerDownY);
      if (dx > 10 || dy > 10) return;
      const target = e.target as HTMLElement | null;
      if (!target) return;
      if (
        target.closest("[data-verse-row]") ||
        target.closest("[data-verse-selection-bar]")
      )
        return;
      setSelectedVerseIds(new Set());
      setShowToolbar(false);
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setSelectedVerseIds(new Set());
        setShowToolbar(false);
      }
    }
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("pointerup", handlePointerUp);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("pointerup", handlePointerUp);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  // Recalculate popover position based on selection bounds
  useEffect(() => {
    if (selectedVerseIds.size === 0 || !scrollContainerRef.current || !containerRef.current) {
      setPopoverPosition(null);
      return;
    }

    const scrollContainer = scrollContainerRef.current;
    
    const updatePosition = () => {
      if (selectedVerseIds.size === 0 || !scrollContainerRef.current || !containerRef.current) {
        setPopoverPosition(null);
        return;
      }
      
      const containerRect = scrollContainer.getBoundingClientRect();
      const elements = Array.from(containerRef.current!.querySelectorAll("[data-verse-row]"))
        .filter((el) => {
          const id = el.getAttribute("data-verse-id");
          return id && selectedVerseIds.has(id);
        }) as HTMLElement[];

      if (elements.length === 0) {
        setPopoverPosition(null);
        return;
      }

      // Get bounding range of all selected verses relative to the scrolling container
      let minTop = Infinity;
      let maxBottom = -Infinity;

      elements.forEach((el) => {
        const rect = el.getBoundingClientRect();
        // Since we position the popover absolute inside scrollContainer,
        // we calculate top and bottom relative to scrollContainer's top, plus current scroll.
        const relTop = rect.top - containerRect.top + scrollContainer.scrollTop;
        const relBottom = rect.bottom - containerRect.top + scrollContainer.scrollTop;
        if (relTop < minTop) minTop = relTop;
        if (relBottom > maxBottom) maxBottom = relBottom;
      });

      // Space above the selection within the scrollContainer's viewport
      const spaceAbove = minTop - scrollContainer.scrollTop;
      // Space below the selection within the scrollContainer's viewport
      const spaceBelow = containerRect.height - (maxBottom - scrollContainer.scrollTop);

      // Estimated height of our compact popover (around 60px to 120px depending on showToolbar)
      // Since it's a floating pill, it will be small.
      const estimatedHeight = showToolbar ? 120 : 60;
      const offset = 8; // Spacing margin

      let placement: "top" | "bottom" = "top";
      let top = minTop - estimatedHeight - offset;

      // If there is not enough space above, but there is space below, or if space below is greater
      if (spaceAbove < estimatedHeight + offset && spaceBelow > spaceAbove) {
        placement = "bottom";
        top = maxBottom + offset;
      } else {
        placement = "top";
        top = minTop - estimatedHeight - offset;
      }

      // Ensure we don't position above the scroll container's top boundary
      if (top < 0) {
        top = offset;
      }

      console.log("Calculated Popover Position:", { minTop, maxBottom, top, placement, spaceAbove, spaceBelow });
      setPopoverPosition({ top, position: placement });
    };

    // Calculate immediately
    updatePosition();

    // Recalculate on scroll, resize, or viewport changes
    scrollContainer.addEventListener("scroll", updatePosition);
    window.addEventListener("resize", updatePosition);

    const resizeObserver = new ResizeObserver(updatePosition);
    const elements = Array.from(containerRef.current.querySelectorAll("[data-verse-row]"))
      .filter((el) => {
        const id = el.getAttribute("data-verse-id");
        return id && selectedVerseIds.has(id);
      }) as HTMLElement[];
    elements.forEach(el => resizeObserver.observe(el));

    return () => {
      scrollContainer.removeEventListener("scroll", updatePosition);
      window.removeEventListener("resize", updatePosition);
      resizeObserver.disconnect();
    };
  }, [selectedVerseIds, verses, showToolbar]);

  useKeyboardNavigation(prevChapter, nextChapter);
  useSwipeNavigation(prevChapter, nextChapter);

  if (!book) return null;

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
    <div className="relative flex flex-col min-w-0 h-full">
      <ReaderHeader
        book={book}
        chapter={chapter}
        readerMode={readerMode}
        onBookChapterClick={onBookChapterClick}
        onChangeReaderMode={onChangeReaderMode}
        fontSize={fontSize}
        onChangeFontSize={onChangeFontSize}
        verseSpacing={verseSpacing}
        onChangeVerseSpacing={onChangeVerseSpacing}
        readerFont={readerFont}
        onChangeReaderFont={onChangeReaderFont}
        onPrevChapter={prevChapter}
        onNextChapter={nextChapter}
      />

      <div
        ref={scrollContainerRef}
        className={`relative flex-1 min-h-0 overflow-y-auto custom-scrollbar w-full mx-auto ${
          readerMode === "wide"
            ? "max-w-none px-4 md:px-8 pt-8 pb-8"
            : readerMode === "medium"
              ? "max-w-4xl px-4 md:px-12 pt-8 pb-8"
              : "max-w-2xl px-4 md:px-16 pt-8 pb-8"
        }`}
      >
        <header className="mb-12 text-center">
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

        <article
          ref={containerRef}
          onClick={handleArticleClick}
          className={`${fontClass} text-foreground selection:bg-highlight ${
            slideDirection === "left"
              ? "animate-slide-in-left"
              : slideDirection === "right"
                ? "animate-slide-in-right"
                : ""
          }`}
          style={{ fontSize: `${fontSize}px` }}
          onAnimationEnd={() => setSlideDirection(null)}
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
                  highlights={highlightsByVerse.get(verse.id)}
                  onShowAll={() => {
                    closeNotePanel();
                    setDockView("highlights");
                  }}
                  notes={notesByVerse.get(verse.id)}
                  onOpenNote={() => {
                    setDockView(null);
                    openNotePanel({
                      bible: versionId,
                      book: bookId,
                      chapter,
                      verseStart: verse.verse,
                      verseEnd: null,
                    });
                  }}
                  verseSpacing={verseSpacing}
                />
            ))
          )}
        </article>

        {isActive && open && (
          <VerseSelectionPopover
            book={book}
            chapter={chapter}
            selectedVerses={selectedVerses}
            versionAbbr={versionAbbr}
            versionId={versionId}
            onClose={() => setSelectedVerseIds(new Set())}
            onOpenHighlightEditor={() => {
              const verseNums = selectedVerses.map((v) =>
                parseInt(v.id.split("-").pop()!, 10)
              );
              setCreateEditorVerses(verseNums);
              setShowCreateEditor(true);
            }}
            top={popoverPosition?.top ?? 0}
            position={popoverPosition?.position ?? "top"}
            showToolbar={showToolbar}
            setShowToolbar={setShowToolbar}
          />
        )}
      </div>

      <div
        className={cn(
          "w-full bg-linear-to-t z-10 from-background to-transparent absolute bottom-0",
          open ? "h-50" : "h-30",
        )}
      ></div>

      {/* Floating navigation: bottom on mobile, sides on desktop */}
      {!dockView && !open && (
      <div className="fixed inset-x-0 bottom-8 z-40 flex justify-center pointer-events-none md:hidden">
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
      )}


      {/* Highlight Editor — edit mode (from sidebar) */}
      {showHighlightEditor && editingHighlight && (
        <HighlightEditor
          open={showHighlightEditor}
          onClose={() => {
            setShowHighlightEditor(false);
            setEditingHighlight(null);
          }}
          highlight={editingHighlight}
          onSave={async (patch) => {
            await updateHighlight(editingHighlight.highlight.id, patch);
          }}
          onCreate={async (patch) => {
            const verseNums = editingHighlight.verses.map((v) => v.verse);
            await createHighlight({
              color: patch.color,
              content: patch.content,
              categoryId: patch.categoryId,
              book: editingHighlight.verses[0].book,
              chapter: editingHighlight.verses[0].chapter,
              verses: verseNums,
              bible: editingHighlight.verses[0].bible,
            });
          }}
          onDelete={deleteHighlight}
          listCategories={listCategories}
          createCategory={createCategory}
        />
      )}

      {/* Highlight Editor — create mode (from selection popover) */}
      {showCreateEditor && createEditorVerses.length > 0 && (
        <HighlightEditor
          open={showCreateEditor}
          onClose={() => {
            setShowCreateEditor(false);
            setCreateEditorVerses([]);
          }}
          highlight={null}
          onSave={async () => {}}
          onCreate={async (patch) => {
            await createHighlight({
              color: patch.color,
              content: patch.content,
              categoryId: patch.categoryId,
              book: bookId,
              chapter,
              verses: createEditorVerses,
              bible: versionId,
            });
          }}
          onDelete={deleteHighlight}
          listCategories={listCategories}
          createCategory={createCategory}
        />
      )}

      {/* Dock inspector — toggled notes/highlights view.
          Desktop: right-docked side panel. Mobile: full-screen drawer. */}
      {dockView && (
        isMobile ? (
          <div className="fixed inset-0 z-50 flex animate-in fade-in duration-200 flex-col bg-background">
            {dockView === "notes" ? (
              <NotesBrowser
                mode="all"
                active
                embedded
                showCloseButton
                onRequestClose={() => setDockView(null)}
                className="h-full"
              />
            ) : (
              <AllHighlightsBrowser
                active
                embedded
                showCloseButton
                onClose={() => setDockView(null)}
                onEdit={dockEditHighlight}
                onDelete={deleteHighlight}
              />
            )}
          </div>
        ) : (
          <div className="fixed right-0 top-0 z-40 flex h-full w-[min(440px,92vw)] animate-in slide-in-from-right flex-col border-l border-border bg-background shadow-elevation duration-200">
            {dockView === "notes" ? (
              <NotesBrowser
                mode="all"
                active
                embedded
                showCloseButton
                onRequestClose={() => setDockView(null)}
                className="h-full"
              />
            ) : (
              <AllHighlightsBrowser
                active
                embedded
                showCloseButton
                onClose={() => setDockView(null)}
                onEdit={dockEditHighlight}
                onDelete={deleteHighlight}
              />
            )}
          </div>
        )
      )}
    </div>
  );
}

export function Reader(props: ReaderProps) {
  const { bookId, chapter } = props;
  const { versionId } = useBibleVersion();

  return (
    <HighlightsProvider bookId={bookId} chapter={chapter} versionId={versionId}>
      <ReaderContent {...props} versionId={versionId} />
    </HighlightsProvider>
  );
}
