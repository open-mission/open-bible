import { readFile } from "node:fs/promises"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"

const root = resolve(import.meta.dirname, "../..")
const platformImports = /(?:from\s+["'](?:next|react|@tauri-apps|electron)|\b(?:window|localStorage|indexedDB|navigator|OPFS)\b)/

async function readPackageSource(packageName: string) {
  return readFile(resolve(root, "packages", packageName, "src/index.ts"), "utf8")
}

describe("shared package boundaries", () => {
  it("keeps Bible domain parsing free of platform runtimes", async () => {
    // SPECSFY: US-001 US-002 FR-001 FR-002 FR-003 NFR-001 NFR-002 AC-002
    await expect(readPackageSource("domain-bible")).resolves.not.toMatch(platformImports)
  })

  it("keeps Bible application use cases free of platform runtimes", async () => {
    // SPECSFY: US-001 US-002 FR-001 FR-002 FR-003 NFR-001 NFR-002 AC-002
    await expect(readPackageSource("application-bible")).resolves.not.toMatch(platformImports)
  })

  it("keeps browser APIs inside the Web adapter", async () => {
    // SPECSFY: US-001 US-002 FR-001 FR-002 FR-003 NFR-001 NFR-002 AC-002
    await expect(readPackageSource("adapters-web")).resolves.toMatch(/WebBibleReader/)
  })
})
