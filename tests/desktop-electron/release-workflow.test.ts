import { readFile } from "node:fs/promises"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"

const root = resolve(import.meta.dirname, "../..")

describe("Electron release workflow", () => {
  it("builds every platform before publishing and exposes rollback validation", async () => {
    const workflow = await readFile(resolve(root, ".github/workflows/desktop-release.yml"), "utf8")

    expect(workflow).toContain("ubuntu-24.04")
    expect(workflow).toContain("macos-14")
    expect(workflow).toContain("windows-latest")
    expect(workflow).toContain("needs: build")
    expect(workflow).toContain("Upload all artifacts atomically")
    expect(workflow).toContain("rollback_tag")
    expect(workflow).toContain("Validate release version")
    expect(workflow).toContain("RELEASE_VERSION")
    expect(workflow).toContain("NEXT_PUBLIC_API_ORIGIN")
    expect(workflow).toContain("--ignore-scripts")
    expect(workflow).toContain("ELECTRON_WINDOWS_CSC_LINK")
    expect(workflow).toContain("ELECTRON_MACOS_CSC_LINK")
    expect(workflow).toContain("signing: none")
    expect(workflow).toContain("dist/electron/*.AppImage")
    expect(workflow).toContain('[[ -f "$artifact" ]]')
    expect(workflow).not.toContain("dist/electron/**/*")
    expect(workflow).not.toContain("tauri-apps/tauri-action")
  })

  it("passes the tag version to Electron packaging", async () => {
    const buildScript = await readFile(resolve(root, "scripts/build-electron.mjs"), "utf8")

    expect(buildScript).toContain("RELEASE_VERSION")
    expect(buildScript).toContain("extraMetadata.version")
  })
})
