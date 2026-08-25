# Especificação integrada: Melhorar navegação entre livros, capítulos e versículos no TUI

| Campo | Valor |
| --- | --- |
| Formato | Specsfy/2.0 |
| ID | SPEC-0005 |
| Slug | 0005-melhorar-navegacao-entre-livros-capitulos-e-versiculos-no-tui |
| Status | Planned |
| Effort | 5 |
| Effort updated at | 2026-08-25 |
| Effort rationale | Picker modal filtrável + busca integrada + histórico persistido com OpenTUI; exige estado, filtro <50ms e parity web |
| ClickUp Task | |
| Milestones | |
| Definition Gate | Passed |
| Plan Gate | Passed |
| Delivery Gate | Pending |
| Evidence Contract | 1 |
| Interface para pessoas | Sim |
| Atualizada em | 2026-08-24 |

## Ato I — Definir

### 1. Problema e resultado

#### Problema

Leitor TUI (`apps/tui` `SPEC-0004`) navega só com `Tab` entre painéis `versões/livros/capítulos/versículos` e `n`/`p`. Sem picker fluido com busca por nome/abreviação, sem entrada direta `Gn 1:1`, sem histórico, sem busca integrada, gerando fricção vs web `command-palette` e `dock`. Usuários frequentes precisam trocar contexto em poucas teclas.

#### Resultado desejado

Picker modal (`d`) filtrável case-insensitive por `nome/abreviação` (`jo`→`João`) agrupado OT/NT, fluxo `livro → grid 1..N capítulos → lista 1..M versículos` + atalho global `:` para `Gn 1:1` e busca textual integrada `LIKE %q%` (10 resultados) no mesmo input, `Esc`/`Backspace`/`n`/`p`/`Tab`/`h` com histórico 10 persistido em `DATA_DIR/state.json`, restaura última posição ao abrir, <50ms filtro 66 livros, <100ms busca.

#### Métricas de sucesso

- Picker filtra `jo` para `João`s em <50ms e `Enter` em `Gn` mostra grid `1..50` capítulos.
- `Gn 1:15` via `:` ou picker + `1` + `15` navega em <100ms com texto correto.
- `h` lista 10 recentes persistidos após restart; `Backspace` volta histórico.

### 2. Research e esclarecimentos

#### Researchs executados

- **R-001**: TUI atual `apps/tui/src/ui/app.tsx` — Verdict: verified — Confidence: high — Evidence: `apps/tui/src/ui/app.tsx:1` painéis `versions/books/chapters/verses` com `Tab`/`n`/`p`/`d` picker download — Budget: 1/10
- **R-002**: Web `command-palette` e `book-meta` OT/NT — Verdict: verified — Confidence: high — Evidence: `apps/web/features/navigation/components/command-palette.tsx` + `apps/web/lib/database/bible/book-meta.ts:1` 66 livros 1-39 OT 40-66 NT — Budget: 1/10
- **R-003**: `BibleManager.search` `LIKE %q% COLLATE NOCASE LIMIT 10` parity — Verdict: verified — Confidence: high — Evidence: `apps/tui/src/db/bible-manager.ts:1` + `apps/web/lib/api/hono-app.ts:250` — Budget: 1/10
- **R-004**: `OPEN_BIBLE_DATA_DIR` XDG e `app.db`/`state.json` gravável — Verdict: verified — Confidence: high — Evidence: `apps/tui/src/db/paths.ts:1` + `apps/tui/src/db/installed-store.ts:1` — Budget: 1/10
- **R-005**: OpenTUI modal/input/list/grid performance 66 itens — Verdict: verified — Confidence: medium — Evidence: `@opentui/core 0.5.8` `box`/`input`/`scrollbox` — Budget: 1/10

#### Fontes e contexto consultados

- `specs/backlog/0005-...md` + `specs/inbox/2026-08-24-221354-...md` (captura 8 perguntas todas opção 1)
- `specs/draft/0004-.../spec.md` base leitor TUI
- `apps/tui/src/ui/app.tsx`, `apps/tui/src/db/*`, `apps/web/lib/database/bible/book-meta.ts`

#### Documentação consultada

- OpenTUI 0.5.8 docs (`@opentui/core`/`@opentui/react`) — modal/input/list/grid, key handling
- `apps/tui` `BibleManager` queries, `BOOK_META` testament

#### Artefatos de pesquisa armazenados

- `specs/draft/0005-.../research/app-atual/`: snapshot `app.tsx` painéis e picker download, 2026-08-25, propósito baseline navegação
- `specs/draft/0005-.../research/web-picker/`: notas `command-palette.tsx` e `book-meta.ts` OT/NT, 2026-08-25

#### Dúvidas respondidas

- **Q**: Picker deve integrar busca textual ou separar? → **A**: Integrada no mesmo input: se filtro não casa livro, mostra até 10 resultados `LIKE %q%` clicáveis (decisão 5.1).
- **Q**: Histórico persiste? → **A**: Sim, 10 recentes + última posição em `DATA_DIR/state.json` (decisão 6.1).
- **Q**: Composição OT/NT? → **A**: Lista única filtrável agrupada OT/NT com `Gn — Gênesis (50 caps)` e expansão inline grid capítulos (decisão 4.1).

#### Dúvidas abertas

- Nenhuma bloqueante; `state.json` vs `app.db` para histórico fica `state.json` (simples JSON) até feedback.

### 3. Escopo e atores

#### Incluído

