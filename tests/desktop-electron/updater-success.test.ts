import { readFile } from "node:fs/promises"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"

const root = resolve(import.meta.dirname, "../..")

describe("Electron updater success", () => {
  it("declares the signed updater dependency", async () => {
    // SPECSFY: US-003 FR-003 NFR-003 AC-007
    const packageJson = await readFile(resolve(root, "apps/desktop-tauri/package.json"), "utf8")

    expect(packageJson).toContain("electron-updater")
  })

  it("keeps updater state behind the desktop runtime contract", async () => {
    const provider = await readFile(
      resolve(root, "apps/web/features/release-notes/components/release-notes-provider.tsx"),
      "utf8",
    )
    const dialog = await readFile(
      resolve(root, "apps/web/features/release-notes/components/update-dialog.tsx"),
      "utf8",
    )

    expect(provider).toContain("desktopRuntime.updater.check")
    expect(provider).toContain('update.status === "error"')
    expect(provider).toContain("desktopStatus")
    expect(dialog).toContain('desktopStatus === "downloading"')
    expect(dialog).toContain('desktopStatus === "error"')
  })
})
