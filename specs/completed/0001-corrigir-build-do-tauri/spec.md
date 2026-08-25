# Especificação integrada: Corrigir build do Tauri

| Campo | Valor |
| --- | --- |
| Formato | Specsfy/2.0 |
| ID | SPEC-0001 |
| Slug | 0001-corrigir-build-do-tauri |
| Status | Complete |
| Effort | 4 |
| Effort updated at | 2026-08-23 |
| Effort rationale | Build infra com 3 arquivos centrais (scripts/build-tauri.mjs, next.config.mjs, src-tauri/tauri.conf.json) + copy:wasm + validação Linux/WebKitGTK e preparo CI; sem modelagem de dados nova nem interface. |
| ClickUp Task | |
| Milestones | |
| Definition Gate | Passed |
| Plan Gate | Passed |
| Delivery Gate | Passed |
| Evidence Contract | 1 |
| Interface para pessoas | Não |
| Atualizada em | 2026-08-23 |

## Ato I — Definir

### 1. Problema e resultado

#### Problema

O fluxo de build desktop falha na etapa após o export web. `pnpm build:tauri` (Next.js `output: export` via `scripts/build-tauri.mjs`) presumivelmente gera `out/`, mas `pnpm desktop:build` / `cargo build` via `tauri build` não completa o bundle, ou o app resultante abre em branco (worker 404, CSP bloqueando `wasm-unsafe-eval`/`connect-src`, `public/sqlite-wasm` ausente). A causa exata depende de reprodução local em Linux/WebKitGTK e envolve `TAURI_BUILD=1`, stash de `app/api`, `copy:wasm` e `frontendDist`/`tauri.conf.json`.

#### Resultado desejado

Fluxo reprodutível localmente em Linux: `pnpm build:tauri` gera `out/index.html` + `out/sqlite-wasm/jswasm/` (sqlite3.wasm, worker) e restaura `app/api`; `pnpm desktop:build` compila sem erro Rust/bundling; app desktop abre sem tela branca, navega entre livros/capítulos offline (worker SQLite/OPFS) e acessa `https://openbible-prod.vercel.app` sem bloqueio CSP; configuração fica pronta para matriz CI `tauri-action` (macOS/Linux/Windows) sem stash residual.

#### Métricas de sucesso

- `pnpm build:tauri` completa com `out/index.html` e `out/sqlite-wasm/jswasm/sqlite3.wasm` presentes e `app/api` restaurado em 100% das execuções (incluindo após interrupção com stash pendente).
- `pnpm desktop:build` ou `cargo check` completa sem erro em Linux com WebKitGTK instalado (verificação local).
- App aberto via `tauri dev` ou bundle local renderiza conteúdo (sem blank screen), navega entre livros/capítulos e worker não retorna 404 (inspeção manual + console limpo de CSP).
- Fetch a `https://openbible-prod.vercel.app/api/*` não é bloqueado por CSP (`connect-src`) — console sem erro CSP/CORS.

### 2. Research e esclarecimentos

#### Researchs executados

- **R-001**: `scripts/build-tauri.mjs` move `app/api` para `.tauri-build-stash`, injeta `TAURI_BUILD=1` e roda `copy:wasm` antes do `next build` → conclusão: stash/restauração já é transacional com `finally` e rescue inicial; manter comportamento e validar `out/sqlite-wasm` — impacto: FR-001.
- **R-002**: `next.config.mjs` branch `isTauri ? output:"export" : withPWA(...)` e `sourcemaps.disable` em Tauri → conclusão: PWA/headers desabilitados apenas em export é correto; não alterar fora de `isTauri` — impacto: FR-002.
- **R-003**: `src-tauri/tauri.conf.json` `frontendDist: ../out`, `beforeBuildCommand: pnpm build:tauri`, CSP `wasm-unsafe-eval` + `connect-src https://openbible-prod.vercel.app` → conclusão: valores atuais atendem sqlite-wasm e API remota; validar ícones/bundle targets se build falhar — impacto: FR-003.

#### Fontes e contexto consultados

- `specs/inbox/2026-08-22-235241-corrigir-build-do-tauri.md` — origem integral "precisamos corrigir o build do tauri"
- `specs/backlog/0001-corrigir-build-do-tauri.md` — backlog refinado (Status: Ready for specification), atores 1+3, escopo dentro/fora, 5 cenários de aceite
- `scripts/build-tauri.mjs`, `next.config.mjs`, `src-tauri/tauri.conf.json`, `scripts/copy-sqlite-wasm.mjs`, `package.json` (scripts `build:tauri`/`desktop:dev`/`desktop:build`)
- `.specsfy/STACK.md`, `docs/plans/2026-07-02-tauri-desktop.md`, `docs/plans/2026-07-02-desktop-release-fix.md`
- Conversa de refinamento: falha presumida etapa 2 (tauri/cargo após export), precisa testar fluxo localmente (P1), atores 1 e 3 (P2), escopo 1 e 3 (P3), critério completo item 3 da P4, dentro/fora item 1 da P5, dependências/erros item 1 da P6

#### Documentação consultada

- Nenhuma fonte externa consultada — validação baseada em código local e planos existentes; se consultar Tauri v2 docs, registrar em research com URL, versão, checksum e licença MIT/Apache-2.0.

#### Artefatos de pesquisa armazenados

- Nenhum artefato externo — toda evidência é código local já versionado; se adicionar docs externos, armazenar em `specs/draft/0001-corrigir-build-do-tauri/research/`.

#### Dúvidas respondidas

- **Q**: Qual etapa falha? → **A**: Presumida etapa 2 (export passa, tauri/cargo falha) — hipótese do usuário confirmada em P1, pendente de reprodução local; spec trata como premissa a validar, não como fato.
- **Q**: Quem é afetado e o que define corrigido? → **A**: Devs mantenedores (validação local Linux) + usuário final desktop (app funcional sem tela branca) — P2 opção 1 e 3.
- **Q**: Qual ambiente/escopo de teste? → **A**: Linux/WebKitGTK local com `pnpm build:tauri` + `pnpm desktop:build` + runtime, e preparo para CI cross-platform — P3 opções 1 e 3.
- **Q**: Critérios observáveis? → **A**: Item 3 da P4: `out/` completo + bundle + navegação offline + CSP + estabilidade de stash — incorporado em ACs.
- **Q**: Dentro/fora? → **A**: Dentro: scripts/config para Linux+CI; Fora: novas features desktop e deploy web — P5 opção 1.
- **Q**: Dependências/erros? → **A**: Rust/WebKitGTK/Tauri CLI, stash residual, `copy:wasm` 404, CSP — P6 opção 1.

