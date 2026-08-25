import { describe, it, expect, beforeEach, afterEach } from "vitest"
import * as fs from "node:fs"
import * as path from "node:path"
import * as os from "node:os"
import { NavigationState } from "../src/state/navigation-state.js"

function tmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), "nav-state-"))
}

describe("NavigationState", () => {
  let tmp: string
  let origEnv: string | undefined

  beforeEach(() => {
    tmp = tmpDir()
    origEnv = process.env.OPEN_BIBLE_DATA_DIR
    process.env.OPEN_BIBLE_DATA_DIR = tmp
  })

  afterEach(() => {
    fs.rmSync(tmp, { recursive: true, force: true })
    if (origEnv) process.env.OPEN_BIBLE_DATA_DIR = origEnv
    else delete process.env.OPEN_BIBLE_DATA_DIR
  })

  it("SPECSFY: US-002 FR-006 NFR-002 AC-004 h lista 10", () => {
    const s = new NavigationState()
    s.addHistory({ bookId: "gen", chapter: 1 })
    s.addHistory({ bookId: "jhn", chapter: 3, verse: 16 })
    expect(s.history.length).toBe(2)
    expect(s.history[0].bookId).toBe("jhn")
  })

  it("SPECSFY: US-002 FR-004 FR-005 FR-006 NFR-002 AC-008 dedup", () => {
    const s = new NavigationState()
    s.addHistory({ bookId: "gen", chapter: 1, verse: 1 })
    s.addHistory({ bookId: "gen", chapter: 1, verse: 1 })
    expect(s.history.length).toBe(1)
    expect(s.lastBook).toBe("gen")
  })

  it("SPECSFY: US-001 FR-002 FR-003 FR-006 NFR-001 AC-009 corrompido fallback", () => {
    const p = path.join(tmp, "state.json")
    fs.writeFileSync(p, "not json")
    const s = new NavigationState()
    s.load()
    expect(s.lastBook).toBe("gen")
    expect(s.history.length).toBe(0)
  })

  it("SPECSFY: limite 10", () => {
    const s = new NavigationState()
    for (let i = 1; i <= 12; i++) s.addHistory({ bookId: "gen", chapter: i })
    expect(s.history.length).toBe(10)
    expect(s.history[0].chapter).toBe(12)
  })
})
