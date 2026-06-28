import { getBook, getVerses } from "./bible-data"

export const HIGHLIGHT_HEX: Record<string, string> = {
  amber: "#f5c842",
  green: "#6aba7a",
  blue: "#6aabd2",
  rose: "#e87b8c",
}

export function resolveHighlightHex(h: { color: string; customHex?: string }): string {
  if (h.color === "custom") return h.customHex ?? "#a78bfa"
  return HIGHLIGHT_HEX[h.color] ?? "#f5c842"
}

export function parseVerseId(verseId: string) {
  const match = verseId.match(/^(.+)-(\d+)-(\d+)$/)
  if (!match) return null
  const [, bookId, chapterStr, verseStr] = match
  const book = getBook(bookId)
  if (!book) return null
  const chapter = parseInt(chapterStr, 10)
  const verse = parseInt(verseStr, 10)
  const verseData = getVerses(bookId, chapter).find((v) => v.verse === verse)
  return { bookId, book, chapter, verse, text: verseData?.text ?? "" }
}