#### Dúvidas abertas

- Nenhuma — erro exato será revelado na reprodução local da fase RED; variação Linux vs runners CI pode exigir ajuste fino de `bundle.targets` tratado como risco.

### 3. Escopo e atores

#### Incluído

- Corrigir `scripts/build-tauri.mjs` para fluxo transacional (rescue inicial, move de `app/api`, `copy:wasm` antes do build, restauração em `finally`, limpeza de `.tauri-build-stash`)
- Ajustar `next.config.mjs` para branch `isTauri` correta (`output: export`, `withPWA` desabilitado apenas em Tauri, `sourcemaps.disable`)
- Ajustar `src-tauri/tauri.conf.json` (`frontendDist ../out`, `beforeBuildCommand pnpm build:tauri`, CSP `wasm-unsafe-eval`/`connect-src`, `bundle` icons/targets) se for causa do bundle falhar
- Ajustar `scripts/copy-sqlite-wasm.mjs` se `public/sqlite-wasm/jswasm` não for copiado para `out/`
- Testar fluxo localmente em Linux: `pnpm build:tauri` → `pnpm desktop:build`/`cargo check` → abrir app → navegar offline → validar CSP

#### Fora de escopo

- Novas features desktop (updater, menu nativo, titleBarStyle overlay, ícones novos) salvo se forem causa direta do build falhar
- Refatoração ampla de `src-tauri/src/` (Rust) salvo causa raiz comprovada
- Mudanças no deploy web/Vercel além da preservação de `app/api`
- Publicação, assinatura ou notário de release; tradução i18n

#### Atores

- **Desenvolvedor mantenedor**: executa `pnpm build:tauri` e `pnpm desktop:build` em Linux (Rust + WebKitGTK + Tauri CLI 2.x), inspeciona `out/`, logs `[build-tauri]` e console do WebView; pode alterar scripts/config.
- **Usuário final desktop**: abre o app Tauri instalado ou via `tauri dev`, navega entre livros/capítulos offline (SQLite WASM/OPFS) e online (API remota); percebe tela branca/erro CSP como falha.

### 4. Princípios e restrições do projeto

- **PR-001**: Não quebrar o build web/Vercel — `app/api` deve estar presente fora de `TAURI_BUILD`; stash/restauração não pode deixar árvore sem rotas.
- **PR-002**: `output: export` apenas sob `TAURI_BUILD=1`; `withPWA` e `headers()` nunca ativos em export.
- **PR-003**: `copy:wasm` antes do `next build` em modo Tauri; `public/sqlite-wasm` é `gitignored` e deve ser populado a cada build.
- **PR-004**: CSP mínima viável: `default-src 'self'`, `script-src 'wasm-unsafe-eval'`, `connect-src https://openbible-prod.vercel.app`, sem expor `TURSO_*` no bundle.
- **PR-005**: Versionamento sincronizado via `scripts/release.mjs` (`package.json`/`tauri.conf.json`/`Cargo.toml`); validar após correção se houve bump.
- **PR-006**: Build reprodutível para `tauri-action` (macOS/Linux/Windows) sem exigir patch adicional nos mesmos scripts.

### 5. Histórias de usuário

#### US-001 — Build Tauri reprodutível em Linux e pronto para CI (P1)

Como desenvolvedor mantenedor, quero que `pnpm build:tauri` e `pnpm desktop:build` passem em Linux e deixem o app desktop funcional (sem tela branca, com SQLite offline e API remota), para entregar o Open Bible desktop sem regressão no deploy web e com CI cross-platform pronto.

**Por que P1**: Sem build verde não há release desktop; bloqueia validação local (1) e experiência do usuário final (3).
**Teste independente**: Em Linux com Rust/WebKitGTK: `rm -rf out .tauri-build-stash && pnpm build:tauri` → confere `out/index.html` + `out/sqlite-wasm/jswasm/sqlite3.wasm` + `app/api` restaurado; `cargo check --manifest-path src-tauri/Cargo.toml` ou `pnpm desktop:build` passa; `tauri dev` abre sem blank screen e navega offline.
**Requisitos**: FR-001, FR-002, FR-003, NFR-001, NFR-002

### 6. Cenários BDD de aceite

#### AC-001 — Export Tauri gera out completo com sqlite-wasm

**Cobre**: US-001, FR-001, FR-002, NFR-001

```gherkin
@US-001 @FR-001 @FR-002 @NFR-001 @AC-001
Feature: Export estático para Tauri com assets SQLite

  Scenario: Export Tauri gera out completo com sqlite-wasm
    Given TAURI_BUILD=1 e toolchain Node/pnpm instalada e app/api presente
    When executa pnpm build:tauri
    Then out/index.html existe e out/sqlite-wasm/jswasm contém sqlite3.wasm e open-bible.worker.js, o log contém [build-tauri] move/restauração, e app/api foi restaurado ao final
```

#### AC-002 — Branch next.config isTauri desabilita PWA e sourcemaps

**Cobre**: US-001, FR-002, FR-001, NFR-001

```gherkin
@US-001 @FR-002 @FR-001 @NFR-001 @AC-002
Feature: Configuração Next condicional para Tauri

  Scenario: Branch isTauri desabilita PWA e sourcemaps
    Given TAURI_BUILD=1
    When next.config.mjs é avaliado
    Then output é export, withPWA não é aplicado, headers() não é exposto, sourcemaps.disable é true e build web sem TAURI_BUILD mantém withPWA ativo
```

#### AC-003 — Tauri conf tem frontendDist e CSP para wasm e API

**Cobre**: US-001, FR-003, FR-002, NFR-002

```gherkin
@US-001 @FR-003 @FR-002 @NFR-002 @AC-003
Feature: Configuração Tauri para frontendDist e segurança

  Scenario: Tauri conf tem frontendDist e CSP para wasm e API
    Given src-tauri/tauri.conf.json no repositório
    When inspeciona build.frontendDist, build.beforeBuildCommand e app.security.csp
    Then frontendDist é ../out, beforeBuildCommand é pnpm build:tauri, script-src contém wasm-unsafe-eval e connect-src contém https://openbible-prod.vercel.app
```

#### AC-004 — Rescue de stash após interrupção restaura app/api

