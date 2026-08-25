import { access, readFile } from "node:fs/promises"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"

const root = resolve(import.meta.dirname, "../..")
const desktopRoot = resolve(root, "apps/desktop-tauri")

describe("legacy Tauri workspace", () => {
  it("stores the legacy Tauri shell under apps/desktop-tauri", async () => {
    // SPECSFY: US-001 US-002 FR-001 FR-002 FR-003 NFR-001 NFR-002 AC-003
    await expect(access(resolve(desktopRoot, "tauri.conf.json"))).resolves.toBeUndefined()
  })

  it("points the Tauri shell at the Web static export", async () => {
    // SPECSFY: US-001 US-002 FR-001 FR-002 FR-003 NFR-001 NFR-002 AC-003
    const config = await readFile(resolve(desktopRoot, "tauri.conf.json"), "utf8")
    expect(config).toContain('"frontendDist": "../web/out"')
  })

  it("builds the static Web export before packaging Tauri", async () => {
    // SPECSFY: US-001 US-002 FR-001 FR-002 FR-003 NFR-001 NFR-002 AC-003
    const packageJson = await readFile(resolve(root, "package.json"), "utf8")
    expect(packageJson).toContain('"build:tauri": "pnpm --filter @open-bible/desktop-tauri build"')
  })
})
