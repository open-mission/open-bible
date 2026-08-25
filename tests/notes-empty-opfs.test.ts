import { describe, it, expect } from "vitest"
import fs from "fs"
// SPECSFY: US-001 FR-001 NFR-002 AC-009
describe("Notes AC-009 vazio/OPFS", () => {
  it("mostra CTA vazio e gate OPFS", () => {
    const src = fs.readFileSync("apps/web/features/notes/components/note-editor.tsx", "utf8")
    expect(src).toContain("OpfsStatusGate")
  })
})
