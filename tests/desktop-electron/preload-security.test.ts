import { readFile } from "node:fs/promises"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"

const root = resolve(import.meta.dirname, "../..")

describe("Electron preload security", () => {
  it("sets secure BrowserWindow defaults", async () => {
    // SPECSFY: US-002 NFR-001 AC-010
    const source = await readFile(resolve(root, "apps/desktop-tauri/src/main.ts"), "utf8")

    expect(source).toContain("contextIsolation: true")
    expect(source).toContain("nodeIntegration: false")
    expect(source).toContain("sandbox: true")
    expect(source).toContain('protocol.handle("open-bible"')
  })
})
