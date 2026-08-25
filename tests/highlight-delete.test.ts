import { describe, it, expect } from "vitest"
import { removeHighlightFromEntries } from "@/features/highlights/hooks/use-all-highlights"
import type { AllHighlightEntry } from "@/features/highlights/hooks/use-all-highlights"

describe("Highlights AC-005 excluir", () => {
  it("remove o card excluído da coleção exibida", () => {
    const makeEntry = (id: string): AllHighlightEntry => ({
      highlight: { id, color: "#facc15", content: "", categoryId: null, noteId: null, createdAt: new Date(), updatedAt: new Date() },
      category: null,
      verses: [],
      verseItems: [],
    })

    expect(removeHighlightFromEntries([makeEntry("h1"), makeEntry("h2")], "h1").map((entry) => entry.highlight.id)).toEqual(["h2"])
  })
})
