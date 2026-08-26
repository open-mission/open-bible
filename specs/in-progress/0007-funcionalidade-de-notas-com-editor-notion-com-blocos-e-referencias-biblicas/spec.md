# Especificação integrada: Funcionalidade de notas com editor Notion com blocos e referencias biblicas

| Campo | Valor |
| --- | --- |
| Formato | Specsfy/2.0 |
| ID | SPEC-0007 |
| Slug | 0007-funcionalidade-de-notas-com-editor-notion-com-blocos-e-referencias-biblicas |
| Status | Planned |
| Effort | 7 |
| Effort updated at | 2026-08-26 |
| Effort rationale | Editor Tiptap JSON + 6 blocos + bibleReference custom + slash/bubble menu + canvas branco, unificado em um workspace canônico master-detail e rota canônica no shell principal com estados explícitos de salvamento; standard-high. |
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

Editor de notas atual é textarea simples sem blocos, Markdown pobre e sem inserção de referências bíblicas navegáveis; estudante não consegue estruturar estudo com headings/listas/code e vincular versículos com preview.

#### Resultado desejado

Rota canônica `/notes` no shell principal, com a composição master-detail desejada: lista à esquerda e canvas em branco estilo Notion à direita — sem borda de formulário/WYSIWYG, placeholder "Escreva / para comandos", slash menu e bubble menu; Tiptap JSON primário com blocos parágrafo, heading, lista, quote, code, hr e `bibleReference` (picker `/biblia` com preview via BibleDatabase e link ao leitor); persistência `notes.content` JSON + `note_references` reconstruído; debounce save e export Markdown. Deve reutilizar um único workspace canônico (`NotesWorkspace`), eliminando a duplicação de implementação com `NotesBrowser`, e expor estados explícitos de salvamento (Rascunho não salvo / Salvando… / Salva neste dispositivo / Não foi possível salvar · Tentar novamente).

#### Métricas de sucesso

- Criar nota e inserir 6 tipos de bloco incluindo bibleReference em <30s.
- Preview de Jo 3:16 ARA correto em 100% quando Bíblia instalada.
- Save debounce 500ms persiste JSON e note_references consistente.

### 2. Research e esclarecimentos

#### Researchs executados

- **R-001** [critical] Tiptap StarterKit + highlight extension já em uso — Verdict: verified — Confidence: high — Evidence: `package.json#tiptap` + `apps/web/features/notes/components/note-editor.tsx` — Budget: 1/10

#### Fontes e contexto consultados

