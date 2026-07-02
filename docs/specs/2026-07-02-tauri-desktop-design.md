# Suporte Tauri — Open Bible Desktop

- **Data:** 2026-07-02
- **Tipo:** Feature
- **Status:** Aprovado (spec)
- **Plataformas-alvo:** macOS, Linux, Windows

## Objetivo

Distribuir o Open Bible como aplicativo desktop nativo (macOS, Linux e Windows) usando
Tauri v2, mantendo a natureza *offline-first* do projeto e reaproveitando ao máximo o
frontend Next.js e a camada de dados já existentes (SQLite WASM + OPFS).

## Contexto

Hoje o Open Bible é um PWA Next.js 16 com:

- **Leitura offline**: SQLite WASM + OPFS (SAHPool VFS) num Web Worker dedicado, com Drizzle
  ORM client-side. A versão ARA (~4,3 MB) vem embutida como *seed* em `public/bibles/ara.db`;
  as outras 17 versões são baixadas sob demanda.
- **Rotas de servidor** (`/api/*`, Hono + Zod OpenAPI): listagem de versões, capítulos, busca e
  o proxy de download `/api/bibles/download/:version` (TursoDB/Cloudflare R2).
- **Auth** (Better Auth): login email/senha, sessões de 7 dias, TursoDB.

A API de produção está hospedada em `https://openbible-prod.vercel.app`.

## Decisões de escopo

| Tema | Decisão |
|------|---------|
| Estratégia offline | Bíblias seed (ARA) embutidas + API remota para baixar as demais versões |
| Empacotamento do frontend | **Static export** do Next.js (`output: "export"`) embutido no Tauri |
| Camada de dados | **Manter SQLite WASM + OPFS** (paridade com o PWA, um só código) |
| Login/sync (Better Auth) | **Adiado** — v1 foca em leitura offline + notas locais |
| Dados embutidos | Somente a seed ARA (igual ao web); demais versões baixam sob demanda |
| Distribuição | GitHub Actions com matrix (macOS/Linux/Windows) + GitHub Release por tag `v*` |

### Fora de escopo (v1)

- Login/sincronização de conta (Better Auth) no desktop.
- Embutir as 17 versões extras no instalador.
- Auto-update (`tauri-plugin-updater`).
- Code signing / notarização (macOS) e assinatura Authenticode (Windows) — builds
  não-assinados no v1, documentado no README.
- Backend Rust nativo para SQLite (só entra como fallback se o de-risking do Linux exigir).

## Arquitetura

```
┌─────────────────────────────────────────────┐
│  Tauri App (Rust core + webview do sistema)   │
│  ┌─────────────────────────────────────────┐ │
│  │  Next.js static export (out/)             │ │
│  │   • React UI (mesma do PWA)               │ │
│  │   • SQLite WASM + OPFS (leitura offline)  │ │
│  │   • ARA seed embutida (~4,3 MB)           │ │
│  └─────────────────────────────────────────┘ │
│         │ fetch https (só quando online)       │
└─────────┼─────────────────────────────────────┘
          ▼
   https://openbible-prod.vercel.app
   (download das outras 17 versões)
```

- O Tauri serve o export estático pelo protocolo interno (`tauri://localhost` /
  `http://tauri.localhost`), que é um *secure context* — requisito para OPFS.
- As rotas `/api/*` do Next **não entram** no bundle desktop. O único ponto que dependia
  delas em runtime no cliente é o **download** de versões, que passa a apontar para a API
  remota.
- A camada de dados (DatabaseManager + Web Worker + Drizzle via `sqlite-proxy`, tanto Bíblias
  quanto notas do usuário em `app.db`) roda **sem alteração**.

### Build condicional (não quebra a Vercel)

O mesmo `next.config.mjs` atende dois modos, selecionados por variável de ambiente:

- **Web (deploy Vercel)** — comportamento atual intacto: SSR + rotas `/api` + next-pwa.
- **Desktop (`TAURI_BUILD=1`)** — `output: "export"`, next-pwa desabilitado (Service Worker
  não faz sentido dentro do Tauri), `assetPrefix` `undefined` em produção.

## Componentes e mudanças

### 1. Base de API configurável

Único ponto de verdade para a origem da API, para funcionar tanto no web (relativo) quanto no
desktop (remoto):

```ts
// lib/api-base.ts (novo)
// Web (SSR na Vercel): "" → usa rotas /api relativas do próprio site.
// Desktop (Tauri export): NEXT_PUBLIC_API_ORIGIN aponta para a API remota.
export const API_ORIGIN = process.env.NEXT_PUBLIC_API_ORIGIN ?? ""
```

- `lib/api-client.ts`: trocar `const API_BASE = "/api"` por `` const API_BASE = `${API_ORIGIN}/api` ``.
- `features/bible-reader/context/bible-version-context.tsx` (~linha 255): trocar
  `` `/api/bibles/download/${id}` `` por `` `${API_ORIGIN}/api/bibles/download/${id}` ``.

No build desktop define-se `NEXT_PUBLIC_API_ORIGIN=https://openbible-prod.vercel.app`. No build
web a env fica vazia e nada muda — **zero regressão no site**.

### 2. CORS

O endpoint de download e a API já têm CORS aberto (para o app iOS). Durante a implementação,
confirmar que a origem do Tauri (`tauri://localhost` / `http://tauri.localhost`) é aceita pelo
middleware CORS do Hono em `lib/api/hono-app.ts`. Se não for, incluir essas origens na
allowlist. (Alteração server-side, faz deploy junto na Vercel.)

