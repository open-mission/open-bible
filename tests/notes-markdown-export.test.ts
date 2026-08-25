import { describe, it, expect } from "vitest"
import { exportMarkdown } from "@/features/notes/lib/markdown-export"
// SPECSFY: US-003 FR-005 NFR-002 AC-007
describe("Notes AC-007 export Markdown", () => {
  it("exporta heading e referência bíblica", () => {
    expect(exportMarkdown({
      type: "doc",
      content: [
        { type: "heading", attrs: { level: 1 }, content: [{ type: "text", text: "Título" }] },
        { type: "bibleReference", attrs: { bible: "ara", book: "jhn", chapter: 3, verseStart: 16, verseEnd: null } },
      ],
    })).toBe("# Título\n\n[Jo 3:16](bible://ara/jhn/3/16)")
  })
})
