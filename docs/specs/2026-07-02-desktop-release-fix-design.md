# Correção do Release Desktop (Windows/Linux/macOS) — v0.3.5

- **Data:** 2026-07-02
- **Tipo:** Fix
- **Status:** Aprovado
- **Branch:** `fix/desktop-release-035` (a partir de `develop`)
- **Alvo de release:** `v0.3.5`

## Objetivo

Corrigir os três defeitos do workflow `.github/workflows/desktop-release.yml` (Tauri v2)
que bloqueiam o release 0.3.5: (1) Windows — build falha na compilação nativa de
`better-sqlite3`; (2) macOS — download da versão chega a 268%; (3) Linux — AppImage
abre com tela branca.

## Causas-raiz

**Windows — compilação nativa desnecessária.** `better-sqlite3` é dev-only, usada só por
`scripts/import-bibles.mjs`. Está em `pnpm.onlyBuiltDependencies` e dispara `node-gyp`
no `pnpm install`, que falha no MSVC do `windows-latest`. O build desktop (Next.js
export + Tauri/Rust) **não a importa** — é irrelevante para o artefato. O step
`ilammy/msvc-dev-cmd@v1` não resolve o node-gyp de forma confiável.

**macOS — 268% (headers CORS não expostos).** O proxy (`lib/api/hono-app.ts`) envia o
DB gzipado: `Content-Length` = comprimido, `X-Original-Content-Length` = descomprimido,
`Content-Encoding: gzip`. O browser descomprime `response.body`, então os bytes do
`reader` são descomprimidos. O cliente prefere `X-Original-Content-Length` mas, no
desktop (cross-origin), o middleware CORS **não expõe** esse header (sem
`Access-Control-Expose-Headers`) → cai para `Content-Length` (comprimido) →
`descomprimido/comprimido ≈ 4,3MB/1,6MB ≈ 268%`. No web (same-origin) funciona porque
todos os headers são legíveis.

**Linux — tela branca (worker 404 no bundle).** `public/sqlite-wasm/` é gitignoreado e
populado só por `pnpm copy:wasm` (hook `prebuild`). Mas `build:tauri` →
`scripts/build-tauri.mjs` chama `next build` **direto**, sem disparar o `prebuild`. Em
CI limpo, `out/` vem **sem o worker SQLite / .wasm / proxy OPFS** → `new Worker(...)`
recebe 404. Sem Error Boundary no app, erros de render viram tela branca em qualquer SO.

## Soluções

1. **CI (Windows/cross-platform):** `pnpm install --frozen-lockfile --ignore-scripts`
   (pula o build nativo do `better-sqlite3`, seguro pois o desktop não o usa) + remover
   o step `ilammy/msvc-dev-cmd@v1`.
2. **macOS/cross-origin:** servir `Access-Control-Expose-Headers:
   X-Original-Content-Length, Content-Encoding` no middleware CORS; no cliente, tratar
   total como indeterminado quando gzip sem `X-Original-Content-Length`, e
   `Math.min(received, total)` (clamp) para nunca passar de 100%.
3. **Linux/cross-platform:** `build-tauri.mjs` executa `copy:wasm` antes do `next build`
   (garante `out/sqlite-wasm/` populado); Error Boundary global (`app/error.tsx` +
   `app/global-error.tsx`, PT-BR); detecção de OPFS (`lib/opfs-available.ts`) com toast
   amigável (`OpfsStatusGate` dentro do `ToastProvider`); gates no modo Tauri
   (`lib/is-tauri.ts`): `ServiceWorkerRegister` e `@vercel/analytics` não rodam no
   desktop (evitam 404 do `/sw.js` e requests bloqueados pelo CSP).

## Fora de escopo

Code signing/notarização; embutir seed ARA (baixa da API no primeiro run); fallback
SQLite nativo Rust no Linux; auto-update.

## Verificação

`pnpm lint` verde; `pnpm build` (web) verde (zero regressão Vercel); `pnpm build:tauri`
popula `out/sqlite-wasm/` (`index.mjs`, `sqlite3.wasm`, proxy, `open-bible.worker.js`);
YAML válido; CI de tag `v0.3.5` compila nos 3 SO, app abre com leitura offline e
download com progresso ≤100%.
