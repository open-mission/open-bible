import { readFile } from "node:fs/promises"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"

const root = resolve(import.meta.dirname, "../..")

describe("Electron release version", () => {
  it("keeps shipped manifests on the same version", async () => {
    const files = [
      "package.json",
      "apps/web/package.json",
      "apps/desktop-tauri/package.json",
    ]
    const versions = await Promise.all(
      files.map(async (file) => JSON.parse(await readFile(resolve(root, file), "utf8")).version),
    )

    expect(new Set(versions).size).toBe(1)
  })

  it("updates all monorepo manifests instead of the removed root Tauri paths", async () => {
    const script = await readFile(resolve(root, "scripts/release.mjs"), "utf8")

    expect(script).toContain("apps/web/package.json")
    expect(script).toContain("apps/desktop-tauri/package.json")
    expect(script).toContain("apps/desktop-tauri/Cargo.toml")
    expect(script).not.toContain("../src-tauri/tauri.conf.json")
  })
})
