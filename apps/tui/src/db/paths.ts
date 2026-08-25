import * as path from "node:path"
import * as os from "node:os"
import * as fs from "node:fs"

export function getDataDir(): string {
  if (process.env.OPEN_BIBLE_DATA_DIR) return process.env.OPEN_BIBLE_DATA_DIR
  const xdg = process.env.XDG_DATA_HOME
  if (xdg) return path.join(xdg, "open-bible")
  return path.join(os.homedir(), ".local", "share", "open-bible")
}

export function biblePath(versionId: string): string {
  return path.join(getDataDir(), "bibles", `${versionId}.db`)
}

export function appDbPath(): string {
  return path.join(getDataDir(), "app.db")
}

export function ensureDir(dir: string): void {
  fs.mkdirSync(dir, { recursive: true })
}

export function ensureDataDirs(): void {
  ensureDir(path.join(getDataDir(), "bibles"))
}
