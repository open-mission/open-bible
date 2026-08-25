import { describe, it, expect } from "vitest"
import {
  bibleReferenceHref,
  buildBibleReferenceDocument,
  extractBibleReferences,
} from "@/features/notes/lib/note-document"
// SPECSFY: US-002 FR-003 FR-004 NFR-001 AC-003
describe("Notes AC-003 bibleReference com preview", () => {
  it("serializa os atributos e produz o link do leitor", () => {
    const document = buildBibleReferenceDocument({
      bible: "ara",
      book: "jhn",
      chapter: 3,
      verseStart: 16,
      verseEnd: null,
    })
    expect(extractBibleReferences(document)).toEqual([{
      bible: "ara",
      book: "jhn",
      chapter: 3,
      verseStart: 16,
      verseEnd: null,
    }])
    expect(bibleReferenceHref(extractBibleReferences(document)[0])).toBe("/?book=jhn&chapter=3&verse=16")
  })
})
