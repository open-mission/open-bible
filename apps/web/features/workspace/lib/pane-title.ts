import { getBook } from "@/features/bible-reader/utils/bible-data"
import type { PaneState } from "../types"

/**
 * Human-readable title for a Bible pane, e.g. "João 3 · ARA".
 * The version abbreviation (uppercased) is appended so each tab shows which
 * translation it holds when multiple versions are open side by side.
 */
export function biblePaneTitle(bookId: string, chapter: number, versionId: string): string {
  const book = getBook(bookId)
  const version = versionId.toUpperCase()
  if (!book) return `Bíblia · ${version}`
  return `${book.name} ${chapter} · ${version}`
}

/** Title for any pane, based on its state type. */
export function paneTitleFor(state: PaneState): string {
  switch (state.type) {
    case "bible":
      return biblePaneTitle(state.bookId, state.chapter, state.versionId)
    case "note":
      return "Nota"
    case "sermon":
      return "Sermão"
  }
}
