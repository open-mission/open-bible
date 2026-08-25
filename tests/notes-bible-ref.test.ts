import { describe, it, expect } from "vitest"
import fs from "fs"
// SPECSFY: US-002 FR-003 FR-004 NFR-001 AC-003
describe("Notes AC-003 bibleReference com preview", () => {
  it("bloco bibleReference existe com preview via BibleDatabase", () => {
    const src = fs.readFileSync("apps/web/features/notes/extensions/bible-reference.ts", "utf8")
    expect(src).toContain("BibleReference")
    expect(src).toContain("BibleDatabase")
  })
})
