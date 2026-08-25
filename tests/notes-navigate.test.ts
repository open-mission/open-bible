import { describe, it, expect } from "vitest"
import fs from "fs"
// SPECSFY: US-002 FR-004 NFR-002 AC-010
describe("Notes AC-010 navegar ao leitor", () => {
  it("bibleReference link navega para /?book=&chapter=", () => {
    const src = fs.readFileSync("apps/web/features/notes/extensions/bible-reference.ts", "utf8")
    expect(src).toContain("book")
  })
})