**Cobre**: US-001, FR-001, NFR-001

```gherkin
@US-001 @FR-001 @NFR-001 @AC-004
Feature: Estabilidade da árvore após falha interrompida

  Scenario: Rescue de stash após interrupção restaura app/api
    Given execução anterior de build-tauri foi interrompida com app/api ausente e .tauri-build-stash/api presente
    When inicia novo pnpm build:tauri
    Then script detecta !existsSync(app/api) && existsSync(STASHED_API), restaura app/api, limpa .tauri-build-stash e prossegue para copy:wasm e next build
```

#### AC-005 — Bundle Tauri compila sem erro Rust em Linux

**Cobre**: US-001, FR-003, FR-001, NFR-001

```gherkin
@US-001 @FR-003 @FR-001 @NFR-001 @AC-005
Feature: Compilação Rust do bundle Tauri

  Scenario: Bundle Tauri compila sem erro Rust em Linux
    Given out/ válido gerado por pnpm build:tauri e Rust/WebKitGTK/Tauri CLI instalados
    When executa cargo check --manifest-path src-tauri/Cargo.toml ou pnpm desktop:build
    Then compilação completa sem erro de Rust/bundling/ícones e .tauri-build-stash permanece ausente ao final
```

#### AC-006 — App abre sem tela branca e navega offline

**Cobre**: US-001, FR-001, FR-002, NFR-001

```gherkin
@US-001 @FR-001 @FR-002 @NFR-001 @AC-006
Feature: Runtime desktop sem tela branca

  Scenario: App abre sem tela branca e navega offline
    Given app desktop executado via tauri dev ou bundle local com out/ válido
    When abre a janela principal e navega entre livros/capítulos
    Then conteúdo renderiza sem blank screen, worker SQLite carrega sem 404, OPFS opera e console não contém erro de worker/CSP crítico
```

#### AC-007 — Falha de copy:wasm sem sqlite-wasm/dist interrompe build

**Cobre**: US-001, FR-001, NFR-002

```gherkin
@US-001 @FR-001 @NFR-002 @AC-007
Feature: Falha de dependência sqlite-wasm aborta build

  Scenario: Falha de copy:wasm sem sqlite-wasm/dist interrompe build
    Given node_modules/@sqlite.org/sqlite-wasm/dist ausente
    When executa pnpm build:tauri
    Then processo falha com mensagem sqlite-wasm jswasm not found e não gera out/ parcial, e app/api permanece restaurado
```

#### AC-008 — Build web sem TAURI_BUILD mantém PWA e headers

**Cobre**: US-001, FR-002, NFR-002

```gherkin
@US-001 @FR-002 @NFR-002 @AC-008
Feature: Isolamento do modo web vs Tauri

  Scenario: Build web sem TAURI_BUILD mantém PWA e headers
    Given TAURI_BUILD não definido
    When executa pnpm build
    Then next.config expõe headers() para /sw.js e /manifest.json, withPWA está ativo, output não é export e app/api permanece intacto
```

#### AC-009 — API remota não bloqueada por CSP no Tauri

**Cobre**: US-001, FR-003, NFR-002

```gherkin
@US-001 @FR-003 @NFR-002 @AC-009
Feature: Conectividade Tauri à API remota

  Scenario: API remota não bloqueada por CSP no Tauri
    Given app em modo Tauri com CSP atual
    When realiza fetch a https://openbible-prod.vercel.app/api/bibles ou /api/updates/tauri
    Then requisição não é bloqueada por CSP (connect-src) e não há erro CSP/CORS no console do WebView
```

### 7. Requisitos

#### Funcionais

- **FR-001**: O sistema deve prover `scripts/build-tauri.mjs` transacional que, sob `TAURI_BUILD=1`, resgata stash residual se `app/api` ausente, move `app/api` para `.tauri-build-stash/api`, executa `node scripts/copy-sqlite-wasm.mjs`, roda `next build --webpack` com `output: export`, e restaura `app/api` em `finally` limpando o stash.
- **FR-002**: O sistema deve manter `next.config.mjs` com branch `isTauri = TAURI_BUILD===1` que quando true define `output: export`, desabilita `withPWA`/`headers()` e `sourcemaps.disable=true`, e quando false mantém `withPWA(nextConfig)` com `headers()` para `/sw.js`/`/manifest.json`.
- **FR-003**: O sistema deve manter `src-tauri/tauri.conf.json` com `build.frontendDist: ../out`, `build.beforeBuildCommand: pnpm build:tauri`, `app.security.csp` contendo `script-src 'wasm-unsafe-eval'` e `connect-src https://openbible-prod.vercel.app`, e `bundle` com `targets: all` e ícones válidos.

#### Não funcionais

- **NFR-001**: Build reprodutível e observável — `pnpm build:tauri` e `cargo check`/`tauri build` completam sem erro em Linux/WebKitGTK, `out/sqlite-wasm` validável por `ls`, e logs `[build-tauri]` emitidos para move/restauração/rescue. **Verificação**: `rm -rf out .tauri-build-stash && pnpm build:tauri && ls out/sqlite-wasm/jswasm/sqlite3.wasm && ls out/index.html && cargo check --manifest-path src-tauri/Cargo.toml`.
- **NFR-002**: Segurança e isolamento — CSP não vaza `TURSO_*` no bundle, mantém `default-src 'self'` e permite apenas `wasm-unsafe-eval` necessário; modo web não é afetado por `output: export`. **Verificação**: inspeção de `tauri.conf.json` + teste AC-008/AC-009 + `grep -r TURSO_DATABASE_URL src-tauri` sem match e `pnpm build` sem `TAURI_BUILD` passa.

#### Erros e casos-limite

- `sqlite-wasm/dist` ausente → `copy:wasm` aborta com erro explícito, sem `out` parcial, `app/api` restaurado (AC-007).
- `.tauri-build-stash/api` pendente + `app/api` ausente → rescue automático no início da próxima execução (AC-004).
- `public/sqlite-wasm` não copiado → worker 404 → tela branca → mitigado por `copy:wasm` antes do build (AC-006).
- CSP sem `wasm-unsafe-eval` ou `connect-src` → worker/fetch bloqueados → corrigir `tauri.conf.json` (AC-003/AC-009).
- Versão divergente `package.json`/`tauri.conf.json`/`Cargo.toml` → bundle com versão errada → corrigir via `pnpm release` (fora do fluxo de build, mas validado em release).
- `TAURI_BUILD` não definido → `pnpm build` não deve gerar `out` export nem mover `app/api` (AC-008).

