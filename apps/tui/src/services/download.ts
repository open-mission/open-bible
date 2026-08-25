import * as fs from "node:fs"
import * as path from "node:path"
import * as zlib from "node:zlib"
import { biblePath, ensureDataDirs } from "../db/paths.js"
import { InstalledStore } from "../db/installed-store.js"
import { validateDbFile } from "../db/bible-manager.js"

export interface DownloadOpts {
  apiUrl?: string
  fetchImpl?: typeof fetch
}

function getApiBase(opts?: DownloadOpts): string {
  return opts?.apiUrl ?? process.env.OPEN_BIBLE_API_URL ?? "http://localhost:3000"
}

export async function listRemoteVersions(opts?: DownloadOpts): Promise<{ id: string; name: string }[]> {
  const base = getApiBase(opts)
  const f = opts?.fetchImpl ?? fetch
  const res = await f(`${base}/api/bibles`)
  if (!res.ok) throw new Error(`Failed to list versions: ${res.status}`)
  const data = await res.json() as any
  // API returns { versions: [...] } or array
  if (Array.isArray(data)) return data
  if (Array.isArray(data.versions)) return data.versions
  if (Array.isArray(data.data)) return data.data
  return data
}

export async function downloadBible(versionId: string, opts?: DownloadOpts): Promise<void> {
  ensureDataDirs()
  const base = getApiBase(opts)
  const f = opts?.fetchImpl ?? fetch
  const url = `${base}/api/bibles/download/${versionId}`
  const res = await f(url)
  if (!res.ok) {
    throw new Error(`Download failed ${versionId}: ${res.status} ${res.statusText}`)
  }
  const arrayBuffer = await res.arrayBuffer()
  const input = Buffer.from(arrayBuffer)
  // Try gunzip, fallback to raw sqlite if not gzipped
  let sqliteBuf: Buffer
  try {
    sqliteBuf = zlib.gunzipSync(input)
  } catch {
    sqliteBuf = input
  }
  // Validate header before writing
  if (!sqliteBuf.subarray(0, 16).equals(Buffer.from("SQLite format 3\0"))) {
    throw new Error(`Downloaded file for ${versionId} is not a valid SQLite DB`)
  }

  const dest = biblePath(versionId)
  const tmp = dest + ".tmp." + Date.now()
  fs.mkdirSync(path.dirname(dest), { recursive: true })
  fs.writeFileSync(tmp, sqliteBuf)
  if (!validateDbFile(tmp)) {
    fs.rmSync(tmp, { force: true })
    throw new Error(`Validation failed for ${versionId}`)
  }
  fs.renameSync(tmp, dest)

  // Register in installed_bibles
  const store = new InstalledStore()
  try {
    // Try to read name from db metadata
    const { BibleManager } = await import("../db/bible-manager.js")
    const mgr = new BibleManager()
    const name = mgr.getBibleName(versionId) ?? versionId
    mgr.close()
    store.upsert({ id: versionId, name, installedAt: Date.now(), versionCode: 1 })
  } finally {
    store.close()
  }
}

export async function removeBible(versionId: string): Promise<boolean> {
  const p = biblePath(versionId)
  let removedFile = false
  if (fs.existsSync(p)) {
    fs.rmSync(p, { force: true })
    removedFile = true
  }
  const store = new InstalledStore()
  try {
    const removedRow = store.remove(versionId)
    return removedFile || removedRow
  } finally {
    store.close()
  }
}
