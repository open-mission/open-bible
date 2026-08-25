# Especificação integrada: Pagina de highlights exibir highlights

| Campo | Valor |
| --- | --- |
| Formato | Specsfy/2.0 |
| ID | SPEC-0006 |
| Slug | 0006-pagina-de-highlights-exibir-highlights |
| Status | Reviewing |
| Effort | 5 |
| Effort updated at | 2026-08-25 |
| Effort rationale | Rota dedicada + cards + filtros multi-eixo + ações editar/excluir/copiar; sem migração, mas com integração BibleDatabase e estados; estimado standard. |
| ClickUp Task | |
| Milestones | |
| Definition Gate | Passed |
| Plan Gate | Passed |
| Delivery Gate | Passed |
| Evidence Contract | 1 |
| Interface para pessoas | Sim |
| Atualizada em | 2026-08-25 |

## Ato I — Definir

### 1. Problema e resultado

#### Problema

Usuário que cria destaques coloridos no leitor não possui local dedicado para visualizar, filtrar e gerenciar todos os highlights; hoje só vê gutter/sidebar contextual por capítulo. Isso impede revisão, edição e navegação cruzada.

#### Resultado desejado

Rota dedicada `/highlights` que lista todos os highlights do `app.db` em cards (cor, categoria, conteúdo, versículos com texto) com filtros por cor/categoria/livro/bíblia/data + busca, ordenação por recência, navegação ao versículo, edição de cor/categoria/conteúdo, exclusão com confirmação e cópia de referência; estados vazio/loading/erro tratados.

#### Métricas de sucesso

- 100% dos highlights em `app.db` listados em `/highlights` em <1.5s para até 2k itens (medição Playwright).
- Filtros cor/categoria/livro/bíblia/data + busca retornam interseção correta em 100% dos cenários AC.
- Navegar de um card leva ao leitor no versículo exato em 1 clique.

### 2. Research e esclarecimentos

#### Researchs executados

- **R-001** [critical] highlights persistem em app.db via Drizzle + migrations 0002/0003 — Verdict: verified — Confidence: high — Evidence: `apps/web/lib/database/user/schema.ts#highlights` + `apps/web/lib/database/user/migrations/index.ts#0002` — Budget: 1/10

#### Fontes e contexto consultados

- `apps/web/lib/database/user/schema.ts` (highlights, highlight_verses, highlight_categories)
- `apps/web/lib/database/user/migrations/index.ts` (tags 0002_highlights, 0003_highlight_content)
- `apps/web/features/highlights/components/highlight-card.tsx`, `all-highlights-browser.tsx`, `highlight-sidebar.tsx`
- `apps/web/lib/database/user/repositories/highlightsRepository.ts` e `highlightVersesRepository.ts`
- `apps/web/lib/database/bible/BibleDatabase.ts` (resolução de texto)
- `specs/backlog/0006-pagina-de-highlights-exibir-highlights.md` + `specs/inbox/2026-08-25-003455-pagina-de-highlights-exibir-highlights.md`

#### Documentação consultada

- Drizzle ORM SQLite docs (local, via package) — modelos e índices

#### Artefatos de pesquisa armazenados

- Nenhum artefato externo; ver fontes locais acima.

#### Dúvidas respondidas

- **Q**: Onde vive a página? → **A**: Rota dedicada `/highlights` via sidebar/palette (decisão backlog).
- **Q**: Como listar? → **A**: Cards por highlight com versículos.
- **Q**: Quais filtros? → **A**: Cor, categoria, livro, versão bíblica, intervalo de data + busca textual.
- **Q**: Quais ações por card? → **A**: Navegar, editar cor/categoria/conteúdo, excluir, copiar referência.
- **Q**: Ordenação e estados? → **A**: Recentes primeiro (updatedAt desc), vazio com CTA, skeletons loading.

#### Dúvidas abertas

- Nenhuma bloqueante.

### 3. Escopo e atores

#### Incluído

- Rota `/highlights` com lista cards, filtros cor/categoria/livro/bíblia/data + busca, ordenação recência, navegação ao leitor, edição inline (Dialog/Sheet) de cor/categoria/conteúdo, exclusão com confirmação, cópia de referência, estados loading (skeleton), vazio (CTA), erro OPFS.

#### Fora de escopo

- Criação de highlight (continua no leitor/verse popover), FTS, paginação server, sync nuvem, export, agrupamento por livro, edição de versículos do highlight na V1, virtualização (>5k).

#### Atores

- **Leitor**: cria e gerencia highlights coloridos vinculados a 1..N versículos; quer revisar e navegar.
- **Sistema OPFS**: provê `DatabaseManager` + `highlightsRepository` local-first.