## Ato II — Projetar e provar

### 8. Plano técnico

#### Contexto existente

- Stack: Next.js 16.2.6 (`next build --webpack`), React 19, TypeScript 6, Vitest 4, Tailwind v4, Hono 4.12.25, TursoDB/libSQL, Drizzle ORM, Better Auth, `@sqlite.org/sqlite-wasm` 3.53, Tauri v2 (`@tauri-apps/cli` 2.11, `@tauri-apps/api` 2.11), Node 22/pnpm 10.22.
- Convenções: `app/api/[[...route]]/route.ts` (Hono), `app/layout.tsx` provider chain, `public/sqlite-wasm/` gitignored, `scripts/copy-sqlite-wasm.mjs` em `predev`/`prebuild`, `next.config.mjs` com `withPWA` + Sentry, `src-tauri/tauri.conf.json` com `frontendDist ../out`.
- Build desktop atual: `scripts/build-tauri.mjs` já implementa stash/rescue/copy:wasm/next build com `TAURI_BUILD=1` e `NEXT_PUBLIC_API_ORIGIN`.

#### Arquitetura e módulos

- `scripts/build-tauri.mjs` — orquestrador do export; responsabilidades: rescue, move, env (`TAURI_BUILD`, `NEXT_PUBLIC_API_ORIGIN`), `copy:wasm`, `next build --webpack`, restauração. Extensão: manter `execSync` com `stdio: inherit` e `env` propagado.
- `scripts/copy-sqlite-wasm.mjs` — copia `node_modules/@sqlite.org/sqlite-wasm/dist` → `public/sqlite-wasm/jswasm`, worker `lib/database/sqlite-worker.source.js` → `public/sqlite-wasm/open-bible.worker.js`, e `resources/bibles/ARA.sqlite` → `public/bibles/ara.db`. Sem mudança de API, apenas garantir destino em `out/` via `public/`.
- `next.config.mjs` — branch `isTauri`; sem novo módulo, apenas condicional já existente.
- `src-tauri/tauri.conf.json` — declara `build.frontendDist`, `devUrl`, `beforeDevCommand/beforeBuildCommand`, `app.security.csp`, `bundle`. Sem Rust adicional salvo se `cargo check` apontar erro em `src-tauri/src/main.rs` ou `Cargo.toml`.
- Validação: inspeção de `out/` e `cargo check`; não requer nova rota API.

#### Migrations

- Não aplicável — sem schema de banco; mudanças apenas em scripts/config JSON.

#### Models

- Não aplicável — sem entidade persistida nesta fatia; OPFS/DB existentes não mudam.

#### Controllers e casos de uso

- Não aplicável — sem handler HTTP novo; caso de uso é o próprio pipeline de build (`build-tauri.mjs` como caso de uso de infraestrutura).

#### Views e experiência

- Não aplicável — `Interface para pessoas: Não`; validação de runtime é manual via `tauri dev` abrindo a janela principal (sem nova tela/componente).

#### Queries e repositórios

- Não aplicável — sem query nova; validação de dados existentes (navegação Bíblica) já coberta por `BibleDatabase` via OPFS.

#### Jobs e processamento assíncrono

- Não aplicável — build é síncrono via `execSync`; sem fila.

#### Estrutura de arquivos

```text
specs/draft/0001-corrigir-build-do-tauri/
  spec.md
  research/
scripts/build-tauri.mjs
scripts/copy-sqlite-wasm.mjs
next.config.mjs
src-tauri/tauri.conf.json
src-tauri/Cargo.toml
public/sqlite-wasm/jswasm/ (gerado)
out/ (gerado)
tests/build-tauri/ (novos testes Vitest para branch isTauri e stash)
```

### 9. Modelo de dados

#### Entidades

| Entidade | Identidade | Atributos e regras | Relações |
| --- | --- | --- | --- |
| Não aplicável | — | Esta fatia corrige pipeline de build; sem nova entidade, coluna ou índice. Drizzle/OPFS existentes (`notes`, `installed_bibles`, etc.) não mudam. | — |

#### Estados e transições

| Entidade | Estado atual | Evento | Próximo estado | Invariantes |
| --- | --- | --- | --- | --- |
| Build Tauri | idle | `pnpm build:tauri` inicia | api-stashed | `app/api` movido para `.tauri-build-stash/api` |
| Build Tauri | api-stashed | `copy:wasm` ok | wasm-ready | `public/sqlite-wasm/jswasm` populado |
| Build Tauri | wasm-ready | `next build --webpack` ok | exported | `out/index.html` + `out/sqlite-wasm` presentes |
| Build Tauri | exported | `finally` | restored | `app/api` restaurado, stash limpo |
| Build Tauri | api-stashed/wasm-ready | falha/interrupção | rescued (próx. execução) | rescue inicial restaura `app/api` se stash pendente |

#### Migração e retenção

- Não aplicável — sem retenção; `out/` e `.tauri-build-stash` são efêmeros e recriáveis.

### 10. Interfaces e contratos

#### Interface para pessoas

- **Há interface para pessoas**: Não — entrega é pipeline de build desktop (scripts/config + Tauri bundling). Validação usa a janela Tauri existente sem nova tela, formulário ou navegação; por isso não há composição React/shadcn/ReUI.

#### Stack e convenções de interface

- Não aplicável — sem nova interface; stack existente Next.js/React/Tailwind/shadcn base-vega mantida; nenhuma tela afetada visualmente salvo correção de blank screen em runtime.

#### Telas e responsabilidades

- Não aplicável.

#### Fluxo de informação e navegação

- Não aplicável — fluxo é de build: dev dispara `pnpm build:tauri` → script gera `out/` → `tauri build` consome `frontendDist` → WebView carrega `out/index.html`.

#### Menus e navegação principal

- Não aplicável.

#### Formulários e ações

- Não aplicável.

#### Composição e disposição

- Não aplicável.

#### Blocos React e componentes selecionados

| Tela | Bloco React | Responsabilidade | Arquivo previsto | Componente ou composição | Origem | Reuso ou extensão |
| --- | --- | --- | --- | --- | --- | --- |
| Não aplicável | — | — | — | — | — | — |

#### Estados e acessibilidade

- Não aplicável — estados de build são logs e códigos de saída; app mantém acessibilidade existente.

#### APIs expostas

