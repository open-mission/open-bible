export interface BibleReference {
  bookId: string
  chapter: number
  verseStart?: number
  verseEnd?: number
}

export function normalizeReference(reference: BibleReference): BibleReference {
  return {
    ...reference,
    bookId: reference.bookId.trim().toLowerCase(),
  }
}

export interface BibleBook {
  id: string
  name: string
  abbreviation: string
  chapters: number
}

export function parseReference<T extends BibleBook>(query: string, books: T[]): { book: T; chapter: number } | null {
  const match = query.trim().match(/^(\d?\s*[a-zA-ZÀ-ÿ]+)[:\s.]*(\d+)$/)
  if (!match) return null

  const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim()
  const chapter = Number(match[2])
  if (!Number.isInteger(chapter) || chapter < 1) return null

  const reference = normalize(match[1])
  const candidates = books.filter((book) =>
    normalize(book.abbreviation) === reference ||
    normalize(book.name) === reference ||
    normalize(book.abbreviation).startsWith(reference) ||
    normalize(book.name).startsWith(reference)
  )
  const book = candidates.length === 1 ? candidates[0] : null
  return book && chapter <= book.chapters ? { book, chapter } : null
}
