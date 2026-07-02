# Suporte Tauri — Open Bible Desktop — Plano de Implementação

> **Para workers agênticos:** SUB-SKILL OBRIGATÓRIA: use superpowers:subagent-driven-development
> (recomendado) ou superpowers:executing-plans para implementar tarefa a tarefa. Os passos usam
> checkbox (`- [ ]`) para acompanhamento.

**Goal:** Empacotar o Open Bible como app desktop (macOS/Linux/Windows) via Tauri v2, reusando o
frontend Next.js (static export) e a camada de dados SQLite WASM + OPFS existente.

**Architecture:** Tauri v2 envolve um static export do Next.js. As rotas `/api/*` não entram no
bundle desktop; o download de versões aponta para a API remota (`openbible-prod.vercel.app`). A
seed ARA continua embutida e a leitura offline usa a mesma pilha WASM+OPFS do PWA. O `next.config`
é condicional (`TAURI_BUILD=1`) para não afetar o deploy web na Vercel.

**Tech Stack:** Tauri v2, `@tauri-apps/cli`, Rust, Next.js 16 (`output: "export"`), pnpm,
GitHub Actions (`tauri-apps/tauri-action`).

**Spec:** `docs/specs/2026-07-02-tauri-desktop-design.md`

**Verificação (sem suíte de testes no projeto):** cada tarefa valida com `pnpm lint` + `pnpm build`
(web, garante zero regressão) e, quando aplicável, `pnpm desktop:dev` / build do Tauri e checagem
manual. Nunca usar `--no-verify`.

**Nota sobre CORS:** o middleware CORS do Hono já responde `Access-Control-Allow-Origin: *`
(`lib/api/hono-app.ts:32`), então a origem do Tauri é aceita sem mudança no servidor. Nenhuma
tarefa server-side é necessária.

---

## Task 1: Base de API configurável (web continua idêntico)

**Files:**
- Create: `lib/api-base.ts`
- Modify: `lib/api-client.ts:1`
- Modify: `features/bible-reader/context/bible-version-context.tsx` (~linha 255)

- [ ] **Step 1: Criar a fonte única da origem de API**

```ts
// lib/api-base.ts
// Web (SSR na Vercel): "" → rotas /api relativas do próprio site.
// Desktop (Tauri export): NEXT_PUBLIC_API_ORIGIN aponta para a API remota.
export const API_ORIGIN = process.env.NEXT_PUBLIC_API_ORIGIN ?? ""
```

- [ ] **Step 2: Usar API_ORIGIN no api-client**

Em `lib/api-client.ts`, trocar a linha 1:

```ts
import { API_ORIGIN } from "./api-base"

const API_BASE = `${API_ORIGIN}/api`
```

- [ ] **Step 3: Usar API_ORIGIN no download de versões**

Em `features/bible-reader/context/bible-version-context.tsx`, adicionar o import no topo do arquivo:

```ts
import { API_ORIGIN } from "@/lib/api-base"
```

E trocar a construção da URL de download (atualmente `const url = \`/api/bibles/download/${id}\``):

```ts
const url = `${API_ORIGIN}/api/bibles/download/${id}`
```

- [ ] **Step 4: Verificar que o web não mudou**

Run: `pnpm lint && pnpm build`
Expected: build passa; como `NEXT_PUBLIC_API_ORIGIN` não está definido, `API_ORIGIN` é `""` e as
URLs continuam `/api/...` — comportamento idêntico ao atual.

- [ ] **Step 5: Commit**

```bash
git add lib/api-base.ts lib/api-client.ts features/bible-reader/context/bible-version-context.tsx
git commit -m "feat: make API origin configurable for desktop builds"
```

---

## Task 2: next.config.mjs condicional para export do Tauri

**Files:**
- Modify: `next.config.mjs`

- [ ] **Step 1: Tornar o config condicional ao TAURI_BUILD**

Reescrever `next.config.mjs` mantendo TODA a config web atual e adicionando o ramo desktop.
Substituir o final do arquivo (a partir da declaração de `nextConfig`) por:

```js
const isTauri = process.env.TAURI_BUILD === "1"

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_APP_VERSION: pkg.version,
  },
  webpack: (config, { dev }) => {
    if (!dev) {
      config.cache = false
    }
    return config
  },
  transpilePackages: ["@open-bible/ui"],
  turbopack: {},
  ...(isTauri
    ? { output: "export" }
    : {
        async headers() {
          return [
            {
              source: "/sw.js",
              headers: [
                { key: "Content-Type", value: "application/javascript; charset=utf-8" },
                { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
                { key: "Service-Worker-Allowed", value: "/" },
              ],
            },
            {
              source: "/manifest.json",
              headers: [
                { key: "Cache-Control", value: "public, max-age=0, must-revalidate" },
              ],
            },
          ]
        },
      }),
}

export default isTauri ? nextConfig : withPWA(nextConfig)
```

Racional: no modo Tauri, `output: "export"` gera `out/`, o next-pwa é desabilitado (Service Worker
não faz sentido dentro do Tauri) e a função `headers()` é omitida (não é suportada com
`output: "export"` e serve apenas ao SW/PWA do web).

- [ ] **Step 2: Verificar build web intacto**

Run: `pnpm lint && pnpm build`
Expected: build web passa normalmente (PWA + headers ativos, sem `output: export`).