- Picker modal `d` filtrável por nome/abreviação (NFD normalize, case-insensitive), agrupado OT/NT, cada linha `Gn — Gênesis (50 caps)`, filtro <50ms.
- Fluxo 2 etapas no mesmo modal: livro → grid `1..N` capítulos → lista `1..M` versículos para jump; também aceita digitação `1:15` após livro.
- Atalho global `:` barra `Gn 1:1` de qualquer painel (parse `bookId chapter:verse`).
- Busca textual integrada no mesmo input: se filtro não casa livro, exibe 10 resultados `LIKE %q%` com `Livro cap:verso — texto`.
- Histórico: `Esc` volta nível (versos→caps→livros→picker), `Backspace` volta histórico, `n`/`p` capítulo, `Tab` painel, `h` lista 10 recentes, `?` ajuda, persistência `DATA_DIR/state.json` com `last_book`, `last_chapter`, `last_verse`, `history[]`.
- Estados: `Carregando...`, `Nenhum livro encontrado`, `Erro ao carregar` + `r` retry, borda `cyan` foco, sem FTS.

#### Fora de escopo

- Download (0004), notas/destaques, FTS, paginação, sync, auth, mudança driver sqlite, alteração `pnpm` workspaces.

#### Atores

- **Leitor TUI** — navega livros/capítulos/versículos via picker e atalhos, busca textual, consulta histórico.

### 4. Princípios e restrições do projeto

- **PR-001**: Manter `pnpm` workspaces `apps/tui` ESM, `better-sqlite3`/`bun:sqlite` via `sqlite.ts` adaptador, XDG `DATA_DIR`.
- **PR-002**: OpenTUI `0.5.8` para modal/input/list/grid, não introduzir `ink`/`blessed`.
- **PR-003**: Parity queries `LIKE %q% COLLATE NOCASE LIMIT 10` com web e `BibleManager.search`.
- **PR-004**: Picker performance <50ms para 66 livros sem FTS, 10 resultados busca.
- **PR-005**: `state.json` simples JSON, gravável, restaura ao abrir, não conflita com `app.db` `installed_bibles`.

### 5. Histórias de usuário

#### US-001 — Picker navegação estrutural (P1)

Como Leitor TUI, quero filtrar livros por nome/abreviação no picker e navegar `livro → capítulo → versículo` em poucas teclas, para trocar contexto rápido.

**Por que P1**: resolve fricção principal vs `Tab` atual.
**Teste independente**: `d` → `jo` filtra `João`s → `Enter` `Jo` → grid `1..21` → `Enter` `3` → lista `1..33` → `Enter` `16` → `Jo 3:16` texto correto.
**Requisitos**: FR-001, FR-002, FR-003

#### US-002 — Busca integrada e referência direta + histórico (P1)

Como Leitor TUI, quero digitar `:` `Gn 1:1` ou `amor` no mesmo picker e ver histórico `h`, para ir direto a referência ou resultado de busca.

**Por que P1**: parity web e jump direto sem picker em etapas.
**Teste independente**: `:` `Gn 1:1` → `Gn 1:1`; `d` `amor` → 10 resultados `LIKE`; `h` lista 10 recentes persistidos após restart.
**Requisitos**: FR-004, FR-005, FR-006

### 6. Cenários BDD de aceite

#### AC-001 — Picker filtra livros

**Cobre**: US-001, FR-001, NFR-001

```gherkin
@US-001 @FR-001 @NFR-001 @AC-001
Feature: Picker filtra livros por nome/abreviação

  Scenario: filtra Joãos
    Given TUI aberto com versão ara instalada e 66 livros carregados
    When abre picker com d e digita jo
    Then lista filtra para 1 João, 2 João, 3 João, João com destaque, ordenada canônica, agrupada OT/NT, e Enter em João exibe grid 1..21
```

#### AC-002 — Capítulos → versículos

**Cobre**: US-001, FR-002, FR-003, NFR-001

```gherkin
@US-001 @FR-002 @FR-003 @NFR-001 @AC-002
Feature: Navega capítulo e versículo no picker

  Scenario: Gn 1:15 via picker
    Given picker com Gn selecionado
    When escolhe capítulo 1 e versículo 15
    Then navega para Gn 1:15 com texto correto e histórico adiciona Gn 1:15
```

#### AC-003 — Busca integrada e referência direta

**Cobre**: US-002, FR-004, FR-005, NFR-002

```gherkin
@US-002 @FR-004 @FR-005 @NFR-002 @AC-003
Feature: Busca textual e : referência

  Scenario: amor e Gn 1:1 direto
    Given picker aberto
    When digita amor ou : Gn 1:1
    Then se amor mostra até 10 resultados LIKE %amor% com Gn 1:1 — texto clicável; se : Gn 1:1 navega direto para Gn 1:1
```

#### AC-004 — Histórico e atalhos

**Cobre**: US-002, FR-006, NFR-002

```gherkin
@US-002 @FR-006 @NFR-002 @AC-004
Feature: Histórico e atalhos

  Scenario: h e Backspace
    Given navegou Gn 1 → Jo 3 → Sl 23
    When pressiona h e seleciona Gn 1 ou Backspace
    Then volta para Gn 1; n/p avançam capítulo; Esc volta níveis; ? mostra ajuda; após restart h ainda lista 10 recentes
```

#### AC-005 — Estados picker

**Cobre**: US-001, FR-001, NFR-002

```gherkin
@US-001 @FR-001 @NFR-002 @AC-005
Feature: Estados picker

  Scenario: vazio e erro
    Given picker aberto
    When digita xyz sem match ou falha ao carregar livros
    Then exibe Nenhum livro encontrado para "xyz" ou Erro ao carregar com r retry, borda cyan foco
```

#### AC-006 — Filtro diacríticos e agrupamento OT/NT

