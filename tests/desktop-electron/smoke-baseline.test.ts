import { access, readFile } from "node:fs/promises"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"

const root = resolve(import.meta.dirname, "../..")

describe("Electron smoke baseline", () => {
  it("stores the cross-platform startup baseline", async () => {
    // SPECSFY: US-001 US-002 US-003 NFR-003 AC-012
    const baselinePath = resolve(root, "tests/desktop-electron/smoke-baseline.json")
    await expect(access(baselinePath)).resolves.toBeUndefined()
    const baseline = JSON.parse(await readFile(baselinePath, "utf8")) as {
      renderer?: string
      platforms?: string[]
      budgets?: { startupMs?: number; offlineReaderReadyMs?: number }
      fallback?: string
    }
    expect(baseline.renderer).toBe("apps/web/out/index.html")
    expect(baseline.platforms).toEqual(["linux", "macos", "windows"])
    expect(baseline.budgets).toEqual({ startupMs: 5000, offlineReaderReadyMs: 3000 })
    expect(baseline.fallback).toBe("tauri")
  })
})