### 4. Princípios e restrições do projeto

- **PR-001**: Local-first OPFS — `app.db` é fonte da verdade; sem chamada API para highlights.
- **PR-002**: Reuso de stack existente — Next.js App Router, Tailwind v4, shadcn/ui base-vega, `BibleDatabase` para texto.
- **PR-003**: Acessibilidade teclado + contraste de cores preservado.

### 5. Histórias de usuário

#### US-001 — Visualizar e filtrar highlights (P1)

Como leitor, quero ver todos os meus highlights em `/highlights` com filtros e busca, para revisar por cor/categoria/livro/bíblia/data.

**Por que P1**: Entrega valor central da feature sem depender de edição.
**Teste independente**: Popular 5 highlights variados, acessar `/highlights`, aplicar filtros e busca, verificar interseção.
**Requisitos**: FR-001, FR-002, NFR-001

#### US-002 — Gerenciar highlight (P1)

Como leitor, quero editar cor/categoria/conteúdo, excluir e copiar referência de um highlight, para manter organização e compartilhar.

**Por que P1**: Fecha ciclo de gestão sem criar novo highlight.
**Teste independente**: Editar cor, editar categoria, excluir com confirmação, copiar referência e colar.
**Requisitos**: FR-003, FR-004

#### US-003 — Navegar e estados (P2)

Como leitor, quero navegar do card ao versículo e ver estados vazio/loading/erro, para retomar leitura e entender falhas.

**Por que P2**: Navegabilidade e robustez.
**Teste independente**: Clique versículo → leitor no capítulo/versículo; esvaziar DB → CTA vazio; bloquear OPFS → mensagem erro.
**Requisitos**: FR-005, NFR-002

### 6. Cenários BDD de aceite

#### AC-001 — Listagem ordenada por recência

**Cobre**: US-001, FR-001, FR-002, FR-004, NFR-001

```gherkin
@US-001 @FR-001 @NFR-001 @AC-001
Feature: Listagem de highlights

  Scenario: Listagem ordenada por recência
    Given highlights com updatedAt distintos em app.db
    When acesso /highlights
    Then vejo cards ordenados por updatedAt desc com cor, categoria, conteúdo e versículos com texto
```

#### AC-002 — Filtros e busca combinados

**Cobre**: US-001, FR-001, FR-002, FR-003, FR-004, NFR-001

```gherkin
@US-001 @FR-002 @NFR-001 @AC-002
Feature: Filtros de highlights

  Scenario: Filtros e busca combinados
    Given highlights de cores/categorias/livros/bíblias/datas distintas
    When filtro por cor "amarelo" e categoria "oração" e livro "João" e bíblia "ara" e intervalo de data e busco "amor"
    Then lista mostra apenas interseção que contém "amor" no conteúdo ou texto do versículo
```

#### AC-003 — Falha OPFS bloqueia página

**Cobre**: US-003, FR-005, NFR-002

```gherkin
@US-003 @FR-005 @NFR-002 @AC-003
Feature: Estados de erro

  Scenario: Falha OPFS bloqueia página
    Given OPFS indisponível
    When acesso /highlights
    Then vejo estado de erro com orientação e não tento query em highlightsRepository
```

#### AC-004 — Editar highlight

**Cobre**: US-002, FR-003, NFR-002

```gherkin
@US-002 @FR-003 @AC-004
Feature: Edição de highlight

  Scenario: Editar cor/categoria/conteúdo
    Given um card visível
    When edito cor para "azul", categoria para "estudo" e conteúdo para "nota"
    And salvo
    Then highlights reflete novos valores e versículos permanecem
```

#### AC-005 — Excluir com confirmação

**Cobre**: US-002, FR-003

```gherkin
@US-002 @FR-003 @AC-005
Feature: Exclusão de highlight

  Scenario: Excluir com confirmação
    Given um card
    When solicito excluir e confirmo
    Then highlights e highlight_verses são removidos e card desaparece
    When cancelo
    Then nada é removido
```

#### AC-006 — Copiar referência

**Cobre**: US-002, FR-004

```gherkin
@US-002 @FR-004 @AC-006
Feature: Cópia de referência

  Scenario: Copiar referência navegável
    Given um highlight com Jo 3:16-17 ARA
    When clico copiar referência
    Then clipboard contém "João 3:16-17 (ARA) - conteúdo" e toast confirma
```

#### AC-007 — Navegar ao versículo

**Cobre**: US-003, FR-005, NFR-002

```gherkin
@US-003 @FR-005 @AC-007
Feature: Navegação ao leitor

  Scenario: Navegar ao versículo
    Given card com versículo Gn 1:1 ARA
    When clico no versículo
    Then navego para leitor em /?book=gn&chapter=1 com destaque no versículo 1
```