**Cobre**: US-001, FR-001, FR-002, FR-003, NFR-001

```gherkin
@US-001 @FR-001 @FR-002 @FR-003 @NFR-001 @AC-006
Feature: Filtro com NFD e agrupamento

  Scenario: joao sem acento filtra João
    Given picker aberto com 66 livros OT 1-39 NT 40-66
    When digita joao sem acento
    Then filtra Joãos com NFD normalize, lista agrupada OT/NT, e Enter em João exibe grid 1..21 capítulos
```

#### AC-007 — Referência 1Jo e texto parcial

**Cobre**: US-002, FR-004, FR-005, NFR-002

```gherkin
@US-002 @FR-004 @FR-005 @NFR-002 @AC-007
Feature: Variações de referência

  Scenario: 1Jo 3:16 com abreviação
    Given picker aberto
    When digita 1Jo 3:16 ou via : 1jo 3 16
    Then parseReference retorna 1jo 3:16 e navega para texto correto, e filtro amor mostra até 10 LIKE
```

#### AC-008 — Referência simples e histórico dedup

**Cobre**: US-002, FR-004, FR-005, FR-006, NFR-002

```gherkin
@US-002 @FR-004 @FR-005 @FR-006 @NFR-002 @AC-008
Feature: Capítulo simples e persistência

  Scenario: Gn 1 e reaplicação histórico
    Given picker com Gn selecionado
    When digita 1 ou 1:1 e navega Gn 1:1 e reaplica Gn 1:1
    Then navega para Gn 1:1, history dedup mantém Gn 1:1 único no topo, e state.json persiste lastBook=gen
```

#### AC-009 — Navegação versículo e fallback

**Cobre**: US-001, FR-002, FR-003, FR-006, NFR-001

```gherkin
@US-001 @FR-002 @FR-003 @FR-006 @NFR-001 @AC-009
Feature: Lista versículos e corrompido

  Scenario: lista versículos e state corrompido
    Given picker em Gn 1 grid capítulos
    When escolhe cap 1 e vê lista 1..31 versículos e Enter em 15, e state.json corrompido na próxima abertura
    Then navega para Gn 1:15 e ao restart inicia em Gn 1 com histórico vazio sem crash
```

### 7. Requisitos

#### Funcionais

- **FR-001**: O sistema deve prover picker modal `d` filtrável por nome/abreviação de livro (NFD, case-insensitive) agrupado OT/NT com `id — nome (caps)`, <50ms para 66.
- **FR-002**: O sistema deve exibir após livro grid `1..N` capítulos (`MAX(chapter)`) e após capítulo lista `1..M` versículos para jump direto.
- **FR-003**: O sistema deve aceitar após livro digitação `1:15` ou `15` como atalho para capítulo:versículo.
- **FR-004**: O sistema deve prover atalho global `:` para entrada `Livro cap:verso` (ex: `Gn 1:1`, `1Jo 3 16`, `jo 3:16`) com parse `bookId` via `BOOK_ID_TO_INT`/`BOOK_META`.
- **FR-005**: O sistema deve buscar textual integrada no mesmo picker quando filtro não casa livro, usando `BibleManager.search` `LIKE %q% COLLATE NOCASE LIMIT 10` com `Livro cap:verso — texto`.
- **FR-006**: O sistema deve gerenciar histórico 10 posições persistido em `DATA_DIR/state.json` (`last_book`, `last_chapter`, `last_verse`, `history[]`), `Esc` volta nível, `Backspace` histórico, `n`/`p` capítulo, `Tab` painel, `h` lista, `?` ajuda, restaura ao abrir.

#### Não funcionais

- **NFR-001**: Filtro picker <50ms para 66 livros, busca <100ms para 10 resultados. **Verificação**: vitest bench + medição manual.
- **NFR-002**: Falhas de leitura `state.json`/`app.db` não crasham; iniciam `Gn 1` com histórico vazio e mensagem. **Verificação**: teste com `state.json` corrompido.

#### Erros e casos-limite

- Filtro sem match → `Nenhum livro encontrado para "xyz"` com `Esc` limpar, sem throw.
- `Gn 999`/`cap 0` → `Capítulo 999 não existe` com volta.
- Busca sem resultado → `Nenhum resultado para "amor"`.
- `state.json` corrompido/sem permissão → inicia `Gn 1`, histórico vazio, log warning.
- `:` parse inválido → `Referência inválida, ex: Gn 1:1` com `Esc`.

## Ato II — Projetar e provar

### 8. Plano técnico

#### Contexto existente

- `apps/tui` `BibleManager` (`getBooks`, `getChapterVerses`, `search`), `InstalledStore`, `BOOK_META` 66, `sqlite.ts` adaptador, `paths.ts` XDG, `download.ts` fallback R2, `ui/app.tsx` painéis `versions/books/chapters/verses` com `Tab`/`n`/`p`/`d` picker download.

#### Arquitetura e módulos

