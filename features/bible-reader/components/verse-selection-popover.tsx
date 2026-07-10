"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import {
  IconCopy,
  IconClipboardText,
  IconCheck,
  IconX,
  IconHighlight,
  IconNotebook,
} from "@tabler/icons-react";
import type { Book, Verse } from "@/lib/types";
import { toast } from "sonner";
import {
  formatVerseReference,
  formatVerseText,
} from "@/features/bible-reader/utils/verse-reference";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/lib/use-media-query";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { HighlightMenu } from "@/features/highlights/components/highlight-menu";
import { useHighlightMutations } from "@/features/highlights/hooks/use-highlight-mutations";
import { useHighlightsContext } from "@/features/highlights/context/highlights-context";
import { useNotesContext } from "@/features/notes/context/notes-context";
import type { NoteTarget } from "@/features/notes/types";

interface VerseSelectionPopoverProps {
  book: Book;
  chapter: number;
  selectedVerses: Verse[];
  versionAbbr: string;
  versionId: string;
  onClose: () => void;
  onOpenHighlightEditor: () => void;
}

type CopiedKind = "reference" | "text" | null;

async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* cai no fallback */
  }
  try {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(textarea);
    return ok;
  } catch {
    return false;
  }
}

export function VerseSelectionPopover({
  book,
  chapter,
  selectedVerses,
  versionAbbr,
  versionId,
  onClose,
  onOpenHighlightEditor,
}: VerseSelectionPopoverProps) {
  const [copied, setCopied] = useState<CopiedKind>(null);
  const [showToolbar, setShowToolbar] = useState(false);
  const isMobile = useIsMobile();

  const {
    createHighlight,
    updateHighlight,
    deleteHighlight,
    createCategory,
    listCategories,
  } = useHighlightMutations();

  const { highlightsByVerse } = useHighlightsContext();
  const { openNotePanel } = useNotesContext();

  const noteTarget: NoteTarget = useMemo(() => {
    const nums = selectedVerses
      .map((v) => parseInt(v.id.split("-").pop()!, 10))
      .sort((a, b) => a - b)
    return {
      bible: versionId,
      book: book.id,
      chapter,
      verseStart: nums[0],
      verseEnd: nums.length > 1 ? nums[nums.length - 1] : null,
    }
  }, [selectedVerses, versionId, book.id, chapter]);

  const handleOpenNote = useCallback(() => {
    openNotePanel(noteTarget)
    onClose()
  }, [openNotePanel, noteTarget, onClose]);

  const reference = formatVerseReference(
    book,
    chapter,
    selectedVerses,
    versionAbbr,
  );
  const count = selectedVerses.length;

  // Find if there is an active highlight for the selected verses (reserved for future UI use)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _activeHighlight = useMemo(() => {
    if (selectedVerses.length === 0) return null;
    const firstVerseId = selectedVerses[0].id;
    const verseHighlights = highlightsByVerse.get(firstVerseId) ?? [];
    return verseHighlights.find((h) => {
      const hVerses = h.verses.map((v) => v.verse);
      return selectedVerses.every((sv) => {
        const num = parseInt(sv.id.split("-").pop()!, 10);
        return hVerses.includes(num);
      });
    }) || null;
  }, [selectedVerses, highlightsByVerse]);

  // Reset toolbar state to closed when selection changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowToolbar(false);
    }, 0)
    return () => clearTimeout(timer)
  }, [selectedVerses]);

  async function handleCopy(kind: CopiedKind) {
    const text =
      kind === "reference"
        ? reference
        : formatVerseText(book, chapter, selectedVerses, versionAbbr);
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopied(kind);
      toast.success(
        kind === "reference" ? "Referência copiada!" : "Texto copiado!"
      );
      setTimeout(() => setCopied(null), 2000);
    } else {
      toast.error("Não foi possível copiar.");
    }
  }

  return (
    <div
      data-verse-selection-bar=""
      className={cn(
        "fixed inset-x-0 z-50 flex justify-center p-4 transition-all duration-200 pointer-events-none",
        isMobile ? "bottom-24" : "bottom-4",
      )}
    >
      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(12px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
      
      <div className="flex flex-col gap-2 w-full max-w-sm md:max-w-4xl pointer-events-auto items-stretch">
        {/* --- Toolbar / Highlight Menu --- */}
        {showToolbar && (
          <div
            className={cn(
              "flex overflow-hidden rounded-2xl bg-background/95 backdrop-blur-sm border border-border shadow-lg px-4 py-2.5 transition-all duration-200",
              isMobile ? "w-full" : "self-end min-w-[280px]"
            )}
            style={{
              animation: "slideUp 250ms cubic-bezier(0.16, 1, 0.3, 1) forwards",
            }}
          >
            <HighlightMenu
              selectedVerseIds={selectedVerses.map((v) => v.id)}
              bookId={book.id}
              chapter={chapter}
              versionId={versionId}
              isMobile={isMobile}
              onCreateHighlight={createHighlight}
              onUpdateHighlight={updateHighlight}
              onDeleteHighlight={deleteHighlight}
              listCategories={listCategories}
              createCategory={createCategory}
              onClose={onClose}
              onOpenEditor={onOpenHighlightEditor}
            />
          </div>
        )}

        {/* --- Card / Popover --- */}
        <div
          className={cn(
            "flex overflow-hidden rounded-2xl bg-background/95 backdrop-blur-sm border border-border shadow-lg transition-all duration-200",
            isMobile ? "w-full flex-col" : "w-full flex-row items-center gap-3 px-4 py-2 text-sm"
          )}
        >
          {isMobile ? (
            // Mobile View
            <>
              {/* Header */}
              <div className="relative flex items-center justify-between px-4 pt-3 pb-1.5 w-full">
                <div className="flex items-center gap-2 truncate">
                  <span className="font-semibold text-foreground text-sm truncate">
                    {reference}
                  </span>
                  <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                    {count > 1 ? `${count} versículos` : `${count} versículo`}
                  </span>
                </div>
                <Button
                  type="button"
                  onClick={onClose}
                  variant="ghost"
                  size="icon-xs"
                  className="shrink-0 text-muted-foreground hover:text-foreground"
                  aria-label="Limpar seleção"
                >
                  <IconX />
                </Button>
              </div>

              <Separator />

              {/* Actions */}
              <div className="flex items-center gap-1 px-3 pb-3 pt-1.5 w-full">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => handleCopy("reference")}
                  className={cn(
                    "flex-1 text-muted-foreground hover:text-foreground",
                    copied === "reference" && "text-primary hover:text-primary"
                  )}
                  aria-label={copied === "reference" ? "Referência copiada" : "Copiar referência"}
                >
                  {copied === "reference" ? (
                    <IconCheck data-icon="inline-start" />
                  ) : (
                    <IconCopy data-icon="inline-start" />
                  )}
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => handleCopy("text")}
                  className={cn(
                    "flex-1 text-muted-foreground hover:text-foreground",
                    copied === "text" && "text-primary hover:text-primary"
                  )}
                  aria-label={copied === "text" ? "Texto copiado" : "Copiar texto"}
                >
                  {copied === "text" ? (
                    <IconCheck data-icon="inline-start" />
                  ) : (
                    <IconClipboardText data-icon="inline-start" />
                  )}
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setShowToolbar(!showToolbar)}
                  className={cn(
                    "flex-1 text-muted-foreground hover:text-foreground",
                    showToolbar && "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  )}
                  aria-label="Destacar"
                >
                  <IconHighlight data-icon="inline-start" />
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={handleOpenNote}
                  className="flex-1 text-muted-foreground hover:text-foreground"
                  aria-label="Anotar"
                >
                  <IconNotebook data-icon="inline-start" />
                </Button>
              </div>
            </>
          ) : (
            // Desktop View
            <>
              <span className="font-semibold text-foreground truncate max-w-[200px] sm:max-w-[280px]">
                {reference}
              </span>
              <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                {count > 1 ? `${count} versículos` : `${count} versículo`}
              </span>

              {/* Spacer */}
              <div className="flex-grow" />

              {/* Actions */}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleCopy("reference")}
                className={cn(
                  "text-muted-foreground hover:text-foreground",
                  copied === "reference" && "text-primary hover:text-primary"
                )}
              >
                {copied === "reference" ? (
                  <IconCheck data-icon="inline-start" />
                ) : (
                  <IconCopy data-icon="inline-start" />
                )}
                {copied === "reference" ? "Copiado!" : "Referência"}
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleCopy("text")}
                className={cn(
                  "text-muted-foreground hover:text-foreground",
                  copied === "text" && "text-primary hover:text-primary"
                )}
              >
                {copied === "text" ? (
                  <IconCheck data-icon="inline-start" />
                ) : (
                  <IconClipboardText data-icon="inline-start" />
                )}
                {copied === "text" ? "Copiado!" : "Texto"}
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowToolbar(!showToolbar)}
                className={cn(
                  "text-muted-foreground hover:text-foreground",
                  showToolbar && "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                )}
              >
                <IconHighlight data-icon="inline-start" />
                Destaque
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleOpenNote}
                className="text-muted-foreground hover:text-foreground"
              >
                <IconNotebook data-icon="inline-start" />
                Nota
              </Button>

              <Button
                type="button"
                onClick={onClose}
                variant="ghost"
                size="icon-xs"
                className="shrink-0 text-muted-foreground hover:text-foreground ml-1"
                aria-label="Limpar seleção"
              >
                <IconX />
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