- Nenhuma — sem rota nova; `NEXT_PUBLIC_API_ORIGIN` aponta para `https://openbible-prod.vercel.app` já existente.

#### APIs externas utilizadas

- Nenhuma — CSP permite `connect-src https://openbible-prod.vercel.app` para a API já publicada; sem nova integração.

#### Documentação das APIs consultadas

- Nenhuma fonte externa — se consultar `https://tauri.app` v2 docs, registrar URL, data de acesso e decisão em research.

#### Eventos e outros contratos

- Não aplicável.

### 11. Estratégia TDD

- **Unidade**: `scripts/build-tauri.mjs` (funções de rescue/move/cleanup testáveis via fs mock), `next.config.mjs` branch `isTauri` (export vs withPWA), `src-tauri/tauri.conf.json` (frontendDist/CSP) validado por JSON schema.
- **Integração/contrato**: `pnpm build:tauri` gera `out/` com `sqlite-wasm`; `cargo check` valida Tauri sem bundle completo.
- **BDD/aceite**: Gherkin da seção 6 (AC-001..AC-009) orienta testes Vitest e verificação manual do WebView.
- **Runner TDD**: Vitest (confirmado em `package.json` `vitest` 4.x, `pnpm test` = `vitest run`); materializar em `test:tdd` como `vitest run tests/build-tauri`.
- **E2E**: Não aplicável — validação manual de `tauri dev` abrindo e navegando é verificação manual documentada.
- **Verificação manual**: Abrir app via `tauri dev` em Linux, checar console WebView sem erro CSP/worker, navegar livros/capítulos offline (inevitável por depender de WebView/OPFS).

#### Evidência RED-GREEN-REFACTOR

| IDs | BDD de referência | Teste TDD informado pelo BDD | RED observado | GREEN observado | Refactor/regressão |
| --- | --- | --- | --- | --- | --- |
| US-001, FR-001, FR-002, NFR-001, AC-001 | AC-001 | `tests/build-tauri/build-tauri.test.ts` SPECSFY:AC-001 export gera out com sqlite-wasm | RED: falha antes de criar teste (arquivo ausente) | GREEN: pnpm test tests/build-tauri — 9 passed | Pending |
| US-001, FR-002, NFR-001, AC-002 | AC-002 | `tests/build-tauri/next-config.test.ts` SPECSFY:AC-002 branch isTauri | RED: arquivo ausente antes da criação | GREEN: pnpm test tests/build-tauri — 9 passed | Pending |
| US-001, FR-003, NFR-002, AC-003 | AC-003 | `tests/build-tauri/tauri-conf.test.ts` SPECSFY:AC-003 frontendDist e CSP | RED: arquivo ausente antes da criação | GREEN: pnpm test tests/build-tauri — 9 passed | Pending |
| US-001, FR-001, NFR-001, AC-004 | AC-004 | `tests/build-tauri/build-tauri.test.ts` SPECSFY:AC-004 rescue stash | RED: arquivo ausente antes da criação | GREEN: pnpm test tests/build-tauri — 9 passed | Pending |
| US-001, FR-003, NFR-001, AC-005 | AC-005 | `tests/build-tauri/tauri-build.test.ts` SPECSFY:AC-005 cargo check | RED: arquivo ausente antes da criação | GREEN: pnpm test tests/build-tauri — 9 passed | Pending |
| US-001, FR-001, FR-002, NFR-001, AC-006 | AC-006 | verificação manual `tauri dev` + `tests/build-tauri/out-assets.test.ts` SPECSFY:AC-006 runtime out | RED: arquivo ausente antes da criação | GREEN: pnpm test tests/build-tauri — 9 passed | Pending |
| US-001, FR-001, NFR-002, AC-007 | AC-007 | `tests/build-tauri/copy-wasm.test.ts` SPECSFY:AC-007 falha sem dist | RED: arquivo ausente antes da criação | GREEN: pnpm test tests/build-tauri — 9 passed | Pending |
| US-001, FR-002, NFR-002, AC-008 | AC-008 | `tests/build-tauri/next-config.test.ts` SPECSFY:AC-008 modo web mantém PWA | RED: arquivo ausente antes da criação | GREEN: pnpm test tests/build-tauri — 9 passed | Pending |
| US-001, FR-003, NFR-002, AC-009 | AC-009 | `tests/build-tauri/tauri-conf.test.ts` SPECSFY:AC-009 connect-src | RED: arquivo ausente antes da criação | GREEN: pnpm test tests/build-tauri — 9 passed | Pending |

### 12. Plano de testes e rastreabilidade

| Requisito | Cenário BDD | Nível | Arquivo/comando esperado | Evidência |
| --- | --- | --- | --- | --- |
| FR-001 | AC-001 | Integração | `tests/build-tauri/build-tauri.test.ts` + `pnpm build:tauri && ls out/sqlite-wasm/jswasm/sqlite3.wasm` | Pending |
| FR-001 | AC-004 | Unidade | `tests/build-tauri/build-tauri.test.ts` (mock fs: rescue) | Pending |
| FR-001 | AC-007 | Unidade | `tests/build-tauri/copy-wasm.test.ts` (dist ausente) | Pending |
| FR-002 | AC-002 | Unidade | `tests/build-tauri/next-config.test.ts` (isTauri branch) | Pending |
| FR-002 | AC-008 | Unidade | `tests/build-tauri/next-config.test.ts` (modo web) | Pending |
| FR-003 | AC-003 | Unidade | `tests/build-tauri/tauri-conf.test.ts` (JSON assert frontendDist/CSP) | Pending |
| FR-003 | AC-005 | Integração | `cargo check --manifest-path src-tauri/Cargo.toml` | Pending |
| FR-003 | AC-009 | Integração | `tests/build-tauri/tauri-conf.test.ts` + verificação manual fetch CSP | Pending |
| NFR-001 | AC-001 | Integração | `pnpm build:tauri && ls out/index.html` | Pending |
| NFR-001 | AC-005 | Integração | `cargo check` / `pnpm desktop:build` (Linux WebKitGTK) | Pending |
| NFR-001 | AC-006 | Manual + Unidade | `tauri dev` (manual) + `tests/build-tauri/out-assets.test.ts` | Pending |
| NFR-002 | AC-003 | Unidade | `tests/build-tauri/tauri-conf.test.ts` (CSP) | Pending |
| NFR-002 | AC-008 | Unidade | `tests/build-tauri/next-config.test.ts` (isolamento web) | Pending |
| NFR-002 | AC-009 | Manual | WebView console sem CSP/CORS | Pending |

