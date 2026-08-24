import { access, readFile } from "node:fs/promises"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"

const root = resolve(import.meta.dirname, "../..")

describe("Electron offline runtime", () => {
  it("keeps the static export and SQLite WASM asset copy in the desktop build", async () => {
    // SPECSFY: US-002 FR-002 NFR-002 AC-004
    const nextConfig = await readFile(resolve(root, "apps/web/next.config.mjs"), "utf8")

    expect(nextConfig).toContain('output: "export"')
    await expect(access(resolve(root, "apps/web/out/index.html"))).resolves.toBeUndefined()
    await expect(access(resolve(root, "apps/web/out/sqlite-wasm"))).resolves.toBeUndefined()
  })
})
