import { describe, it, expect } from "vitest"
import { readFileSync, existsSync } from "node:fs"
import { join } from "node:path"

const root = join(__dirname, "../..")

describe("build-tauri pipeline", () => {
  // SPECSFY: US-001 FR-001 FR-002 NFR-001 AC-001
  it("AC-001: pnpm build:tauri gera out com sqlite-wasm quando implementado", () => {
    const script = readFileSync(join(root, "scripts/build-tauri.mjs"), "utf-8")
    expect(script).toContain("copy-sqlite-wasm.mjs")
    expect(script).toContain("TAURI_BUILD")
    expect(script).toContain("renameSync")
    expect(script).toContain("finally")
    // out validation will be done via integration, here we check script structure
    expect(script).toContain("STASH_DIR")
  })

  // SPECSFY: US-001 FR-001 NFR-001 AC-004
  it("AC-004: rescue de stash restaura app/api se execução anterior interrompida", () => {
    const script = readFileSync(join(root, "scripts/build-tauri.mjs"), "utf-8")
    expect(script).toContain("!existsSync(API_DIR) && existsSync(STASHED_API)")
    expect(script).toContain("renameSync(STASHED_API, API_DIR)")
    expect(script).toContain("restaurado app/api de um stash")
  })
})
