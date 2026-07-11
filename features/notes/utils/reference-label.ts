import type { NoteReference } from "@/lib/database/user/schema"

/** Short bible reference label for list/detail headers. */
export function referenceLabel(references: NoteReference[]): string {
  if (references.length === 0) return "Sem referência"
  const first = references[0]
  const base = `${first.book.toUpperCase()} ${first.chapter}:${first.verseStart}`
  if (references.length === 1) {
    if (first.verseEnd && first.verseEnd !== first.verseStart) {
      return `${first.book.toUpperCase()} ${first.chapter}:${first.verseStart}-${first.verseEnd}`
    }
    return base
  }
  return `${base} +${references.length - 1}`
}