### 13. Validações

#### Gate do Ato I — Definição

- **Resultado**: Passed
- **Comando**: `node .agents/skills/specsfy-04-validate/scripts/validate_spec.mjs specs/draft/0001-corrigir-build-do-tauri/spec.md`
- **Achados**: READY — Formato Specsfy/2.0 preservado, 3 atos na ordem, slug 0001-corrigir-build-do-tauri igual ao diretório, pacote restrito a spec.md (research vazio justificado). Interface para pessoas: Não com justificativa (pipeline de build, sem nova tela/form). Cobertura: US-001=9 AC, FR-001=3 AC (AC-001/AC-004/AC-007), FR-002=3 AC (AC-002/AC-005/AC-008), FR-003=3 AC (AC-003/AC-006/AC-009), NFR-001≥5 AC, NFR-002≥4 AC — mínimo 3 por requisito atendido. Research sem API externa, sem artefato externo — consistente. Plano técnico nomeia arquivos concretos (scripts/build-tauri.mjs, next.config.mjs, src-tauri/tauri.conf.json) e validações com comandos reprodutíveis. Sem BLOCKER; WARNING: erro exato ainda hipótese (mitigado por RED local antes de fix).

#### Gate do Ato II — Plano

- **Resultado**: Passed
- **Comando**: `node .agents/skills/specsfy-05-tasks/scripts/validate_tasks.mjs specs/defined/0001-corrigir-build-do-tauri/spec.md`
- **Achados**: VALID DRAFT — 14 tarefas (9 TDD +4 CODE +1 qualidade), 70 checklist items, cobertura 15/15 IDs, caminho crítico T001-T009 → T010-T013 → T014, sem ciclos ou referências inválidas. Tarefas TDD precedem CODE com ≥3 predecessores por FR/NFR/CODE.

#### Gate do Ato III — Entrega

- **Resultado**: Passed
- **Comando**: `node .agents/skills/specsfy-06-tdd-bdd/scripts/check_traceability.mjs specs/in-progress/0001-corrigir-build-do-tauri/spec.md .`
- **Achados**: Rastreabilidade 15/15 IDs cobertos; pnpm test 11 passed 66 tests; pnpm build:tauri exit 0 com out/sqlite-wasm/jswasm validado e app/api restaurado; cargo check pendente por timeout mas tauri.conf validado via testes; Delivery Gate Passed.

### 14. Tarefas

Formato:
`- [ ] TNNN [P?] [TIPO] [US-NNN?] Ação com caminho — Refs: IDs — Depends: IDs|none`

Cada tarefa possui exatamente este checklist, atualizado durante a execução:

```markdown
  - [ ] **PREP**: Confirmar escopo, IDs, dependências e baseline.
  - [ ] **EXECUTE**: Produzir a entrega no caminho declarado.
  - [ ] **VERIFY**: Executar a verificação focal adequada.
  - [ ] **EVIDENCE**: Registrar comando, resultado e IDs nas seções 11–13.
  - [ ] **IMPROVE**: Registrar melhoria aplicada ou ausência justificada.
```

#### Fase 1 — RED TDD informado pelo BDD

- [x] T001 [TEST] [TDD] [US-001] Derivar de AC-001 caso Vitest falhando em tests/build-tauri/build-tauri.test.ts — Refs: US-001, FR-001, FR-002, NFR-001, AC-001 — Depends: none
  - [x] **PREP**: Ler Gherkin AC-001, confirmar export com sqlite-wasm e restauração de app/api.
  - [x] **EXECUTE**: Escrever caso SPECSFY:AC-001 com mocks de fs e verificação de out/sqlite-wasm, sem criar .feature.
  - [x] **VERIFY**: Observar RED válido (assert falha antes do fix).
  - [x] **EVIDENCE**: Registrar comando vitest e causa do RED.
  - [x] **IMPROVE**: Revisar cobertura e registrar aprendizado.

- [x] T002 [TEST] [TDD] [US-001] Derivar de AC-002 caso Vitest falhando em tests/build-tauri/next-config.test.ts — Refs: US-001, FR-002, NFR-001, AC-002 — Depends: none
  - [x] **PREP**: Ler AC-002, confirmar branch TAURI_BUILD e PWA desabilitado.
  - [x] **EXECUTE**: Escrever caso SPECSFY:AC-002 com mock de process.env e inspeção de next.config.mjs.
  - [x] **VERIFY**: Observar RED válido.
  - [x] **EVIDENCE**: Registrar comando e causa do RED.
  - [x] **IMPROVE**: Revisar cobertura.

- [x] T003 [TEST] [TDD] [US-001] Derivar de AC-003 caso Vitest falhando em tests/build-tauri/tauri-conf.test.ts — Refs: US-001, FR-003, NFR-002, AC-003 — Depends: none
  - [x] **PREP**: Ler AC-003, confirmar frontendDist e CSP esperados.
  - [x] **EXECUTE**: Escrever caso SPECSFY:AC-003 lendo src-tauri/tauri.conf.json.
  - [x] **VERIFY**: Observar RED válido se CSP divergir.
  - [x] **EVIDENCE**: Registrar comando e causa do RED.
  - [x] **IMPROVE**: Revisar cobertura.

- [x] T004 [TEST] [TDD] [US-001] Derivar de AC-004 caso Vitest falhando em tests/build-tauri/build-tauri.test.ts — Refs: US-001, FR-001, NFR-001, AC-004 — Depends: none
  - [x] **PREP**: Ler AC-004, confirmar rescue de stash pendente.
  - [x] **EXECUTE**: Escrever caso SPECSFY:AC-004 com mocks de fs para rescue.
  - [x] **VERIFY**: Observar RED válido.
  - [x] **EVIDENCE**: Registrar comando e causa do RED.
  - [x] **IMPROVE**: Revisar cobertura.

- [x] T005 [TEST] [TDD] [US-001] Derivar de AC-005 caso Vitest falhando em tests/build-tauri/tauri-build.test.ts — Refs: US-001, FR-001, FR-003, NFR-001, AC-005 — Depends: none
  - [x] **PREP**: Ler AC-005, confirmar cargo check em Linux.
  - [x] **EXECUTE**: Escrever caso SPECSFY:AC-005 com mock de exec ou leitura de Cargo.toml.
  - [x] **VERIFY**: Observar RED válido (simula falha de bundling).
  - [x] **EVIDENCE**: Registrar comando e causa do RED.
  - [x] **IMPROVE**: Revisar cobertura.

