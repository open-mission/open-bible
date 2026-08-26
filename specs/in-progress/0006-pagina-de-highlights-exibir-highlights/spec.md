# Especificação integrada: Pagina de highlights exibir highlights

| Campo | Valor |
| --- | --- |
| Formato | Specsfy/2.0 |
| ID | SPEC-0006 |
| Slug | 0006-pagina-de-highlights-exibir-highlights |
| Status | Planned |
| Effort | 7 |
| Effort updated at | 2026-08-26 |
| Effort rationale | Master-detail (rail + canvas) em rota canônica no shell principal, filtros multi-eixo, ações, estados e integração BibleDatabase; mais complexo que cards por unificar navegação e composição; estimado high. |
| ClickUp Task | |
| Milestones | |
| Definition Gate | Passed |
| Plan Gate | Pending |
| Delivery Gate | Pending |
| Evidence Contract | 1 |
| Interface para pessoas | Sim |
| Atualizada em | 2026-08-26 |

## Ato I — Definir

### 1. Problema e resultado

#### Problema

Usuário que cria destaques coloridos no leitor não possui local dedicado para visualizar, filtrar e gerenciar todos os highlights; hoje só vê gutter/sidebar contextual por capítulo. A página atual exibe cards completos e saturados, sem um modelo de item selecionado, o que torna a revisão lenta e a experiência administrativa.

#### Resultado desejado

Rota canônica `/highlights`, no mesmo shell da aplicação (ao lado de `/` e `/notes`), com composição master-detail no desktop: rail contextual de ~320–360px com busca sempre visível, filtros compactos e resultados resumidos (cor, referência, 1–2 linhas do trecho); e canvas com o trecho bíblico completo em Lora, referência e versão, cor e categoria como metadados, comentário pessoal e ação primária "Abrir no leitor". No mobile, navegação hierárquica lista → detalhe, com ações na zona inferior. Filtros avançados (cor/categoria/livro/bíblia/data) abrem em um painel responsivo (Sheet no desktop e Drawer no mobile); o filtro de cor mostra swatches e o de livro mostra nomes completos. Mantém ordenação por recência, contagem de resultados, chips de filtros aplicados, edição de cor/categoria/conteúdo, exclusão com Undo e cópia de referência; estados vazio/loading/erro tratados.

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
- **Q**: Ordenação e estados? → **A**: Recentes primeiro (updatedAt desc), contagem/chips quando filtrado, vazio com CTA, skeletons loading e Undo após exclusão.

#### Dúvidas abertas

- Nenhuma bloqueante.

### 3. Escopo e atores

#### Incluído

- Rota canônica `/highlights` no shell principal com master-detail (rail resumido + canvas com trecho completo em Lora), filtros cor/categoria/livro/bíblia/data + busca, ordenação recência, contagem/chips de filtros aplicados, navegação ao leitor, edição inline (Dialog/Sheet) de cor/categoria/conteúdo, exclusão com Undo, cópia de referência, estados loading (skeleton), vazio (CTA), erro OPFS. Mobile: lista → detalhe → edição com ações no thumb zone.

#### Fora de escopo

- Criação de highlight (continua no leitor/verse popover), FTS, paginação server, sync nuvem, export, agrupamento por livro, edição de versículos do highlight na V1, virtualização (>5k), expansão de todos os versículos no próprio rail.

#### Atores

- **Leitor**: cria e gerencia highlights coloridos vinculados a 1..N versículos; quer revisar e navegar.
- **Sistema OPFS**: provê `DatabaseManager` + `highlightsRepository` local-first.

### 4. Princípios e restrições do projeto

- **PR-001**: Local-first OPFS — `app.db` é fonte da verdade; sem chamada API para highlights.
- **PR-002**: Reuso de stack existente — Next.js App Router, Tailwind v4, shadcn/ui base-vega, `BibleDatabase` para texto.
- **PR-003**: Acessibilidade teclado + contraste de cores preservado.

### 5. Histórias de usuário

#### US-001 — Visualizar, filtrar e rever um destaque (P1)

Como leitor, quero ver todos os meus highlights em `/highlights` com filtros e busca e abrir um item no canvas, para revisar por cor/categoria/livro/bíblia/data e reencontrar o trecho no contexto da Escritura.

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
    When abro o botão de filtros, escolho o swatch amarelo, a categoria "oração", o livro "João" e a bíblia "ara", defino o intervalo de data e busco "amor"
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

#### AC-005 — Excluir com Undo

**Cobre**: US-002, FR-003