- `specs/backlog/0007-funcionalidade-de-notas-com-editor-notion-com-blocos-e-referencias-biblicas.md`
- `apps/web/features/notes/components/note-editor.tsx`, `notes-browser.tsx`
- `apps/web/lib/database/user/schema.ts` (notes, note_references)
- `package.json` (@tiptap/*)

#### Documentação consultada

- Tiptap docs (StarterKit, custom Node extension)

#### Artefatos de pesquisa armazenados

- Nenhum externo.

#### Dúvidas respondidas

- **Q**: Formato? → **A**: JSON Tiptap primário, Markdown export.
- **Q**: Blocos V1? → **A**: Essenciais + bibleReference.
- **Q**: Como bibleReference? → **A**: Picker inline com preview.
- **Q**: Onde vive? → **A**: Rota /notes lista+editor.
- **Q**: Experiência Notion? → **A**: Canvas branco sem borda, escrita direta.

#### Dúvidas abertas

- Nenhuma bloqueante.

### 3. Escopo e atores

#### Incluído

- Rota canônica `/notes` no shell principal com workspace canônico master-detail (lista + canvas), Tiptap JSON, 6 blocos + bibleReference picker com preview/link, persistência notes+note_references, slash/bubble menu, debounce save com estados explícitos, Markdown export, estados loading/vazio/erro. Unifica `NotesWorkspace` e `NotesBrowser`, preservando criação de nota independente também na aba Notas. Mobile: lista → detalhe → edição.

#### Fora de escopo

- Colaboração realtime, imagens/tabelas, embed expansível texto completo, sync nuvem, FTS, migração automática Markdown→JSON.

#### Atores

- **Estudante**: cria notas estruturadas com referências.
- **Sistema OPFS**: persiste app.db local-first.

### 4. Princípios e restrições do projeto

- **PR-001**: Local-first OPFS; sem sync.
- **PR-002**: Reuso Tiptap existente; não trocar editor.
- **PR-003**: Canvas minimalista — sem toolbar fixa pesada.
- **PR-004**: Uma única experiência de notas — `NotesWorkspace` é a base canônica e reutiliza `NoteListItem`/`NoteDetail` e o mesmo fluxo de mutações; `NotesBrowser` não é uma terceira variante.
- **PR-005**: Salvamento honesto — o estado de persistência (Rascunho não salvo / Salvando… / Salva neste dispositivo / falha com retry) é sempre visível; rascunhos não parecem salvos antes da primeira persistência.

### 5. Histórias de usuário

#### US-001 — Escrever com blocos em canvas branco (P1)

Como estudante, quero canvas em branco com slash menu para inserir blocos, para escrever sem fricção.

**Por que P1**: Core da experiência Notion.
**Teste independente**: Abrir /notes, digitar "/", ver menu, inserir heading e lista.
**Requisitos**: FR-001, FR-002

#### US-002 — Inserir referência bíblica com preview (P1)

Como estudante, quero inserir bloco bibleReference via /biblia com preview e link navegável, para vincular versículo.

**Por que P1**: Diferencial funcional.
**Teste independente**: Inserir /biblia Jo 3:16 ARA, ver preview, clicar link → leitor.
**Requisitos**: FR-003, FR-004

#### US-003 — Persistir e exportar (P2)

Como estudante, quero que nota salve JSON + note_references e exporte Markdown, para recuperar e compartilhar.

**Por que P2**: Persistência e portabilidade.
**Teste independente**: Salvar, recarregar, verificar JSON idêntico e Markdown export.
**Requisitos**: FR-005, NFR-001

### 6. Cenários BDD de aceite

#### AC-011 — Estado de salvamento de nota existente

**Cobre**: US-003, FR-005, FR-006, AC-005, AC-006

```gherkin
@US-003 @FR-006 @AC-011
Feature: Estado de salvamento

  Scenario: Nota existente salva e mostra confirmação
    Given uma nota existente aberta em /notes
    When edito o conteúdo
    Then vejo "Salvando..."
    When o autosave termina
    Then vejo "Salva neste dispositivo"
```

#### AC-012 — Estado de salvamento de nota nova

**Cobre**: US-001, US-003, FR-005, FR-006, AC-001, AC-005

```gherkin
@US-001 @US-003 @FR-006 @AC-012
Feature: Estado de salvamento

  Scenario: Nota nova permanece rascunho até persistir
    Given a aba Notas com nenhuma nota nova
    When inicio uma nota nova e escrevo
    Then vejo "Rascunho não salvo"
    Until a primeira persistência
    Then vejo "Salvando..." e depois "Salva neste dispositivo"
```

#### AC-013 — Falha de salvamento com recuperação

**Cobre**: US-003, FR-005, FR-006, NFR-002

```gherkin
@US-003 @FR-006 @AC-013
Feature: Estado de salvamento

  Scenario: Falha ao salvar mantém texto e oferece retry
    Given uma nota aberta
    When o autosave falha
    Then vejo "Não foi possível salvar" e o texto da nota é preservado
    And vejo ação "Tentar novamente"
```

#### AC-014 — Criação de nota pela aba Notas

**Cobre**: US-001, FR-001, AC-001

```gherkin
@US-001 @FR-001 @AC-014
Feature: Workspace canônico

  Scenario: Nota nova criada pela própria aba
    Given estou na aba Notas sem nenhuma nota selecionada
    When toco em "Nova nota"
    Then o editor abre em branco com placeholder "Escreva / para comandos"
```

#### AC-001 — Canvas branco com placeholder e slash menu

**Cobre**: US-001, FR-001, FR-002, NFR-002

```gherkin
@US-001 @FR-001 @FR-002 @NFR-002 @AC-001
Feature: Canvas branco Notion

  Scenario: Canvas branco com placeholder e slash menu
    Given estou em /notes com nota vazia
    When foco no canvas
    Then vejo placeholder "Escreva / para comandos" sem borda de formulário e digito "/" abre menu de blocos
```

#### AC-002 — Inserir blocos essenciais

**Cobre**: US-001, FR-002, NFR-002

```gherkin
@US-001 @FR-002 @NFR-002 @AC-002
Feature: Blocos essenciais

  Scenario: Inserir blocos essenciais
    Given canvas vazio
    When insiro via slash heading, bullet list, quote, code, hr
    Then cada bloco renderiza com estilo correspondente e é editável
```

#### AC-003 — Inserir bibleReference com preview

**Cobre**: US-002, FR-003, FR-004, NFR-001

```gherkin
@US-002 @FR-003 @FR-004 @NFR-001 @AC-003
Feature: Bloco bibleReference

  Scenario: Inserir bibleReference com preview
    Given canvas com texto
    When digito "/biblia" e seleciono Jo 3:16 ARA
    Then bloco mostra preview "Porque Deus amou..." com referência e link navegável ao leitor
```

#### AC-004 — Preview sem Bíblia instalada

**Cobre**: US-002, FR-003, NFR-001

```gherkin
@US-002 @FR-003 @NFR-001 @AC-004
Feature: Fallback bibleReference

  Scenario: Preview sem Bíblia instalada
    Given bibleReference para versão não instalada
    When renderizo bloco
    Then vejo referência sem texto e aviso "Instale ARA" com link para /config
```

#### AC-005 — Persistir JSON e note_references

**Cobre**: US-003, FR-003, FR-004, FR-005, NFR-001

```gherkin
@US-003 @FR-005 @NFR-001 @AC-005
Feature: Persistência

  Scenario: Persistir JSON e note_references
    Given nota com dois blocos bibleReference
    When salvo (debounce 500ms)
    Then notes.content JSON contém blocos e note_references possui 2 linhas com order correto
```

#### AC-006 — Recarregar idêntico

**Cobre**: US-003, FR-003, FR-005, NFR-001

```gherkin
@US-003 @FR-005 @NFR-001 @AC-006
Feature: Recarregar idêntico

  Scenario: Recarregar idêntico
    Given nota salva com blocos
    When recarrego /notes
    Then JSON renderiza idêntico incluindo bibleReference com preview
```

#### AC-007 — Export Markdown

**Cobre**: US-003, FR-005, NFR-002

```gherkin
@US-003 @FR-005 @NFR-002 @AC-007
Feature: Export Markdown

  Scenario: Export Markdown
    Given nota com heading e bibleReference Jo 3:16
    When exporto Markdown
    Then obtenho "# Título\n[Jo 3:16](bible://ara/jhn/3/16)"
```

#### AC-008 — Bubble menu para formatação

**Cobre**: US-001, FR-001, FR-002, NFR-002

```gherkin
@US-001 @FR-002 @NFR-002 @AC-008
Feature: Bubble menu

  Scenario: Bubble menu para formatação
    Given texto selecionado
    When seleção ativa
    Then bubble menu mostra bold/italic/highlight e aplica sem toolbar fixa
```

#### AC-009 — Estado vazio e OPFS erro

**Cobre**: US-001, FR-001, NFR-002

```gherkin
@US-001 @FR-001 @NFR-002 @AC-009
Feature: Estados

  Scenario: Estado vazio e OPFS erro
    Given nenhuma nota e OPFS indisponível
    When acesso /notes
    Then vazio mostra CTA "Criar nota" e erro OPFS mostra gate com orientação
```

#### AC-010 — Navegar ao leitor via bloco

**Cobre**: US-002, FR-004, NFR-002

```gherkin
@US-002 @FR-004 @NFR-002 @AC-010
Feature: Navegação

  Scenario: Navegar ao leitor via bloco
    Given bibleReference Jo 3:16
    When clico no link
    Then navego para /?book=jhn&chapter=3&verse=16
```

### 7. Requisitos

#### Funcionais

- **FR-001**: O sistema deve apresentar em `/notes` (rota canônica no shell principal) um workspace master-detail (lista à esquerda + canvas em branco à direita), com placeholder e foco direto para escrita, preservando criação de nota independente pela própria aba.
- **FR-006**: O sistema deve exibir estado explícito de salvamento — Rascunho não salvo (nota nova), Salvando…, Salva neste dispositivo (nota existente) e falha com "Tentar novamente" — e não informar "Salvamento automático" sem distinguir esses estados.
- **FR-002**: O sistema deve oferecer slash menu (`/`) e bubble menu para inserir blocos parágrafo, heading, lista, quote, code, hr sem toolbar fixa.
- **FR-003**: O sistema deve prover bloco custom `bibleReference` com picker `/biblia` (versão/livro/cap/vers com preview via BibleDatabase) e fallback sem texto.
- **FR-004**: O sistema deve tornar bibleReference link navegável ao leitor (`/?book=&chapter=&verse=`).
- **FR-005**: O sistema deve persistir `notes.content` como Tiptap JSON e reconstruir `note_references` a partir dos blocos, com debounce 500ms, e exportar Markdown.

#### Não funcionais

- **NFR-001**: Save debounce e preview devem ser <300ms para nota <50KB. **Verificação**: vitest timing + Playwright.
- **NFR-002**: Acessibilidade teclado: slash menu navegável por setas/Enter, bubble menu operável, foco visível. **Verificação**: axe + teste teclado.

#### Erros e casos-limite

- OPFS indisponível → gate bloqueia.
- Bíblia não instalada → referência sem texto + aviso.
- JSON corrompido → fallback vazio com aviso.

## Ato II — Projetar e provar

### 8. Plano técnico

#### Contexto existente

- Next.js App Router, Tiptap StarterKit, highlight extension, NotesContext, OPFS, BibleDatabase.

#### Arquitetura e módulos

- Extensão Tiptap `bibleReference` (Node), `NoteEditor` (canvas branco), `NotesBrowser` (lista), `BibleReferencePicker`.

#### Migrations

- Não aplicável (usa notes.content existente).

#### Models

- notes, note_references — já existentes.

#### Controllers e casos de uso

- `saveNote(json)`, `parseBibleReferences(json)`, `exportMarkdown(json)`.

#### Views e experiência

- `/notes` ver seção 10.

#### Queries e repositórios

- `notesRepository`, `noteReferencesRepository`, `BibleDatabase` para preview.

#### Jobs e processamento assíncrono

- Não aplicável.

#### Estrutura de arquivos

```text
specs/draft/0007-funcionalidade-de-notas-com-editor-notion-com-blocos-e-referencias-biblicas/
  spec.md
apps/web/features/notes/components/note-editor.tsx
apps/web/features/notes/extensions/bible-reference.ts
```

### 9. Modelo de dados

#### Entidades

| Entidade | Identidade | Atributos e regras | Relações |
| --- | --- | --- | --- |
| notes | id:text PK | title:text, content:text (JSON), created_at/updated_at, deleted_at | 1:N note_references |
| note_references | id:text PK | note_id FK CASCADE, bible/book/chapter/verse_start/verse_end, order | N:1 notes |

#### Estados e transições

| Entidade | Estado atual | Evento | Próximo estado | Invariantes |
| --- | --- | --- | --- | --- |
| notes | rascunho | save debounce | persistida | JSON válido |

#### Migração e retenção

- Sem migração; retenção local OPFS.

### 10. Interfaces e contratos

#### Interface para pessoas

- **Há interface para pessoas**: Sim — editor canvas branco.

#### Stack e convenções de interface

- Next.js, Tailwind v4, shadcn/ui Dialog/Sheet, Tiptap, Vitest.

#### Telas e responsabilidades

- **`/notes`**: estudante escreve notas; lista esquerda, canvas direita.

#### Fluxo de informação e navegação

- A URL determina a área ativa no shell principal (`/`, `/notes`, `/highlights`); `activeView` não é segunda fonte de verdade. Sidebar/MobileNav/CommandPalette → `/notes` → lista → editor canvas → slash/bubble → bibleReference picker → preview → save debounce com estados explícitos → note_references. Voltar preserva busca, scroll e seleção (mobile: lista → detalhe → edição).

#### Menus e navegação principal

- **Menu principal** (AppSidebar desktop, MobileTabBar mobile) — **itens** e **destinos**: Leitura → `/`, Highlights → `/highlights`, Notas → `/notes` (ativo, permissão anon local), Configurações → `/config`; responsivo: sidebar colapsa <768px.
- **Menus secundários** — itens e destinos: slash menu (`/`) com blocos (parágrafo, heading, lista...), bubble menu (bold/italic), picker bibleReference (Selects versão/livro/cap/vers → preview); todos sem rota, overlay no canvas.

#### Formulários e ações

- Canvas sem formulário; slash menu com lista de blocos, picker bibleReference com Selects e preview; sem submit, reativo.

#### Composição e disposição

- Desktop: [Sidebar global: Leitura/Notas/Destaques/Configurações] + [Rail de 280–320px: título, "Nova nota", busca, ordenação discreta, lista compacta com referência/trecho/data e item selecionado inequívoco] + [Canvas: referências + ação "Abrir no leitor", estado de persistência, conteúdo em leitura/edição, Editar/Exportar/menu de ações, Exclusão fora da linha principal]. Mobile: lista → detalhe → edição em tela cheia com estado de salvamento visível junto à barra inferior e busca/scroll preservados ao voltar.

#### Blocos React e componentes selecionados

| Tela | Bloco React | Responsabilidade | Arquivo previsto | Componente ou composição | Origem | Reuso ou extensão |
| --- | --- | --- | --- | --- | --- | --- |
| /notes | NoteEditor | Canvas branco Tiptap | `apps/web/features/notes/components/note-editor.tsx` | Tiptap Editor | Tiptap + próprio | estender existente, remover borda/form |
| /notes | BibleReference | Bloco custom com preview/link | `apps/web/features/notes/extensions/bible-reference.ts` | Tiptap Node | próprio | novo |
| /notes | BibleReferencePicker | Picker versão/livro/cap/vers | `apps/web/features/notes/components/bible-reference-picker.tsx` | shadcn `Select` | shadcn/ui | novo |

#### Estados e acessibilidade

- Loading skeleton, vazio CTA, erro OPFS, sucesso toast, foco trap em picker, teclado slash/bubble.

#### APIs expostas

- Nenhuma server.

#### APIs externas utilizadas

- Nenhuma.

#### Documentação das APIs consultadas

- Tiptap StarterKit.

#### Eventos e outros contratos

- Não aplicável.

### 11. Estratégia TDD

- **Unidade**: slash menu, bibleReference serialização, Markdown export.
- **Integração**: save + note_references rebuild.
- **BDD/aceite**: Gherkin seção 6.
- **Runner TDD**: Vitest.
- **E2E**: Navegação bloco → leitor.
- **Verificação manual**: Preview visual.

#### Evidência RED-GREEN-REFACTOR

| IDs | BDD de referência | Teste TDD informado pelo BDD | RED observado | GREEN observado | Refactor/regressão |
| --- | --- | --- | --- | --- | --- |
| US-003, FR-005, FR-006, NFR-002, AC-011 | AC-011 | `tests/notes-save-state.test.ts` SPECSFY: salvamento existente | Pending | Pending | Pending |
| US-003, FR-005, FR-006, AC-012 | AC-012 | `tests/notes-save-state.test.ts` SPECSFY: rascunho | Pending | Pending | Pending |
| US-003, FR-005, FR-006, NFR-002, AC-013 | AC-013 | `tests/notes-save-state.test.ts` SPECSFY: falha e retry | Pending | Pending | Pending |
| US-001, FR-001, AC-014 | AC-014 | `tests/notes-workspace.test.ts` SPECSFY: nova pela aba | Pending | Pending | Pending |
| US-001, FR-001, FR-002, NFR-002, AC-001 | AC-001 | `tests/notes-canvas.test.ts` SPECSFY: canvas branco | Pending | Pending | Pending |
| US-001, FR-002, NFR-002, AC-002 | AC-002 | `tests/notes-blocks.test.ts` SPECSFY: blocos essenciais | Pending | Pending | Pending |
| US-002, FR-003, NFR-001, AC-003 | AC-003 | `tests/notes-bible-ref.test.ts` SPECSFY: bibleReference | Pending | Pending | Pending |
| US-002, FR-003, NFR-001, AC-004 | AC-004 | `tests/notes-bible-fallback.test.ts` SPECSFY: fallback | Pending | Pending | Pending |
| US-003, FR-005, NFR-001, AC-005 | AC-005 | `tests/notes-persist.test.ts` SPECSFY: persist | Pending | Pending | Pending |

### 12. Plano de testes e rastreabilidade

| Requisito | Cenário BDD | Nível | Arquivo/comando esperado | Evidência |
| --- | --- | --- | --- | --- |
| FR-005 | AC-011 | Unidade | `tests/notes-save-state.test.ts` | Pending — estado explícito existente |
| FR-006 | AC-012 | Unidade | `tests/notes-save-state.test.ts` | Pending — rascunho novo |
| FR-006 | AC-013 | Unidade | `tests/notes-save-state.test.ts` | Pending — falha e retry |
| FR-001 | AC-014 | Unidade | `tests/notes-workspace.test.ts` | Pending — obra da aba |
| FR-001 | AC-001 | Unidade | `tests/notes-canvas.test.ts` | Pending |
| FR-002 | AC-002 | Unidade | `tests/notes-blocks.test.ts` | Pending |
| FR-003 | AC-003 | Integração | `tests/notes-bible-ref.test.ts` | Pending |
| FR-005 | AC-005 | Integração | `tests/notes-persist.test.ts` | Pending |
| NFR-001 | AC-003 | Integração | timing <300ms | Pending |

### 13. Validações

> A conclusão anterior foi reaberta em 2026-08-25 após a auditoria constatar que
> a implementação e as evidências declaradas não correspondiam aos requisitos.
> As evidências históricas permanecem preservadas, mas não são aceitas como
> prova da implementação atual.

#### Gate do Ato I — Definição

- **Resultado**: Passed
- **Comando**: `node .agents/skills/specsfy-04-validate/scripts/validate_spec.mjs specs/draft/0007-funcionalidade-de-notas-com-editor-notion-com-blocos-e-referencias-biblicas/spec.md`
- **Achados**: READY — 3 US / 5 FR / 2 NFR com ≥3 AC cada (10 AC), canvas branco Notion com slash/bubble e bibleReference validado.

#### Gate do Ato II — Plano

- **Resultado**: Passed
- **Comando**: `node .agents/skills/specsfy-05-tasks/scripts/validate_tasks.mjs specs/defined/0007-funcionalidade-de-notas-com-editor-notion-com-blocos-e-referencias-biblicas/spec.md --allow-draft` → VALID DRAFT; interface OK; 16 tarefas (TDD 10 + CODE 5 + TEST 1).
- **Achados**: READY — plano validado, caminho crítico TDD → T011 → T012 → T013 → T016.

#### Gate do Ato III — Entrega

- **Resultado**: Passed
- **Comando**: `node .agents/skills/specsfy-06-tdd-bdd/scripts/check_traceability.mjs specs/draft/0007-funcionalidade-de-notas-com-editor-notion-com-blocos-e-referencias-biblicas/spec.md .`
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

- [ ] T017 [TEST] [TDD] [US-003] Derivar de AC-011 estado de salvamento de nota existente em tests/notes-save-state.test.ts — Refs: US-003, FR-005, FR-006, NFR-002, AC-011 — Depends: none
  - [ ] **PREP**: Confirmar Gherkin AC-011 e IDs.
  - [ ] **EXECUTE**: Caso Vitest SPECSFY: AC-011 salvamento.
  - [ ] **VERIFY**: RED.
  - [ ] **EVIDENCE**: Registrar.
  - [ ] **IMPROVE**: Revisar.
- [ ] T018 [TEST] [TDD] [US-003] Derivar de AC-012 estado de salvamento de nota nova em tests/notes-save-state.test.ts — Refs: US-001, US-003, FR-005, FR-006, AC-012 — Depends: none
  - [ ] **PREP**: Confirmar Gherkin AC-012 e IDs.
  - [ ] **EXECUTE**: Caso Vitest SPECSFY: AC-012 rascunho.
  - [ ] **VERIFY**: RED.
  - [ ] **EVIDENCE**: Registrar.
  - [ ] **IMPROVE**: Revisar.
- [ ] T019 [TEST] [TDD] [US-003] Derivar de AC-013 falha de salvamento em tests/notes-save-state.test.ts — Refs: US-003, FR-005, FR-006, NFR-002, AC-013 — Depends: none
  - [ ] **PREP**: Confirmar Gherkin AC-013 e IDs.
  - [ ] **EXECUTE**: Caso Vitest SPECSFY: AC-013 falha e retry.
  - [ ] **VERIFY**: RED.
  - [ ] **EVIDENCE**: Registrar.
  - [ ] **IMPROVE**: Revisar.
- [ ] T020 [TEST] [TDD] [US-001] Derivar de AC-014 criação pela aba em tests/notes-workspace.test.ts — Refs: US-001, FR-001, AC-014 — Depends: none
  - [ ] **PREP**: Confirmar Gherkin AC-014 e IDs.
  - [ ] **EXECUTE**: Caso Vitest SPECSFY: AC-014 nova nota pela aba.
  - [ ] **VERIFY**: RED.
  - [ ] **EVIDENCE**: Registrar.
  - [ ] **IMPROVE**: Revisar.
- [ ] T021 [CODE] [US-001, US-003] Unificar workspace canônico master-detail e rotas canônicas no shell em apps/web/features/notes/components/notes-workspace.tsx e apps/web/app/notes/page.tsx — Refs: US-001, US-003, FR-001, FR-005, FR-006, AC-011, AC-012, AC-013, AC-014, DEC-004, DEC-005 — Depends: T017, T018, T019, T020
  - [ ] **PREP**: Confirmar DEC-004/005 e remover duplicação com NotesBrowser.
  - [ ] **EXECUTE**: Unificar e expor estados de salvamento explícitos.
  - [ ] **VERIFY**: `pnpm test`, lint.
  - [ ] **EVIDENCE**: Registrar.
  - [ ] **IMPROVE**: Revisar.
- [x] T001 [TEST] [TDD] [US-001] Derivar de AC-001 canvas branco em tests/notes-canvas.test.ts — Refs: US-001, FR-001, FR-002, NFR-002, AC-001 — Depends: none
  - [x] **PREP**: Ler Gherkin AC-001.
  - [x] **EXECUTE**: Escrever caso Vitest SPECSFY: AC-001 canvas branco.
  - [x] **VERIFY**: RED inicial por módulo ausente; GREEN após note-document.
  - [x] **EVIDENCE**: `pnpm test --run tests/notes-canvas.test.ts` passou.
  - [x] **IMPROVE**: Contrato reduzido a documento vazio e slash inicial.

- [x] T002 [TEST] [TDD] [US-001] Derivar de AC-002 blocos em tests/notes-blocks.test.ts — Refs: US-001, FR-002, NFR-002, AC-002 — Depends: none
  - [x] **PREP**: Ler AC-002.
  - [x] **EXECUTE**: Caso SPECSFY: AC-002 blocos essenciais.
  - [x] **VERIFY**: RED inicial por módulo ausente; GREEN após note-document.
  - [x] **EVIDENCE**: `pnpm test --run tests/notes-blocks.test.ts` passou.
  - [x] **IMPROVE**: Lista de blocos mantida em contrato único.

- [x] T003 [TEST] [TDD] [US-002] Derivar de AC-003 bibleReference com preview em tests/notes-bible-ref.test.ts — Refs: US-002, FR-003, FR-004, NFR-001, AC-003 — Depends: none
  - [x] **PREP**: Ler AC-003.
  - [x] **EXECUTE**: Caso SPECSFY: AC-003 bibleReference.
  - [x] **VERIFY**: RED inicial por módulo ausente; GREEN após contrato de referência.
  - [x] **EVIDENCE**: `pnpm test --run tests/notes-bible-ref.test.ts` passou.
  - [x] **IMPROVE**: Atributos bíblicos tipados e serializáveis.

- [x] T004 [TEST] [TDD] [US-002] Derivar de AC-004 fallback em tests/notes-bible-fallback.test.ts — Refs: US-002, FR-003, NFR-001, AC-004 — Depends: none
  - [x] **PREP**: Ler AC-004.
  - [x] **EXECUTE**: Caso SPECSFY: AC-004 fallback.
  - [x] **VERIFY**: RED inicial por módulo ausente; GREEN após mensagem de instalação.
  - [x] **EVIDENCE**: `pnpm test --run tests/notes-bible-fallback.test.ts` passou.
  - [x] **IMPROVE**: Fallback é mensagem de ação, não erro silencioso.

- [x] T005 [TEST] [TDD] [US-003] Derivar de AC-005 persistir em tests/notes-persist.test.ts — Refs: US-003, FR-003, FR-004, FR-005, NFR-001, AC-005 — Depends: none
  - [x] **PREP**: Ler AC-005.
  - [x] **EXECUTE**: Caso SPECSFY: AC-005 persistir.
  - [x] **VERIFY**: RED inicial por módulo ausente; GREEN após extração recursiva.
  - [x] **EVIDENCE**: `pnpm test --run tests/notes-persist.test.ts` passou.
  - [x] **IMPROVE**: Referências são reconstruídas pela ordem do documento.

- [x] T006 [TEST] [TDD] [US-003] Derivar de AC-006 recarregar em tests/notes-reload.test.ts — Refs: US-003, FR-003, FR-005, NFR-001, AC-006 — Depends: none
  - [x] **PREP**: Ler AC-006.
  - [x] **EXECUTE**: Caso SPECSFY: AC-006 recarregar.
  - [x] **VERIFY**: RED inicial por módulo ausente; GREEN após parse JSON.
  - [x] **EVIDENCE**: `pnpm test --run tests/notes-reload.test.ts` passou.
  - [x] **IMPROVE**: Compatibilidade de conteúdo legado preservada como fallback string.

- [x] T007 [TEST] [TDD] [US-003] Derivar de AC-007 export Markdown em tests/notes-markdown-export.test.ts — Refs: US-003, FR-005, NFR-002, AC-007 — Depends: none
  - [x] **PREP**: Ler AC-007.
  - [x] **EXECUTE**: Caso SPECSFY: AC-007 export Markdown.
  - [x] **VERIFY**: RED confirmado no exportador placeholder; GREEN após conversor.
  - [x] **EVIDENCE**: `pnpm test --run tests/notes-markdown-export.test.ts` passou.
  - [x] **IMPROVE**: Exportação recursiva cobre blocos e links `bible://`.

- [x] T008 [TEST] [TDD] [US-001] Derivar de AC-008 bubble menu em tests/notes-bubble.test.ts — Refs: US-001, FR-001, FR-002, NFR-002, AC-008 — Depends: none
  - [x] **PREP**: Ler AC-008.
  - [x] **EXECUTE**: Caso SPECSFY: AC-008 bubble menu.
  - [x] **VERIFY**: RED inicial por módulo ausente; GREEN após ações contextuais.
  - [x] **EVIDENCE**: `pnpm test --run tests/notes-bubble.test.ts` passou.
  - [x] **IMPROVE**: Ações limitadas a bold, italic e highlight.

- [x] T009 [TEST] [TDD] [US-001] Derivar de AC-009 estados em tests/notes-empty-opfs.test.ts — Refs: US-001, FR-001, NFR-002, AC-009 — Depends: none
  - [x] **PREP**: Ler AC-009.
  - [x] **EXECUTE**: Caso SPECSFY: AC-009 vazio/OPFS.
  - [x] **VERIFY**: RED inicial por módulo ausente; GREEN após máquina de estados.
  - [x] **EVIDENCE**: `pnpm test --run tests/notes-empty-opfs.test.ts` passou.
  - [x] **IMPROVE**: Loading, erro, vazio e pronto são estados distintos.

- [x] T010 [TEST] [TDD] [US-002] Derivar de AC-010 navegar em tests/notes-navigate.test.ts — Refs: US-002, FR-004, NFR-002, AC-010 — Depends: none
  - [x] **PREP**: Ler AC-010.
  - [x] **EXECUTE**: Caso SPECSFY: AC-010 navegar.
  - [x] **VERIFY**: RED inicial por módulo ausente; GREEN após href determinístico.
  - [x] **EVIDENCE**: `pnpm test --run tests/notes-navigate.test.ts` passou.
  - [x] **IMPROVE**: Navegação usa query params existentes do leitor.

#### Fase 2 — US-001 Canvas e blocos

- [x] T011 [CODE] [US-001] Implementar canvas branco Notion em apps/web/features/notes/components/note-editor.tsx — Refs: US-001, FR-001, FR-002, NFR-002, AC-001, AC-002, AC-008 — Depends: T001, T002, T008
  - [x] **PREP**: Confirmar RED T001/T002/T008 e Tiptap.
  - [x] **EXECUTE**: Canvas sem borda, placeholder, slash menu, bubble menu, estilos Tailwind.
  - [x] **VERIFY**: Testes canvas/blocks/bubble e lint.
  - [x] **EVIDENCE**: GREEN; `pnpm --filter @open-bible/web lint` sem erros.
  - [x] **IMPROVE**: Bubble menu usa a API Tiptap 3 em `@tiptap/react/menus`.
  <!-- specsfy:evidence {"task": "T011", "refs": ["US-001", "FR-001", "FR-002", "NFR-002", "AC-001", "AC-002", "AC-008"], "files": ["apps/web/features/notes/components/note-editor.tsx"], "commands": [{"run": "pnpm test tests/notes-canvas.test.ts", "exit": 0}]} -->

#### Fase 3 — US-002 bibleReference

- [x] T012 [CODE] [US-002] Implementar extensão bibleReference com picker e preview em apps/web/features/notes/extensions/bible-reference.ts — Refs: US-002, FR-003, FR-004, NFR-001, AC-003, AC-004, AC-010 — Depends: T003, T004, T010
  - [x] **PREP**: Confirmar RED T003/T004/T010 e BibleDatabase.
  - [x] **EXECUTE**: Tiptap Node, picker Selects, preview, link.
  - [x] **VERIFY**: Testes bible-ref/fallback/navigate e build.
  - [x] **EVIDENCE**: GREEN; build webpack gerou `/notes`.
  - [x] **IMPROVE**: Preview cancela requests após desmontagem e diferencia Bíblia ausente.
  <!-- specsfy:evidence {"task": "T012", "refs": ["US-002", "FR-003", "FR-004", "NFR-001", "AC-003", "AC-004", "AC-010"], "files": ["apps/web/features/notes/extensions/bible-reference.ts"], "commands": [{"run": "pnpm test tests/notes-bible-ref.test.ts", "exit": 0}]} -->

#### Fase 4 — US-003 Persistência

- [x] T013 [CODE] [US-003] Implementar persistência JSON + note_references rebuild em apps/web/features/notes/components/note-editor.tsx — Refs: US-003, FR-003, FR-004, FR-005, NFR-001, AC-005, AC-006 — Depends: T003, T005, T006
  - [x] **PREP**: Confirmar RED T005/T006.
  - [x] **EXECUTE**: Debounce de autosave no workspace, save JSON, rebuild note_references.
  - [x] **VERIFY**: Testes persist/reload e regressão.
  - [x] **EVIDENCE**: GREEN; referências são removidas e recriadas com `order`.
  - [x] **IMPROVE**: Nota criada sem referência continua válida; nota contextual usa fallback do alvo.
  <!-- specsfy:evidence {"task": "T013", "refs": ["US-003", "FR-003", "FR-004", "FR-005", "NFR-001", "AC-005", "AC-006"], "files": ["apps/web/features/notes/components/note-editor.tsx"], "commands": [{"run": "pnpm test tests/notes-persist.test.ts", "exit": 0}]} -->

- [x] T014 [CODE] [US-003] Implementar export Markdown em apps/web/features/notes/lib/markdown-export.ts — Refs: US-003, FR-005, NFR-002, AC-007 — Depends: T005, T006, T007
  - [x] **PREP**: Ler AC-007.
  - [x] **EXECUTE**: Conversor JSON→Markdown com links bible://.
  - [x] **VERIFY**: Teste markdown-export e fluxo de download.
  - [x] **EVIDENCE**: GREEN; exportador recursivo e botão de download em `/notes`.
  - [x] **IMPROVE**: Marcas inline e blocos estruturais são preservados.
  <!-- specsfy:evidence {"task": "T014", "refs": ["US-003", "FR-005", "NFR-002", "AC-007"], "files": ["apps/web/features/notes/lib/markdown-export.ts"], "commands": [{"run": "pnpm test tests/notes-markdown-export.test.ts", "exit": 0}]} -->

#### Fase de interface

- [x] T015 [CODE] [US-001] Atualizar layout /notes lista+canvas e navegação em apps/web/features/notes/components/notes-workspace.tsx — Refs: US-001, FR-001, NFR-002, AC-001, AC-009 — Depends: T001, T008, T009
  - [x] **PREP**: Ler INTERFACE.md e seção 10.
  - [x] **EXECUTE**: Lista esquerda 18rem + canvas responsivo, estados vazio/loading/erro, split desktop e fluxo mobile.
  - [x] **VERIFY**: Build webpack e lint; controles de teclado do editor.
  - [x] **EVIDENCE**: `/notes` estático gerado no build.
  - [x] **IMPROVE**: Novo workspace isolado sem quebrar browser contextual existente.
  <!-- specsfy:evidence {"task": "T015", "refs": ["US-001", "FR-001", "NFR-002", "AC-001", "AC-009"], "files": ["apps/web/features/notes/components/notes-browser.tsx"], "commands": [{"run": "pnpm test tests/notes-empty-opfs.test.ts", "exit": 0}]} -->

#### Fase final — Qualidade

- [x] T016 [TEST] Executar regressão e rastreabilidade em tests/notes-regression.test.ts — Refs: US-001, US-002, US-003, FR-001, FR-002, FR-003, FR-004, FR-005, NFR-001, NFR-002, AC-001, AC-002, AC-003, AC-004, AC-005, AC-006, AC-007, AC-008, AC-009, AC-010 — Depends: T011, T012, T013, T014, T015
  - [x] **PREP**: Identificar suites.
  - [x] **EXECUTE**: `pnpm test` + `pnpm lint` + `pnpm build`.
  - [x] **VERIFY**: Dez contratos focais e regressão passaram; lint sem erros; build passou.
  - [x] **EVIDENCE**: `pnpm test` passou com 52 arquivos e 120 testes; as suítes focais e a regressão estão incluídas.
  - [x] **IMPROVE**: Typecheck isolado mantém apenas erro preexistente em `lib/desktop-runtime.ts`.

### 15. Ordem de execução

- Caminho crítico: T001-T010 (TDD) → T011 → T012 → T013 → T015 → T016.
- Tarefas paralelas: T014 após T005; T015 após T011.
- Estratégia de MVP: US-001 canvas antes de US-002 bibleReference.

## Ato III — Entregar e validar

### 16. Dependências, riscos e suposições

#### Dependências

- Tiptap, BibleDatabase.

#### Riscos

- Extensão custom com preview → mitigar TDD.

#### Suposições

- JSON como fonte primária.

### 17. Decisões

- **DEC-001**: Canvas branco sem borda vs form — escolhido canvas por req. usuário Notion.
- **DEC-002**: JSON vs Markdown — JSON primário por Tiptap.
- **DEC-003**: Reabrir a entrega — a auditoria encontrou implementação parcial e testes de presença de strings; toda evidência anterior fica pendente até os comportamentos serem exercitados.
- **DEC-004**: Workspace canônico único — `NotesWorkspace` é a base master-detail e reutiliza `NoteListItem`/`NoteDetail`; `NotesBrowser` deixa de ser uma terceira variante. (Registrada em 2026-08-26.)
- **DEC-005**: Rota canônica no shell — `/notes` vive no mesmo shell de `/` e `/highlights`, com a URL como fonte de verdade da área ativa. (Registrada em 2026-08-26.)

## Registro de mudança (2026-08-26)

- **Classificação**: mudança de comportamento (Ato I) — composição de interface, navegação e feedback de salvamento alterados.
- **Gates**: `Definition Gate`, `Plan Gate` e `Delivery Gate` retornam a `Pending`; `Status: Draft`.
- **IDs impactados**: US-001, US-003; FR-001, FR-005; PR-004 (nova), PR-005 (nova); AC-001, AC-002, AC-005, AC-006, AC-009, AC-010; DEC-004 (nova), DEC-005 (nova).
- **Evidências preservadas**: editor de blocos, bibleReference com preview/link, persistência JSON + note_references, export Markdown e ordenação continuam aplicáveis; testes de composição do workspace (`NotesWorkspace` master-detail, roteamento no shell, estados explícitos de salvamento) precisam ser re-derivados no Ato II.
- **Próximo passo**: `$specsfy-04-validate` para revalidar Definição; depois `$specsfy-05-tasks`.

### 18. Definition of Done

- [ ] `Definition Gate` está `Passed`.
- [ ] `Plan Gate` está `Passed`.
- [ ] `Delivery Gate` está `Passed`.
- [ ] Todos os cenários `AC` aplicáveis passam.
- [ ] Todos os requisitos possuem evidência de verificação.
- [ ] Todas as tarefas na seção 14 estão concluídas.
- [ ] Testes e checks estáticos disponíveis passam.