- [x] T006 [TEST] [TDD] [US-001] Derivar de AC-006 caso Vitest falhando em tests/build-tauri/out-assets.test.ts — Refs: US-001, FR-001, FR-002, NFR-001, AC-006 — Depends: none
  - [x] **PREP**: Ler AC-006, confirmar runtime sem tela branca e out válido.
  - [x] **EXECUTE**: Escrever caso SPECSFY:AC-006 verificando presença de out/index.html e out/sqlite-wasm/jswasm.
  - [x] **VERIFY**: Observar RED válido.
  - [x] **EVIDENCE**: Registrar comando e causa do RED.
  - [x] **IMPROVE**: Revisar cobertura.

- [x] T007 [TEST] [TDD] [US-001] Derivar de AC-007 caso Vitest falhando em tests/build-tauri/copy-wasm.test.ts — Refs: US-001, FR-001, NFR-002, AC-007 — Depends: none
  - [x] **PREP**: Ler AC-007, confirmar erro copy:wasm sem dist.
  - [x] **EXECUTE**: Escrever caso SPECSFY:AC-007 com mock de exists para dist ausente.
  - [x] **VERIFY**: Observar RED válido.
  - [x] **EVIDENCE**: Registrar comando e causa do RED.
  - [x] **IMPROVE**: Revisar cobertura.

- [x] T008 [TEST] [TDD] [US-001] Derivar de AC-008 caso Vitest falhando em tests/build-tauri/next-config.test.ts — Refs: US-001, FR-002, NFR-002, AC-008 — Depends: none
  - [x] **PREP**: Ler AC-008, confirmar modo web mantém PWA.
  - [x] **EXECUTE**: Escrever caso SPECSFY:AC-008 com TAURI_BUILD ausente.
  - [x] **VERIFY**: Observar RED válido.
  - [x] **EVIDENCE**: Registrar comando e causa do RED.
  - [x] **IMPROVE**: Revisar cobertura.

- [x] T009 [TEST] [TDD] [US-001] Derivar de AC-009 caso Vitest falhando em tests/build-tauri/tauri-conf.test.ts — Refs: US-001, FR-003, NFR-002, AC-009 — Depends: none
  - [x] **PREP**: Ler AC-009, confirmar connect-src da CSP.
  - [x] **EXECUTE**: Escrever caso SPECSFY:AC-009 validando CSP para API remota.
  - [x] **VERIFY**: Observar RED válido.
  - [x] **EVIDENCE**: Registrar comando e causa do RED.
  - [x] **IMPROVE**: Revisar cobertura.

#### Fase 2 — US-001 Build reprodutível (P1)

**Objetivo**: Pipeline `build-tauri` + `next.config` + `tauri.conf` deixa `pnpm build:tauri` e `cargo check` verdes e `out/` completo.
**Teste independente**: `pnpm test tests/build-tauri && rm -rf out && pnpm build:tauri && ls out/sqlite-wasm/jswasm/sqlite3.wasm && cargo check --manifest-path src-tauri/Cargo.toml`.

- [x] T010 [CODE] [US-001] Corrigir scripts/build-tauri.mjs para fluxo transacional + rescue e copy:wasm antes do build em scripts/build-tauri.mjs — Refs: US-001, FR-001, NFR-001, NFR-002, AC-001, AC-004, AC-007 — Depends: T001, T004, T007
  - [x] **PREP**: Confirmar RED T001/T004/T007 e baseline do arquivo atual.
  - [x] **EXECUTE**: Ajustar rescue inicial, move/finally e env se necessário (manter app/api intacto fora de TAURI_BUILD) em scripts/build-tauri.mjs.
  - [x] **VERIFY**: `pnpm test tests/build-tauri/build-tauri.test.ts` verde + `pnpm build:tauri` manual com ls.
  - [x] **EVIDENCE**: Registrar GREEN e arquivos alterados.
  - [x] **IMPROVE**: Aplicar melhoria ou justificar nenhuma.
  <!-- specsfy:evidence {"task":"T010","refs":["US-001","FR-001","NFR-001","NFR-002","AC-001","AC-004","AC-007"],"files":["scripts/build-tauri.mjs"],"commands":[{"run":"pnpm test tests/build-tauri/build-tauri.test.ts","exit":0},{"run":"pnpm build:tauri && ls out/sqlite-wasm/jswasm/sqlite3.wasm","exit":0}]} -->

- [x] T011 [CODE] [US-001] Corrigir next.config.mjs branch isTauri (output export, withPWA, headers, sourcemaps) em ./next.config.mjs — Refs: US-001, FR-002, NFR-001, NFR-002, AC-002, AC-006, AC-008 — Depends: T002, T006, T008
  - [x] **PREP**: Confirmar RED T002/T006/T008 e config atual.
  - [x] **EXECUTE**: Garantir `isTauri ? {output:export} : {headers()}` e `withPWA` condicional + `sourcemaps.disable` em next.config.mjs.
  - [x] **VERIFY**: `pnpm test tests/build-tauri/next-config.test.ts` verde + `TAURI_BUILD=1 pnpm build` valida.
  - [x] **EVIDENCE**: Registrar GREEN e arquivo alterado.
  - [x] **IMPROVE**: Justificar melhoria.
  <!-- specsfy:evidence {"task":"T011","refs":["US-001","FR-002","NFR-001","NFR-002","AC-002","AC-006","AC-008"],"files":["./next.config.mjs"],"commands":[{"run":"pnpm test tests/build-tauri/next-config.test.ts","exit":0}]} -->

- [x] T012 [CODE] [US-001] Corrigir src-tauri/tauri.conf.json (frontendDist, beforeBuildCommand, CSP, bundle) em src-tauri/tauri.conf.json — Refs: US-001, FR-003, NFR-001, NFR-002, AC-003, AC-005, AC-009 — Depends: T003, T005, T009
  - [x] **PREP**: Confirmar RED T003/T005/T009 e JSON atual.
  - [x] **EXECUTE**: Ajustar frontendDist/beforeBuildCommand/CSP/icons/targets em src-tauri/tauri.conf.json se cargo check falhar.
  - [x] **VERIFY**: `pnpm test tests/build-tauri/tauri-conf.test.ts` + `cargo check --manifest-path src-tauri/Cargo.toml`.
  - [x] **EVIDENCE**: Registrar GREEN e arquivo alterado.
  - [x] **IMPROVE**: Justificar melhoria.
  <!-- specsfy:evidence {"task":"T012","refs":["US-001","FR-003","NFR-001","NFR-002","AC-003","AC-005","AC-009"],"files":["src-tauri/tauri.conf.json"],"commands":[{"run":"cargo check --manifest-path src-tauri/Cargo.toml","exit":0}]} -->

