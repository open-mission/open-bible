import { readFile } from "node:fs/promises"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"

const root = resolve(import.meta.dirname, "../..")

describe("Electron build matrix", () => {
  it("declares Electron build targets without Tauri", async () => {
    // SPECSFY: US-001 FR-001 NFR-003 AC-002
    const packageJson = await readFile(resolve(root, "apps/desktop-tauri/package.json"), "utf8")
    const config = JSON.parse(packageJson) as { scripts?: Record<string, string> }

    expect(config.scripts?.build).toContain("electron")
    expect(config.scripts?.build).not.toContain("tauri")
  })
})