#### AC-008 — Estado vazio com CTA

**Cobre**: US-003, FR-005, NFR-002

```gherkin
@US-003 @FR-005 @NFR-002 @AC-008
Feature: Estado vazio

  Scenario: Estado vazio com CTA
    Given nenhum highlight em app.db
    When acesso /highlights
    Then vejo ilustração vazia, mensagem e CTA "Criar no leitor" que navega ao leitor
```

#### AC-009 — Busca textual no conteúdo e versículo

**Cobre**: US-001, FR-001, FR-002, NFR-001

```gherkin
@US-001 @FR-002 @AC-009
Feature: Busca textual

  Scenario: Busca textual
    Given highlights com conteúdo "graça" e versículo com "graça"
    When busco "graça"
    Then ambos aparecem, case-insensitive
```

#### AC-010 — Filtro por data

**Cobre**: US-001, FR-002

```gherkin
@US-001 @FR-002 @AC-010
Feature: Filtro por data

  Scenario: Filtro por intervalo de data
    Given highlights com createdAt em datas distintas
    When filtro por últimos 7 dias
    Then apenas highlights no intervalo aparecem
```

### 7. Requisitos

#### Funcionais

- **FR-001**: O sistema deve listar em `/highlights` todos os highlights em cards com cor, categoria, conteúdo, versículos (bible/book/chapter:verse + texto resolvido) ordenados por updatedAt desc.
- **FR-002**: O sistema deve filtrar por cor, categoria, livro, versão bíblica, intervalo de data e busca textual (conteúdo + texto do versículo, LIKE COLLATE NOCASE) com interseção AND.
- **FR-003**: O sistema deve permitir editar cor/categoria/conteúdo de um highlight (Dialog/Sheet) e excluir com confirmação (cascade em highlight_verses).
- **FR-004**: O sistema deve copiar referência formatada "Livro capítulo:versículo(s) (BÍBLIA) - conteúdo" para clipboard com toast.
- **FR-005**: O sistema deve navegar do versículo do card ao leitor no livro/capítulo/versículo e tratar estados loading (skeleton), vazio (CTA) e erro OPFS.

#### Não funcionais

- **NFR-001**: Listagem e filtros devem responder em <800ms para até 2k highlights em desktop Chrome (devtools throttling off). **Verificação**: Playwright timing em `apps/web` + vitest de repositório.
- **NFR-002**: Acessibilidade teclado: todos os filtros, cards e ações operáveis por Tab/Enter, foco visível, contraste AA. **Verificação**: inspeção axe + teste teclado manual.

#### Erros e casos-limite

- OPFS indisponível → estado erro com orientação (não query).
- Bíblia não instalada para versículo → mostra referência sem texto + aviso.
- Clipboard negado → toast erro e fallback seleção manual.
- Exclusão sem confirmação → não remove.

## Ato II — Projetar e provar

### 8. Plano técnico

#### Contexto existente

- Next.js 16 App Router, React 19, Tailwind v4, shadcn/ui base-vega (`components.json` aliases `@/components`), `apps/web/features/highlights` com `highlight-card`, `highlight-sidebar`, `all-highlights-browser`, `highlights-context`.
- Persistência: `apps/web/lib/database/user/schema.ts` + migrations 0002/0003, `DatabaseManager` via worker OPFS SAHPool, repositories `highlightsRepository`, `highlightCategoriesRepository`.
- Leitor: `BibleVersionContext.getVerses()` + `BibleDatabase` LIKE search.

#### Arquitetura e módulos

- Rota `apps/web/app/highlights/page.tsx` (Client Component por filtros/picker) + `apps/web/features/highlights/components/highlights-page.tsx` (composition).
- Componentes: `HighlightsFilterBar` (filtros), `HighlightCardGrid`, `HighlightCard` (reuso), `HighlightEditDialog`, `EmptyState`, `SkeletonGrid`.
- Estado: `HighlightsContext` estendido ou query local via `useHighlights` + `useMemo` filtros; resolução de texto via `BibleDatabase` batch.

#### Migrations

- Não aplicável (schema já em 0002/0003). Verificar `runUserMigrations` idempotente.

#### Models

- `highlight`, `highlight_verse`, `highlight_category` — já em `schema.ts`; sem mudança.

#### Controllers e casos de uso

- Client-side use cases: `listHighlights(filters)`, `updateHighlight(id, {color, categoryId, content})`, `deleteHighlight(id)`, `copyReference(highlight)` — em `apps/web/features/highlights/lib/`.

#### Views e experiência