- [ ] **Step 3: Verificar export desktop gera out/**

Run: `TAURI_BUILD=1 NEXT_PUBLIC_API_ORIGIN=https://openbible-prod.vercel.app pnpm build`
Expected: build conclui e cria o diretório `out/` com `index.html` e assets estáticos.

- [ ] **Step 4: Commit**

```bash
git add next.config.mjs
git commit -m "feat: add conditional static export for Tauri builds"
```

---

## Task 3: Gate de de-risking — OPFS + SQLite WASM no webview (bloqueante)

> **Esta tarefa é um GATE.** Não prosseguir para a Task 4+ até validar OPFS no webview, com
> prioridade no Linux/WebKitGTK. O objetivo é uma prova rápida com `tauri dev` antes de investir no
> resto do empacotamento.

**Files:**
- Nenhum arquivo de produção alterado (validação exploratória). Se `src-tauri` ainda não existir
  neste ponto, esta tarefa pode ser executada logo após a Task 4 (scaffold). Ordem recomendada:
  fazer o scaffold mínimo da Task 4 primeiro e então executar este gate.

- [ ] **Step 1: Rodar o app em modo dev dentro do Tauri**

Run (após scaffold da Task 4): `pnpm desktop:dev`
Expected: janela nativa abre carregando a UI do Open Bible.

- [ ] **Step 2: Validar inicialização do banco local**

Ação manual: abrir o app, navegar até a leitura e confirmar que a **ARA carrega e exibe
versículos** (isso exercita SQLite WASM + import OPFS da seed). Abrir o devtools do webview e
confirmar ausência de erros de OPFS/`SharedArrayBuffer`/VFS no console.

Expected: capítulo da ARA renderiza; troca de livro/capítulo funciona; busca retorna resultados.

- [ ] **Step 3: Validar no Linux (WebKitGTK) — prioridade de risco**

Se houver acesso a ambiente Linux (VM/CI/máquina), repetir os steps 1-2 lá. Caso contrário, marcar
para validar no primeiro run da GitHub Action (Task 7) e **sinalizar o risco ao usuário** antes de
tratar o app Linux como pronto.

Expected: mesma leitura offline funciona no WebKitGTK.

- [ ] **Step 4: Decisão do gate**

- Se OPFS funciona nos SO acessíveis: registrar OK e seguir.
- Se falha no Linux: **parar e apresentar ao usuário** as opções da spec (exigir WebKitGTK mínimo
  com OPFS, ou fallback SQLite nativo só no Linux). Não seguir sem decisão.

- [ ] **Step 5: Commit (registro do gate)**

Sem mudança de código; se algum ajuste de CSP/config for necessário para o OPFS funcionar, ele é
feito na Task 5 e commitado lá. Nenhum commit próprio se não houve alteração.

---

## Task 4: Scaffold do projeto src-tauri + scripts

**Files:**
- Create: `src-tauri/` (via CLI)
- Modify: `package.json` (scripts + devDependency)
- Modify: `.gitignore`

- [ ] **Step 1: Adicionar a CLI do Tauri como devDependency**

Run: `pnpm add -D @tauri-apps/cli`
Expected: `@tauri-apps/cli` aparece em devDependencies.

- [ ] **Step 2: Inicializar o projeto Tauri**

Run:
```bash
pnpm tauri init \
  --app-name "Open Bible" \
  --window-title "Open Bible" \
  --frontend-dist ../out \
  --dev-url http://localhost:3000 \
  --before-dev-command "pnpm dev" \
  --before-build-command "TAURI_BUILD=1 NEXT_PUBLIC_API_ORIGIN=https://openbible-prod.vercel.app pnpm build"
```
Expected: cria `src-tauri/` com `tauri.conf.json`, `Cargo.toml`, `src/main.rs`, `build.rs`.

- [ ] **Step 3: Definir identifier e productName**

Em `src-tauri/tauri.conf.json`, garantir:

```json
{
  "productName": "Open Bible",
  "identifier": "app.openbible.desktop"
}
```

- [ ] **Step 4: Adicionar scripts ao package.json**

Em `package.json`, na seção `scripts`, adicionar:

```json
"tauri": "tauri",
"desktop:dev": "tauri dev",
"desktop:build": "tauri build"
```

- [ ] **Step 5: Ignorar artefatos de build do Rust**

Em `.gitignore`, adicionar ao final:

```
# tauri (rust build artifacts)
/src-tauri/target/
/src-tauri/gen/
```

- [ ] **Step 6: Gerar ícones a partir do public/**

Run: `pnpm tauri icon public/icon.png`
(Se `public/icon.png` não existir, usar o maior PNG disponível em `public/` como fonte; conferir
com `ls public/*.png`.)
Expected: ícones gerados em `src-tauri/icons/`.

- [ ] **Step 7: Verificar que o web não quebrou**

Run: `pnpm lint && pnpm build`
Expected: build web passa; `src-tauri/` não interfere no build Next.

- [ ] **Step 8: Commit**

```bash
git add src-tauri package.json .gitignore
git commit -m "feat: scaffold tauri v2 desktop project"
```

---

## Task 5: CSP e allowlist de rede no tauri.conf.json

**Files:**
- Modify: `src-tauri/tauri.conf.json`

- [ ] **Step 1: Configurar a CSP de segurança**

Em `src-tauri/tauri.conf.json`, na seção `app.security`, definir:

```json
"security": {
  "csp": {
    "default-src": "'self'",
    "script-src": "'self' 'wasm-unsafe-eval'",
    "connect-src": "'self' https://openbible-prod.vercel.app",
    "img-src": "'self' blob: data: asset: http://asset.localhost",
    "style-src": "'self' 'unsafe-inline'",
    "font-src": "'self' data:"
  }
}
```

Racional: `wasm-unsafe-eval` habilita o SQLite WASM; `connect-src` libera o fetch de download da
API remota; `blob:`/`data:` cobrem a montagem do `.db` baixado e assets inline.

- [ ] **Step 2: Rodar em dev e validar console limpo**

Run: `pnpm desktop:dev`
Expected: app abre; nenhum erro de violação de CSP no console do webview; leitura da ARA e download
de uma segunda versão (com internet) funcionam.

- [ ] **Step 3: Commit**

```bash
git add src-tauri/tauri.conf.json
git commit -m "feat: configure tauri CSP for wasm and remote api"
```

---

## Task 6: Build local de produção do desktop (macOS)

**Files:**
- Nenhum (validação de build).

- [ ] **Step 1: Build de produção do app desktop**

Run: `pnpm desktop:build`
Expected: `beforeBuildCommand` roda o export (`out/`), o Rust compila em release e gera o instalador
em `src-tauri/target/release/bundle/` (`.dmg`/`.app` no macOS).

- [ ] **Step 2: Smoke test do instalador**

Ação manual: abrir o `.app`/`.dmg` gerado, confirmar leitura offline da ARA e download de uma
versão adicional com internet.
Expected: app funciona instalado, não só em dev.

- [ ] **Step 3: Commit (se algum ajuste de config foi necessário)**

Se o build exigiu ajuste em `tauri.conf.json` (ex.: `bundle.targets`, `bundle.active`), commitar:

```bash
git add src-tauri/tauri.conf.json
git commit -m "chore: finalize tauri bundle configuration"
```

---

## Task 7: GitHub Action de build cross-platform + release por tag

**Files:**
- Create: `.github/workflows/desktop-release.yml`

- [ ] **Step 1: Criar o workflow de release desktop**

```yaml
# .github/workflows/desktop-release.yml
name: Desktop Release

on:
  push:
    tags:
      - "v*"

jobs:
  build:
    permissions:
      contents: write
    strategy:
      fail-fast: false
      matrix:
        include:
          - platform: macos-latest
            args: "--target universal-apple-darwin"
          - platform: ubuntu-22.04
            args: ""
          - platform: windows-latest
            args: ""
    runs-on: ${{ matrix.platform }}
    steps:
      - uses: actions/checkout@v4

      - name: Install Rust toolchain
        uses: dtolnay/rust-toolchain@stable
        with:
          targets: ${{ matrix.platform == 'macos-latest' && 'aarch64-apple-darwin,x86_64-apple-darwin' || '' }}

      - name: Rust cache
        uses: swatinem/rust-cache@v2
        with:
          workspaces: "./src-tauri -> target"

      - name: Install Linux system dependencies
        if: matrix.platform == 'ubuntu-22.04'
        run: |
          sudo apt-get update
          sudo apt-get install -y libwebkit2gtk-4.1-dev libappindicator3-dev librsvg2-dev patchelf

      - name: Setup pnpm
        uses: pnpm/action-setup@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm

      - name: Install frontend dependencies
        run: pnpm install --frozen-lockfile

      - name: Build and release desktop app
        uses: tauri-apps/tauri-action@v0
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          TAURI_BUILD: "1"
          NEXT_PUBLIC_API_ORIGIN: "https://openbible-prod.vercel.app"
        with:
          tagName: ${{ github.ref_name }}
          releaseName: "Open Bible ${{ github.ref_name }}"
          releaseDraft: true
          prerelease: false
          args: ${{ matrix.args }}
```

Racional: matrix cobre os 3 SO; `tauri-action` roda o `beforeBuildCommand` (export do Next) e
compila o Rust, anexando os instaladores a um GitHub Release em rascunho para revisão antes de
publicar. Sem secrets de signing no v1 (builds não-assinados).

- [ ] **Step 2: Validar sintaxe do YAML**

Run: `pnpm dlx yaml-lint .github/workflows/desktop-release.yml || true`
(Se o binário não existir, revisar o YAML manualmente — indentação e chaves.)
Expected: sem erro de parse.

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/desktop-release.yml
git commit -m "ci: add cross-platform desktop build and release workflow"
```

- [ ] **Step 4: Nota sobre o remote (push de workflows)**

A memória do projeto indica que o token `gh` pode não ter escopo `workflow` para push HTTPS. O
remote é SSH, então o push da branch com o novo workflow deve ocorrer via SSH normalmente. Se o
push do arquivo em `.github/workflows/` for rejeitado por escopo, sinalizar ao usuário.

---

## Task 8: Documentação (README) do app desktop

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Adicionar seção "Desktop (Tauri)" ao README**

Incluir: pré-requisitos (Rust, deps de sistema por SO), comandos `pnpm desktop:dev` /
`pnpm desktop:build`, como uma tag `v*` dispara o release, e o aviso de builds **não-assinados**
(como contornar Gatekeeper no macOS e SmartScreen no Windows). Texto em português, coerente com o
restante do README.

- [ ] **Step 2: Verificar build web**

Run: `pnpm lint && pnpm build`
Expected: passa (mudança só em Markdown).

- [ ] **Step 3: Commit**

```bash
git add README.md
git commit -m "docs: document tauri desktop build and release"
```

---

## Ordem de execução recomendada

1. Task 1 → Task 2 (frontend pronto para export, web intacto).
2. Task 4 (scaffold) → **Task 3 (GATE OPFS)** — validar antes de investir no resto.
3. Task 5 (CSP) → Task 6 (build local macOS).
4. Task 7 (CI) → Task 8 (docs).

> O GATE da Task 3 depende do scaffold da Task 4 (`pnpm desktop:dev`), por isso o scaffold vem
> antes na prática, mas o gate continua sendo bloqueante para tudo depois dele.

## Auto-revisão (cobertura da spec)

- Estratégia offline (seed ARA + API remota): Tasks 1, 5, 6. ✓
- Static export condicional (não quebra Vercel): Task 2. ✓
- Camada de dados WASM+OPFS mantida + de-risking Linux: Task 3 (gate). ✓
- Login adiado: fora de escopo, nenhuma task (correto). ✓
- CORS: já é `*`, sem task server-side (nota no cabeçalho). ✓
- Projeto src-tauri + CSP + scripts: Tasks 4, 5. ✓
- CI matrix 3 SO + release por tag: Task 7. ✓
- Docs: Task 8. ✓
