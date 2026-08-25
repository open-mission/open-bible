import { describe, it, expect } from "vitest"
import { bibleReferenceHref } from "@/features/notes/lib/note-document"
// SPECSFY: US-002 FR-004 NFR-002 AC-010
describe("Notes AC-010 navegar ao leitor", () => {
  it("navega para o livro, capítulo e versículo", () => {
    expect(bibleReferenceHref({
      bible: "ara",
      book: "jhn",
      chapter: 3,
      verseStart: 16,
      verseEnd: 17,
    })).toBe("/?book=jhn&chapter=3&verse=16")
  })
})
