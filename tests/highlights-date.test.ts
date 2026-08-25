import { describe, it, expect } from "vitest"
import { filterHighlights, EMPTY_HIGHLIGHT_FILTERS } from "@/features/highlights/components/highlights-filter-bar"
import type { AllHighlightEntry } from "@/features/highlights/hooks/use-all-highlights"

const makeEntry = (date: string): AllHighlightEntry => ({
  highlight: {
    id: date,
    color: "#facc15",
    content: "",
    categoryId: null,
    noteId: null,
    createdAt: new Date(date),
    updatedAt: new Date(date),
  },
  category: null,
  verses: [],
  verseItems: [],
})

describe("Highlights AC-010 filtro data", () => {
  it("filtra somente highlights criados dentro do intervalo", () => {
    const entries = [makeEntry("2026-08-01T12:00:00Z"), makeEntry("2026-08-20T12:00:00Z")]
    const filtered = filterHighlights(entries, {
      ...EMPTY_HIGHLIGHT_FILTERS,
      dateFrom: "2026-08-10",
      dateTo: "2026-08-31",
    })

    expect(filtered.map((item) => item.highlight.id)).toEqual(["2026-08-20T12:00:00Z"])
  })
})