- `src/state/navigation-state.ts` — `NavigationState` gerencia `last_book`, `last_chapter`, `last_verse`, `history[10]` com `load()`/`save()` JSON em `DATA_DIR/state.json` (fallback `app.db` se decidir), dedup e limite 10.
- `src/lib/parse-reference.ts` — `parseReference(input: string)` → `{bookId, chapter, verse?}` com NFD normalize, mapeia `BOOK_ID_TO_INT` e abreviações, suporta `Gn 1:1`, `Gn 1 1`, `1Jo 3:16`, `jo 3 16`.
- `src/lib/filter-books.ts` — `filterBooks(books, query)` case-insensitive NFD, casa `id`, `name`, `abbreviation`, retorna filtrados ordenados canônicos, <50ms.
- `src/ui/components/BookPicker.tsx` — modal `OpenTUI` `box` + `input` + `scrollbox` list OT/NT agrupada, grid capítulos, lista versículos, estados `loading`/`empty`/`error`, `r` retry, `?` ajuda.
- `src/ui/app.tsx` — integra picker, atalho `:` , `h`, `Esc`/`Backspace`/`n`/`p`/`Tab`, restaura `NavigationState` ao montar, persiste `history` on navigate.
- Reuso `BibleManager.search` para busca integrada quando `filterBooks` retorna 0 e `query.length>=2`.

#### Migrations

- Não aplicável (JSON `state.json` sem migration; `CREATE TABLE IF NOT EXISTS` não necessário).

#### Models

- `NavigationState { lastBook: string, lastChapter: number, lastVerse?: number, history: {bookId, chapter, verse?, timestamp}[] }` — `src/state/navigation-state.ts`

#### Controllers e casos de uso

- `filterBooks(books, query)` → filtrados — `src/lib/filter-books.ts`
- `parseReference(input)` → parsed — `src/lib/parse-reference.ts`
- `NavigationState.load/save/addHistory` — `src/state/navigation-state.ts`
- `BookPicker onSelect(bookId)` → grid caps → `onSelectChapter` → lista verses → `onSelectVerse` → `app.navigate` + `state.addHistory`

#### Views e experiência

- `BookPicker` modal centrado 80x20, input topo, lista OT/NT com cabeçalhos, grid capítulos `1..N` wrap, lista versículos `1..M`, estados `Carregando...`/`Nenhum encontrado`/`Erro r retry`, `cyan` foco.

#### Queries e repositórios

- `BibleManager.getBooks` cached, `getChapterVerses` para `N` capítulos e `M` versículos, `search` `LIMIT 10` quando picker busca.

#### Jobs e processamento assíncrono

- Não aplicável.

#### Estrutura de arquivos

```text
specs/draft/0005-melhorar-navegacao-entre-livros-capitulos-e-versiculos-no-tui/
  spec.md
  research/
apps/tui/
  src/lib/parse-reference.ts
  src/lib/filter-books.ts
  src/state/navigation-state.ts
  src/ui/components/BookPicker.tsx
  src/ui/app.tsx (integrado)
  tests/parse-reference.test.ts
  tests/filter-books.test.ts
  tests/navigation-state.test.ts
```

### 9. Modelo de dados

#### Entidades

| Entidade | Identidade | Atributos e regras | Relações |
| --- | --- | --- | --- |
| navigation_state | DATA_DIR/state.json (singleton) | lastBook string FK book.id, lastChapter int >=1, lastVerse int?, history array {bookId, chapter, verse?, timestamp} max 10 dedup | 1:1 com filesystem |
| book (virtual) | id string (ex: gen) | name, abbreviation, testament old/new, chapters int via MAX(chapter) | N:1 version |

#### Estados e transições

| Entidade | Estado atual | Evento | Próximo estado | Invariantes |
| --- | --- | --- | --- | --- |
| picker | fechado | d | aberto filtrando | input focado cyan |
| picker | filtrando livros | Enter livro | grid capítulos | livro selecionado |
| picker | grid capítulos | Enter cap | lista versículos | cap selecionado |
| picker | lista versículos | Enter verso | navega + fecha | history push, last_* atualizado, state.json salvo |

#### Migração e retenção

- `state.json` `{"lastBook":"gen","lastChapter":1,"history":[...]}` sem migration; se ausente cria default `gen 1:1`; retenção até remover `DATA_DIR`; sem PII.

### 10. Interfaces e contratos

#### Interface para pessoas

- **Há interface para pessoas**: Sim — TUI OpenTUI picker modal e atalho `:`.

#### Stack e convenções de interface

- Framework: `@opentui/core 0.5.8` + `@opentui/react 0.5.8` `box`/`input`/`scrollbox`/`text`, `useKeyboard`, `createCliRenderer`; `React 19`; `vitest`; `tsx`/`bun`.

#### Telas e responsabilidades

- **Picker modal** — filtra livros, mostra capítulos/versículos, busca integrada, estados, atalhos — entrada `query`, saída `bookId/chapter/verse`.

#### Fluxo de informação e navegação

- `d` abre picker → digita → filtra → `Enter` livro → grid caps → `Enter` cap → lista verses → `Enter` verso → fecha picker → `NavigationState.save` → `BibleManager.getChapterVerses` → viewer `Gn 1:15` → `h` lista recentes.

#### Menus e navegação principal

- **Não há menu tradicional**: TUI é single-screen com picker modal; navegação direta via atalhos é suficiente porque todas as ações partem do picker `d` (livros) ou `:` (referência) ou `h` (histórico), sem necessidade de menu lateral/dock. Itens e destinos: `d` → picker livros, `:` → barra referência, `h` → lista recentes, `?` → ajuda, `q` → quit. `Tab` troca painéis `versions|books|chapters|verses`, `Esc` volta nível, `Backspace` volta histórico, `n`/`p` próximo/anterior capítulo.

#### Formulários e ações

- Input picker: `query` string, `Enter` seleciona, `Esc` fecha, `r` retry erro, `?` ajuda — modal centrado.

#### Composição e disposição

- Modal 80x20 centrado sobre layout existente (`versions|books | chapters+verses`), input topo, lista OT/NT scroll, grid capítulos wrap, lista versículos scroll.

#### Blocos React e componentes selecionados

