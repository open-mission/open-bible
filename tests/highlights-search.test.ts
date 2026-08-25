import { describe, it, expect } from "vitest"
import { filterHighlights, EMPTY_HIGHLIGHT_FILTERS } from "@/features/highlights/components/highlights-filter-bar"
import type { AllHighlightEntry } from "@/features/highlights/hooks/use-all-highlights"

const entry: AllHighlightEntry = {
  highlight: {
    id: "h1",
    color: "#facc15",
    content: "Graça abundante",
    categoryId: null,
    noteId: null,
    createdAt: new Date("2026-08-20"),
    updatedAt: new Date("2026-08-20"),
  },
  category: null,
  verses: [],
  verseItems: [{ reference: "João 3:16", text: "Porque Deus amou" }],
}

describe("Highlights AC-009 busca", () => {
  it("busca conteúdo e texto do versículo case-insensitive", () => {
    expect(filterHighlights([entry], { ...EMPTY_HIGHLIGHT_FILTERS, query: "GRAÇA" })).toHaveLength(1)
    expect(filterHighlights([entry], { ...EMPTY_HIGHLIGHT_FILTERS, query: "AMOU" })).toHaveLength(1)
  })
})
