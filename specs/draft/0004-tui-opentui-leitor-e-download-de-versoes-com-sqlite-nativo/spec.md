# Especificação integrada: TUI OpenTUI leitor e download de versões com sqlite nativo

| Campo | Valor |
| --- | --- |
| Formato | Specsfy/2.0 |
| ID | SPEC-0004 |
| Slug | 0004-tui-opentui-leitor-e-download-de-versoes-com-sqlite-nativo |
| Status | Draft |
| Effort | 6 |
| Effort updated at | 2026-08-25 |
| Effort rationale | TUI completo com navegação, download e persistência sqlite nativo; exige OpenTUI, better-sqlite3, integração com API existente |
| ClickUp Task | |
| Milestones | |
| Definition Gate | Pending |
| Plan Gate | Pending |
| Delivery Gate | Pending |
| Evidence Contract | 1 |
| Interface para pessoas | Sim |
| Atualizada em | 2026-08-25 |

## Ato I — Definir

### 1. Problema e resultado

#### Problema

Usuários em terminal/servidor sem navegador não conseguem ler Bíblias offline. O Open Bible hoje só entrega leitor via `apps/web` (Next.js + SQLite WASM/OPFS), incompatível com ambiente CLI. Não há ferramenta nativa Node para baixar/instalar versões bíblicas em disco com driver sqlite performático.

#### Resultado desejado

`apps/tui` executando no terminal com OpenTUI, permitindo navegar livros/capítulos/versículos de qualquer versão instalada e baixar/instalar novas versões a partir da API `/api/bibles/download/{version}` usando `better-sqlite3` (sqlite nativo). Dados armazenados em filesystem local XDG (`~/.local/share/open-bible` ou `$XDG_DATA_HOME/open-bible`) com isolamento por worktree.

#### Métricas de sucesso

- Leitor renderiza capítulo em < 100ms após navegação (medido via exec local de getChapter).
- Download+instalação de versão `ara` (~5MB sqlite gzip) completa em < 15s em rede 10Mbps e fica queryável imediatamente.
- `pnpm --filter @open-bible/tui test` passa com >= 6 casos de aceite.

### 2. Research e esclarecimentos

#### Researchs executados

- **R-001**: OpenTUI disponível como `@opentui/core` 0.5.8 e `@opentui/react` 0.5.8 — Verdict: verified — Confidence: high — Evidence: `npm view @opentui/core` 0.5.8 — Budget: 1/10
- **R-002**: `better-sqlite3` 12.11.1 já presente como `onlyBuiltDependencies` e usado em scripts import — Verdict: verified — Confidence: high — Evidence: `package.json` + `scripts/import-bibles.mjs` — Budget: 1/10
- **R-003**: API download `/api/bibles/download/{version}` proxya gz de Turso/R2, usada pelo web — Verdict: verified — Confidence: high — Evidence: `apps/web/app/api/[[...route]]/route.ts` e `lib/api/hono-app.ts` — Budget: 1/10
- **R-004**: Schema Bíblia SQLite: `verse(book_id int, chapter int, verse int, text text)`, `book(id int)`, `metadata(key,value)` — Verdict: verified — Confidence: high — Evidence: `apps/web/lib/database/bible/BibleDatabase.ts` + `book-meta.ts` — Budget: 1/10
- **R-005**: pnpm workspaces `apps/*` + `enableGlobalVirtualStore` / `virtualStoreDir` permite node_modules virtual isolado por worktree via store compartilhado — Verdict: verified — Confidence: medium — Evidence: pnpm docs v10 — Budget: 1/10

#### Fontes e contexto consultados

- `apps/web/lib/database/bible/BibleDatabase.ts`, `book-meta.ts`, `DatabaseManager.ts`
- `apps/web/lib/api/hono-app.ts` e `bible-service.ts` (rotas e download proxy)
- `package.json`, `pnpm-workspace.yaml`, `.npmrc`
- `AGENTS.md`, `.specsfy/STACK.md`, `.specsfy/DATABASE.md`

#### Documentação consultada

- OpenTUI core/react 0.5.8 docs (npm registry tarball), endpoints de renderização e input handling — verificação via npm view
- better-sqlite3 12.x docs (github/Wiki) — API Database, prepare, all/get, transaction
- pnpm workspaces + virtual store docs — pnpm.io

#### Artefatos de pesquisa armazenados

- `specs/draft/0004-tui-opentui-leitor-e-download-de-versoes-com-sqlite-nativo/research/opentui/`: snapshot de `npm view @opentui/core` e tarball listing, 2026-08-25, propósito prova API 0.5.8
- `specs/draft/0004-tui-opentui-leitor-e-download-de-versoes-com-sqlite-nativo/research/sqlite-schema/`: cópia de `BibleDatabase.ts` queries e `book-meta.ts`, proveniência local

#### Dúvidas respondidas

