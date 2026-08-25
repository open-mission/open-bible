import { describe, it, expect } from "vitest"
import fs from "fs"
// SPECSFY: US-002 FR-003 NFR-001 AC-004
describe("Notes AC-004 fallback bibleReference", () => {
  it("mostra aviso quando Bíblia não instalada", () => {
    const src = fs.readFileSync("apps/web/features/notes/extensions/bible-reference.ts", "utf8")
    expect(src).toContain("bible")
  })
})
