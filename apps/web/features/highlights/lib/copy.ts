import { getBookName } from "@/lib/books"
import type { HighlightVerse } from "@/lib/database/user/schema"

interface ReferenceInput {
  verses: Pick<HighlightVerse, "book" | "chapter" | "verse" | "bible">[]
  content?: string | null
}

export function formatHighlightReference({ verses, content }: ReferenceInput): string {
  const sorted = [...verses].sort((a, b) => a.verse - b.verse)
  const first = sorted[0]
  if (!first) return content?.trim() ?? ""

  const book = getBookName(first.book)
  const sameChapter = sorted.every(
    (verse) => verse.book === first.book && verse.chapter === first.chapter,
  )
  const reference = sameChapter && sorted.length > 1
    ? `${book} ${first.chapter}:${sorted[0].verse}-${sorted.at(-1)!.verse}`
    : sorted.map((verse) => `${getBookName(verse.book)} ${verse.chapter}:${verse.verse}`).join(", ")
  const suffix = content?.trim() ? ` - ${content.trim()}` : ""

  return `${reference} (${first.bible.toUpperCase()})${suffix}`
}

export async function copyReference(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch {
    // Use the selection fallback below when clipboard permission is denied.
  }

  const textarea = document.createElement("textarea")
  textarea.value = text
  textarea.setAttribute("readonly", "")
  textarea.style.position = "fixed"
  textarea.style.opacity = "0"
  document.body.appendChild(textarea)
  textarea.select()
  const copied = document.execCommand("copy")
  textarea.remove()
  return copied
}

export default copyReference
