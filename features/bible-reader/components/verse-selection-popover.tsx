"use client"

import { useState } from "react"
import { Copy, ClipboardText, Check } from "@tabler/icons-react"
import type { Book, Verse } from "@/lib/types"
import { PopoverContent } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { useToast } from "@/features/layout/hooks/use-toast"
import {
  formatVerseReference,
  formatVerseText,
} from "@/features/bible-reader/utils/verse-reference"

interface VerseSelectionPopoverProps {
  book: Book
  chapter: number
  selectedVerses: Verse[]
  versionAbbr: string
}

type CopiedKind = "reference" | "text" | null

/**
 * Copia texto para a área de transferência. Usa a Clipboard API assíncrona em
 * contextos seguros e faz fallback para `document.execCommand("copy")` em
 * webviews não-secure (ex.: Tauri).
 */
async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch {
    /* cai no fallback */
  }
  try {
    const textarea = document.createElement("textarea")
    textarea.value = text
    textarea.style.position = "fixed"
    textarea.style.opacity = "0"
    document.body.appendChild(textarea)
    textarea.focus()
    textarea.select()
    const ok = document.execCommand("copy")
    document.body.removeChild(textarea)
    return ok
  } catch {
    return false
  }
}

export function VerseSelectionPopover({
  book,
  chapter,
  selectedVerses,
  versionAbbr,
}: VerseSelectionPopoverProps) {
  const [copied, setCopied] = useState<CopiedKind>(null)
  const { addToast, removeToast } = useToast()

  const reference = formatVerseReference(book, chapter, selectedVerses, versionAbbr)
  const count = selectedVerses.length

  async function handleCopy(kind: "reference" | "text") {
    const text =
      kind === "reference"
        ? reference
        : formatVerseText(book, chapter, selectedVerses, versionAbbr)
    const ok = await copyToClipboard(text)
    if (ok) {
      setCopied(kind)
      const id = addToast({
        message: kind === "reference" ? "Referência copiada!" : "Texto copiado!",
        type: "success",
      })
      setTimeout(() => {
        setCopied(null)
        removeToast(id)
      }, 2000)
    } else {
      const id = addToast({
        message: "Não foi possível copiar.",
        type: "error",
      })
      setTimeout(() => removeToast(id), 3000)
    }
  }

  return (
    <PopoverContent
      align="start"
      side="bottom"
      sideOffset={6}
      className="w-64 p-2 gap-1"
      onOpenAutoFocus={(e) => e.preventDefault()}
    >
      <div className="px-2 py-1.5 flex flex-col gap-0.5">
        <p className="text-sm font-semibold text-foreground leading-tight">
          {reference}
        </p>
        <p className="text-xs text-muted-foreground">
          {count} {count === 1 ? "versículo selecionado" : "versículos selecionados"}
        </p>
      </div>
      <div className="h-px bg-border my-1" />
      <Button
        variant="ghost"
        size="sm"
        className="w-full justify-start gap-2 font-normal"
        onClick={() => handleCopy("reference")}
      >
        {copied === "reference" ? (
          <Check className="size-4 text-primary" />
        ) : (
          <Copy className="size-4" />
        )}
        {copied === "reference" ? "Copiado!" : "Copiar referência"}
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="w-full justify-start gap-2 font-normal"
        onClick={() => handleCopy("text")}
      >
        {copied === "text" ? (
          <Check className="size-4 text-primary" />
        ) : (
          <ClipboardText className="size-4" />
        )}
        {copied === "text" ? "Copiado!" : "Copiar texto"}
      </Button>
    </PopoverContent>
  )
}