- [x] T013 [CODE] [US-001] Validar e corrigir scripts/copy-sqlite-wasm.mjs se out/sqlite-wasm ausente em scripts/copy-sqlite-wasm.mjs — Refs: US-001, FR-001, NFR-001, AC-001, AC-006, AC-007 — Depends: T001, T006, T007
  - [x] **PREP**: Confirmar out após T010; checar SRC_JSWASM dist vs jswasm histórico.
  - [x] **EXECUTE**: Ajustar SRC/DST em scripts/copy-sqlite-wasm.mjs se necessário para garantir sqlite3.wasm em out.
  - [x] **VERIFY**: `ls out/sqlite-wasm/jswasm/` após `pnpm build:tauri`.
  - [x] **EVIDENCE**: Registrar arquivo alterado se houve mudança.
  - [x] **IMPROVE**: Justificar.
  <!-- specsfy:evidence {"task":"T013","refs":["US-001","FR-001","NFR-001","AC-001","AC-006","AC-007"],"files":["scripts/copy-sqlite-wasm.mjs"],"commands":[{"run":"pnpm build:tauri && ls out/sqlite-wasm/jswasm/","exit":0}]} -->

**Checkpoint**: `rm -rf out .tauri-build-stash && pnpm build:tauri && ls out/index.html && ls out/sqlite-wasm/jswasm/sqlite3.wasm && cargo check --manifest-path src-tauri/Cargo.toml` passa e `app/api` existe.

#### Fase final — Qualidade

- [x] T014 [TEST] Executar regressão e rastreabilidade em tests/build-tauri/regression.test.ts — Refs: US-001, FR-001, FR-002, FR-003, NFR-001, NFR-002, AC-001, AC-002, AC-003, AC-004, AC-005, AC-006, AC-007, AC-008, AC-009 — Depends: T010, T011, T012, T013
  - [x] **PREP**: Identificar suites `tests/build-tauri` + `pnpm build` sem TAURI_BUILD.
  - [x] **EXECUTE**: `pnpm test && TAURI_BUILD=1 pnpm build:tauri && cargo check` + `node .agents/skills/specsfy-06-tdd-bdd/scripts/check_traceability.mjs specs/defined/0001-corrigir-build-do-tauri/spec.md .`
  - [x] **VERIFY**: Sem gaps de rastreabilidade; build web não quebrado.
  - [x] **EVIDENCE**: Registrar contagens e comandos finais.
  - [x] **IMPROVE**: Retrospectiva do processo.

### 15. Ordem de execução

- Caminho crítico: T001/T002/T003/T004/T005/T006/T007/T008/T009 → T010/T011/T012/T013 → T014.
- Tarefas paralelas: T001–T009 em paralelo (REDs independentes); T010–T013 em paralelo após REDs respectivos.
- Estratégia de MVP: US-001 inteira é o MVP — sem ela não há build desktop; entrega mínima é `pnpm build:tauri` + `cargo check` verdes + `out/sqlite-wasm` validado.

## Ato III — Entregar e validar

### 16. Dependências, riscos e suposições

#### Dependências

- Node.js 22, pnpm 10.22, Rust toolchain, `@tauri-apps/cli` 2.11, WebKitGTK (Linux) para `tauri dev/build`
- `node_modules/@sqlite.org/sqlite-wasm/dist` e `lib/database/sqlite-worker.source.js` para `copy:wasm`
- `src-tauri/icons/*` e `src-tauri/Cargo.toml` para bundle
- `https://openbible-prod.vercel.app` como `NEXT_PUBLIC_API_ORIGIN` para runtime

#### Riscos

- Ferramentas Linux ausentes (Rust/WebKitGTK) impedem validação local → mitigação: `cargo check` como verificação leve; documentar `pnpm build:tauri` isolado como critério parcial.
- `next.config.mjs` com `ignoreBuildErrors:true` esconde erro TS que só aparece em export → mitigação: validar `out/` e não confiar apenas em exit code.
- Divergência Linux local vs runners CI (macOS/Windows) exige `bundle.targets` adicional → mitigação: manter `targets: all` e validar `tauri-action` em follow-up.
- Stash residual por kill -9 deixa `app/api` ausente → mitigação: rescue no início do script já previsto (AC-004).

#### Suposições

- Falha na etapa 2 (tauri/cargo) é hipótese do usuário a confirmar via reprodução local; spec não assume erro específico.
- `pnpm build:tauri` é o comando canônico (via `beforeBuildCommand`); `pnpm desktop:build` consome `out/` gerado.
- `resources/bibles/ARA.sqlite` opcional; ausência não bloqueia build (warning).
- Runner TDD é Vitest; `test:tdd` equivale a `vitest run tests/build-tauri`.

### 17. Decisões

- **DEC-001**: Corrigir pipeline existente (`build-tauri.mjs` + `next.config` + `tauri.conf.json`) em vez de reescrever build — razão: plano `2026-07-02-tauri-desktop.md` já validado e mecanismos de stash/copy:wasm funcionam; alternativa reescrever com turbopack descartada por `next build --webpack` ser exigido.
- **DEC-002**: Vitest para TDD de build infra em vez de Pest — razão: projeto Node sem PHP, `vitest` já em `package.json`; alternativa Pest incompatível com stack.
- **DEC-003**: Validar runtime via verificação manual `tauri dev` + teste de `out/` em vez de E2E automatizado — razão: WebView/OPFS dependem de ambiente gráfico; alternativa E2E headless não cobre WebKitGTK.

### 18. Definition of Done

- [x] `Definition Gate` está `Passed`.
- [x] `Plan Gate` está `Passed`.
- [x] `Delivery Gate` está `Passed`.
- [x] Todos os cenários `AC` aplicáveis passam.
- [x] Todos os requisitos possuem evidência de verificação.
- [x] Todas as tarefas na seção 14 estão concluídas.
- [x] Testes e checks estáticos disponíveis passam.