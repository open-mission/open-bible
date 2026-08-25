import { describe, expect, it } from "vitest"
import { exportMarkdown } from "@/features/notes/lib/markdown-export"
import {
  bibleReferenceHref,
  extractBibleReferences,
  parseNoteContent,
} from "@/features/notes/lib/note-document"

describe("Notes regression AC-001..AC-010", () => {
  it("preserva documento, referência, navegação e exportação no mesmo fluxo", () => {
    const document = {
      type: "doc",
      content: [
        { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Estudo" }] },
        { type: "bibleReference", attrs: { bible: "ara", book: "jhn", chapter: 3, verseStart: 16, verseEnd: null } },
        { type: "paragraph", content: [{ type: "text", text: "Minha reflexão" }] },
      ],
    }
    const persisted = JSON.stringify(document)
    const restored = parseNoteContent(persisted)

    expect(restored).toEqual(document)
    expect(extractBibleReferences(restored)).toHaveLength(1)
    expect(bibleReferenceHref(extractBibleReferences(restored)[0])).toBe("/?book=jhn&chapter=3&verse=16")
    expect(exportMarkdown(restored)).toContain("[Jo 3:16](bible://ara/jhn/3/16)")
  })
})
