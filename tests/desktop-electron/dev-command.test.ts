import { readFile } from "node:fs/promises"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"

const root = resolve(import.meta.dirname, "../..")

describe("Electron desktop development", () => {
  it("starts the desktop shell with Electron instead of Tauri", async () => {
    // SPECSFY: US-001 FR-001 AC-001
    const packageJson = await readFile(
      resolve(root, "apps/desktop-tauri/package.json"),
      "utf8",
    )
    const packageConfig = JSON.parse(packageJson) as {
      scripts?: { dev?: string }
    }

    expect(packageConfig.scripts?.dev).toContain("electron")
    expect(packageConfig.scripts?.dev).not.toContain("tauri")
  })
})