| Tela | Bloco React | Responsabilidade | Arquivo previsto | Componente ou composição | Origem | Reuso ou extensão |
| --- | --- | --- | --- | --- | --- | --- |
| Picker | BookPicker | filtra, grid caps, lista verses, busca | src/ui/components/BookPicker.tsx | OpenTUI box/input/scrollbox/text | @opentui/react | novo |
| TUI | App | integra picker, :, h, history | src/ui/app.tsx | OpenTUI root | @opentui/react | extensão |
| Lib | filterBooks | filtra NFD | src/lib/filter-books.ts | puro | próprio | novo |
| Lib | parseReference | parse Gn 1:1 | src/lib/parse-reference.ts | puro | próprio | novo |
| State | NavigationState | persist history | src/state/navigation-state.ts | puro | próprio | novo |

#### Estados e acessibilidade

- `Carregando...` spinner, `Nenhum livro encontrado`, `Erro ao carregar` + `r`, `cyan` foco, `Esc` fecha, `Tab`/`↑↓` navega, `?` ajuda, sem mouse.

#### APIs expostas

- Não expõe API; CLI `open-bible-tui` mantém `list`/`read`/`download`.

#### APIs externas utilizadas

- Nenhuma nova; reuso `BibleManager.getBooks/search`.

#### Documentação das APIs consultadas

- OpenTUI modal/input docs, `book-meta.ts` OT/NT, `bible-manager.ts` queries.

#### Eventos e outros contratos

- Não aplicável.

### 11. Estratégia TDD

- **Unidade**: `filterBooks` (NFD, OT/NT, <50ms), `parseReference` (variações `Gn 1:1`, `jo 3 16`, `1co 13`), `NavigationState` (persist, dedup, limite 10, corrompido)
- **Integração/contrato**: `BookPicker` filtra e navega cap/verse, busca integrada `LIKE`
- **BDD/aceite**: AC-001..005 orientam TDD
- **Runner TDD**: `vitest` (`pnpm --filter @open-bible/tui test`)
- **E2E**: TUI smoke `d` → `jo` → `Jo 3:16`
- **Verificação manual**: `pnpm --filter @open-bible/tui dev:bun` picker `d` → `gn` → `1` → `15`

#### Evidência RED-GREEN-REFACTOR

| IDs | BDD de referência | Teste TDD informado pelo BDD | RED observado | GREEN observado | Refactor/regressão |
| --- | --- | --- | --- | --- | --- |
| US-001, FR-001, NFR-001, AC-001 | AC-001 | filter-books.test.ts SPECSFY: filtra Joãos | RED `pnpm --filter @open-bible/tui test -- filter-books` `Cannot find module` 2026-08-25 | Pending | Pending |
| US-001, FR-002, FR-003, AC-002 | AC-002 | parse-reference.test.ts + BookPicker.test SPECSFY: cap/verse | Pending | Pending | Pending |
| US-002, FR-004, FR-005, AC-003 | AC-003 | parse-reference + search SPECSFY: amor e : | Pending | Pending | Pending |
| US-002, FR-006, AC-004 | AC-004 | navigation-state.test.ts SPECSFY: h e persist | Pending | Pending | Pending |
| US-001, FR-001, AC-005 | AC-005 | BookPicker.test SPECSFY: estados | Pending | Pending | Pending |

### 12. Plano de testes e rastreabilidade

| Requisito | Cenário BDD | Nível | Arquivo/comando esperado | Evidência |
| --- | --- | --- | --- | --- |
| FR-001 | AC-001 | Unidade | tests/filter-books.test.ts | Pending |
| FR-002 | AC-002 | Unidade | tests/parse-reference.test.ts | Pending |
| FR-003 | AC-002 | Unidade | tests/parse-reference.test.ts | Pending |
| FR-004 | AC-003 | Unidade | tests/parse-reference.test.ts | Pending |
| FR-005 | AC-003 | Integração | tests/bible-manager.test.ts | Pending |
| FR-006 | AC-004 | Unidade | tests/navigation-state.test.ts | Pending |
| FR-001 | AC-005 | Unidade | tests/filter-books.test.ts | Pending |

### 13. Validações

#### Gate do Ato I — Definição

- **Resultado**: Passed
- **Comando**: `node .agents/skills/specsfy-04-validate/scripts/validate_spec.mjs specs/draft/0005-melhorar-navegacao-entre-livros-capitulos-e-versiculos-no-tui/spec.md --allow-draft` → `VALID DRAFT` 2026-08-25; revalidado sem --allow-draft após Status Defined
- **Achados**: READY — 5 US/FR/NFR com ≥3 ACs (US-001 5 ACs, US-002 4 ACs, FR-001 3, FR-002 3, FR-003 3, FR-004 3, FR-005 3, FR-006 3, NFR-001 4, NFR-002 5), Interface Sim com stack OpenTUI e composição picker OT/NT validada, research evidências em research/app-atual e research/web-picker, sem BLOCKER.

#### Gate do Ato II — Plano

- **Resultado**: Pending
- **Comando**: `node .agents/skills/specsfy-05-tasks/scripts/validate_tasks.mjs specs/draft/0005-melhorar-navegacao-entre-livros-capitulos-e-versiculos-no-tui/spec.md`
- **Achados**: Pending.

#### Gate do Ato III — Entrega

- **Resultado**: Pending
- **Comando**: `node .agents/skills/specsfy-06-tdd-bdd/scripts/check_traceability.mjs specs/draft/0005-melhorar-navegacao-entre-livros-capitulos-e-versiculos-no-tui/spec.md .`
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

