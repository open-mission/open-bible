import { describe, it, expect } from "vitest"
import { readFileSync } from "node:fs"
import { join } from "node:path"

const root = join(__dirname, "../..")

describe("out assets and runtime", () => {
  // SPECSFY: US-001 FR-001 FR-002 NFR-001 AC-006
  it("AC-006: app runtime sem tela branca requer out/sqlite-wasm e next export", () => {
    const buildScript = readFileSync(join(root, "scripts/build-tauri.mjs"), "utf-8")
    expect(buildScript).toContain("out")
    const nextCfg = readFileSync(join(root, "next.config.mjs"), "utf-8")
    expect(nextCfg).toContain('output: "export"')
    // verify copy wasm destinations are inside public which maps to out
    const copyCfg = readFileSync(join(root, "scripts/copy-sqlite-wasm.mjs"), "utf-8")
    expect(copyCfg).toContain("public/sqlite-wasm/jswasm")
    expect(copyCfg).toContain("open-bible.worker.js")
  })
})
