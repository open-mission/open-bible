import { readFile } from "node:fs/promises"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"

const root = resolve(import.meta.dirname, "../..")

describe("Desktop rollback", () => {
  it("documents the Tauri fallback release", async () => {
    // SPECSFY: US-003 FR-003 NFR-003 AC-009
    const workflow = await readFile(resolve(root, ".github/workflows/desktop-release.yml"), "utf8")

    expect(workflow).toContain("rollback_tag")
    expect(workflow).toContain("gh release view")
  })
})