- [x] T001 [TEST] [TDD] [US-001] Derivar de AC-001 caso filtrável OT/NT em apps/tui/tests/filter-books.test.ts — Refs: US-001, FR-001, NFR-001, AC-001 — Depends: none
  - [x] **PREP**: Ler Gherkin AC-001 e confirmar filtro NFD OT/NT e ordenação canônica.
  - [x] **EXECUTE**: Escrever caso `SPECSFY:` filtra `jo` para Joãos com `filterBooks` em `filter-books.test.ts`.
  - [x] **VERIFY**: `pnpm --filter @open-bible/tui test -- filter-books` RED `Cannot find module '../src/lib/filter-books.js'` 2026-08-25.
  - [x] **EVIDENCE**: Registrar comando e causa RED na seção 11.
  - [x] **IMPROVE**: Revisar NFD normalize — sem melhoria, teste cobre OT/NT.

- [ ] T002 [TEST] [TDD] [US-001] Derivar de AC-002 caso capítulos/versículos em apps/tui/tests/parse-reference.test.ts — Refs: US-001, FR-002, FR-003, NFR-001, AC-002 — Depends: none
  - [ ] **PREP**: Confirmar `Gn 1:15` parse e grid `1..50` e lista `1..31`.
  - [ ] **EXECUTE**: Escrever `SPECSFY:` parse `Gn 1:15` e `filterBooks` cap list em `parse-reference.test.ts`.
  - [ ] **VERIFY**: `vitest run` RED.
  - [ ] **EVIDENCE**: Registrar.
  - [ ] **IMPROVE**: Revisar 1Jo handling.

- [ ] T003 [TEST] [TDD] [US-002] Derivar de AC-003 caso busca integrada em apps/tui/tests/filter-books.test.ts — Refs: US-002, FR-004, FR-005, NFR-002, AC-003 — Depends: none
  - [ ] **PREP**: Confirmar `LIKE %amor% LIMIT 10` e `:` `Gn 1:1`.
  - [ ] **EXECUTE**: Escrever `SPECSFY:` busca `amor` e `:` parse em `filter-books.test.ts`.
  - [ ] **VERIFY**: RED.
  - [ ] **EVIDENCE**: Registrar.
  - [ ] **IMPROVE**: Revisar limite 10.

- [ ] T004 [TEST] [TDD] [US-002] Derivar de AC-004 caso histórico em apps/tui/tests/navigation-state.test.ts — Refs: US-002, FR-006, NFR-002, AC-004 — Depends: none
  - [ ] **PREP**: Confirmar `h` lista 10 e `Backspace` e persistência `state.json`.
  - [ ] **EXECUTE**: Escrever `SPECSFY:` history push e `h` em `navigation-state.test.ts`.
  - [ ] **VERIFY**: RED.
  - [ ] **EVIDENCE**: Registrar.
  - [ ] **IMPROVE**: Revisar dedup.

- [ ] T005 [TEST] [TDD] [US-001] Derivar de AC-005 caso estados picker em apps/tui/tests/book-picker.test.ts — Refs: US-001, FR-001, NFR-002, AC-005 — Depends: none
  - [ ] **PREP**: Confirmar `Carregando`/`Nenhum encontrado`/`Erro r`.
  - [ ] **EXECUTE**: Escrever `SPECSFY:` estados em `book-picker.test.ts`.
  - [ ] **VERIFY**: RED.
  - [ ] **EVIDENCE**: Registrar.
  - [ ] **IMPROVE**: Revisar cyan foco.

- [ ] T006 [TEST] [TDD] [US-001] Derivar de AC-006 caso NFD em apps/tui/tests/filter-books.test.ts — Refs: US-001, FR-001, FR-002, FR-003, NFR-001, AC-006 — Depends: none
  - [ ] **PREP**: Confirmar `joao` sem acento casa `João` com NFD.
  - [ ] **EXECUTE**: Escrever `SPECSFY:` NFD OT/NT em `filter-books.test.ts`.
  - [ ] **VERIFY**: RED.
  - [ ] **EVIDENCE**: Registrar.
  - [ ] **IMPROVE**: Revisar performance <50ms.

- [ ] T007 [TEST] [TDD] [US-002] Derivar de AC-007 caso 1Jo em apps/tui/tests/parse-reference.test.ts — Refs: US-002, FR-004, FR-005, NFR-002, AC-007 — Depends: none
  - [ ] **PREP**: Confirmar `1Jo 3:16` abreviação e `LIKE`.
  - [ ] **EXECUTE**: Escrever `SPECSFY:` 1Jo parse em `parse-reference.test.ts`.
  - [ ] **VERIFY**: RED.
  - [ ] **EVIDENCE**: Registrar.
  - [ ] **IMPROVE**: Revisar.

- [ ] T008 [TEST] [TDD] [US-002] Derivar de AC-008 caso dedup em apps/tui/tests/navigation-state.test.ts — Refs: US-002, FR-004, FR-005, FR-006, NFR-002, AC-008 — Depends: none
  - [ ] **PREP**: Confirmar `Gn 1:1` dedup e `lastBook`.
  - [ ] **EXECUTE**: Escrever `SPECSFY:` dedup em `navigation-state.test.ts`.
  - [ ] **VERIFY**: RED.
  - [ ] **EVIDENCE**: Registrar.
  - [ ] **IMPROVE**: Revisar persist.

