"use client";

import { useState } from "react";
import {
  IconCopy,
  IconClipboardText,
  IconCheck,
  IconX,
} from "@tabler/icons-react";
import type { Book, Verse } from "@/lib/types";
import { useToast } from "@/features/layout/hooks/use-toast";
import {
  formatVerseReference,
  formatVerseText,
} from "@/features/bible-reader/utils/verse-reference";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/lib/use-media-query";

interface VerseSelectionPopoverProps {
  book: Book;
  chapter: number;
  selectedVerses: Verse[];
  versionAbbr: string;
  onClose: () => void;
}

type CopiedKind = "reference" | "text" | null;

/**
 * Copia texto para a área de transferência. Usa a Clipboard API assíncrona em
 * contextos seguros e faz fallback para `document.execCommand("copy")` em
 * webviews não-secure (ex.: Tauri).
 */
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
  onClose,
}: VerseSelectionPopoverProps) {
  const [copied, setCopied] = useState<CopiedKind>(null);
  const { addToast, removeToast } = useToast();
  const isMobile = useIsMobile();
  const reference = formatVerseReference(
    book,
    chapter,
    selectedVerses,
    versionAbbr,
  );
  const count = selectedVerses.length;

  async function handleCopy(kind: "reference" | "text") {
    const text =
      kind === "reference"
        ? reference
        : formatVerseText(book, chapter, selectedVerses, versionAbbr);
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopied(kind);
      const id = addToast({
        message:
          kind === "reference" ? "Referência copiada!" : "Texto copiado!",
        type: "success",
      });
      setTimeout(() => {
        setCopied(null);
        removeToast(id);
      }, 2000);
    } else {
      const id = addToast({
        message: "Não foi possível copiar.",
        type: "error",
      });
      setTimeout(() => removeToast(id), 3000);
    }
  }

  return (
    <div
      data-verse-selection-bar=""
      className={cn(
        "fixed inset-x-0 bottom-4 z-50 flex justify-center p-4",
        isMobile ? "bottom-20 scale-115" : "bottom-4",
      )}
    >
      <div className="inline-flex items-center gap-1.5 rounded-full bg-background/95 backdrop-blur-sm border border-border shadow-lg px-3 py-2 text-sm">
        {/* Reference + count */}
        <span className="font-medium text-foreground truncate max-w-50 sm:max-w-70">
          {reference}
        </span>
        <span className="text-xs text-muted-foreground shrink-0">
          {count > 1 ? `· ${count} versículos` : `· ${count} versículo`}
        </span>

        <div className="h-4 w-px bg-border mx-0.5" />

        {/* Copy reference */}
        <button
          type="button"
          onClick={() => handleCopy("reference")}
          className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-normal text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          aria-label="Copiar referência"
        >
          {copied === "reference" ? (
            <IconCheck className="size-4 text-primary" />
          ) : (
            <IconCopy className="size-4" />
          )}
          <span className="hidden sm:inline">
            {copied === "reference" ? "Copiado!" : "Referência"}
          </span>
        </button>

        {/* Copy text */}
        <button
          type="button"
          onClick={() => handleCopy("text")}
          className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-normal text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          aria-label="Copiar texto"
        >
          {copied === "text" ? (
            <IconCheck className="size-4 text-primary" />
          ) : (
            <IconClipboardText className="size-4" />
          )}
          <span className="hidden sm:inline">
            {copied === "text" ? "Copiado!" : "Texto"}
          </span>
        </button>

        {/* Close */}
        <button
          type="button"
          onClick={onClose}
          className="inline-flex items-center justify-center rounded-full size-6 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          aria-label="Limpar seleção"
        >
          <IconX className="size-3.5" />
        </button>
      </div>
    </div>
  );
}
