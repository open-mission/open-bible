import { describe, it, expect, afterEach } from "vitest"
import * as fs from "node:fs"
import * as os from "node:os"
import * as path from "node:path"
import { getDataDir, biblePath, appDbPath } from "../src/db/paths.js"

describe("paths", () => {
  const origEnv = { ...process.env }

  afterEach(() => {
    process.env = { ...origEnv }
  })

  it("SPECSFY: AC-006 OPEN_BIBLE_DATA_DIR override", () => {
    process.env.OPEN_BIBLE_DATA_DIR = "/tmp/custom-tui"
    expect(getDataDir()).toBe("/tmp/custom-tui")
    expect(biblePath("ara")).toBe("/tmp/custom-tui/bibles/ara.db")
    expect(appDbPath()).toBe("/tmp/custom-tui/app.db")
  })

  it("SPECSFY: AC-006 XDG_DATA_HOME fallback", () => {
    delete process.env.OPEN_BIBLE_DATA_DIR
    process.env.XDG_DATA_HOME = "/tmp/xdg"
    expect(getDataDir()).toBe(path.join("/tmp/xdg", "open-bible"))
  })

  it("SPECSFY: AC-006 default XDG path usa homedir", () => {
    delete process.env.OPEN_BIBLE_DATA_DIR
    delete process.env.XDG_DATA_HOME
    const expected = path.join(os.homedir(), ".local", "share", "open-bible")
    expect(getDataDir()).toBe(expected)
  })

  it("SPECSFY: NFR-003 driver nativo sem wasm no paths", () => {
    const src = fs.readFileSync("src/db/paths.ts", "utf-8")
    expect(src).not.toContain("sqlite-wasm")
    const mgrSrc = fs.readFileSync("src/db/bible-manager.ts", "utf-8")
    expect(mgrSrc).toContain("better-sqlite3")
  })

  it("SPECSFY: AC-001 biblePath aponta para DATA_DIR/bibles/{id}.db", () => {
    process.env.OPEN_BIBLE_DATA_DIR = "/tmp/tui-test"
    expect(biblePath("nvi")).toBe("/tmp/tui-test/bibles/nvi.db")
  })
})
