import { describe, it, expect } from "vitest"
import { filterBooks } from "../src/lib/filter-books.js"
import { BOOK_META } from "../src/lib/book-meta.js"

const books = BOOK_META.filter(Boolean).map(b => ({
  id: b!.id,
  name: b!.name,
  abbreviation: b!.abbreviation,
  testament: (b!.id === "gen" ? "old" : "new") as "old" | "new",
  chapters: 50,
}))

describe("filterBooks", () => {
  it("SPECSFY: US-001 FR-001 NFR-001 AC-001 filtra Joãos", () => {
    const result = filterBooks(books as any, "jo")
    expect(result.map(r => r.id)).toContain("jhn")
    expect(result.length).toBeGreaterThan(0)
  })

  it("SPECSFY: US-001 FR-001 NFR-002 AC-005 estados vazio", () => {
    const result = filterBooks(books as any, "xyz")
    expect(result).toEqual([])
  })

  it("SPECSFY: US-001 FR-001 FR-002 FR-003 NFR-001 AC-006 NFD joao sem acento", () => {
    const result = filterBooks(books as any, "joao")
    expect(result.map(r => r.id)).toContain("jhn")
  })
})
