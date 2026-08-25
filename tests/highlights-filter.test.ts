import { describe, it, expect } from "vitest"
import { filterHighlights, type HighlightFilters } from "@/features/highlights/components/highlights-filter-bar"
import type { AllHighlightEntry } from "@/features/highlights/hooks/use-all-highlights"

function entry(overrides: Partial<AllHighlightEntry["highlight"]> = {}): AllHighlightEntry {
  return {
    highlight: {
      id: "h1",
      color: "#facc15",
      content: "amor e graça",
      categoryId: "cat-1",
      noteId: null,
      createdAt: new Date("2026-08-20T12:00:00Z"),
      updatedAt: new Date("2026-08-21T12:00:00Z"),
      ...overrides,
    },
    category: { id: "cat-1", name: "oração", createdAt: new Date("2026-08-01") },
    verses: [{ id: "v1", highlightId: "h1", book: "joao", chapter: 3, verse: 16, bible: "ara" }],
    verseItems: [{ reference: "João 3:16", text: "Porque Deus amou o mundo" }],
  }
}

describe("Highlights AC-002 filtros combinados", () => {
  it("filtra por cor/categoria/livro/bíblia/data e busca textual com interseção", () => {
    const filters: HighlightFilters = {
      query: "amor",
      color: "#facc15",
      category: "cat-1",
      book: "joao",
      bible: "ara",
      dateFrom: "2026-08-01",
      dateTo: "2026-08-31",
    }

    expect(filterHighlights([entry()], filters)).toHaveLength(1)
    expect(filterHighlights([entry()], { ...filters, book: "gn" })).toHaveLength(0)
    expect(filterHighlights([entry()], { ...filters, query: "inexistente" })).toHaveLength(0)
  })
})
