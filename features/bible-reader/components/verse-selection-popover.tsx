"use client";

import { useState, useMemo, useCallback } from "react";
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
import { HighlightMenu } from "@/features/highlights/components/highlight-menu";
import { useHighlightMutations } from "@/features/highlights/hooks/use-highlight-mutations";
import { useNotesContext } from "@/features/notes/context/notes-context";
import type { NoteTarget } from "@/features/notes/types";

export interface SelectionAnchor {
  /** Y offset (relative to the reader root) of the selection edge the pill anchors to. */
  top: number;
  /** X center (relative to the reader root) of the selection bounds. */
  centerX: number;
  /** "top": pill floats above the first selected verse; "bottom": below the last one. */
  placement: "top" | "bottom";
}

interface VerseSelectionPopoverProps {
  book: Book;
  chapter: number;
  selectedVerses: Verse[];
  versionAbbr: string;
  versionId: string;
  onClose: () => void;
  onOpenHighlightEditor: () => void;
  anchor: SelectionAnchor;
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
  anchor,
  showToolbar,
  setShowToolbar,
}: VerseSelectionPopoverProps) {
  const [copied, setCopied] = useState<CopiedKind>(null);
  const isMobile = useIsMobile();

  const {
    createHighlight,
    deleteHighlight,
    createCategory,
    listCategories,
  } = useHighlightMutations();

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

  // The highlight menu stacks on the side opposite to the selection, so the
  // main action pill always stays closest to the selected verses.
  const menuFirst = anchor.placement === "top";

  const actionPill = (
    <div className="flex items-center gap-0.5 rounded-full border border-border bg-popover px-1.5 py-1 shadow-xl">
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={() => handleCopy("reference")}
        className={cn(
          "text-muted-foreground hover:text-foreground rounded-full transition-colors",
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

      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={() => handleCopy("text")}
        className={cn(
          "text-muted-foreground hover:text-foreground rounded-full transition-colors",
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

      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={() => setShowToolbar(!showToolbar)}
        className={cn(
          "text-muted-foreground hover:text-foreground rounded-full transition-colors",
          showToolbar && "bg-secondary text-secondary-foreground hover:bg-secondary/80"
        )}
        title="Destacar"
        aria-label="Destacar"
      >
        <IconHighlight className="size-4" />
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={handleOpenNote}
        className="text-muted-foreground hover:text-foreground rounded-full transition-colors"
        title="Anotar"
        aria-label="Anotar"
      >
        <IconNotebook className="size-4" />
      </Button>

      <div className="mx-1 h-5 w-px shrink-0 bg-border" />

      <Button
        type="button"
        onClick={onClose}
        variant="ghost"
        size="icon-sm"
        className="text-muted-foreground hover:text-foreground rounded-full transition-colors"
        aria-label="Limpar seleção"
        title="Limpar seleção"
      >
        <IconX className="size-4" />
      </Button>
    </div>
  );

  const highlightMenuPill = showToolbar && (
    <div className="flex items-center rounded-full border border-border bg-popover px-3 py-2 shadow-xl menu-animate">
      <HighlightMenu
        selectedVerseIds={selectedVerses.map((v) => v.id)}
        bookId={book.id}
        chapter={chapter}
        versionId={versionId}
        isMobile={isMobile}
        onCreateHighlight={async (...args) => { await createHighlight(...args); }}
        onDeleteHighlight={deleteHighlight}
        listCategories={listCategories}
        createCategory={createCategory}
        onClose={onClose}
        onOpenEditor={onOpenHighlightEditor}
      />
    </div>
  );

  return (
    <div
      data-verse-selection-bar=""
      className="absolute z-40 select-none pointer-events-none"
      style={{
        top: anchor.top,
        left: anchor.centerX,
        transform:
          anchor.placement === "top"
            ? "translate(-50%, calc(-100% - 10px))"
            : "translate(-50%, 10px)",
      }}
    >
      <style>{`
        @keyframes verseSelectionIn {
          from { opacity: 0; transform: scale(0.92) translateY(4px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .verse-selection-animate {
          animation: verseSelectionIn 180ms cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes floatInMenu {
          from { opacity: 0; transform: scale(0.95) translateY(4px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .menu-animate {
          animation: floatInMenu 180ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

      <div
        className="pointer-events-auto flex flex-col items-center gap-2 verse-selection-animate"
        style={{
          transformOrigin:
            anchor.placement === "top" ? "bottom center" : "top center",
        }}
      >
        {menuFirst && highlightMenuPill}
        {actionPill}
        {!menuFirst && highlightMenuPill}
      </div>
    </div>
  );
}
