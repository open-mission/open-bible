import { access, readFile } from "node:fs/promises"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"

const root = resolve(import.meta.dirname, "../..")

describe("Electron updater failure", () => {
  it("defines a recoverable updater adapter", async () => {
    // SPECSFY: US-003 FR-003 NFR-001 NFR-003 AC-008
    await expect(access(resolve(root, "apps/desktop-tauri/src/updater.ts"))).resolves.toBeUndefined()

    const updater = await readFile(resolve(root, "apps/desktop-tauri/src/updater.ts"), "utf8")
    expect(updater).toContain('import electronUpdater from "electron-updater"')
    expect(updater).toContain('return { status: "error", error: getErrorMessage(error) }')
    expect(updater).toContain("Invalid update channel")
    expect(updater).toContain("[redacted]")
  })
})