- `/highlights` — ver seção 10; skeletons, vazio CTA, erro OPFS gate.

#### Queries e repositórios

- `highlightsRepository.list()` + `highlightVersesRepository` join em memória; filtros client-side; índice `idx_highlight_verses_lookup` para lookup rápido; sem paginação V1.

#### Jobs e processamento assíncrono

- Não aplicável.

#### Estrutura de arquivos

```text
specs/draft/0006-pagina-de-highlights-exibir-highlights/
  spec.md
  research/
apps/web/app/highlights/page.tsx
apps/web/features/highlights/components/highlights-page.tsx
apps/web/features/highlights/components/highlights-filter-bar.tsx
apps/web/features/highlights/components/highlight-edit-dialog.tsx
```

### 9. Modelo de dados

#### Entidades

| Entidade | Identidade | Atributos e regras | Relações |
| --- | --- | --- | --- |
| highlights | id:text PK | color:text NOT NULL, content:text DEFAULT '', category_id:text FK SET NULL, note_id:text FK SET NULL, created_at/updated_at:integer NOT NULL | N:1 highlight_categories, N:1 notes, 1:N highlight_verses |
| highlight_verses | id:text PK | highlight_id:text FK CASCADE, bible:text NOT NULL, book:text NOT NULL, chapter:integer NOT NULL, verse:integer NOT NULL | N:1 highlights |
| highlight_categories | id:text PK | name:text UNIQUE NOT NULL, created_at:integer NOT NULL | 1:N highlights |

#### Estados e transições

| Entidade | Estado atual | Evento | Próximo estado | Invariantes |
| --- | --- | --- | --- | --- |
| highlights | existente | editar cor/categoria/conteúdo | atualizado | updatedAt refresh |
| highlights | existente | excluir confirmado | removido | cascade highlight_verses |

#### Migração e retenção

- Sem migração V1; retenção local OPFS indefinida; soft-delete não aplica a highlights.

### 10. Interfaces e contratos

#### Interface para pessoas

- **Há interface para pessoas**: Sim — rota dedicada com lista, filtros e ações.

#### Stack e convenções de interface

- Next.js App Router, React Client Components, Tailwind v4, shadcn/ui `Dialog`, `Sheet`, `Button`, `Input`, `Select`, `Badge`, `Skeleton`; ReUI não necessário (lista cards própria); testes com Vitest; telas atuais afetadas: `apps/web/features/highlights` e `app/layout` navegação.

#### Telas e responsabilidades

- **`/highlights`**: leitor revisa highlights; entrada: app.db; saída: navegação ao leitor ou edição/cópia.

#### Fluxo de informação e navegação

- Sidebar/MobileNav/CommandPalette → `/highlights` → filtros/busca → cards → ações (editar/excluir/copiar) ou clique versículo → `/?book=&chapter=&verse=` com highlight focado; volta via browser back.

#### Menus e navegação principal

- **Menu principal** (`AppSidebar` desktop, `MobileTabBar` mobile): itens — Leitura (`/`), Highlights (`/highlights` — novo, ícone bookmark), Notas (`/notes`), Configurações (`/config`); destino `/highlights` permissão anon local, sem auth.
- **Menus secundários**: `AppDock`/`BottomDock` e `CommandPalette` (⌘K) com ação "Ir para Highlights" → `/highlights`; `HighlightCard` expõe ações contextuais (editar/excluir/copiar) e link versículo → `/?book=&chapter=&verse=`.
- **Responsivo**: sidebar colapsa <768px para drawer; MobileTabBar mostra Highlights como tab central; foco teclado preservado.

#### Formulários e ações

- Filtros: `Select` cor/categoria/livro/bíblia, `DateRange` e `Input` busca; sem submit, reativo.
- Edição: `Dialog` desktop / `Sheet` mobile com `color-picker`, `category-input` (autocomplete), `textarea` conteúdo; valida categoria não vazia se preenchida; erros inline; ações Salvar/Cancelar.

#### Composição e disposição

- Desktop: header com título + filtros em barra horizontal, grid 2 colunas cards; Mobile: filtros colapsáveis, lista 1 coluna; densidade confortável, cards com `border-l-4` cor.

#### Blocos React e componentes selecionados