- **Q**: Onde armazenar DBs no TUI? → **A**: XDG data dir `~/.local/share/open-bible/bibles/{version}.db` + `app.db` para `installed_bibles`; sobrescrevível por `OPEN_BIBLE_DATA_DIR` env para testes/worktree.
- **Q**: Fonte download? → **A**: `GET /api/bibles/download/{version}` (Hono) que retorna gzip SQLite; fallback direto `CLOUDFLARE_BUCKET_PUBLIC_URL` se API indisponível.
- **Q**: Reuso de código? → **A**: Reusar `packages/domain-bible` e `book-meta` como lib compartilhada; TUI não duplica mapeamento bookId.

#### Dúvidas abertas

- Nenhuma bloqueante para Draft → Defined.

### 3. Escopo e atores

#### Incluído

- Worktree `feat/0004-tui-opentui` a partir de `develop` com `pnpm install` usando virtual store compartilhado (isolated linker)
- `apps/tui` pacote Node (`@open-bible/tui`) com bin `open-bible-tui` / `pnpm --filter @open-bible/tui dev`
- Persistência sqlite nativa via `better-sqlite3`: `BibleManager`, `InstalledBiblesRepo`, `getBooks`, `getChapterVerses`, `search`
- Download/instalação de versões: listar disponíveis, baixar gzip, descompactar, validar sqlite, registrar em `installed_bibles`
- Leitor TUI OpenTUI: seleção de versão, lista de livros (OT/NT), capítulos, renderização de versículos, navegação teclado, busca substring
- Comandos CLI e keybindings documentados

#### Fora de escopo

- Notes/highlights no TUI (fica para spec futura)
- Autenticação Better Auth no TUI
- Sync / PWA service worker / OPFS
- Editor de preferências completo (apenas storage path configurável)

#### Atores

- **Leitor CLI**: navega e lê Bíblia offline no terminal
- **Operador de versões**: lista, instala, remove e verifica versões bíblicas locais

### 4. Princípios e restrições do projeto

- **PR-001**: Monorepo pnpm workspaces: `apps/tui` deve ser workspace `apps/*` com TypeScript ESM e `pnpm-workspace.yaml` inalterado exceto necessário
- **PR-002**: Driver sqlite nativo obrigatório (`better-sqlite3`); PROIBIDO usar `sqlite-wasm`/`OPFS` no TUI
- **PR-003**: OpenTUI obrigatório para render (`@opentui/core` + `@opentui/react`); não usar `ink`, `blessed`, `chalk` manual
- **PR-004**: Parity de schema com web: reutilizar `BOOK_META` e queries de `BibleDatabase.ts`
- **PR-005**: Worktree isolada: `git worktree add .worktrees/feat-tui-opentui -b feat/0004-tui-opentui` já criado; virtual node_modules via pnpm store global (isolated linker)
- **PR-006**: Sem inventar versão bíblica: usar apenas IDs existentes em `bible_versions` servidos pela API

### 5. Histórias de usuário

#### US-001 — Leitor básico TUI (P1)

Como Leitor CLI, quero escolher versão instalada, navegar livros/capítulos e ver versículos no terminal, para estudar offline.

**Por que P1**: entrega valor core sem depender de download.
**Teste independente**: `pnpm --filter @open-bible/tui test` cobre getBooks/getVerses + render smoke; `node apps/tui/dist/index.js --help` lista comandos.
**Requisitos**: FR-001, FR-002, FR-006, FR-007

#### US-002 — Download e instalação de versões (P1)

Como Operador de versões, quero listar versões remotas, baixar e instalar uma versão e vê-la disponível no leitor, para expandir meu acervo offline.

**Por que P1**: sem instalação não há conteúdo offline além do seed.
**Teste independente**: mock download gzip → install → `installed_bibles` contém registro e `bible.db` queryável.
**Requisitos**: FR-003, FR-004, FR-005

#### US-003 — Gestão local e busca (P2)

Como Leitor CLI, quero listar versões instaladas, remover uma versão e buscar texto entre versículos, para manter disco e encontrar passagens.

**Por que P2**: qualidade operacional após leitor+download.
**Teste independente**: `search("amor", limit 10)` retorna versículos com `LIKE %amor%` parity.
**Requisitos**: FR-004, FR-005, FR-008

### 6. Cenários BDD de aceite

#### AC-001 — Leitura de capítulo instalado

**Cobre**: US-001, FR-001, FR-002, NFR-001

```gherkin
@US-001 @FR-001 @FR-002 @NFR-001 @AC-001
Feature: Leitura de capítulo instalado

  Scenario: exibir capítulo de versão instalada
    Given versão "ara" instalada em DATA_DIR/bibles/ara.db
    And livro "gn" possui capítulo 1
    When o usuário abre leitor, seleciona versão "ara", livro "gn", capítulo 1
    Then o TUI renderiza todos os versículos de Gênesis 1 ordenados por verse com texto não vazio
    And navegação para próximo/anterior capítulo funciona via teclas e via API getChapterVerses
```

#### AC-002 — Navegação resiliente

**Cobre**: US-001, FR-006, FR-007, NFR-002

```gherkin
@US-001 @FR-006 @FR-007 @NFR-002 @AC-002
Feature: Navegação resiliente

  Scenario: tratar versão/livro/capítulo inexistente
    Given versão instalada "ara"
    When o usuário solicita livro inválido "zzz" ou capítulo 999 em "gn"
    Then o sistema retorna lista vazia ou erro amigável sem crash
    And o TUI exibe estado vazio com instruções para voltar
```

