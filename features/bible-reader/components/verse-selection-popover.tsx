"use client";

import { useState, useMemo, useCallback, useRef } from "react";
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
  position: "top" | "bottom";
  showToolbar: boolean;
  setShowToolbar: (show: boolean) => void;
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
  position,
  showToolbar,
  setShowToolbar,
}: VerseSelectionPopoverProps) {
  console.log("VerseSelectionPopover Rendered:", { position, selectedVersesCount: selectedVerses.length });
  const [copied, setCopied] = useState<CopiedKind>(null);
  const isMobile = useIsMobile();
  const popoverRef = useRef<HTMLDivElement>(null);

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
      ref={popoverRef}
      style={position === "top" ? {
        position: "absolute",
        top: "72px",
        left: "50%",
        transform: "translateX(-50%)",
      } : {
        position: "absolute",
        bottom: "16px",
        left: "50%",
        transform: "translateX(-50%)",
      }}
      className={cn(
        "z-40 flex justify-center px-4 w-full transition-all duration-300 pointer-events-none select-none max-w-[320px]",
        position === "top" ? "float-animate-top" : "float-animate-bottom"
      )}
    >
      <style>{`
        @keyframes floatInTop {
          from {
            opacity: 0;
            transform: translate(-50%, 8px) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0) scale(1);
          }
        }
        @keyframes floatInBottom {
          from {
            opacity: 0;
            transform: translate(-50%, -8px) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0) scale(1);
          }
        }
        .float-animate-top {
          animation: floatInTop 200ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .float-animate-bottom {
          animation: floatInBottom 200ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes floatInMenu {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(4px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        .menu-animate {
          animation: floatInMenu 180ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

      <div className="flex flex-col gap-2 w-full items-center pointer-events-auto">
        {/* --- Toolbar / Highlight Menu --- */}
        {showToolbar && (
          <div
            className="flex overflow-hidden rounded-2xl bg-popover/95 backdrop-blur-sm border border-border shadow-lg px-4 py-2.5 menu-animate w-full justify-center"
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
          className="flex flex-col w-full overflow-hidden rounded-2xl bg-popover/95 backdrop-blur-sm border border-border/80 shadow-lg px-4 py-3 text-sm gap-2"
        >
          {/* Header Row */}
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2 truncate">
              <span className="font-semibold text-foreground text-xs truncate max-w-[150px]" title={reference}>
                {reference}
              </span>
              <span className="shrink-0 rounded bg-muted/60 px-1.5 py-0.5 text-[9px] font-medium text-muted-foreground">
                {count > 1 ? `${count} versículos` : `${count} versículo`}
              </span>
            </div>
            <Button
              type="button"
              onClick={onClose}
              variant="ghost"
              size="icon-xs"
              className="shrink-0 text-muted-foreground hover:text-foreground rounded-full size-6 hover:bg-muted/40 transition-colors"
              aria-label="Limpar seleção"
            >
              <IconX className="size-3.5" />
            </Button>
          </div>

          <Separator className="bg-border/60" />

          {/* Actions Row */}
          <div className="flex items-center justify-between w-full px-1">
            {/* Copy Reference */}
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => handleCopy("reference")}
              className={cn(
                "text-muted-foreground hover:text-foreground rounded-lg size-9 transition-colors shrink-0",
                copied === "reference" && "text-primary hover:text-primary bg-primary/10"
              )}
              title={copied === "reference" ? "Referência copiada!" : "Copiar referência"}
              aria-label="Copiar referência"
            >
              {copied === "reference" ? (
                <IconCheck className="size-4" />
              ) : (
                <IconCopy className="size-4" />
              )}
            </Button>

            {/* Copy Text */}
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => handleCopy("text")}
              className={cn(
                "text-muted-foreground hover:text-foreground rounded-lg size-9 transition-colors shrink-0",
                copied === "text" && "text-primary hover:text-primary bg-primary/10"
              )}
              title={copied === "text" ? "Texto copiado!" : "Copiar texto"}
              aria-label="Copiar texto"
            >
              {copied === "text" ? (
                <IconCheck className="size-4" />
              ) : (
                <IconClipboardText className="size-4" />
              )}
            </Button>

            {/* Highlight */}
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => setShowToolbar(!showToolbar)}
              className={cn(
                "text-muted-foreground hover:text-foreground rounded-lg size-9 transition-colors shrink-0",
                showToolbar && "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              )}
              title="Destacar"
              aria-label="Destacar"
            >
              <IconHighlight className="size-4" />
            </Button>

            {/* Note */}
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={handleOpenNote}
              className="text-muted-foreground hover:text-foreground rounded-lg size-9 transition-colors shrink-0"
              title="Anotar"
              aria-label="Anotar"
            >
              <IconNotebook className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
