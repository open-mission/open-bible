import { describe, it, expect } from "vitest"
import { extractBibleReferences } from "@/features/notes/lib/note-document"
// SPECSFY: US-003 FR-003 FR-004 FR-005 NFR-001 AC-005
describe("Notes AC-005 persistir", () => {
  it("reconstrói referências na ordem em que aparecem no documento", () => {
    const document = {
      type: "doc",
      content: [
        { type: "paragraph", content: [{ type: "text", text: "Notas" }] },
        { type: "bibleReference", attrs: { bible: "ara", book: "jhn", chapter: 3, verseStart: 16, verseEnd: null } },
        { type: "bibleReference", attrs: { bible: "nvi", book: "rom", chapter: 8, verseStart: 28, verseEnd: 29 } },
      ],
    }
    expect(extractBibleReferences(document)).toHaveLength(2)
    expect(extractBibleReferences(document)[1].order).toBeUndefined()
  })
})
