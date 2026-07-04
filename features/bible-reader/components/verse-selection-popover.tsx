"use client";

import { useState } from "react";
import {
  IconCopy,
  IconClipboardText,
  IconCheck,
  IconX,
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

interface VerseSelectionPopoverProps {
  book: Book;
  chapter: number;
  selectedVerses: Verse[];
  versionAbbr: string;
  versionId: string;
  onClose: () => void;
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
}: VerseSelectionPopoverProps) {
  const [copied, setCopied] = useState<CopiedKind>(null);
  const isMobile = useIsMobile();
  const { createHighlight, updateHighlight, deleteHighlight, createCategory, listCategories } = useHighlightMutations();
  const reference = formatVerseReference(
    book,
    chapter,
    selectedVerses,
    versionAbbr,
  );
  const count = selectedVerses.length;

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
        "fixed inset-x-0 z-50 flex justify-center p-4",
        isMobile ? "bottom-24" : "bottom-4",
      )}
    >
      <div
        className={cn(
          "flex overflow-hidden rounded-2xl bg-background/95 backdrop-blur-sm border border-border shadow-lg",
          isMobile
            ? "w-full max-w-sm flex-col"
            : "inline-flex items-center gap-1.5 px-4 py-2 text-sm",
        )}
      >
        {/* --- Row 1: Reference + close --- */}
        <div
          className={cn(
            "items-center",
            isMobile
              ? "relative flex justify-center px-4 pt-3 pb-1.5"
              : "inline-flex gap-2",
          )}
        >
          <span className="flex items-center gap-2 truncate">
            <span
              className={cn(
                "font-medium text-foreground truncate",
                isMobile ? "text-sm" : "max-w-50 sm:max-w-70",
              )}
            >
              {reference}
            </span>
            <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground">
              {count > 1 ? `${count} versículos` : `${count} versículo`}
            </span>
          </span>
          <Button
            type="button"
            onClick={onClose}
            variant="ghost"
            size="icon-xs"
            className={cn(
              "shrink-0 text-muted-foreground hover:text-foreground",
              isMobile
                ? "absolute right-3 top-1/2 -translate-y-1/2"
                : "ml-auto",
            )}
            aria-label="Limpar seleção"
          >
            <IconX />
          </Button>
        </div>

        {/* Separator between rows on mobile */}
        {isMobile && <Separator />}

        {/* --- Row 2: Actions --- */}
        <div
          className={cn(
            "flex items-center gap-1",
            isMobile ? "px-3 pb-3 pt-1.5" : "inline-flex",
          )}
        >
          <Button
            type="button"
            variant="ghost"
            size={isMobile ? "sm" : "sm"}
            onClick={() => handleCopy("reference")}
            className={cn(
              "flex-1 text-muted-foreground hover:text-foreground",
              copied === "reference" && "text-primary hover:text-primary",
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
            size={isMobile ? "sm" : "sm"}
            onClick={() => handleCopy("text")}
            className={cn(
              "flex-1 text-muted-foreground hover:text-foreground",
              copied === "text" && "text-primary hover:text-primary",
            )}
          >
            {copied === "text" ? (
              <IconCheck data-icon="inline-start" />
            ) : (
              <IconClipboardText data-icon="inline-start" />
            )}
            {copied === "text" ? "Copiado!" : "Texto"}
          </Button>

          <HighlightMenu
            selectedVerseIds={selectedVerses.map((v) => v.id)}
            bookId={book.id}
            chapter={chapter}
            versionId={versionId}
            onCreateHighlight={createHighlight}
            onUpdateHighlight={updateHighlight}
            onDeleteHighlight={deleteHighlight}
            listCategories={listCategories}
            createCategory={createCategory}
            onClose={onClose}
          />
        </div>
      </div>
    </div>
  );
}
