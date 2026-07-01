import { getBook, getVerses } from "@/features/bible-reader/utils/bible-data"

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
