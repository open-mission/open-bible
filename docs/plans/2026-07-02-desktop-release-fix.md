# Plano — Correção do Release Desktop v0.3.5

- **Goal:** Corrigir Windows (build), macOS (progresso 268%) e Linux (tela branca) do
  workflow `desktop-release.yml`.
- **Architecture:** Fix de CI + servidor (CORS) + cliente (progresso) + pipeline de
  assets do build Tauri + Error Boundary/gates de runtime. Sem mudanças de banco nem
  de API de dados.
- **Tech Stack:** GitHub Actions, Tauri v2, Next.js 16 (`output: "export"`), Hono,
  React 19 (App Router error boundaries), pnpm.
- **Spec:** `docs/specs/2026-07-02-desktop-release-fix-design.md`
- **Branch:** `fix/desktop-release-035` (a partir de `develop`)

## Mapa de arquivos

- Modify: `.github/workflows/desktop-release.yml` — `--ignore-scripts` + remover MSVC.
- Modify: `scripts/build-tauri.mjs` — rodar `copy:wasm` antes do `next build`.
- Modify: `lib/api/hono-app.ts` — expor headers CORS.
- Modify: `features/bible-reader/context/bible-version-context.tsx` — lógica de
  totalBytes + clamp.
- Create: `lib/is-tauri.ts` — detector runtime de Tauri.
- Create: `lib/opfs-available.ts` — detector de OPFS.
- Modify: `features/service-worker/components/service-worker-register.tsx` — gate.
- Modify: `app/layout.tsx` — gate Analytics + renderizar `OpfsStatusGate`.
- Create: `features/layout/components/opfs-status-gate.tsx` — toast amigável.
- Create: `app/error.tsx` — Error Boundary de rota (PT-BR).
- Create: `app/global-error.tsx` — Error Boundary raiz (PT-BR).

## Tarefas

### Task 1 — CI: `--ignore-scripts` + remover MSVC
- [ ] Editar `.github/workflows/desktop-release.yml`: install com `--ignore-scripts`;
  remover step `ilammy/msvc-dev-cmd@v1`; adicionar comentário explicativo.
- [ ] Validar YAML: `python3 -c "import yaml; yaml.safe_load(open('.github/workflows/desktop-release.yml'))"`.

### Task 2 — Pipeline de assets do build Tauri
- [ ] Editar `scripts/build-tauri.mjs`: antes de `execSync("next build --webpack")`,
  rodar `node scripts/copy-sqlite-wasm.mjs` (mesmo cwd, mesmo env).
- [ ] Validar local: `pnpm build:tauri` → `ls out/sqlite-wasm/jswasm/` mostra
  `index.mjs`, `sqlite3.wasm`, `sqlite3-opfs-async-proxy.js`; `ls out/sqlite-wasm/`
  mostra `open-bible.worker.js`.

### Task 3 — CORS: expor headers do download
- [ ] Editar `lib/api/hono-app.ts` (middleware CORS): adicionar
  `c.header("Access-Control-Expose-Headers", "X-Original-Content-Length, Content-Encoding")`.

### Task 4 — Cliente: progresso correto + clamp
- [ ] Editar `features/bible-reader/context/bible-version-context.tsx`
  (`installVersion`): novo cálculo de `totalBytes` (gzip sem original → indeterminado)
  e clamp `Math.min(receivedBytes, totalBytes)`.

### Task 5 — Helpers + gates Tauri
- [ ] Criar `lib/is-tauri.ts`.
- [ ] Criar `lib/opfs-available.ts`.
- [ ] Editar `features/service-worker/components/service-worker-register.tsx`: pular
      registro se `isTauri`.
- [ ] Editar `app/layout.tsx`: gate `Analytics` com `isTauri`; renderizar
      `OpfsStatusGate` dentro de `ToastProvider`.
- [ ] Criar `features/layout/components/opfs-status-gate.tsx`: toast persistente se
      OPFS ausente.

### Task 6 — Error Boundaries
- [ ] Criar `app/error.tsx` (client, PT-BR, botão recarregar).
- [ ] Criar `app/global-error.tsx` (client, PT-BR, html/body próprios).

### Task 7 — Validação + commit + PR
- [ ] `pnpm lint` verde.
- [ ] `pnpm build` (web) verde (zero regressão).
- [ ] `pnpm build:tauri` gera `out/sqlite-wasm/` populado.
- [ ] Commits semânticos (`fix: ...`) por grupo lógico.
- [ ] Push + `gh pr create --base develop`.
