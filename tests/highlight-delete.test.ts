import { describe, it, expect } from "vitest"
import {
  buildHighlightRestoreInput,
  removeHighlightFromEntries,
} from "@/features/highlights/hooks/use-all-highlights"
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

  it("preserva todos os versículos para o Undo", () => {
    const entry: AllHighlightEntry = {
      highlight: { id: "h1", color: "#facc15", content: "oração", categoryId: "cat", noteId: null, createdAt: new Date(), updatedAt: new Date() },
      category: null,
      verses: [
        { id: "v1", highlightId: "h1", book: "joao", chapter: 3, verse: 16, bible: "ara" },
        { id: "v2", highlightId: "h1", book: "joao", chapter: 3, verse: 17, bible: "ara" },
      ],
      verseItems: [],
    }

    expect(buildHighlightRestoreInput(entry)).toEqual({
      highlight: { color: "#facc15", content: "oração", categoryId: "cat", noteId: null },
      verses: [
        { book: "joao", chapter: 3, verse: 16, bible: "ara" },
        { book: "joao", chapter: 3, verse: 17, bible: "ara" },
      ],
    })
  })
})
