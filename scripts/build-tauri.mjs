// Build do frontend para o app desktop (Tauri).
//
// O Next.js com `output: "export"` não consegue exportar route handlers dinâmicos
// (as rotas /api/* usam Hono + TursoDB). No desktop essas rotas não existem — o app
// fala com a API remota (NEXT_PUBLIC_API_ORIGIN). Então, só para o build desktop,
// movemos `app/api` para fora da árvore, rodamos o export e restauramos ao final
// (inclusive em caso de erro), deixando a árvore de trabalho intacta.

import { execSync } from "node:child_process"
import { existsSync, renameSync, mkdirSync, rmSync } from "node:fs"
import { join, dirname } from "node:path"
import { fileURLToPath } from "node:url"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")
const API_DIR = join(root, "app", "api")
const STASH_DIR = join(root, ".tauri-build-stash")
const STASHED_API = join(STASH_DIR, "api")

// Safety net: if a previous run was interrupted (e.g. killed by a timeout) after
// moving app/api to the stash but before the `finally` restored it, app/api is
// missing and the stash dir lingers. Restore it now so the working tree is never
// left without the API routes (the Vercel build depends on them). A clean run has
// no stash dir, so this is a no-op.
if (!existsSync(API_DIR) && existsSync(STASHED_API)) {
  renameSync(STASHED_API, API_DIR)
  rmSync(STASH_DIR, { recursive: true, force: true })
  console.log("[build-tauri] restaurado app/api de um stash de execução anterior interrompida")
}

const apiWasMoved = existsSync(API_DIR)

try {
  if (apiWasMoved) {
    rmSync(STASH_DIR, { recursive: true, force: true })
    mkdirSync(STASH_DIR, { recursive: true })
    renameSync(API_DIR, STASHED_API)
    console.log("[build-tauri] app/api movido temporariamente para fora do export")
  }

  const env = {
    ...process.env,
    TAURI_BUILD: "1",
    NEXT_PUBLIC_API_ORIGIN:
      process.env.NEXT_PUBLIC_API_ORIGIN ?? "https://openbible-prod.vercel.app",
  }

  // The SQLite WASM worker + sqlite3.wasm + OPFS proxy live in public/sqlite-wasm/,
  // which is gitignored and normally populated by the `prebuild` hook (pnpm
  // copy:wasm). `next build` is invoked directly below, bypassing that hook, so we
  // must copy the assets first — otherwise the static export ships without the
  // worker and the desktop app opens to a blank screen (worker 404 at runtime).
  execSync("node scripts/copy-sqlite-wasm.mjs", { cwd: root, stdio: "inherit", env })

  execSync("next build --webpack", { cwd: root, stdio: "inherit", env })
} finally {
  if (apiWasMoved && existsSync(STASHED_API)) {
    rmSync(API_DIR, { recursive: true, force: true })
    renameSync(STASHED_API, API_DIR)
    rmSync(STASH_DIR, { recursive: true, force: true })
    console.log("[build-tauri] app/api restaurado")
  }
}
