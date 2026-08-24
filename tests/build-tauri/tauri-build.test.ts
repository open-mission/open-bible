import { describe, it, expect } from "vitest"
import { readFileSync, existsSync } from "node:fs"
import { join } from "node:path"

const root = join(__dirname, "../..")

describe("tauri bundle compilation", () => {
  // SPECSFY: US-001 FR-001 FR-003 NFR-001 AC-005
  it("AC-005: bundle Tauri compila sem erro Rust (Cargo.toml e tauri.conf válidos)", () => {
    const cargo = readFileSync(join(root, "src-tauri/Cargo.toml"), "utf-8")
    expect(cargo).toContain('name = "open-bible"')
    const tauri = JSON.parse(readFileSync(join(root, "src-tauri/tauri.conf.json"), "utf-8"))
    expect(tauri.bundle.targets).toBe("all")
    expect(tauri.bundle.icon.length).toBeGreaterThan(0)
    // icons exist
    for (const icon of tauri.bundle.icon) {
      expect(existsSync(join(root, "src-tauri", icon))).toBe(true)
    }
  })
})
