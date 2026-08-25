import type { Book } from "../db/bible-manager.js"

function normalize(str: string): string {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
}

export function filterBooks(books: Book[], query: string): Book[] {
  const q = normalize(query.trim())
  if (!q) return books
  return books.filter(b => {
    const id = normalize(b.id)
    const name = normalize(b.name)
    const abbr = normalize(b.abbreviation)
    return id.includes(q) || name.includes(q) || abbr.includes(q)
  })
}