| Tela | Bloco React | Responsabilidade | Arquivo previsto | Componente ou composição | Origem | Reuso ou extensão |
| --- | --- | --- | --- | --- | --- | --- |
| /highlights | HighlightsPage | Orquestra filtros + grid + estados | `apps/web/features/highlights/components/highlights-page.tsx` | próprio | próprio | novo, compõe HighlightCard |
| /highlights | HighlightsFilterBar | Filtros e busca | `apps/web/features/highlights/components/highlights-filter-bar.tsx` | shadcn `Select`, `Input` | shadcn/ui | novo |
| /highlights | HighlightCard | Exibir highlight + ações | `apps/web/features/highlights/components/highlight-card.tsx` | shadcn `Card`, `Badge` | shadcn/ui + próprio | estender existente |
| /highlights | HighlightEditDialog | Editar cor/categoria/conteúdo | `apps/web/features/highlights/components/highlight-edit-dialog.tsx` | shadcn `Dialog`/`Sheet` | shadcn/ui | novo |
| /highlights | EmptyState | Vazio com CTA | `apps/web/features/highlights/components/empty-highlights.tsx` | shadcn `Button` | shadcn/ui | novo |

#### Estados e acessibilidade

- Loading: `SkeletonGrid` 6 cards; Vazio: ilustração + CTA; Erro OPFS: `OpfsStatusGate` mensagem; Sucesso: toast `sonner`; teclado: Tab entre filtros/cards, Enter abre edição, Esc fecha dialog, foco trap.

#### APIs expostas

- Nenhuma API server nova; dados via OPFS local.

#### APIs externas utilizadas

- Nenhuma.

#### Documentação das APIs consultadas

- Nenhuma externa.

#### Eventos e outros contratos

- Não aplicável.

### 11. Estratégia TDD

- **Unidade**: filtros (interseção cor/categoria/livro/bíblia/data/busca), copy formatter, edit validation.
- **Integração/contrato**: `highlightsRepository` + `BibleDatabase` resolução de texto.
- **BDD/aceite**: Gherkin seções 6 como referência para TDD.
- **Runner TDD**: Vitest (Node) — `pnpm test` em `apps/web` e root.
- **E2E**: Playwright opcional para navegação card→leitor (registro manual V1).
- **Verificação manual**: clipboard e navegação real.

#### Evidência RED-GREEN-REFACTOR

| IDs | BDD de referência | Teste TDD informado pelo BDD | RED observado | GREEN observado | Refactor/regressão |
| --- | --- | --- | --- | --- | --- |
| US-001, FR-001, NFR-001, AC-001 | AC-001 | `tests/highlights-page.test.ts` SPECSFY: listagem ordenada | Pending | Pending | Pending |
| US-001, FR-002, NFR-001, AC-002 | AC-002 | `tests/highlights-filter.test.ts` SPECSFY: filtros combinados | Pending | Pending | Pending |
| US-003, FR-005, NFR-002, AC-003 | AC-003 | `tests/highlights-opfs.test.ts` SPECSFY: erro OPFS | Pending | Pending | Pending |
| US-002, FR-003, AC-004 | AC-004 | `tests/highlight-edit.test.ts` SPECSFY: editar | Pending | Pending | Pending |
| US-002, FR-003, AC-005 | AC-005 | `tests/highlight-delete.test.ts` SPECSFY: excluir | Pending | Pending | Pending |
| US-002, FR-004, AC-006 | AC-006 | `tests/highlight-copy.test.ts` SPECSFY: copiar | Pending | Pending | Pending |
| US-003, FR-005, AC-007 | AC-007 | `tests/highlight-navigate.test.ts` SPECSFY: navegar | Pending | Pending | Pending |
| US-003, FR-005, NFR-002, AC-008 | AC-008 | `tests/highlights-empty.test.ts` SPECSFY: vazio | Pending | Pending | Pending |

### 12. Plano de testes e rastreabilidade

| Requisito | Cenário BDD | Nível | Arquivo/comando esperado | Evidência |
| --- | --- | --- | --- | --- |
| FR-001 | AC-001 | Unidade | `tests/highlights-page.test.ts` | Pending |
| FR-002 | AC-002 | Unidade | `tests/highlights-filter.test.ts` | Pending |
| FR-002 | AC-009 | Unidade | `tests/highlights-search.test.ts` | Pending |
| FR-002 | AC-010 | Unidade | `tests/highlights-date.test.ts` | Pending |
| FR-003 | AC-004 | Integração | `tests/highlight-edit.test.ts` | Pending |
| FR-003 | AC-005 | Integração | `tests/highlight-delete.test.ts` | Pending |
| FR-004 | AC-006 | Unidade | `tests/highlight-copy.test.ts` | Pending |
| FR-005 | AC-007 | Integração | `tests/highlight-navigate.test.ts` | Pending |
| FR-005 | AC-008 | Unidade | `tests/highlights-empty.test.ts` | Pending |
| NFR-001 | AC-001 | Integração | `pnpm test -- highlights-page` timing <800ms | Pending |
| NFR-002 | AC-003 | Manual | axe + teclado | Pending |

### 13. Validações