#### AC-003 — Download e instalação de versão

**Cobre**: US-002, FR-003, FR-004, NFR-001

```gherkin
@US-002 @FR-003 @FR-004 @NFR-001 @AC-003
Feature: Download e instalação de versão

  Scenario: baixar e instalar versão remota
    Given API lista versão "nvi" disponível e endpoint /api/bibles/download/nvi retorna gzip sqlite válido
    When o operador executa instalação de "nvi"
    Then o arquivo DATA_DIR/bibles/nvi.db é criado e válido (sqlite header)
    And installed_bibles contém registro id=nvi
    And getBooks("nvi") retorna 66 livros e getChapterVerses("nvi","gn",1) retorna versículos
```

#### AC-004 — Falha de download e reinstalação idempotente

**Cobre**: US-002, FR-003, FR-004, NFR-002

```gherkin
@US-002 @FR-003 @FR-004 @NFR-002 @AC-004
Feature: Falha de download

  Scenario: falha de rede e reinstalação
    Given rede falha ou gzip corrompido ao baixar "nvi"
    When o operador tenta instalar "nvi"
    Then a instalação falha com mensagem clara, sem arquivo parcial corrompido e sem registro em installed_bibles
    And reinstalar versão já instalada "ara" sobrescreve db de forma atômica ou mantém anterior íntegro
```

#### AC-005 — Listagem, remoção e busca

**Cobre**: US-003, FR-004, FR-005, FR-008, NFR-001

```gherkin
@US-003 @FR-004 @FR-005 @FR-008 @NFR-001 @AC-005
Feature: Gestão local e busca

  Scenario: listar, buscar e remover
    Given versões "ara" e "nvi" instaladas
    When o usuário lista versões instaladas
    Then vê 2 entradas com id e nome
    When busca "amor" em "ara" com limite 10
    Then recebe até 10 versículos contendo "amor" case-insensitive
    When remove "nvi"
    Then arquivo nvi.db é removido e registro apagado, sem afetar "ara"
```

#### AC-006 — Driver sqlite nativo e isolamento

**Cobre**: US-001, US-002, FR-006, NFR-001, NFR-003

```gherkin
@US-001 @US-002 @FR-006 @NFR-001 @NFR-003 @AC-006
Feature: Driver sqlite nativo

  Scenario: garantia de driver nativo
    Given apps/tui usa better-sqlite3
    When código importa Database de better-sqlite3 e abre bibles/*.db
    Then não há import de @sqlite.org/sqlite-wasm nem referência a OPFS
    And XDG_DATA_HOME=/tmp/tui-test isola armazenamento de teste
```

### 7. Requisitos

#### Funcionais

- **FR-001**: O sistema deve listar livros de uma versão instalada com id, nome, abreviação, testament e chapters via sqlite nativo.
- **FR-002**: O sistema deve retornar versículos de um capítulo (book_id, chapter, verse, text) ordenados por verse.
- **FR-003**: O sistema deve listar versões remotas disponíveis via API e baixar gzip sqlite de `/api/bibles/download/{version}` com progresso e validação de header sqlite.
- **FR-004**: O sistema deve registrar e listar versões instaladas em `installed_bibles` (app.db) e mapear para arquivos `bibles/{id}.db` em DATA_DIR.
- **FR-005**: O sistema deve remover versão instalada apagando `bibles/{id}.db` e registro em `installed_bibles` de forma atômica.
- **FR-006**: O sistema deve expor `BibleManager` com API `getBooks(version)`, `getChapterVerses(version, book, chapter)`, `search(version, query, limit)` usando `better-sqlite3`.
- **FR-007**: O sistema deve renderizar TUI OpenTUI com telas: seleção de versão, lista livros (OT/NT), grid capítulos, viewer versículos, com navegação teclado e estados empty/loading/error.
- **FR-008**: O sistema deve buscar versículos por substring case-insensitive `LIKE %q% COLLATE NOCASE` com limite, parity com web.

#### Não funcionais

- **NFR-001**: Leitura de capítulo (getChapterVerses) deve responder < 100ms para DB local 5MB em máquina dev. **Verificação**: vitest bench + medição manual.
- **NFR-002**: Falhas de I/O, rede ou sqlite inválido devem produzir erro amigável sem crash e sem deixar DB corrompido. **Verificação**: testes de falha simulada.
- **NFR-003**: TUI deve operar com `better-sqlite3` nativo Node 22, sem WASM/OPFS, e `DATA_DIR` configurável por env. **Verificação**: grep ausência de wasm + teste XDG env.

#### Erros e casos-limite

- Versão não instalada → erro "versão não instalada, use download" + lista instaladas
- Livro/capítulo inexistente → lista vazia ou erro amigável, sem throw não tratado
- Download 404/500/rede/timeout → mensagem + sem arquivo parcial; retry manual
- Gzip corrompido / sqlite header inválido → falha validação, remove temp file
- Disco cheio / permissão negada → erro com path DATA_DIR
- DB locked / múltiplas instâncias → mensagem + retry

## Ato II — Projetar e provar

### 8. Plano técnico

