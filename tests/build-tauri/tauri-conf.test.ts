import { describe, it, expect } from "vitest"
import { readFileSync } from "node:fs"
import { join } from "node:path"

const root = join(__dirname, "../..")

describe("tauri.conf.json", () => {
  // SPECSFY: US-001 FR-003 NFR-002 AC-003
  it("AC-003: frontendDist e CSP para wasm e API", () => {
    const raw = readFileSync(join(root, "src-tauri/tauri.conf.json"), "utf-8")
    const cfg = JSON.parse(raw)
    expect(cfg.build.frontendDist).toBe("../out")
    expect(cfg.build.beforeBuildCommand).toBe("pnpm build:tauri")
    const csp = cfg.app.security.csp
    expect(csp["script-src"]).toContain("wasm-unsafe-eval")
    expect(csp["connect-src"]).toContain("https://openbible-prod.vercel.app")
  })

  // SPECSFY: US-001 FR-003 NFR-002 AC-009
  it("AC-009: connect-src permite API remota sem bloqueio CSP", () => {
    const raw = readFileSync(join(root, "src-tauri/tauri.conf.json"), "utf-8")
    const cfg = JSON.parse(raw)
    const connect = cfg.app.security.csp["connect-src"] as string
    expect(connect).toMatch(/https:\/\/openbible-prod\.vercel\.app/)
    expect(connect).toContain("'self'")
  })
})
