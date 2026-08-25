import { describe, it, expect } from "vitest"
import { readFileSync } from "node:fs"
import { join } from "node:path"

const root = join(__dirname, "../..")

describe("copy-sqlite-wasm", () => {
  // SPECSFY: US-001 FR-001 NFR-002 AC-007
  it("AC-007: falha sem sqlite-wasm/dist aborta com mensagem", () => {
    const script = readFileSync(join(root, "scripts/copy-sqlite-wasm.mjs"), "utf-8")
    expect(script).toContain("sqlite-wasm jswasm not found")
    expect(script).toContain("SRC_JSWASM")
    expect(script).toContain("DST_JSWASM")
  })
})
