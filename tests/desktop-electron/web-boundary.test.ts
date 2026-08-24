import { readFile } from "node:fs/promises"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"

const root = resolve(import.meta.dirname, "../..")

describe("Web boundary", () => {
  it("keeps Tauri and Electron imports out of the Web runtime", async () => {
    // SPECSFY: US-002 NFR-002 AC-011
    const files = [
      "apps/web/features/config/components/config-content.tsx",
      "apps/web/features/layout/components/tauri-menu-listener.tsx",
      "apps/web/features/release-notes/components/release-notes-provider.tsx",
    ]
    const sources = await Promise.all(files.map((file) => readFile(resolve(root, file), "utf8")))

    expect(sources.join("\n")).not.toMatch(/@tauri-apps|from ["']electron["']/)
  })
})