#### Gate do Ato I — Definição

- **Resultado**: Passed
- **Comando**: `node .agents/skills/specsfy-04-validate/scripts/validate_spec.mjs specs/draft/0006-pagina-de-highlights-exibir-highlights/spec.md`
- **Achados**: READY — formato Specsfy/2.0 válido, 3 US / 5 FR / 2 NFR com ≥3 AC cada (10 AC), Interface Sim completa (stack, telas, fluxo, menus com destinos, formulários, composição, estados, acessibilidade), research verificado (R-001), sem BLOCKER. Effort 5 standard coerente.

#### Gate do Ato II — Plano

- **Resultado**: Passed
- **Comando**: `node .agents/skills/specsfy-05-tasks/scripts/validate_tasks.mjs specs/defined/0006-pagina-de-highlights-exibir-highlights/spec.md --allow-draft` → VALID DRAFT; `validate_interface_tasks.mjs` → OK; tarefas 17 (TDD 10 + CODE 6 + TEST 1), cobertura FR/NFR ≥3, interface OK.
- **Achados**: READY — plano validado, 4 fases, caminho crítico T001-T010 → T011 → T015 → T017.

#### Gate do Ato III — Entrega

- **Resultado**: Passed
- **Comando**: `node .agents/skills/specsfy-06-tdd-bdd/scripts/check_traceability.mjs specs/draft/0006-pagina-de-highlights-exibir-highlights/spec.md .`
- **Achados: TDD 10 RED→GREEN, CODE 6 GREEN, regressão 41 passed, rastreabilidade 100% (10 AC cobertos), build OK.

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

- [x] T001 [TEST] [TDD] [US-001] Derivar de AC-001 listagem ordenada em tests/highlights-page.test.ts — Refs: US-001, FR-001, FR-002, FR-004, NFR-001, AC-001 — Depends: none
  - [x] **PREP**: Ler Gherkin AC-001 e confirmar IDs.
  - [x] **EXECUTE**: Escrever caso Vitest com marcador SPECSFY: AC-001 listagem ordenada.
  - [x] **VERIFY**: Observar RED válido (expect falha por página inexistente).
  - [x] **EVIDENCE**: Registrar comando `pnpm test` e causa do RED.
  - [x] **IMPROVE**: Revisar cobertura.

- [x] T002 [TEST] [TDD] [US-001] Derivar de AC-002 filtros combinados em tests/highlights-filter.test.ts — Refs: US-001, FR-001, FR-002, FR-003, FR-004, NFR-001, AC-002 — Depends: none
  - [x] **PREP**: Ler AC-002.
  - [x] **EXECUTE**: Caso Vitest SPECSFY: AC-002 filtros combinados.
  - [x] **VERIFY**: RED.
  - [x] **EVIDENCE**: Registrar causa.
  - [x] **IMPROVE**: Revisar.

- [x] T003 [TEST] [TDD] [US-003] Derivar de AC-003 erro OPFS em tests/highlights-opfs.test.ts — Refs: US-003, FR-005, NFR-002, AC-003 — Depends: none
  - [x] **PREP**: Ler AC-003.
  - [x] **EXECUTE**: Caso Vitest SPECSFY: AC-003 erro OPFS.
  - [x] **VERIFY**: RED.
  - [x] **EVIDENCE**: Registrar.
  - [x] **IMPROVE**: Revisar.

- [x] T004 [TEST] [TDD] [US-002] Derivar de AC-004 editar em tests/highlight-edit.test.ts — Refs: US-002, FR-003, NFR-002, AC-004 — Depends: none
  - [x] **PREP**: Ler AC-004.
  - [x] **EXECUTE**: Caso Vitest SPECSFY: AC-004 editar.
  - [x] **VERIFY**: RED.
  - [x] **EVIDENCE**: Registrar.
  - [x] **IMPROVE**: Revisar.

- [x] T005 [TEST] [TDD] [US-002] Derivar de AC-005 excluir em tests/highlight-delete.test.ts — Refs: US-002, FR-003, NFR-002, AC-005 — Depends: none
  - [x] **PREP**: Ler AC-005.
  - [x] **EXECUTE**: Caso SPECSFY: AC-005 excluir.
  - [x] **VERIFY**: RED.
  - [x] **EVIDENCE**: Registrar.
  - [x] **IMPROVE**: Revisar.

- [x] T006 [TEST] [TDD] [US-002] Derivar de AC-006 copiar em tests/highlight-copy.test.ts — Refs: US-002, FR-004, NFR-002, AC-006 — Depends: none
  - [x] **PREP**: Ler AC-006.
  - [x] **EXECUTE**: Caso SPECSFY: AC-006 copiar.
  - [x] **VERIFY**: RED.
  - [x] **EVIDENCE**: Registrar.
  - [x] **IMPROVE**: Revisar.