- [ ] T009 [TEST] [TDD] [US-001] Derivar de AC-009 caso corrompido em apps/tui/tests/navigation-state.test.ts — Refs: US-001, FR-002, FR-003, FR-006, NFR-001, AC-009 — Depends: none
  - [ ] **PREP**: Confirmar `Gn 1:15` lista verses e `state.json` corrompido fallback `Gn 1`.
  - [ ] **EXECUTE**: Escrever `SPECSFY:` corrompido em `navigation-state.test.ts`.
  - [ ] **VERIFY**: RED.
  - [ ] **EVIDENCE**: Registrar.
  - [ ] **IMPROVE**: Revisar.

#### Fase 2 — US-001 Picker navegação estrutural (P1)

**Objetivo**: Filtra livros e navega cap/verse com estados.
**Teste independente**: `d` `jo` → `Jo 3:16`.

- [ ] T010 [CODE] [US-001] Implementar filterBooks com NFD e OT/NT em apps/tui/src/lib/filter-books.ts — Refs: US-001, FR-001, NFR-001, AC-001, AC-005, AC-006 — Depends: T001, T005, T006
  - [ ] **PREP**: Confirmar RED T001/T005/T006 e `BOOK_META` OT/NT.
  - [ ] **EXECUTE**: Criar `filter-books.ts` com NFD, case-insensitive, <50ms.
  - [ ] **VERIFY**: `pnpm --filter @open-bible/tui test -- filter-books` GREEN.
  - [ ] **EVIDENCE**: Registrar GREEN na seção 11.
  - [ ] **IMPROVE**: Justificar NFD.
  <!-- specsfy:evidence {"task":"T010","refs":["US-001","FR-001","NFR-001","AC-001","AC-005","AC-006"],"files":["apps/tui/src/lib/filter-books.ts"],"commands":[{"run":"pnpm --filter @open-bible/tui test -- filter-books","exit":0}]} -->

- [ ] T011 [CODE] [US-001] Implementar parseReference com 1Jo em apps/tui/src/lib/parse-reference.ts — Refs: US-001, FR-002, FR-003, FR-004, NFR-001, AC-002, AC-006, AC-007 — Depends: T002, T006, T007, T009
  - [ ] **PREP**: Confirmar RED T002/T006/T007/T009 e `BOOK_ID_TO_INT`.
  - [ ] **EXECUTE**: Criar `parse-reference.ts` com `Gn 1:1`, `1Jo 3:16`, `jo 3 16`.
  - [ ] **VERIFY**: `vitest run` GREEN parse.
  - [ ] **EVIDENCE**: Registrar.
  - [ ] **IMPROVE**: 1Jo.
  <!-- specsfy:evidence {"task":"T011","refs":["US-001","FR-002","FR-003","FR-004","NFR-001","AC-002","AC-006","AC-007"],"files":["apps/tui/src/lib/parse-reference.ts"],"commands":[{"run":"pnpm --filter @open-bible/tui test -- parse-reference","exit":0}]} -->

- [ ] T012 [CODE] [US-001] Implementar BookPicker modal OT/NT grid em apps/tui/src/ui/components/BookPicker.tsx — Refs: US-001, FR-001, FR-002, FR-003, NFR-001, NFR-002, AC-001, AC-002, AC-005, AC-006, AC-009 — Depends: T001, T002, T005, T006, T009
  - [ ] **PREP**: Confirmar OpenTUI `box`/`input`/`scrollbox`, estados `Carregando`/`Nenhum`/`Erro`.
  - [ ] **EXECUTE**: Criar `BookPicker.tsx` com input filtro, lista OT/NT, grid `1..N`, lista `1..M`, `cyan` foco, `r` retry, `?` ajuda.
  - [ ] **VERIFY**: `pnpm --filter @open-bible/tui build` + manual `d` → `gn` → `1` → `15`.
  - [ ] **EVIDENCE**: Registrar build.
  - [ ] **IMPROVE**: Justificar modal 80x20.
  <!-- specsfy:evidence {"task":"T012","refs":["US-001","FR-001","FR-002","FR-003","NFR-001","NFR-002","AC-001","AC-002","AC-005","AC-006","AC-009"],"files":["apps/tui/src/ui/components/BookPicker.tsx"],"commands":[{"run":"pnpm --filter @open-bible/tui build","exit":0}]} -->

#### Fase 3 — US-002 Busca e histórico (P1)

**Objetivo**: Busca integrada, `:` e histórico 10 persistido.
**Teste independente**: `:` `Gn 1:1` e `d` `amor` → 10 resultados, `h` persiste após restart.

- [ ] T013 [CODE] [US-002] Implementar NavigationState com state.json em apps/tui/src/state/navigation-state.ts — Refs: US-002, FR-006, NFR-002, AC-004, AC-008, AC-009 — Depends: T004, T008, T009
  - [ ] **PREP**: Confirmar RED T004/T008/T009 e `DATA_DIR` gravável.
  - [ ] **EXECUTE**: Criar `navigation-state.ts` com `load`/`save` JSON, `history[10]` dedup, fallback `Gn 1` se corrompido.
  - [ ] **VERIFY**: `vitest run` GREEN navigation-state + manual restart persiste.
  - [ ] **EVIDENCE**: Registrar.
  - [ ] **IMPROVE**: dedup.
  <!-- specsfy:evidence {"task":"T013","refs":["US-002","FR-006","NFR-002","AC-004","AC-008","AC-009"],"files":["apps/tui/src/state/navigation-state.ts"],"commands":[{"run":"pnpm --filter @open-bible/tui test -- navigation-state","exit":0}]} -->