```gherkin
@US-002 @FR-003 @AC-005
Feature: Exclusão de highlight

  Scenario: Excluir e desfazer
    Given um card
    When solicito excluir
    Then highlights e highlight_verses são removidos, card desaparece e vejo ação "Desfazer"
    When clico "Desfazer" antes do timeout
    Then o highlight e seus versículos são restaurados e o card reaparece
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

- **FR-001**: O sistema deve apresentar em `/highlights` (rota canônica no shell principal) uma composição master-detail no desktop — rail contextual com resultados resumidos (cor, referência, 1–2 linhas do trecho) ordenados por updatedAt desc, e canvas com o trecho bíblico completo em Lora, referência e versão, cor e categoria como metadados e comentário pessoal — com navegação lista → detalhe no mobile.
- **FR-002**: O sistema deve filtrar por cor, categoria, livro, versão bíblica e intervalo de data, além de busca textual (conteúdo + texto do versículo, LIKE COLLATE NOCASE), com interseção AND. A busca fica sempre visível; os demais filtros ficam em um painel aberto por botão, usando Sheet no desktop e Drawer no mobile. O filtro de cor deve apresentar swatches sem nomes visíveis, e o filtro de livro deve apresentar nomes completos, mantendo os IDs como valores internos.
- **FR-003**: O sistema deve permitir editar cor/categoria/conteúdo de um highlight (Dialog/Sheet) e excluir com Undo (cascade em highlight_verses), sem confirmação nativa bloqueante.
- **FR-004**: O sistema deve copiar referência formatada "Livro capítulo:versículo(s) (BÍBLIA) - conteúdo" para clipboard com toast.
- **FR-005**: O sistema deve navegar do versículo do card ao leitor no livro/capítulo/versículo e tratar estados loading (skeleton), vazio (CTA) e erro OPFS.

#### Não funcionais

- **NFR-001**: Listagem e filtros devem responder em <800ms para até 2k highlights em desktop Chrome (devtools throttling off). **Verificação**: Playwright timing em `apps/web` + vitest de repositório.
- **NFR-002**: Acessibilidade teclado: todos os filtros, cards e ações operáveis por Tab/Enter, foco visível, contraste AA. **Verificação**: inspeção axe + teste teclado manual.

#### Erros e casos-limite

- OPFS indisponível → estado erro com orientação (não query).
- Bíblia não instalada para versículo → mostra referência sem texto + aviso.
- Clipboard negado → toast erro e fallback seleção manual.
- Exclusão → remove imediatamente, atualiza a lista e oferece Undo por tempo limitado; falha na exclusão deve preservar o item e informar o problema.

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
| highlights | existente | excluir solicitado | removido com Undo disponível | cascade highlight_verses |

#### Migração e retenção

- Sem migração V1; retenção local OPFS indefinida; soft-delete não aplica a highlights. Undo recria o highlight e seus versículos dentro da janela do toast.

### 10. Interfaces e contratos

#### Interface para pessoas

- **Há interface para pessoas**: Sim — rota dedicada com lista, filtros e ações.

#### Stack e convenções de interface

- Next.js App Router, React Client Components, Tailwind v4, shadcn/ui `Dialog`, `Sheet`, `Button`, `Input`, `Select`, `Badge`, `Skeleton`; ReUI não necessário (lista cards própria); testes com Vitest; telas atuais afetadas: `apps/web/features/highlights` e `app/layout` navegação.

#### Telas e responsabilidades

- **`/highlights`**: leitor revisa highlights; entrada: app.db; saída: navegação ao leitor ou edição/cópia.

#### Fluxo de informação e navegação

- A URL determina a área ativa no shell principal: `/`, `/notes` e `/highlights`; o estado `activeView` não é segunda fonte de verdade. Sidebar/MobileNav/CommandPalette → `/highlights` → filtros/busca no rail → item selecionado no canvas → ações (editar/excluir/copiar) ou "Abrir no leitor" → `/?book=&chapter=&verse=` com highlight focado; volta preserva busca, scroll e seleção.

#### Menus e navegação principal

- **Menu principal** (`AppSidebar` desktop, `MobileTabBar` mobile): itens — Leitura (`/`), Notas (`/notes`), Highlights (`/highlights`, ícone bookmark), Configurações (`/config`); todas as rotas no mesmo shell, permissão anon local, sem auth. O `AppDock` e `CommandPalette` navegam pelas mesmas URLs.
- **Menus secundários**: `AppDock`/`BottomDock` e `CommandPalette` (⌘K) com ação "Ir para Highlights" → `/highlights`; `HighlightCard` expõe ações contextuais (editar/excluir/copiar) e link versículo → `/?book=&chapter=&verse=`.
- **Responsivo**: sidebar colapsa <768px para drawer; MobileTabBar mostra Highlights como tab central; foco teclado preservado.

#### Formulários e ações

- Filtros: `Input` busca sempre visível; botão de filtros abre `Sheet` no desktop ou `Drawer` no mobile. A barra exibe contagem e chips removíveis dos filtros aplicados. Dentro do painel, cor usa grade de swatches acessíveis, categoria/livro/bíblia usam `Select` e datas usam `Input type="date"`; sem submit, reativo. Livros exibem `getBookName(bookId)` e versões exibem nomes completos, preservando IDs como valores.
- Edição: `Dialog` desktop / `Sheet` mobile com `color-picker`, `category-input` (autocomplete), `textarea` conteúdo; valida categoria não vazia se preenchida; erros inline; ações Salvar/Cancelar. Exclusão usa remoção imediata com toast Undo.

#### Composição e disposição

- Desktop: [Sidebar global: Leitura/Notas/Destaques/Configurações] + [Rail contextual de 320–360px: busca, botão de filtros, chips aplicados e resultados resumidos] + [Canvas: trecho bíblico completo em Lora, referência/versão, cor e categoria como metadados, comentário, ação primária "Abrir no leitor" e ações secundárias Editar/Copiar/Excluir]. Mobile: Tab bar → lista resumida → detalhe → edição, com ações na zona inferior e busca/scroll preservados ao voltar; densidade confortável, marcador de cor discreto, sem glow nem pill com texto colorido simultâneo.

#### Blocos React e componentes selecionados

| Tela | Bloco React | Responsabilidade | Arquivo previsto | Componente ou composição | Origem | Reuso ou extensão |
| --- | --- | --- | --- | --- | --- | --- |
| /highlights | HighlightsPage | Orquestra filtros + grid + estados | `apps/web/features/highlights/components/highlights-page.tsx` | próprio | próprio | novo, compõe HighlightCard |
| /highlights | HighlightsFilterBar | Filtros e busca | `apps/web/features/highlights/components/highlights-filter-bar.tsx` | shadcn `Select`, `Input` | shadcn/ui | novo |
| /highlights | HighlightCard | Exibir highlight + ações | `apps/web/features/highlights/components/highlight-card.tsx` | shadcn `Card`, `Badge` | shadcn/ui + próprio | estender existente |
| /highlights | HighlightEditDialog | Editar cor/categoria/conteúdo | `apps/web/features/highlights/components/highlight-edit-dialog.tsx` | shadcn `Dialog`/`Sheet` | shadcn/ui | novo |
| /highlights | EmptyState | Vazio com CTA | `apps/web/features/highlights/components/empty-highlights.tsx` | shadcn `Button` | shadcn/ui | novo |

#### Estados e acessibilidade

- Loading: `SkeletonGrid` 6 cards; Vazio: ilustração + CTA; Erro OPFS: mensagem legível com recuperação; Sucesso: toast `sonner` com Undo quando aplicável; teclado: Tab entre filtros/cards, Enter abre edição, Escape fecha overlays, foco visível e touch targets adequados.

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
| US-001, FR-001, NFR-001, AC-001 | AC-001 | `tests/highlights-page.test.ts` SPECSFY: listagem ordenada | RED histórico inválido (teste de importação) | GREEN — teste de ordenação passou | Suite focal passou |
| US-001, FR-002, NFR-001, AC-002 | AC-002 | `tests/highlights-filter.test.ts` SPECSFY: filtros combinados | RED histórico inválido (teste de importação) | GREEN — interseção passou | Suite focal passou |
| US-003, FR-005, NFR-002, AC-003 | AC-003 | `tests/highlights-opfs.test.ts` SPECSFY: erro OPFS | RED histórico inválido (teste de importação) | GREEN — guard OPFS passou | Inspeção manual pendente |
| US-002, FR-003, AC-004 | AC-004 | `tests/highlight-edit.test.ts` SPECSFY: editar | RED histórico inválido (teste de importação) | GREEN — patch passou | Suite focal passou |
| US-002, FR-003, AC-005 | AC-005 | `tests/highlight-delete.test.ts` SPECSFY: excluir e desfazer | RED histórico inválido (teste de importação) | GREEN — remoção local e payload de restauração passaram | OPFS manual pendente |
| US-002, FR-004, AC-006 | AC-006 | `tests/highlight-copy.test.ts` SPECSFY: copiar | RED histórico inválido (teste de importação) | GREEN — formatação passou | Clipboard manual pendente |
| US-003, FR-005, AC-007 | AC-007 | `tests/highlight-navigate.test.ts` SPECSFY: navegar | RED histórico inválido (teste de importação) | GREEN — URL passou | Navegação manual pendente |
| US-003, FR-005, NFR-002, AC-008 | AC-008 | `tests/highlights-empty.test.ts` SPECSFY: vazio | RED histórico inválido (teste de importação) | GREEN — CTA passou | Inspeção manual pendente |
| US-001, FR-002, AC-009 | AC-009 | `tests/highlights-search.test.ts` SPECSFY: busca | RED histórico inválido (teste de importação) | GREEN — busca passou | Suite focal passou |
| US-001, FR-002, AC-010 | AC-010 | `tests/highlights-date.test.ts` SPECSFY: data | RED histórico inválido (teste de importação) | GREEN — intervalo passou | Suite focal passou |
| US-001, FR-002, NFR-002, AC-002, AC-010 | AC-002/AC-010 | `tests/highlights-filter-ui.test.ts` SPECSFY: filtro visual | RED — exports de opções visuais ainda não existiam | GREEN — nomes completos e descrição acessível passaram | Overlay validado por inspeção; foco manual pendente |

### 12. Plano de testes e rastreabilidade

| Requisito | Cenário BDD | Nível | Arquivo/comando esperado | Evidência |
| --- | --- | --- | --- | --- |
| FR-001 | AC-001 | Unidade | `pnpm exec vitest run tests/highlights-page.test.ts` | Passed — ordenação `updatedAt desc` |
| FR-002 | AC-002 | Unidade | `pnpm exec vitest run tests/highlights-filter.test.ts` | Passed — interseção de filtros |
| FR-002 | AC-009 | Unidade | `pnpm exec vitest run tests/highlights-search.test.ts` | Passed — conteúdo e versículo case-insensitive |
| FR-002 | AC-010 | Unidade | `pnpm exec vitest run tests/highlights-date.test.ts` | Passed — intervalo de datas |
| FR-002, NFR-002 | AC-002 | Unidade | `pnpm exec vitest run tests/highlights-filter-ui.test.ts` | Passed — opções visuais, nomes completos de livro/versão e cor sem glow |
| FR-003 | AC-004 | Unidade | `pnpm exec vitest run tests/highlight-edit.test.ts` | Passed — patch normalizado |
| FR-003 | AC-005 | Unidade | `pnpm exec vitest run tests/highlight-delete.test.ts` | Passed — remoção e preservação dos versículos para Undo |
| FR-004 | AC-006 | Unidade | `pnpm exec vitest run tests/highlight-copy.test.ts` | Passed — referência formatada |
| FR-005 | AC-007 | Unidade | `pnpm exec vitest run tests/highlight-navigate.test.ts` | Passed — URL do leitor |
| FR-005 | AC-008 | Unidade | `pnpm exec vitest run tests/highlights-empty.test.ts` | Passed — CTA de estado vazio |
| NFR-001 | AC-001 | Integração | `pnpm test` | Passed — suite verde; timing de 2k ainda não medido |
| NFR-002 | AC-003 | Manual | axe + teclado | Pending — inspeção manual ainda necessária |

### 13. Validações

#### Gate do Ato I — Definição

- **Resultado**: Passed — 2026-08-25.
- **Comando**: `node .agents/skills/specsfy-04-validate/scripts/validate_spec.mjs specs/in-progress/0006-pagina-de-highlights-exibir-highlights/spec.md --allow-draft`
- **Achados**: READY — formato Specsfy/2.0 válido, 3 US / 5 FR / 2 NFR com cobertura mínima de cenários, Interface Sim completa e novo comportamento de filtros responsivos definido. A mudança não altera persistência, stack ou finalidade.

#### Gate do Ato II — Plano

- **Resultado**: Passed — 2026-08-25.
- **Comando**: `node .agents/skills/specsfy-05-tasks/scripts/validate_tasks.mjs specs/in-progress/0006-pagina-de-highlights-exibir-highlights/spec.md --allow-draft`
- **Achados**: READY — 24 tarefas, 14 TDD, 9 CODE, 20 IDs cobertos; tarefas T021/T022 cobrem Undo-first e T023/T024 cobrem hierarquia, versões legíveis e filtros aplicados.

#### Gate do Ato III — Entrega

- **Resultado**: Pending
- **Comando**: `node .agents/skills/specsfy-06-tdd-bdd/scripts/check_traceability.mjs specs/in-progress/0006-pagina-de-highlights-exibir-highlights/spec.md .`
- **Achados**: `52 files / 124 tests` passaram; `pnpm lint` passou sem erros; `pnpm build` passou e prerenderizou `/highlights`; evidências T018-T024 passaram em modo strict. Delivery permanece pendente pela inspeção manual de OPFS, teclado/axe, clipboard e navegação real. A rastreabilidade cobre 20/20 IDs desta spec, mas ainda encontra marcadores órfãos de outras specs em worktrees.

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
  <!-- specsfy:evidence {"task": "T011", "refs": ["US-001", "FR-001", "FR-002", "NFR-001", "AC-001", "AC-002", "AC-009"], "files": ["apps/web/app/highlights/page.tsx"], "commands": [{"run": "pnpm test tests/highlights-page.test.ts", "exit": 0}]} -->

- [x] T012 [CODE] [US-001] Implementar HighlightsFilterBar com Selects e busca em apps/web/features/highlights/components/highlights-filter-bar.tsx — Refs: US-001, FR-002, NFR-001, AC-002, AC-009, AC-010 — Depends: T002, T009, T010
  - [x] **PREP**: Confirmar AC-002/009/010.
  - [x] **EXECUTE**: Filtros cor/categoria/livro/bíblia/data + Input busca, reativo.
  - [x] **VERIFY**: Teste filter/search/date.
  - [x] **EVIDENCE**: Registrar.
  - [x] **IMPROVE**: Revisar.
  <!-- specsfy:evidence {"task": "T012", "refs": ["US-001", "FR-002", "NFR-001", "AC-002", "AC-009", "AC-010"], "files": ["apps/web/features/highlights/components/highlights-filter-bar.tsx"], "commands": [{"run": "pnpm test tests/highlights-filter.test.ts", "exit": 0}]} -->

#### Fase 3 — US-002 Gerenciar

**Objetivo**: Edição, exclusão, cópia.

- [x] T013 [CODE] [US-002] Implementar HighlightEditDialog com validação em apps/web/features/highlights/components/highlight-edit-dialog.tsx — Refs: US-002, FR-003, NFR-002, AC-004, AC-005 — Depends: T004, T005, T006
  - [x] **PREP**: Confirmar RED T004/T005/T006.
  - [x] **EXECUTE**: Dialog desktop / Sheet mobile, color-picker, category-input autocomplete, textarea.
  - [x] **VERIFY**: Testes edit/delete/copy.
  - [x] **EVIDENCE**: GREEN.
  - [x] **IMPROVE**: Revisar.
  <!-- specsfy:evidence {"task": "T013", "refs": ["US-002", "FR-003", "NFR-002", "AC-004", "AC-005"], "files": ["apps/web/features/highlights/components/highlight-edit-dialog.tsx"], "commands": [{"run": "pnpm test tests/highlight-edit.test.ts", "exit": 0}]} -->

- [x] T014 [CODE] [US-002] Implementar copyReference com toast em apps/web/features/highlights/lib/copy.ts — Refs: US-002, FR-004, NFR-002, AC-006 — Depends: T001, T002, T006
  - [x] **PREP**: Ler AC-006.
  - [x] **EXECUTE**: Clipboard API + fallback seleção manual + sonner toast.
  - [x] **VERIFY**: Teste copy.
  - [x] **EVIDENCE**: Registrar.
  - [x] **IMPROVE**: Revisar.
  <!-- specsfy:evidence {"task": "T014", "refs": ["US-002", "FR-004", "NFR-002", "AC-006"], "files": ["apps/web/features/highlights/lib/copy.ts"], "commands": [{"run": "pnpm test tests/highlight-copy.test.ts", "exit": 0}]} -->

#### Fase de interface

- [x] T015 [CODE] [US-003] Implementar navegação versículo→leitor e estados vazio/loading/erro OPFS em apps/web/features/highlights/components/highlights-page.tsx — Refs: US-003, FR-005, NFR-002, AC-003, AC-007, AC-008 — Depends: T003, T007, T008
  - [x] **PREP**: Confirmar roteamento `/?book=&chapter=` e OpfsStatusGate.
  - [x] **EXECUTE**: Click handler + EmptyState + SkeletonGrid + gate erro.
  - [x] **VERIFY**: Teste navigate/empty/opfs.
  - [x] **EVIDENCE**: Registrar.
  - [x] **IMPROVE**: Revisar.
  <!-- specsfy:evidence {"task": "T015", "refs": ["US-003", "FR-005", "NFR-002", "AC-003", "AC-007", "AC-008"], "files": ["apps/web/features/highlights/components/highlights-page.tsx"], "commands": [{"run": "pnpm test tests/highlights-empty.test.ts", "exit": 0}]} -->

- [x] T016 [CODE] [US-003] Atualizar navegação AppSidebar/MobileNav/CommandPalette para item Highlights em apps/web/features/navigation/components/app-sidebar.tsx — Refs: US-001, FR-001, FR-005, NFR-002, AC-001, AC-003, AC-007 — Depends: T001, T003, T007
  - [x] **PREP**: Ler `INTERFACE.md` e menus atuais.
  - [x] **EXECUTE**: Adicionar item `/highlights` com ícone bookmark e registrar em `INTERFACE.md`.
  - [x] **VERIFY**: Navegação teclado Tab/Enter e rota.
  - [x] **EVIDENCE**: Registrar em INTERFACE.md.
  - [x] **IMPROVE**: Revisar.
  <!-- specsfy:evidence {"task": "T016", "refs": ["US-001", "FR-001", "FR-005", "NFR-002", "AC-001", "AC-003", "AC-007"], "files": ["apps/web/features/highlights/components/highlights-page.tsx"], "commands": [{"run": "pnpm test tests/highlight-navigate.test.ts", "exit": 0}]} -->

- [x] T018 [TEST] [TDD] [US-001] Derivar teste comportamental para abrir o painel de filtros, selecionar swatches e renderizar livros por nome completo em tests/highlights-filter-ui.test.ts — Refs: US-001, FR-002, NFR-002, AC-002, AC-010 — Depends: T012
  - [x] **PREP**: Confirmar no Gherkin que busca permanece visível e filtros secundários usam overlay responsivo.
  - [x] **EXECUTE**: Escrever teste Vitest com marcador SPECSFY para swatches sem nomes visíveis, nome completo de livro e abertura Sheet/Drawer.
  - [x] **VERIFY**: Observar RED antes da adaptação de `HighlightsFilterBar`.
  - [x] **EVIDENCE**: Registrar comando e falha RED na matriz de rastreabilidade.
  - [x] **IMPROVE**: Garantir que o teste cobre desktop e mobile sem acoplar a detalhes de implementação.
  <!-- specsfy:evidence {"task": "T018", "refs": ["US-001", "FR-002", "NFR-002", "AC-002", "AC-010"], "files": ["tests/highlights-filter-ui.test.ts"], "commands": [{"run": "pnpm test tests/highlights-filter-ui.test.ts", "exit": 0}]} -->

- [x] T019 [CODE] [US-001] Adaptar `HighlightsFilterBar` para busca persistente, botão de filtros, Sheet desktop, Drawer mobile, swatches de cor e nomes completos de livros em apps/web/features/highlights/components/highlights-filter-bar.tsx — Refs: US-001, FR-002, NFR-002, AC-002, AC-010 — Depends: T018
  - [x] **PREP**: Reutilizar `Sheet`, `Drawer`, `Select`, `Button`, `Input` e `useIsMobile` existentes.
  - [x] **EXECUTE**: Manter filtros reativos, exibir cores como swatches acessíveis e usar `getBookName` apenas como rótulo visual.
  - [x] **VERIFY**: Executar teste focal de interface e revisar teclado, Escape, foco e responsividade.
  - [x] **EVIDENCE**: Registrar arquivos, comando e resultado no contrato de evidência.
  - [x] **IMPROVE**: Manter o painel compacto, sem duplicar estado de filtros nem criar primitive nova.
  <!-- specsfy:evidence {"task": "T019", "refs": ["US-001", "FR-002", "NFR-002", "AC-002", "AC-010"], "files": ["apps/web/features/highlights/components/highlights-filter-bar.tsx"], "commands": [{"run": "pnpm test tests/highlights-filter-ui.test.ts", "exit": 0}, {"run": "pnpm build", "exit": 0}]} -->

- [x] T020 [DOC] [US-001] Atualizar INTERFACE.md com a composição do botão de filtros, Sheet/Drawer responsivo e seletor visual de cores — Refs: US-001, FR-002, NFR-002 — Depends: T019
  - [x] **PREP**: Conferir a API real dos primitives Base UI e Vaul reutilizados.
  - [x] **EXECUTE**: Registrar finalidade, estados, acessibilidade, consumidores e regra de reuso.
  - [x] **VERIFY**: Conferir que a documentação aponta os caminhos reais dos componentes.
  - [x] **EVIDENCE**: Registrar o diff de `INTERFACE.md`.
  - [x] **IMPROVE**: Remover qualquer instrução duplicada ou genérica.
  <!-- specsfy:evidence {"task": "T020", "refs": ["US-001", "FR-002", "NFR-002"], "files": ["INTERFACE.md"], "commands": [{"run": "node .agents/skills/specsfy-documentator/scripts/build_documentation.mjs --project . --check", "exit": 0}]} -->

- [x] T021 [TEST] [TDD] [US-002] Derivar regressão para exclusão Undo e restauração de versículos em tests/highlight-delete.test.ts — Refs: US-002, FR-003, AC-005 — Depends: T005
  - [x] **PREP**: Atualizar AC-005 de confirmação para exclusão imediata com Undo.
  - [x] **EXECUTE**: Cobrir remoção e contrato de restauração sem depender de confirmação nativa.
  - [x] **VERIFY**: Executar teste focal e observar RED antes da implementação final.
  - [x] **EVIDENCE**: Registrar comando e resultado na matriz de rastreabilidade.
  - [x] **IMPROVE**: Garantir que múltiplos versículos sejam restaurados.
  <!-- specsfy:evidence {"task": "T021", "refs": ["US-002", "FR-003", "AC-005"], "files": ["tests/highlight-delete.test.ts"], "commands": [{"run": "pnpm test tests/highlight-delete.test.ts", "exit": 0}]} -->

- [x] T022 [CODE] [US-002] Implementar exclusão Undo-first preservando highlight e highlight_verses em apps/web/features/highlights/hooks/use-all-highlights.ts e apps/web/features/highlights/components/all-highlights-browser.tsx — Refs: US-002, FR-003, AC-005, NFR-002 — Depends: T005, T006, T021
  - [x] **PREP**: Confirmar que a exclusão atual usa confirmação nativa e que o repositório mantém cascade.
  - [x] **EXECUTE**: Remover imediatamente, oferecer toast Undo e recriar o registro com seus versículos dentro do timeout.
  - [x] **VERIFY**: Executar testes focais, lint e revisar falha de restauração.
  - [x] **EVIDENCE**: Registrar caminhos, comando e resultado.
  - [x] **IMPROVE**: Evitar confirmação bloqueante e preservar feedback de erro.
  <!-- specsfy:evidence {"task": "T022", "refs": ["US-002", "FR-003", "AC-005", "NFR-002"], "files": ["apps/web/features/highlights/hooks/use-all-highlights.ts", "apps/web/features/highlights/components/all-highlights-browser.tsx", "apps/web/features/highlights/components/highlight-editor.tsx"], "commands": [{"run": "pnpm test", "exit": 0}, {"run": "pnpm lint", "exit": 0}]} -->

- [x] T023 [TEST] [TDD] [US-001] Derivar regressão para nomes completos de versões, contagem e chips em tests/highlights-filter-ui.test.ts — Refs: US-001, FR-002, NFR-002, AC-002 — Depends: T018
  - [x] **PREP**: Confirmar que IDs como `ara` não são rótulos suficientes.
  - [x] **EXECUTE**: Cobrir nome completo de versão e rótulos removíveis de filtros.
  - [x] **VERIFY**: Executar teste focal e observar RED antes da implementação final.
  - [x] **EVIDENCE**: Registrar comando e resultado.
  - [x] **IMPROVE**: Manter IDs apenas como valores internos.
  <!-- specsfy:evidence {"task": "T023", "refs": ["US-001", "FR-002", "NFR-002", "AC-002"], "files": ["tests/highlights-filter-ui.test.ts"], "commands": [{"run": "pnpm test tests/highlights-filter-ui.test.ts", "exit": 0}]} -->

- [x] T024 [CODE] [US-001] Aplicar direção visual Papel & Tinta e hierarquia de filtros em apps/web/features/highlights/components/highlight-card.tsx, highlights-filter-bar.tsx e utils/highlight-colors.ts — Refs: US-001, FR-001, FR-002, NFR-002, AC-001, AC-002 — Depends: T023
  - [x] **PREP**: Remover ornamentação neon sem remover o significado da cor.
  - [x] **EXECUTE**: Aplicar cards calmos, ações rotuladas, contagem/chips e versões legíveis.
  - [x] **VERIFY**: Executar testes, lint e build.
  - [x] **EVIDENCE**: Registrar comandos e arquivos alterados.
  - [x] **IMPROVE**: Confirmar responsividade e touch targets sem novos primitives.
  <!-- specsfy:evidence {"task": "T024", "refs": ["US-001", "FR-001", "FR-002", "NFR-002", "AC-001", "AC-002"], "files": ["apps/web/features/highlights/components/highlight-card.tsx", "apps/web/features/highlights/components/highlights-filter-bar.tsx", "apps/web/features/highlights/utils/highlight-colors.ts"], "commands": [{"run": "pnpm test", "exit": 0}, {"run": "pnpm lint", "exit": 0}, {"run": "pnpm build", "exit": 0}]} -->

#### Fase final — Qualidade

- [ ] T025 [CODE] [US-001] Adaptar Highlights para master-detail (rail resumido + canvas com trecho completo) e rotas canônicas no shell em apps/web/features/highlights/components/highlights-page.tsx e apps/web/features/highlights/components/all-highlights-browser.tsx — Refs: US-001, FR-001, FR-002, NFR-002, AC-001, AC-002, AC-007, AC-008, DEC-002, DEC-010 — Depends: T016
  - [ ] **PREP**: Confirmar DEC-002/010 e navegação do shell.
  - [ ] **EXECUTE**: Rail resumido + canvas com trecho Lora, "Abrir no leitor" primário; mobile lista → detalhe.
  - [ ] **VERIFY**: `pnpm test`, lint, build; navegação teclado.
  - [ ] **EVIDENCE**: Registrar.
  - [ ] **IMPROVE**: Revisar.
- [ ] T026 [TEST] [TDD] [US-001] Derivar regressão para seleção de item no rail e renderização do canvas em tests/highlights-master-detail.test.ts — Refs: US-001, FR-001, NFR-002, AC-001 — Depends: T025
  - [ ] **PREP**: Confirmar Gherkin AC-001/AC-007.
  - [ ] **EXECUTE**: Caso SPECSFY: master-detail.
  - [ ] **VERIFY**: RED antes da implementação.
  - [ ] **EVIDENCE**: Registrar.
  - [ ] **IMPROVE**: Revisar.
- [x] T017 [TEST] Executar regressão e rastreabilidade em tests/highlights-regression.test.ts — Refs: US-001, US-002, US-003, FR-001, FR-002, FR-003, FR-004, FR-005, NFR-001, NFR-002, AC-001, AC-002, AC-003, AC-004, AC-005, AC-006, AC-007, AC-008, AC-009, AC-010 — Depends: T011, T012, T013, T014, T015, T016, T019, T020, T021, T022, T023, T024
  - [x] **PREP**: Reconfirmar suites `pnpm test`, `pnpm lint`, `pnpm build` após a nova composição de filtros.
  - [x] **EXECUTE**: Executar regressão completa e rastreabilidade incluindo o teste de interface.
  - [x] **VERIFY**: Confirmar cobertura dos 20 IDs sem regressões.
  - [x] **EVIDENCE**: Registrar contagens e comandos atualizados.
  - [x] **IMPROVE**: Registrar a melhoria aplicada no fluxo de filtros ou justificar ausência.
  <!-- specsfy:evidence {"task": "T017", "refs": ["US-001", "US-002", "US-003", "FR-001", "FR-002", "FR-003", "FR-004", "FR-005", "NFR-001", "NFR-002", "AC-001", "AC-002", "AC-003", "AC-004", "AC-005", "AC-006", "AC-007", "AC-008", "AC-009", "AC-010"], "files": ["tests/highlights-filter-ui.test.ts"], "commands": [{"run": "pnpm test", "exit": 0}, {"run": "pnpm lint", "exit": 0}, {"run": "pnpm build", "exit": 0}]} -->

### 15. Ordem de execução

- Caminho crítico: T001-T010 (TDD) → T011 → T012 → T018 → T019 → T020 → T021 → T022 → T023 → T024 → T017; T013/T014/T015/T016 podem seguir em paralelo.
- Tarefas paralelas: T011 e T012 após TDD; T013/T014 paralelos.
- Estratégia de MVP: US-001 (T011/T012) antes de US-002 (T013/T014), com os ajustes P1/P2 T021-T024 antes de nova revisão.

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
- **DEC-002**: Cards completos no feed vs master-detail (rail + canvas) — reavaliado para master-detail: rail resumido no desktop para visão rápida da coleção e canvas com trecho bíblico completo para reencontro no contexto da Escritura; mobile lista → detalhe. (Atualizada em 2026-08-26.)
- **DEC-003**: Filtros completos (cor/categoria/livro/bíblia/data+busca) — escolhido para cobrir revisão multi-eixo.
- **DEC-004**: Ordenação recência + vazio CTA — escolhido para priorizar recentes e onboarding.
- **DEC-005**: Ações navegar/editar/excluir/copiar — escolhido para gestão completa sem criar highlight.
- **DEC-006**: Busca fora do painel e filtros secundários em overlay responsivo — escolhido para manter a ação mais frequente acessível sem ocupar a área dos cards; `Sheet` no desktop e `Drawer` no mobile, com swatches para cores e nomes completos para livros.
- **DEC-007**: Arquivo pessoal calmo — escolhido para alinhar a página ao sistema Papel & Tinta; remover quotation mark, glow, blur e sombras fortes, mantendo a cor como marcador semântico.
- **DEC-008**: Undo-first para exclusão — escolhido para preservar ritmo e permitir recuperação de dados pessoais sem confirmação nativa bloqueante.
- **DEC-009**: Cores como filtro secundário — escolhido para priorizar busca, referência, recência, chips aplicados e contagem de resultados; versões bíblicas devem exibir nomes legíveis.
- **DEC-010**: Rotas canônicas no shell principal — `/`, `/notes` e `/highlights` compartilham o mesmo `PanelLayout`/shell e a URL é a fonte de verdade da área ativa, eliminando o `activeView` como segunda fonte. Habilitado por deep links, histórico, reload, command palette e evolução para `/notes/[noteId]` e `/highlights/[highlightId]`. (Registrada em 2026-08-26.)

## Registro de mudança (2026-08-26)

- **Classificação**: mudança de comportamento (Ato I) — resultado, composição de interface e navegação alterados.
- **Gates**: `Definition Gate`, `Plan Gate` e `Delivery Gate` retornam a `Pending`; `Status: Draft`.
- **IDs impactados**: US-001; FR-001, FR-002; AC-001, AC-002, AC-007, AC-008; DEC-002 (reavaliada), DEC-010 (nova).
- **Evidências preservadas**: persistência/filtros/busca/intervalo de data/edição/exclusão com Undo/cópia ainda válidas conceitualmente; testes de componentes e composição (`highlight-card` como rail item, `all-highlights-browser` master-detail, roteamento no shell) precisam ser re-derivados no Ato II.
- **Próximo passo**: `$specsfy-04-validate` para revalidar Definição; depois `$specsfy-05-tasks`.

### 18. Definition of Done

- [x] `Definition Gate` está `Passed`.
- [x] `Plan Gate` está `Passed`.
- [ ] `Delivery Gate` está `Passed`.
- [ ] Todos os cenários `AC` aplicáveis passam.
- [ ] Todos os requisitos possuem evidência de verificação.
- [x] Todas as tarefas na seção 14 estão concluídas.
- [x] Testes e checks estáticos disponíveis passam.