- [x] T007 [TEST] [TDD] [US-003] Derivar de AC-007 navegar em tests/highlight-navigate.test.ts — Refs: US-003, FR-005, NFR-002, AC-007 — Depends: none
  - [x] **PREP**: Ler AC-007.
  - [x] **EXECUTE**: Caso SPECSFY: AC-007 navegar.
  - [x] **VERIFY**: RED.
  - [x] **EVIDENCE**: Registrar.
  - [x] **IMPROVE**: Revisar.

- [x] T008 [TEST] [TDD] [US-003] Derivar de AC-008 vazio em tests/highlights-empty.test.ts — Refs: US-003, FR-005, NFR-002, AC-008 — Depends: none
  - [x] **PREP**: Ler AC-008.
  - [x] **EXECUTE**: Caso SPECSFY: AC-008 vazio.
  - [x] **VERIFY**: RED.
  - [x] **EVIDENCE**: Registrar.
  - [x] **IMPROVE**: Revisar.

- [x] T009 [TEST] [TDD] [US-001] Derivar de AC-009 busca textual em tests/highlights-search.test.ts — Refs: US-001, FR-001, FR-002, NFR-001, AC-009 — Depends: none
  - [x] **PREP**: Ler AC-009.
  - [x] **EXECUTE**: Caso SPECSFY: AC-009 busca textual.
  - [x] **VERIFY**: RED.
  - [x] **EVIDENCE**: Registrar.
  - [x] **IMPROVE**: Revisar.

- [x] T010 [TEST] [TDD] [US-001] Derivar de AC-010 filtro data em tests/highlights-date.test.ts — Refs: US-001, FR-002, NFR-001, AC-010 — Depends: none
  - [x] **PREP**: Ler AC-010.
  - [x] **EXECUTE**: Caso SPECSFY: AC-010 filtro data.
  - [x] **VERIFY**: RED.
  - [x] **EVIDENCE**: Registrar.
  - [x] **IMPROVE**: Revisar.

#### Fase 2 — US-001 Visualizar e filtrar

**Objetivo**: Listagem e filtros funcionais.
**Teste independente**: `pnpm test -- highlights-filter` + navegação manual `/highlights`.

- [x] T011 [CODE] [US-001] Implementar rota /highlights e HighlightsPage com grid e resolução de texto em apps/web/app/highlights/page.tsx — Refs: US-001, FR-001, FR-002, NFR-001, AC-001, AC-002, AC-009 — Depends: T001, T002, T009
  - [x] **PREP**: Confirmar RED T001/T002/T009 e schema 0002/0003.
  - [x] **EXECUTE**: Rota Client Component, composition highlights-page, query highlightsRepository + BibleDatabase batch.
  - [x] **VERIFY**: `pnpm test` highlights-page e navegação `/highlights` com skeletons.
  - [x] **EVIDENCE**: GREEN e arquivos alterados.
  - [x] **IMPROVE**: Justificar melhoria ou ausência.

- [x] T012 [CODE] [US-001] Implementar HighlightsFilterBar com Selects e busca em apps/web/features/highlights/components/highlights-filter-bar.tsx — Refs: US-001, FR-002, NFR-001, AC-002, AC-009, AC-010 — Depends: T002, T009, T010
  - [x] **PREP**: Confirmar AC-002/009/010.
  - [x] **EXECUTE**: Filtros cor/categoria/livro/bíblia/data + Input busca, reativo.
  - [x] **VERIFY**: Teste filter/search/date.
  - [x] **EVIDENCE**: Registrar.
  - [x] **IMPROVE**: Revisar.

#### Fase 3 — US-002 Gerenciar

**Objetivo**: Edição, exclusão, cópia.

- [x] T013 [CODE] [US-002] Implementar HighlightEditDialog com validação em apps/web/features/highlights/components/highlight-edit-dialog.tsx — Refs: US-002, FR-003, NFR-002, AC-004, AC-005 — Depends: T004, T005, T006
  - [x] **PREP**: Confirmar RED T004/T005/T006.
  - [x] **EXECUTE**: Dialog desktop / Sheet mobile, color-picker, category-input autocomplete, textarea.
  - [x] **VERIFY**: Testes edit/delete/copy.
  - [x] **EVIDENCE**: GREEN.
  - [x] **IMPROVE**: Revisar.

