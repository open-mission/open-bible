import { readFile } from "node:fs/promises"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"

const root = resolve(import.meta.dirname, "../..")

describe("Electron API boundary", () => {
  it("does not load Tauri modules from the Web renderer", async () => {
    // SPECSFY: US-002 FR-002 NFR-001 NFR-002 AC-006
    const source = await readFile(
      resolve(root, "apps/web/features/release-notes/components/release-notes-provider.tsx"),
      "utf8",
    )

    expect(source).not.toContain("@tauri-apps")
    expect(source).not.toContain("TURSO_AUTH_TOKEN")
  })
})
