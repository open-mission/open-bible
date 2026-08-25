import { describe, it, expect } from "vitest"
import { sortHighlightEntries } from "@/features/highlights/hooks/use-all-highlights"
import type { AllHighlightEntry } from "@/features/highlights/hooks/use-all-highlights"

describe("Highlights page - AC-001 listagem ordenada por recência", () => {
  it("ordena highlights por updatedAt desc", () => {
    const makeEntry = (id: string, updatedAt: string): AllHighlightEntry => ({
      highlight: {
        id,
        color: "#facc15",
        content: "",
        categoryId: null,
        noteId: null,
        createdAt: new Date(updatedAt),
        updatedAt: new Date(updatedAt),
      },
      category: null,
      verses: [],
      verseItems: [],
    })

    expect(sortHighlightEntries([
      makeEntry("old", "2026-08-01"),
      makeEntry("new", "2026-08-20"),
    ]).map((item) => item.highlight.id)).toEqual(["new", "old"])
  })
})
