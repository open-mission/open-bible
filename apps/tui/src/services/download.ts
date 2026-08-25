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

const R2_MAPPING: Record<string, string> = {
  acf: "ACF.sqlite",
  ara: "ARA.sqlite",
  arc: "ARC.sqlite",
  as21: "AS21.sqlite",
  jfaa: "JFAA.sqlite",
  kja: "KJA.sqlite",
  kjf: "KJF.sqlite",
  mens: "MENS.sqlite",
  naa: "NAA.sqlite",
  nbv: "NBV.sqlite",
  ntlh: "NTLH.sqlite",
  nvi: "NVI.sqlite",
  nvt: "NVT.sqlite",
  ol: "OL.sqlite",
  tb: "TB.sqlite",
  vfl: "VFL.sqlite",
}

const FALLBACK_VERSIONS: { id: string; name: string }[] = [
  { id: "acf", name: "Almeida Corrigida Fiel" },
  { id: "ara", name: "Almeida Revista e Atualizada" },
  { id: "arc", name: "Almeida Revista e Corrigida" },
  { id: "as21", name: "Almeida Século 21" },
  { id: "jfaa", name: "João Ferreira de Almeida Atualizada" },
  { id: "kja", name: "King James Atualizada" },
  { id: "kjf", name: "King James Fiel" },
  { id: "mens", name: "The Message" },
  { id: "naa", name: "Nova Almeida Atualizada" },
  { id: "nbv", name: "Nova Bíblia Viva" },
  { id: "ntlh", name: "Nova Tradução na Linguagem de Hoje" },
  { id: "nvi", name: "Nova Versão Internacional" },
  { id: "nvt", name: "Nova Versão Transformadora" },
  { id: "ol", name: "O Livro" },
  { id: "tb", name: "Tradução Brasileira" },
  { id: "vfl", name: "Versão Fácil de Ler" },
]

function getApiBase(opts?: DownloadOpts): string {
  return opts?.apiUrl ?? process.env.OPEN_BIBLE_API_URL ?? "http://localhost:3000"
}

function getR2BucketUrl(): string {
  const env = process.env.CLOUDFLARE_BUCKET_PUBLIC_URL
  if (env) return env.replace(/\/$/, "")
  return "https://pub-2e657f1c9c644712ad9474513a7ad79b.r2.dev/bibles"
}

function getDirectR2Url(versionId: string): string | null {
  const filename = R2_MAPPING[versionId.toLowerCase()]
  if (!filename) return null
  return `${getR2BucketUrl()}/${filename}`
}

export async function listRemoteVersions(opts?: DownloadOpts): Promise<{ id: string; name: string }[]> {
  const base = getApiBase(opts)
  const f = opts?.fetchImpl ?? fetch
  try {
    const res = await f(`${base}/api/bibles`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = (await res.json()) as unknown
    if (Array.isArray(data)) return data as { id: string; name: string }[]
    if (data && typeof data === "object" && Array.isArray((data as { versions?: unknown }).versions)) return (data as { versions: { id: string; name: string }[] }).versions
    if (data && typeof data === "object" && Array.isArray((data as { data?: unknown }).data)) return (data as { data: { id: string; name: string }[] }).data
    return data as { id: string; name: string }[]
  } catch (e) {
    // Fallback to static list when API unavailable (offline, no web server)
    // Keep UX similar to web picker
    const msg = (e as Error).message
    console.error(`[tui] API list failed (${base}/api/bibles): ${msg} — usando lista estática R2`)
    return FALLBACK_VERSIONS
  }
}

async function fetchBuffer(url: string, f: typeof fetch): Promise<Buffer> {
  const res = await f(url)
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText} for ${url}`)
  const ab = await res.arrayBuffer()
  return Buffer.from(ab)
}

export async function downloadBible(versionId: string, opts?: DownloadOpts): Promise<void> {
  ensureDataDirs()
  const base = getApiBase(opts)
  const f = opts?.fetchImpl ?? fetch
  const vid = versionId.toLowerCase()
  let input: Buffer | null = null
  let lastError: unknown = null
  const attemptedUrls: string[] = []

  // 1. Try API proxy (like web: /api/bibles/download/{version} gzipped)
  const apiUrl = `${base}/api/bibles/download/${vid}`
  attemptedUrls.push(apiUrl)
  try {
    input = await fetchBuffer(apiUrl, f)
  } catch (e) {
    lastError = e
    const directUrl = getDirectR2Url(vid)
    if (directUrl) {
      attemptedUrls.push(directUrl)
      try {
        input = await fetchBuffer(directUrl, f)
      } catch (e2) {
        lastError = e2
        // Try alternative without /bibles prefix if bucketUrl already had it and file not found
        const altUrl = directUrl.includes("/bibles/") ? directUrl.replace("/bibles/", "/") : directUrl.replace(".r2.dev/", ".r2.dev/bibles/")
        if (altUrl !== directUrl) {
          attemptedUrls.push(altUrl)
          try {
            input = await fetchBuffer(altUrl, f)
            lastError = null
          } catch (e3) {
            lastError = e3
          }
        }
      }
    }
  }

  if (!input) {
    const urls = attemptedUrls.join(", ")
    throw new Error(`Unable to connect. Tente: 1) rodar web em ${base} (pnpm dev) ou 2) export OPEN_BIBLE_API_URL=https://open-bible.vercel.app ou 3) verificar internet. URLs tentadas: ${urls}. Detalhe: ${(lastError as Error)?.message ?? String(lastError)}`)
  }

  // Try gunzip, fallback to raw sqlite if not gzipped (R2 direct is raw, API is gzipped)
  let sqliteBuf: Buffer
  try {
    sqliteBuf = zlib.gunzipSync(input)
  } catch {
    sqliteBuf = input
  }
  if (!sqliteBuf.subarray(0, 16).equals(Buffer.from("SQLite format 3\0"))) {
    throw new Error(`Downloaded file for ${vid} is not a valid SQLite DB (tentou ${attemptedUrls.join(", ")})`)
  }

  const dest = biblePath(vid)
  const tmp = dest + ".tmp." + Date.now()
  fs.mkdirSync(path.dirname(dest), { recursive: true })
  fs.writeFileSync(tmp, sqliteBuf)
  if (!validateDbFile(tmp)) {
    fs.rmSync(tmp, { force: true })
    throw new Error(`Validation failed for ${vid}`)
  }
  fs.renameSync(tmp, dest)

  const store = new InstalledStore()
  try {
    const { BibleManager } = await import("../db/bible-manager.js")
    const mgr = new BibleManager()
    const name = mgr.getBibleName(vid) ?? vid
    mgr.close()
    store.upsert({ id: vid, name, installedAt: Date.now(), versionCode: 1 })
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
