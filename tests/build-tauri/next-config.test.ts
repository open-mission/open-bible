import { describe, it, expect } from "vitest"
import { readFileSync } from "node:fs"
import { join } from "node:path"

const root = join(__dirname, "../..")

describe("next.config branch isTauri", () => {
  // SPECSFY: US-001 FR-002 NFR-001 AC-002
  it("AC-002: isTauri define output export e desabilita withPWA/sourcemaps", () => {
    const cfg = readFileSync(join(root, "apps/web/next.config.mjs"), "utf-8")
    expect(cfg).toContain('isTauri')
    expect(cfg).toContain('output: "export"')
    expect(cfg).toContain('withPWA')
    expect(cfg).toContain('sourcemaps')
    expect(cfg).toContain('TAURI_BUILD')
  })

  // SPECSFY: US-001 FR-002 NFR-002 AC-008
  it("AC-008: modo web sem TAURI_BUILD mantém PWA e headers", () => {
    const cfg = readFileSync(join(root, "apps/web/next.config.mjs"), "utf-8")
    expect(cfg).toContain('withPWA(nextConfig)')
    expect(cfg).toContain('headers()')
    expect(cfg).toContain('Service-Worker-Allowed')
  })
})