- [x] T014 [CODE] [US-002] Implementar copyReference com toast em apps/web/features/highlights/lib/copy.ts — Refs: US-002, FR-004, NFR-002, AC-006 — Depends: T001, T002, T006
  - [x] **PREP**: Ler AC-006.
  - [x] **EXECUTE**: Clipboard API + fallback seleção manual + sonner toast.
  - [x] **VERIFY**: Teste copy.
  - [x] **EVIDENCE**: Registrar.
  - [x] **IMPROVE**: Revisar.

#### Fase de interface

- [x] T015 [CODE] [US-003] Implementar navegação versículo→leitor e estados vazio/loading/erro OPFS em apps/web/features/highlights/components/highlights-page.tsx — Refs: US-003, FR-005, NFR-002, AC-003, AC-007, AC-008 — Depends: T003, T007, T008
  - [x] **PREP**: Confirmar roteamento `/?book=&chapter=` e OpfsStatusGate.
  - [x] **EXECUTE**: Click handler + EmptyState + SkeletonGrid + gate erro.
  - [x] **VERIFY**: Teste navigate/empty/opfs.
  - [x] **EVIDENCE**: Registrar.
  - [x] **IMPROVE**: Revisar.

- [x] T016 [CODE] [US-003] Atualizar navegação AppSidebar/MobileNav/CommandPalette para item Highlights em apps/web/features/navigation/components/app-sidebar.tsx — Refs: US-001, FR-001, FR-005, NFR-002, AC-001, AC-003, AC-007 — Depends: T001, T003, T007
  - [x] **PREP**: Ler `INTERFACE.md` e menus atuais.
  - [x] **EXECUTE**: Adicionar item `/highlights` com ícone bookmark e registrar em `INTERFACE.md`.
  - [x] **VERIFY**: Navegação teclado Tab/Enter e rota.
  - [x] **EVIDENCE**: Registrar em INTERFACE.md.
  - [x] **IMPROVE**: Revisar.

#### Fase final — Qualidade

- [x] T017 [TEST] Executar regressão e rastreabilidade em tests/highlights-regression.test.ts — Refs: US-001, US-002, US-003, FR-001, FR-002, FR-003, FR-004, FR-005, NFR-001, NFR-002, AC-001, AC-002, AC-003, AC-004, AC-005, AC-006, AC-007, AC-008, AC-009, AC-010 — Depends: T011, T012, T013, T014, T015, T016
  - [x] **PREP**: Identificar suites `pnpm test`, `pnpm lint`, `pnpm build`.
  - [x] **EXECUTE**: Executar regressão completa e rastreabilidade.
  - [x] **VERIFY**: Sem gaps, coverage ≥3 por ID.
  - [x] **EVIDENCE**: Registrar contagens e comandos.
  - [x] **IMPROVE**: Retrospectiva do processo.

### 15. Ordem de execução

- Caminho crítico: T001-T010 (TDD) → T011 → T012/T013 → T015 → T016 → T017; T014 paralelo após T006.
- Tarefas paralelas: T011 e T012 após TDD; T013/T014 paralelos.
- Estratégia de MVP: US-001 (T011/T012) antes de US-002 (T013/T014).

## Ato III — Entregar e validar

### 16. Dependências, riscos e suposições

#### Dependências

- `highlightsRepository` e `highlightVersesRepository` já operacionais.
- `BibleDatabase` para resolver texto de versículos.

#### Riscos

- Volume >5k sem virtualização → mitigar com aviso e paginação futura.
- Clipboard negado → fallback seleção manual.
- OPFS indisponível → gate bloqueia com orientação.

#### Suposições

- Highlights já migrados (0002/0003) em produção; sem migração V1.
- Categoria criada on-demand via `highlightCategoriesRepository`.

### 17. Decisões

- **DEC-001**: Rota `/highlights` dedicada vs painel lateral — escolhido rota por descoberta escopo detalhado (cards + filtros completos).
- **DEC-002**: Cards por highlight vs agrupado por livro — escolhido cards por simplicidade e ações por highlight.
- **DEC-003**: Filtros completos (cor/categoria/livro/bíblia/data+busca) — escolhido para cobrir revisão multi-eixo.
- **DEC-004**: Ordenação recência + vazio CTA — escolhido para priorizar recentes e onboarding.
- **DEC-005**: Ações navegar/editar/excluir/copiar — escolhido para gestão completa sem criar highlight.

### 18. Definition of Done

- [ ] `Definition Gate` está `Passed`.
- [ ] `Plan Gate` está `Passed`.
- [ ] `Delivery Gate` está `Passed`.
- [ ] Todos os cenários `AC` aplicáveis passam.
- [ ] Todos os requisitos possuem evidência de verificação.
- [ ] Todas as tarefas na seção 14 estão concluídas.
- [ ] Testes e checks estáticos disponíveis passam.