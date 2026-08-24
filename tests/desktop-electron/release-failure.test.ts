import { readFile } from "node:fs/promises"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"

const root = resolve(import.meta.dirname, "../..")

describe("Electron release failure handling", () => {
  it("has a release script that can block incomplete publication", async () => {
    // SPECSFY: US-001 FR-001 NFR-003 AC-003
    const script = await readFile(resolve(root, "scripts/build-electron.mjs"), "utf8")

    expect(script).toContain("apps/web/out/index.html")
    expect(script).toContain("Static Web export is required")
  })
})