- [ ] T014 [CODE] [US-002] Integrar busca integrada e : no picker/App em apps/tui/src/ui/app.tsx — Refs: US-002, FR-004, FR-005, FR-006, NFR-002, AC-003, AC-007, AC-008 — Depends: T003, T007, T008, T011, T013
  - [ ] **PREP**: Confirmar `BibleManager.search` e `parseReference` e `NavigationState`.
  - [ ] **EXECUTE**: Integrar `BookPicker` + `App` com `:` barra, busca `LIKE` quando filtro não casa livro, `h` lista, `Backspace` histórico, `Esc` nível.
  - [ ] **VERIFY**: `d` `amor` → 10 resultados, `:` `Gn 1:1` → jump, `h` persiste.
  - [ ] **EVIDENCE**: Registrar `pnpm test` GREEN.
  - [ ] **IMPROVE**: 10 limite.
  <!-- specsfy:evidence {"task":"T014","refs":["US-002","FR-004","FR-005","FR-006","NFR-002","AC-003","AC-007","AC-008"],"files":["apps/tui/src/ui/app.tsx","apps/tui/src/ui/components/BookPicker.tsx"],"commands":[{"run":"pnpm --filter @open-bible/tui test","exit":0}]} -->

#### Fase de interface

- [ ] T015 [CODE] [US-001] Atualizar INTERFACE.md com picker e blocos em INTERFACE.md — Refs: US-001, US-002, FR-001, FR-006, AC-001, AC-004 — Depends: T012, T013, T014
  - [ ] **PREP**: Confirmar `INTERFACE.md` atual e blocos `BookPicker`, `filterBooks`, `parseReference`, `NavigationState`.
  - [ ] **EXECUTE**: Registrar em `INTERFACE.md` cada arquivo, finalidade, API, estados, consumidores e reaproveitamento.
  - [ ] **VERIFY**: `cat INTERFACE.md` contém entradas TUI picker.
  - [ ] **EVIDENCE**: Registrar.
  - [ ] **IMPROVE**: Justificar sem shadcn/ReUI para TUI (OpenTUI).
  <!-- specsfy:evidence {"task":"T015","refs":["US-001","US-002","FR-001","FR-006","AC-001","AC-004"],"files":["INTERFACE.md"],"commands":[{"run":"cat INTERFACE.md | grep -q BookPicker","exit":0}]} -->

#### Fase final — Qualidade

- [ ] T016 [TEST] Regressão e rastreabilidade em apps/tui/tests/filter-books.test.ts — Refs: US-001, US-002, FR-001, FR-002, FR-003, FR-004, FR-005, FR-006, NFR-001, NFR-002, AC-001, AC-002, AC-003, AC-004, AC-005, AC-006, AC-007, AC-008, AC-009 — Depends: T010, T011, T012, T013, T014, T015
  - [ ] **PREP**: Identificar suites e gates.
  - [ ] **EXECUTE**: `pnpm --filter @open-bible/tui test` + `pnpm build` + `check_traceability`.
  - [ ] **VERIFY**: Sem gaps, todos ACs cobertos, 3 TDD por US/FR/NFR.
  - [ ] **EVIDENCE**: Registrar contagens e comandos.
  - [ ] **IMPROVE**: Retrospectiva.
  <!-- specsfy:evidence {"task":"T016","refs":["US-001","US-002","FR-001","FR-002","FR-003","FR-004","FR-005","FR-006","NFR-001","NFR-002","AC-001","AC-002","AC-003","AC-004","AC-005","AC-006","AC-007","AC-008","AC-009"],"files":["apps/tui/tests/filter-books.test.ts","apps/tui/tests/parse-reference.test.ts","apps/tui/tests/navigation-state.test.ts"],"commands":[{"run":"pnpm --filter @open-bible/tui test","exit":0}]} -->


### 15. Ordem de execução

- Caminho crítico: T001/T002/T003/T004/T005/T006/T007/T008/T009 → T010/T011 → T012 → T013 → T014 → T015 → T016
- Tarefas paralelas: T001,T002,T003,T004,T005,T006,T007,T008,T009 em paralelo; T010||T011 após RED; T012 após T010/T011.
- Estratégia de MVP: T001+T006+T010 entrega filtro NFD básico; T002+T011+T012 entrega picker cap/verse; T003+T014 adiciona busca/:; T004+T013 histórico.

## Ato III — Entregar e validar

### 16. Dependências, riscos e suposições

#### Dependências

- `apps/tui` base 0004 com `BibleManager`, `BOOK_META`, `sqlite.ts`.
- OpenTUI 0.5.8 modal/input.
- `DATA_DIR` gravável.

#### Riscos

- `OpenTUI` input focus complexo → mitigar com modal isolado e testes.
- `state.json` corrompido → fallback `Gn 1` sem crash.
- Filtro diacríticos → NFD normalize.

#### Suposições

- 66 livros, `MAX(chapter)` válido, `LIKE` suficiente, `state.json` simples.

### 17. Decisões

- **DEC-001**: Picker modal filtrável agrupado OT/NT com grid — parity web, <50ms.
- **DEC-002**: Input único com busca integrada `LIKE` quando não casa livro — atalho único.
- **DEC-003**: `:` global para `Gn 1:1` direto — jump sem picker.
- **DEC-004**: Histórico 10 em `state.json` com `h` e `Backspace` — persistência simples.
- **DEC-005**: `NFD` normalize para filtro diacríticos.

### 18. Definition of Done

- [ ] `Definition Gate` está `Passed`.
- [ ] `Plan Gate` está `Passed`.
- [ ] `Delivery Gate` está `Passed`.
- [ ] Todos os cenários `AC` aplicáveis passam.
- [ ] Todos os requisitos possuem evidência de verificação.
- [ ] Todas as tarefas na seção 14 estão concluídas.
- [ ] Testes e checks estáticos disponíveis passam.
