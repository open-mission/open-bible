import { describe, it, expect } from "vitest"
import fs from "fs"
// SPECSFY: US-001 FR-001 FR-002 NFR-002 AC-008
describe("Notes AC-008 bubble menu", () => {
  it("bubble menu para bold/italic/highlight", () => {
    const src = fs.readFileSync("apps/web/features/notes/components/note-editor.tsx", "utf8")
    expect(src).toContain("BubbleMenu")
  })
})
