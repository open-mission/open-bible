// Copies the official sqlite-wasm ESM build into public/ so a Web Worker can
// load it statically, and copies the seed Bible (ARA) into public/bibles.
// Wired into predev/prebuild so the assets always exist before the app runs.
//
// NOTE: As of @sqlite.org/sqlite-wasm 3.53.0-build1 the package no longer ships
// a `sqlite-wasm/jswasm/` directory. The runtime assets (sqlite3.wasm,
// index.mjs, the OPFS async proxy, the worker1 entry) now live in `dist/`, so
// SRC_JSWASM points there. The destination keeps the historical
// `public/sqlite-wasm/jswasm` path expected by the worker tasks.
import { cp, mkdir, access } from "node:fs/promises"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const root = dirname(fileURLToPath(import.meta.url)) + "/.."

const SRC_JSWASM = join(root, "node_modules/@sqlite.org/sqlite-wasm/dist")
const DST_JSWASM = join(root, "public/sqlite-wasm/jswasm")

// The worker source is tracked in git and deployed here at build time.
const SRC_WORKER = join(root, "lib/database/sqlite-worker.source.js")
const DST_WORKER = join(root, "public/sqlite-wasm/open-bible.worker.js")

const SRC_ARA = join(root, "resources/bibles/ARA.sqlite")
const DST_ARA = join(root, "public/bibles/ara.db")

async function exists(p) {
  try { await access(p); return true } catch { return false }
}

async function main() {
  if (!(await exists(SRC_JSWASM))) {
    throw new Error(`sqlite-wasm jswasm not found at ${SRC_JSWASM} — run pnpm install first`)
  }
  await mkdir(dirname(DST_JSWASM), { recursive: true })
  await cp(SRC_JSWASM, DST_JSWASM, { recursive: true })
  console.log(`Copied sqlite-wasm → ${DST_JSWASM}`)

  await cp(SRC_WORKER, DST_WORKER)
  console.log(`Copied SQLite worker → ${DST_WORKER}`)

  if (await exists(SRC_ARA)) {
    await mkdir(dirname(DST_ARA), { recursive: true })
    await cp(SRC_ARA, DST_ARA)
    console.log(`Copied ARA Bible → ${DST_ARA}`)
  } else {
    console.warn(`ARA seed not found at ${SRC_ARA} — skipping (install via UI later)`)
  }
}

main().catch((e) => { console.error(e); process.exit(1) })
