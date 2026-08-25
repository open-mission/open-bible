import { describe, it, expect, beforeEach, afterEach } from "vitest"
import * as fs from "node:fs"
import * as path from "node:path"
import * as os from "node:os"
import { InstalledStore } from "../src/db/installed-store.js"

let tmp: string
let store: InstalledStore

function makeTmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), "tui-store-test-"))
}

beforeEach(() => {
  tmp = makeTmpDir()
  process.env.OPEN_BIBLE_DATA_DIR = tmp
  store = new InstalledStore()
})

afterEach(() => {
  store.close()
  fs.rmSync(tmp, { recursive: true, force: true })
  delete process.env.OPEN_BIBLE_DATA_DIR
})

describe("InstalledStore", () => {
  it("SPECSFY: AC-005 upsert e list", () => {
    store.upsert({ id: "ara", name: "Almeida Revista", installedAt: 1000, versionCode: 1 })
    store.upsert({ id: "nvi", name: "Nova Versão Internacional", installedAt: 2000, versionCode: 1 })
    const list = store.list()
    expect(list.length).toBe(2)
    expect(list.map(l => l.id).sort()).toEqual(["ara", "nvi"])
  })

  it("SPECSFY: AC-003 registro após upsert", () => {
    store.upsert({ id: "ara", name: "ARA", installedAt: Date.now(), versionCode: 1 })
    const got = store.get("ara")
    expect(got?.name).toBe("ARA")
  })

  it("SPECSFY: AC-005 remove versão", () => {
    store.upsert({ id: "ara", name: "ARA", installedAt: 1, versionCode: 1 })
    store.upsert({ id: "nvi", name: "NVI", installedAt: 2, versionCode: 1 })
    expect(store.remove("nvi")).toBe(true)
    expect(store.list().length).toBe(1)
    expect(store.get("nvi")).toBeNull()
    expect(store.remove("inexistente")).toBe(false)
  })

  it("SPECSFY: upsert atualiza existente", () => {
    store.upsert({ id: "ara", name: "Old", installedAt: 1, versionCode: 1 })
    store.upsert({ id: "ara", name: "New", installedAt: 2, versionCode: 2 })
    expect(store.list().length).toBe(1)
    expect(store.get("ara")?.name).toBe("New")
    expect(store.get("ara")?.versionCode).toBe(2)
  })
})