#### Contexto existente

- Monorepo `pnpm 10.22.0`, workspaces `apps/*`, `packages/*`, Node 22
- Web usa `@sqlite.org/sqlite-wasm` + OPFS worker + Drizzle; scripts import usam `better-sqlite3` nativo
- API Hono expõe `/api/bibles`, `/api/bibles/{version}`, `/api/bibles/{version}/books/{bookId}/chapters/{chapter}`, `/api/bibles/{version}/search`, `/api/bibles/download/{version}` (gzip)
- `BOOK_META` e `BOOK_ID_TO_INT` mapeiam int<->string; `BibleDatabase` queries são referência para parity
- `installed_bibles` já existe em `apps/web/lib/database/user/schema.ts` e migrações `0000`, `0001`

#### Arquitetura e módulos

- **apps/tui**: pacote ESM TypeScript (`@open-bible/tui`), bin `open-bible-tui` (dist/index.js com shebang)
- **src/db/bible-manager.ts**: `BibleManager` classe com `better-sqlite3` Database por versão, métodos `getBooks`, `getChapterVerses`, `search`, `validateDb`, `close`
- **src/db/installed-store.ts**: `InstalledStore` sobre `better-sqlite3` para `app.db` (`installed_bibles` table), métodos `list`, `get`, `upsert`, `remove`
- **src/db/paths.ts**: resolve `DATA_DIR` = `env.OPEN_BIBLE_DATA_DIR ?? XDG_DATA_HOME/open-bible ?? ~/.local/share/open-bible`, helpers `biblePath(id)`, `appDbPath()`, `ensureDir()`
- **src/services/download.ts**: `downloadBible(version, opts)` fetch gzip, gunzip, valida sqlite header `SQLite format 3`, write atomico via temp + rename, chama `installedStore.upsert`
- **src/services/bible-service.ts**: fachada combinando manager + store + download
- **src/ui/app.tsx**: root OpenTUI React component, state versão/livro/capítulo, teclas navegação, panels
- **src/ui/components/**: `VersionSelector`, `BookList`, `ChapterGrid`, `VerseView`, `StatusBar`
- **src/index.ts**: CLI entry, parse args `--data-dir`, `--version`, comando `list`, `download`, `read`
- Usa `packages/domain-bible` para tipos compartilhados quando possível; caso contrário copia `book-meta` minimal para TUI sem acoplar web

#### Migrations

- Não aplicável no TUI: reusa `installed_bibles` schema. `InstalledStore` executa `CREATE TABLE IF NOT EXISTS installed_bibles (id TEXT PRIMARY KEY, name TEXT NOT NULL, installed_at INTEGER NOT NULL, version_code INTEGER NOT NULL DEFAULT 1)` na inicialização. Sem drizzle no TUI para manter leve.

#### Models

- `InstalledBible { id: string, name: string, installedAt: number, versionCode: number }` — arquivo `src/db/installed-store.ts`
- `Book { id: string, name: string, abbreviation: string, testament: 'old'|'new', chapters: number }` — reuso de `BOOK_META`
- `Verse { id: string, bookId: string, chapter: number, verse: number, text: string }`

#### Controllers e casos de uso

- `BibleManager.getBooks(version)` → query `SELECT b.id, MAX(v.chapter) FROM book JOIN verse... GROUP BY` — arquivo `src/db/bible-manager.ts`
- `BibleManager.getChapterVerses(version, bookId, chapter)` → `SELECT chapter, verse, text WHERE book_id=? AND chapter=? ORDER BY verse` — idem
- `BibleManager.search(version, query, limit)` → `SELECT ... WHERE text LIKE ? COLLATE NOCASE LIMIT ?`
- `DownloadService.download(version)` → fetch → gunzip → validate → atomic write → upsert — `src/services/download.ts`
- `CLI` parse `process.argv` → dispatch para manager/service/ui — `src/index.ts`

#### Views e experiência

- `VersionSelector`: dropdown/list de versões instaladas, indica `installed` vs `available`, tecla `d` para download
- `BookList`: duas seções OT/NT, lista livros com `chapters` count, filtro por abreviação
- `ChapterGrid`: grid de números 1..N capítulos, highlight atual
- `VerseView`: scrollable lista `verseNumber + text`, header `Livro Capítulo`, footer navegação
- Estados: `loading` (spinner), `empty` (sem versão instalada → prompt download), `error` (mensagem + retry), `success`

#### Queries e repositórios

- Queries `better-sqlite3` prepared statements, sem ORM, índices existentes em `verse(book_id, chapter, verse)` são suficientes
- `InstalledStore` single `app.db` com WAL mode? opcional `PRAGMA journal_mode=WAL` para concorrência leitor

#### Jobs e processamento assíncrono

- Não aplicável; download é síncrono com streaming `fetch` + `zlib gunzip`.

#### Estrutura de arquivos

```text
specs/draft/0004-tui-opentui-leitor-e-download-de-versoes-com-sqlite-nativo/
  spec.md
  research/
apps/tui/
  package.json
  tsconfig.json
  src/
    index.ts
    db/
      paths.ts
      bible-manager.ts
      installed-store.ts
    services/
      download.ts
      bible-service.ts
    ui/
      app.tsx
      components/
        VersionSelector.tsx
        BookList.tsx
        ChapterGrid.tsx
        VerseView.tsx
        StatusBar.tsx
    lib/
      book-meta.ts
  tests/
    bible-manager.test.ts
    download.test.ts
    paths.test.ts
```

### 9. Modelo de dados

#### Entidades

| Entidade | Identidade | Atributos e regras | Relações |
| --- | --- | --- | --- |
| installed_bibles | id (PK string) | name string NOT NULL, installed_at integer NOT NULL (ms), version_code integer DEFAULT 1 | 1:N com arquivos `bibles/{id}.db` no filesystem (não FK) |
| bible verse | (book_id, chapter, verse) PK implícito | book_id int FK book.id, chapter int >=1, verse int >=1, text text NOT NULL | N:1 book |
| book | id int PK | id int (1..66 mapeado), usado só em bibles/*.db | 1:N verse, 1:1 metadata |
| metadata | key TEXT PK | key text, value text (ex: name) | - |

#### Estados e transições

| Entidade | Estado atual | Evento | Próximo estado | Invariantes |
| --- | --- | --- | --- | --- |
| installed_bible | ausente | download+validate OK | instalado | arquivo existe e header válido |
| installed_bible | instalado | remove | ausente | arquivo e registro removidos atomicamente |
| installed_bible | instalado | re-download | instalado (updated) | rename atômico preserva integridade |

#### Migração e retenção

- `CREATE TABLE IF NOT EXISTS installed_bibles` no `InstalledStore` init; sem migrations versionadas no TUI v1. Retenção: dados locais indefinidos até usuário remover. Backup não necessário.

### 10. Interfaces e contratos

#### Interface para pessoas

- **Há interface para pessoas**: Sim — TUI terminal interativo com OpenTUI React, além de CLI não interativo para CI/testes.

#### Stack e convenções de interface

- Framework: OpenTUI `@opentui/core` 0.5.8 + `@opentui/react` 0.5.8, React 19, render via `createRoot` do opentui. Roteamento não aplicável (single screen com panels). Estilo via props de layout do OpenTUI (flex, border). Testes via `vitest`. Fontes observadas: `apps/web` não usa OpenTUI; TUI é stack isolada.

#### Telas e responsabilidades

- **Tela única com 4 painéis**: selector versão (topo), lista livros (esquerda), grid capítulos (centro-top), viewer versículos (centro). Tarefa principal: ler capítulo completo. Entrada: teclas n/p/↑↓/enter/q; Saída: render de versículos.

#### Fluxo de informação e navegação

- App inicia → `InstalledStore.list()` → se vazio mostra empty com instrução download → usuário seleciona versão → `BibleManager.getBooks` → lista livros → seleciona livro → `ChapterGrid` mostra 1..chapters → seleciona capítulo → `getChapterVerses` → `VerseView` renderiza. Teclas `n`/`p` avançam capítulo, `b` volta livros, `v` troca versão, `q` sai, `/` busca.

#### Menus e navegação principal

- Sem menu tradicional; navegação por painéis focáveis e keybindings: `Tab` troca foco, `↑↓` navega lista, `Enter` seleciona, `Esc` volta, `q` quit, `d` download, `/` search. Sem permissões.

#### Formulários e ações

- **Download**: input livre versão id (ex: `ara`, `nvi`), valida contra lista remota, confirma, exibe progresso. Erro em status bar.
- **Busca**: input texto + limite, resultado lista referências clicáveis que levam ao capítulo.
- Padrão: inline overlay / modal simples do OpenTUI (box absoluto).

#### Composição e disposição

- Layout flex row: sidebar livros (30 cols) + main (resto). Header status bar com versão e referência atual. Densidade compacta para 80x24 min. Responsivo: se width < 80, sidebar colapsa.

#### Blocos React e componentes selecionados

| Tela | Bloco React | Responsabilidade | Arquivo previsto | Componente ou composição | Origem | Reuso ou extensão |
| --- | --- | --- | --- | --- | --- | --- |
| TUI | App | estado global e roteamento de painéis | src/ui/app.tsx | OpenTUI React root | @opentui/react | novo |
| TUI | VersionSelector | escolha versão | src/ui/components/VersionSelector.tsx | opentui box/list | @opentui/react | novo |
| TUI | BookList | lista OT/NT | src/ui/components/BookList.tsx | opentui list | @opentui/react | novo |
| TUI | ChapterGrid | grid capítulos | src/ui/components/ChapterGrid.tsx | opentui grid/box | @opentui/react | novo |
| TUI | VerseView | render versículos | src/ui/components/VerseView.tsx | opentui scrollbox/text | @opentui/react | novo |
| TUI | StatusBar | info e erros | src/ui/components/StatusBar.tsx | opentui text | @opentui/react | novo |

#### Estados e acessibilidade

- Loading: spinner/text "Carregando..." enquanto query. Empty: "Nenhuma versão instalada. Pressione d para baixar." Error: box vermelho com mensagem e tecla r para retry. Success: render versículos. Teclado 100% navegável, sem mouse obrigatório.

#### APIs expostas

- CLI: `open-bible-tui` sem args inicia TUI; `--data-dir <path>` override; `list-versions`, `download <id>`, `remove <id>`, `read <version> <book> <chapter>` para modo não interativo.

#### APIs externas utilizadas

- `GET /api/bibles` (lista versões remotas) e `GET /api/bibles/download/{version}` (gzip sqlite) — base `process.env.OPEN_BIBLE_API_URL ?? http://localhost:3000`; timeout 30s, retry 1, fallback `CLOUDFLARE_BUCKET_PUBLIC_URL`. Sem auth.

#### Documentação das APIs consultadas

- Hono app `apps/web/lib/api/hono-app.ts` v 4.12.25, rotas definidas em `schemas.ts`; docs Scalar em `/api/docs`.

#### Eventos e outros contratos

- Não aplicável.

### 11. Estratégia TDD

- **Unidade**: `BibleManager` queries, `InstalledStore` CRUD, `paths` XDG resolution, `download` validação header e atomic write
- **Integração/contrato**: download gzip real (mock fetch), sqlite header validation, parity queries LIKE
- **BDD/aceite**: AC-001..AC-006 orientam testes; Gherkin em spec é referência para casos TDD
- **Runner TDD**: Vitest (`pnpm --filter @open-bible/tui test` e `test:tdd`)
- **E2E**: TUI smoke render não bloqueante (verifica que App monta sem throw)
- **Verificação manual**: iniciar TUI com `pnpm --filter @open-bible/tui dev` e navegar Gênesis 1

#### Evidência RED-GREEN-REFACTOR

| IDs | BDD de referência | Teste TDD informado pelo BDD | RED observado | GREEN observado | Refactor/regressão |
| --- | --- | --- | --- | --- | --- |
| US-001, FR-001, FR-002, NFR-001, AC-001 | AC-001 | bible-manager.test.ts SPECSFY: getBooks e getChapterVerses | Pending | Pending | Pending |
| US-001, FR-006, FR-007, NFR-002, AC-002 | AC-002 | bible-manager.test.ts SPECSFY: livro/capítulo inexistente | Pending | Pending | Pending |
| US-002, FR-003, FR-004, NFR-001, AC-003 | AC-003 | download.test.ts SPECSFY: download+install cria db e registro | Pending | Pending | Pending |
| US-002, FR-003, FR-004, NFR-002, AC-004 | AC-004 | download.test.ts SPECSFY: falha remove temp sem registro | Pending | Pending | Pending |
| US-003, FR-004, FR-005, FR-008, NFR-001, AC-005 | AC-005 | bible-manager.test.ts + installed-store.test.ts SPECSFY: list/search/remove | Pending | Pending | Pending |
| US-001, US-002, FR-006, NFR-003, AC-006 | AC-006 | paths.test.ts SPECSFY: driver nativo sem wasm e XDG env | Pending | Pending | Pending |

### 12. Plano de testes e rastreabilidade

| Requisito | Cenário BDD | Nível | Arquivo/comando esperado | Evidência |
| --- | --- | --- | --- | --- |
| FR-001 | AC-001 | Unidade | tests/bible-manager.test.ts | Pending |
| FR-002 | AC-001 | Unidade | tests/bible-manager.test.ts | Pending |
| FR-006 | AC-002 | Unidade | tests/bible-manager.test.ts | Pending |
| FR-003 | AC-003 | Integração | tests/download.test.ts | Pending |
| FR-004 | AC-003 | Integração | tests/download.test.ts | Pending |
| FR-003 | AC-004 | Unidade | tests/download.test.ts | Pending |
| FR-004 | AC-005 | Unidade | tests/installed-store.test.ts | Pending |
| FR-005 | AC-005 | Unidade | tests/installed-store.test.ts | Pending |
| FR-008 | AC-005 | Unidade | tests/bible-manager.test.ts | Pending |
| FR-006 | AC-006 | Unidade | tests/paths.test.ts | Pending |

### 13. Validações

#### Gate do Ato I — Definição

- **Resultado**: Pending
- **Comando**: `node .agents/skills/specsfy-04-validate/scripts/validate_spec.mjs specs/draft/0004-tui-opentui-leitor-e-download-de-versoes-com-sqlite-nativo/spec.md`
- **Achados**: Pending.

#### Gate do Ato II — Plano

- **Resultado**: Pending
- **Comando**: `node .agents/skills/specsfy-05-tasks/scripts/validate_tasks.mjs specs/draft/0004-tui-opentui-leitor-e-download-de-versoes-com-sqlite-nativo/spec.md`
- **Achados**: Pending.

#### Gate do Ato III — Entrega

- **Resultado**: Pending
- **Comando**: `node .agents/skills/specsfy-06-tdd-bdd/scripts/check_traceability.mjs specs/draft/0004-tui-opentui-leitor-e-download-de-versoes-com-sqlite-nativo/spec.md .`
- **Achados**: Pending.

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

- [ ] T001 [TEST] [TDD] [US-001] Derivar de AC-001/AC-002 casos Vitest falhando em apps/tui/tests/bible-manager.test.ts — Refs: US-001, FR-001, FR-002, FR-006, AC-001, AC-002 — Depends: none
  - [ ] **PREP**: Ler Gherkin AC-001/AC-002 e confirmar queries parity.
  - [ ] **EXECUTE**: Escrever casos com marcador `SPECSFY:` para getBooks/getChapterVerses e tratamento inválido.
  - [ ] **VERIFY**: Observar RED válido (`vitest run` falha).
  - [ ] **EVIDENCE**: Registrar comando e causa RED.
  - [ ] **IMPROVE**: Revisar cobertura.

- [ ] T002 [TEST] [TDD] [US-002] Derivar de AC-003/AC-004 casos em apps/tui/tests/download.test.ts — Refs: US-002, FR-003, FR-004, AC-003, AC-004 — Depends: none
  - [ ] **PREP**: Confirmar API download gzip e header sqlite.
  - [ ] **EXECUTE**: Escrever casos mock fetch gzip válido/corrompido com `SPECSFY:`.
  - [ ] **VERIFY**: RED.
  - [ ] **EVIDENCE**: Registrar.
  - [ ] **IMPROVE**: Revisar.

- [ ] T003 [TEST] [TDD] [US-003] Derivar de AC-005/AC-006 casos em apps/tui/tests/paths.test.ts e installed-store — Refs: US-003, FR-004, FR-005, FR-008, NFR-003, AC-005, AC-006 — Depends: none
  - [ ] **PREP**: Confirmar INSTALLED e XDG + LIKE search.
  - [ ] **EXECUTE**: Escrever casos com `SPECSFY:`.
  - [ ] **VERIFY**: RED.
  - [ ] **EVIDENCE**: Registrar.
  - [ ] **IMPROVE**: Revisar.

#### Fase 2 — US-001 Leitor básico TUI (P1)

**Objetivo**: Ler capítulo instalado via sqlite nativo.
**Teste independente**: `pnpm --filter @open-bible/tui test` bible-manager passa.

- [ ] T004 [CODE] [US-001] Implementar paths, InstalledStore e BibleManager com better-sqlite3 — Refs: US-001, FR-001, FR-002, FR-004, FR-006, AC-001, AC-002, AC-006 — Depends: T001, T003
  - [ ] **PREP**: Confirmar RED T001/T003.
  - [ ] **EXECUTE**: Criar `apps/tui/src/db/paths.ts`, `installed-store.ts`, `bible-manager.ts`, `lib/book-meta.ts`.
  - [ ] **VERIFY**: `vitest run` GREEN para bible-manager/paths.
  - [ ] **EVIDENCE**: Registrar GREEN.
  - [ ] **IMPROVE**: Justificar sem ORM.
  <!-- specsfy:evidence {"task":"T004","refs":["US-001","FR-001","FR-002","FR-004","FR-006","AC-001","AC-002","AC-006"],"files":["apps/tui/src/db/paths.ts","apps/tui/src/db/installed-store.ts","apps/tui/src/db/bible-manager.ts","apps/tui/src/lib/book-meta.ts"],"commands":[{"run":"pnpm --filter @open-bible/tui test -- bible-manager","exit":0}]} -->

**Checkpoint**: `node apps/tui/dist/index.js read ara gn 1` imprime Gênesis 1 via sqlite nativo.

#### Fase 3 — US-002 Download e instalação (P1)

**Objetivo**: Baixar e instalar versão remota.
**Teste independente**: download mock gzip → db queryável.

- [ ] T005 [CODE] [US-002] Implementar DownloadService com fetch+gzip+validação atômica — Refs: US-002, FR-003, FR-004, AC-003, AC-004 — Depends: T002, T004
  - [ ] **PREP**: Confirmar RED T002.
  - [ ] **EXECUTE**: Criar `apps/tui/src/services/download.ts` e `bible-service.ts`.
  - [ ] **VERIFY**: `vitest run` GREEN download.
  - [ ] **EVIDENCE**: Registrar.
  - [ ] **IMPROVE**: Atomic rename.
  <!-- specsfy:evidence {"task":"T005","refs":["US-002","FR-003","FR-004","AC-003","AC-004"],"files":["apps/tui/src/services/download.ts","apps/tui/src/services/bible-service.ts"],"commands":[{"run":"pnpm --filter @open-bible/tui test -- download","exit":0}]} -->

#### Fase 4 — US-003 Gestão e busca (P2)

- [ ] T006 [CODE] [US-003] Implementar list/remove e search parity — Refs: US-003, FR-004, FR-005, FR-008, AC-005 — Depends: T003, T005
  - [ ] **PREP**: Confirmar T003.
  - [ ] **EXECUTE**: Estender manager com search e store com remove.
  - [ ] **VERIFY**: `vitest run` GREEN.
  - [ ] **EVIDENCE**: Registrar.
  - [ ] **IMPROVE**: -


#### Fase de interface

- [ ] T007 [CODE] [US-001] Implementar TUI OpenTUI React App com painéis e keybindings — Refs: US-001, FR-007, AC-001, AC-002 — Depends: T004
  - [ ] **PREP**: Confirmar stack OpenTUI, layout flex, estados.
  - [ ] **EXECUTE**: Criar `apps/tui/src/ui/app.tsx` e `src/ui/components/*` com @opentui/react.
  - [ ] **VERIFY**: `pnpm --filter @open-bible/tui build` e smoke render sem throw.
  - [ ] **EVIDENCE**: Registrar build e manual nav.
  - [ ] **IMPROVE**: Justificar layout.
  <!-- specsfy:evidence {"task":"T007","refs":["US-001","FR-007","AC-001","AC-002"],"files":["apps/tui/src/ui/app.tsx","apps/tui/src/ui/components/VersionSelector.tsx","apps/tui/src/ui/components/BookList.tsx","apps/tui/src/ui/components/ChapterGrid.tsx","apps/tui/src/ui/components/VerseView.tsx","apps/tui/src/ui/components/StatusBar.tsx"],"commands":[{"run":"pnpm --filter @open-bible/tui build","exit":0}]} -->

- [ ] T008 [CODE] [US-002] Integrar download/busca na TUI (overlays) — Refs: US-002, US-003, FR-007, FR-008, AC-003, AC-005 — Depends: T005, T006, T007
  - [ ] **PREP**: Confirmar services prontos.
  - [ ] **EXECUTE**: Adicionar modais download/search na App, keybindings d e /.
  - [ ] **VERIFY**: Manual smoke + build.
  - [ ] **EVIDENCE**: Registrar.
  - [ ] **IMPROVE**: -
  <!-- specsfy:evidence {"task":"T008","refs":["US-002","US-003","FR-007","FR-008","AC-003","AC-005"],"files":["apps/tui/src/ui/app.tsx"],"commands":[{"run":"pnpm --filter @open-bible/tui build","exit":0}]} -->

#### Fase final — Qualidade

- [ ] T009 [TEST] Executar regressão e rastreabilidade completa — Refs: US-001, US-002, US-003, FR-001..FR-008, AC-001..AC-006 — Depends: T004,T005,T006,T007,T008
  - [ ] **PREP**: Identificar suites.
  - [ ] **EXECUTE**: `pnpm --filter @open-bible/tui test` + `pnpm lint` + check traceability.
  - [ ] **VERIFY**: Sem gaps, todos AC cobertos.
  - [ ] **EVIDENCE**: Registrar contagens.
  - [ ] **IMPROVE**: Retrospectiva.
  <!-- specsfy:evidence {"task":"T009","refs":["US-001","US-002","US-003","FR-001","FR-002","FR-003","FR-004","FR-005","FR-006","FR-007","FR-008","AC-001","AC-002","AC-003","AC-004","AC-005","AC-006"],"files":["apps/tui/tests/bible-manager.test.ts","apps/tui/tests/download.test.ts","apps/tui/tests/paths.test.ts"],"commands":[{"run":"pnpm --filter @open-bible/tui test","exit":0}]} -->

### 15. Ordem de execução

- Caminho crítico: T001/T002/T003 → T004 → T005 → T006 → T007 → T008 → T009
- Tarefas paralelas: T001,T002,T003 em paralelo; T006 pode iniciar após T004 sem esperar T005 para search.
- Estratégia de MVP: T001+T004+T007 entrega leitor mínimo instalável; T002+T005+T008 adicionam download.

## Ato III — Entregar e validar

### 16. Dependências, riscos e suposições

#### Dependências

- better-sqlite3 12.x nativo compilado para Node 22
- OpenTUI 0.5.8 (@opentui/core + @opentui/react)
- API `/api/bibles/download/{version}` acessível (ou CLOUDFLARE_BUCKET_PUBLIC_URL)

#### Riscos

- better-sqlite3 build falha em CI sem toolchain → mitigar com `onlyBuiltDependencies` já existente e prebuild
- OpenTUI API instável (0.5.x) → mitigar isolando UI em `src/ui/` e smoke test
- Download 5MB gzip timeout → mitigar com stream + timeout 30s + mensagem

#### Suposições

- Versões bíblicas disponíveis são as já importadas no Turso (ex: ara, nvi, etc.)
- DATA_DIR padrão XDG é gravável

### 17. Decisões

- **DEC-001**: Usar `better-sqlite3` direto sem Drizzle no TUI para manter binário leve e query parity manual — alternativa Drizzle descartada por overhead e necessidade de migrator WASM.
- **DEC-002**: OpenTUI React como stack TUI por pedido explícito do usuário; alternativa Ink descartada.
- **DEC-003**: Armazenamento XDG `~/.local/share/open-bible` com override env para permitir isolamento de teste e worktree.
- **DEC-004**: Instalação atômica via temp file + rename para evitar DB corrompido em falha.
- **DEC-005**: Reuso de `BOOK_META` copiado para `apps/tui/src/lib/book-meta.ts` para evitar dependência cíclica com web.

### 18. Definition of Done

- [ ] `Definition Gate` está `Passed`.
- [ ] `Plan Gate` está `Passed`.
- [ ] `Delivery Gate` está `Passed`.
- [ ] Todos os cenários `AC` aplicáveis passam.
- [ ] Todos os requisitos possuem evidência de verificação.
- [ ] Todas as tarefas na seção 14 estão concluídas.
- [ ] Testes e checks estáticos disponíveis passam.