### 3. next.config.mjs condicional

```js
const isTauri = process.env.TAURI_BUILD === "1"
```

- Quando `isTauri`: `output: "export"`, não aplicar o wrapper `withPWA`, `images.unoptimized`
  já é `true`. As rotas `headers()` e o Workbox só se aplicam ao modo web.
- Caso contrário: configuração atual preservada integralmente.

Validação de exportabilidade: nenhuma rota usa `generateStaticParams`; as páginas
(`/`, `/config`, `/database-test`, `/test-panel`, `/~offline`) são client-side. As rotas
`/api/*` ficam de fora do export por serem server-only.

### 4. Projeto `src-tauri/`

Criado via `tauri init`. Rust core puro, sem comandos custom no v1.

- `tauri.conf.json`:
  - `build.beforeDevCommand`: `pnpm dev`
  - `build.beforeBuildCommand`:
    `TAURI_BUILD=1 NEXT_PUBLIC_API_ORIGIN=https://openbible-prod.vercel.app pnpm build`
  - `build.devUrl`: `http://localhost:3000`
  - `build.frontendDist`: `../out`
  - `app.security.csp`:
    - `script-src 'self' 'wasm-unsafe-eval'`
    - `connect-src 'self' https://openbible-prod.vercel.app`
    - `img-src 'self' blob: data: asset: http://asset.localhost`
    - `style-src 'self' 'unsafe-inline'`
  - `identifier`: `app.openbible.desktop`
  - `productName`: `Open Bible`
- `src-tauri/icons/`: gerados a partir de `public/` via `tauri icon`.
- `src-tauri/capabilities/`: permissões mínimas (core). Sem plugins extras no v1.

### 5. Scripts e dependências

`package.json`:

```json
"tauri": "tauri",
"desktop:dev": "tauri dev",
"desktop:build": "tauri build"
```

- devDependency: `@tauri-apps/cli`.
- `.gitignore`: adicionar `src-tauri/target/`.

### 6. GitHub Action de release desktop

`.github/workflows/desktop-release.yml`:

- **Trigger:** push de tag `v*`.
- **Matrix:** `macos-latest` (target universal Apple Silicon + Intel), `ubuntu-22.04`,
  `windows-latest`.
- **Passos:** checkout → setup Rust (`dtolnay/rust-toolchain`) + cache → setup Node + pnpm →
  dependências de sistema no Linux (`libwebkit2gtk-4.1-dev`, `libappindicator3-dev`, `librsvg2-dev`,
  `patchelf`) → `pnpm install` → `tauri-apps/tauri-action` (roda o `beforeBuildCommand`, compila e
  anexa os instaladores ao GitHub Release).
- **Artefatos:** `.dmg` (macOS), `.AppImage` + `.deb` (Linux), `.msi` + `.exe` NSIS (Windows).
- Builds **não-assinados** no v1 (sem secrets de signing); documentar no README como
  contornar o Gatekeeper/SmartScreen.

## Fluxo de dados (desktop)

1. App inicia → webview carrega o export estático → DatabaseManager inicializa SQLite WASM + OPFS.
2. Primeira execução: seed ARA embutida é importada no OPFS (mesmo fluxo do PWA).
3. Leitura de capítulos/busca/notas: 100% local via SQLite WASM (offline).
4. Instalar outra versão: `fetch` para `https://openbible-prod.vercel.app/api/bibles/download/:id`
   → grava no OPFS. Requer internet apenas neste momento.

## Tratamento de erros

- **Sem internet ao instalar versão:** o fluxo atual já trata `response.ok` falso e lança erro
  exibido via toast. Nenhuma mudança necessária além da nova origem.
- **OPFS indisponível no webview:** ver riscos abaixo — tratado como gate de de-risking.

## Riscos e de-risking

**Risco principal — suporte a OPFS nos webviews de sistema.** WebView2 (Windows) e WKWebView
(macOS) suportam OPFS. O **WebKitGTK (Linux)** é o incerto: versões antigas podem não expor OPFS.

**Gate obrigatório (1ª tarefa da implementação):** rodar `tauri dev` e validar que o SQLite WASM
+ OPFS inicializa e lê a ARA em cada SO, com prioridade no **Linux/WebKitGTK**. Se falhar no
Linux, **parar** e decidir com o usuário entre:
1. Exigir WebKitGTK ≥ versão com suporte a OPFS (documentar requisito), ou
2. Fallback de SQLite nativo (rusqlite / `tauri-plugin-sql`) **apenas no Linux**.

Não prosseguir com o restante da implementação antes desse gate passar.

## Verificação

Sem suíte de testes no projeto. Por tarefa:

- `pnpm lint` + `pnpm build` (modo web) devem continuar passando — garante zero regressão no site.
- `TAURI_BUILD=1 ... pnpm build` deve gerar `out/` sem erros.
- `pnpm desktop:dev` abre o app; validar manualmente: leitura da ARA offline, troca de
  capítulo/livro, busca, criação de nota, e download de uma segunda versão com internet.
- CI: a Action de release deve compilar nos 3 SO e anexar os instaladores ao Release da tag.

## Referências

- Tauri v2 — Next.js SSG: https://v2.tauri.app/start/frontend/nextjs
- Tauri v2 — CSP: https://v2.tauri.app/security/csp
- `tauri-action`: build/release cross-platform via GitHub Actions.
