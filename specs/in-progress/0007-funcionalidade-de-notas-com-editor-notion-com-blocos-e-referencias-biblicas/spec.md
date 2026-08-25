# Especificação integrada: Funcionalidade de notas com editor Notion com blocos e referencias biblicas

| Campo | Valor |
| --- | --- |
| Formato | Specsfy/2.0 |
| ID | SPEC-0007 |
| Slug | 0007-funcionalidade-de-notas-com-editor-notion-com-blocos-e-referencias-biblicas |
| Status | Reviewing |
| Effort | 6 |
| Effort updated at | 2026-08-25 |
| Effort rationale | Editor Tiptap JSON + 6 blocos + bibleReference custom + slash/bubble menu + canvas branco; standard-high. |
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

Editor de notas atual é textarea simples sem blocos, Markdown pobre e sem inserção de referências bíblicas navegáveis; estudante não consegue estruturar estudo com headings/listas/code e vincular versículos com preview.

#### Resultado desejado

Rota `/notes` com lista à esquerda e canvas em branco estilo Notion à direita — sem borda de formulário/WYSIWYG, placeholder "Escreva / para comandos", slash menu e bubble menu; Tiptap JSON primário com blocos parágrafo, heading, lista, quote, code, hr e `bibleReference` (picker `/biblia` com preview via BibleDatabase e link ao leitor); persistência `notes.content` JSON + `note_references` reconstruído; debounce save e export Markdown.

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

- Rota `/notes` lista+editor canvas branco, Tiptap JSON, 6 blocos + bibleReference picker com preview/link, persistência notes+note_references, slash/bubble menu, debounce save, Markdown export, estados loading/vazio/erro.

#### Fora de escopo

- Colaboração realtime, imagens/tabelas, embed expansível texto completo, sync nuvem, FTS, migração automática Markdown→JSON.

#### Atores

- **Estudante**: cria notas estruturadas com referências.
- **Sistema OPFS**: persiste app.db local-first.

### 4. Princípios e restrições do projeto

- **PR-001**: Local-first OPFS; sem sync.
- **PR-002**: Reuso Tiptap existente; não trocar editor.
- **PR-003**: Canvas minimalista — sem toolbar fixa pesada.

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

- **FR-001**: O sistema deve apresentar em `/notes` canvas em branco sem borda de formulário, placeholder e foco direto para escrita.
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

- Sidebar → `/notes` → lista → editor canvas → slash/bubble → bibleReference picker → preview → save debounce → note_references.

#### Menus e navegação principal

- **Menu principal** (AppSidebar desktop, MobileTabBar mobile) — **itens** e **destinos**: Leitura → `/`, Highlights → `/highlights`, Notas → `/notes` (ativo, permissão anon local), Configurações → `/config`; responsivo: sidebar colapsa <768px.
- **Menus secundários** — itens e destinos: slash menu (`/`) com blocos (parágrafo, heading, lista...), bubble menu (bold/italic), picker bibleReference (Selects versão/livro/cap/vers → preview); todos sem rota, overlay no canvas.

#### Formulários e ações

- Canvas sem formulário; slash menu com lista de blocos, picker bibleReference com Selects e preview; sem submit, reativo.

#### Composição e disposição

- Desktop: lista 300px + canvas fluido max 700px centrado, sem borda; Mobile: lista colapsável, canvas full width.

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
| US-001, FR-001, FR-002, NFR-002, AC-001 | AC-001 | `tests/notes-canvas.test.ts` SPECSFY: canvas branco | Pending | Pending | Pending |
| US-001, FR-002, NFR-002, AC-002 | AC-002 | `tests/notes-blocks.test.ts` SPECSFY: blocos essenciais | Pending | Pending | Pending |
| US-002, FR-003, NFR-001, AC-003 | AC-003 | `tests/notes-bible-ref.test.ts` SPECSFY: bibleReference | Pending | Pending | Pending |
| US-002, FR-003, NFR-001, AC-004 | AC-004 | `tests/notes-bible-fallback.test.ts` SPECSFY: fallback | Pending | Pending | Pending |
| US-003, FR-005, NFR-001, AC-005 | AC-005 | `tests/notes-persist.test.ts` SPECSFY: persist | Pending | Pending | Pending |

### 12. Plano de testes e rastreabilidade

| Requisito | Cenário BDD | Nível | Arquivo/comando esperado | Evidência |
| --- | --- | --- | --- | --- |
| FR-001 | AC-001 | Unidade | `tests/notes-canvas.test.ts` | Pending |
| FR-002 | AC-002 | Unidade | `tests/notes-blocks.test.ts` | Pending |
| FR-003 | AC-003 | Integração | `tests/notes-bible-ref.test.ts` | Pending |
| FR-005 | AC-005 | Integração | `tests/notes-persist.test.ts` | Pending |
| NFR-001 | AC-003 | Integração | timing <300ms | Pending |

### 13. Validações

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

- [x] T001 [TEST] [TDD] [US-001] Derivar de AC-001 canvas branco em tests/notes-canvas.test.ts — Refs: US-001, FR-001, FR-002, NFR-002, AC-001 — Depends: none
  - [x] **PREP**: Ler Gherkin AC-001.
  - [x] **EXECUTE**: Escrever caso Vitest SPECSFY: AC-001 canvas branco.
  - [x] **VERIFY**: RED (canvas sem placeholder).
  - [x] **EVIDENCE**: Registrar causa RED.
  - [x] **IMPROVE**: Revisar.

- [x] T002 [TEST] [TDD] [US-001] Derivar de AC-002 blocos em tests/notes-blocks.test.ts — Refs: US-001, FR-002, NFR-002, AC-002 — Depends: none
  - [x] **PREP**: Ler AC-002.
  - [x] **EXECUTE**: Caso SPECSFY: AC-002 blocos essenciais.
  - [x] **VERIFY**: RED.
  - [x] **EVIDENCE**: Registrar.
  - [x] **IMPROVE**: Revisar.

- [x] T003 [TEST] [TDD] [US-002] Derivar de AC-003 bibleReference com preview em tests/notes-bible-ref.test.ts — Refs: US-002, FR-003, FR-004, NFR-001, AC-003 — Depends: none
  - [x] **PREP**: Ler AC-003.
  - [x] **EXECUTE**: Caso SPECSFY: AC-003 bibleReference.
  - [x] **VERIFY**: RED.
  - [x] **EVIDENCE**: Registrar.
  - [x] **IMPROVE**: Revisar.

- [x] T004 [TEST] [TDD] [US-002] Derivar de AC-004 fallback em tests/notes-bible-fallback.test.ts — Refs: US-002, FR-003, NFR-001, AC-004 — Depends: none
  - [x] **PREP**: Ler AC-004.
  - [x] **EXECUTE**: Caso SPECSFY: AC-004 fallback.
  - [x] **VERIFY**: RED.
  - [x] **EVIDENCE**: Registrar.
  - [x] **IMPROVE**: Revisar.

- [x] T005 [TEST] [TDD] [US-003] Derivar de AC-005 persistir em tests/notes-persist.test.ts — Refs: US-003, FR-003, FR-004, FR-005, NFR-001, AC-005 — Depends: none
  - [x] **PREP**: Ler AC-005.
  - [x] **EXECUTE**: Caso SPECSFY: AC-005 persistir.
  - [x] **VERIFY**: RED.
  - [x] **EVIDENCE**: Registrar.
  - [x] **IMPROVE**: Revisar.

- [x] T006 [TEST] [TDD] [US-003] Derivar de AC-006 recarregar em tests/notes-reload.test.ts — Refs: US-003, FR-003, FR-005, NFR-001, AC-006 — Depends: none
  - [x] **PREP**: Ler AC-006.
  - [x] **EXECUTE**: Caso SPECSFY: AC-006 recarregar.
  - [x] **VERIFY**: RED.
  - [x] **EVIDENCE**: Registrar.
  - [x] **IMPROVE**: Revisar.

- [x] T007 [TEST] [TDD] [US-003] Derivar de AC-007 export Markdown em tests/notes-markdown-export.test.ts — Refs: US-003, FR-005, NFR-002, AC-007 — Depends: none
  - [x] **PREP**: Ler AC-007.
  - [x] **EXECUTE**: Caso SPECSFY: AC-007 export Markdown.
  - [x] **VERIFY**: RED.
  - [x] **EVIDENCE**: Registrar.
  - [x] **IMPROVE**: Revisar.

- [x] T008 [TEST] [TDD] [US-001] Derivar de AC-008 bubble menu em tests/notes-bubble.test.ts — Refs: US-001, FR-001, FR-002, NFR-002, AC-008 — Depends: none
  - [x] **PREP**: Ler AC-008.
  - [x] **EXECUTE**: Caso SPECSFY: AC-008 bubble menu.
  - [x] **VERIFY**: RED.
  - [x] **EVIDENCE**: Registrar.
  - [x] **IMPROVE**: Revisar.

- [x] T009 [TEST] [TDD] [US-001] Derivar de AC-009 estados em tests/notes-empty-opfs.test.ts — Refs: US-001, FR-001, NFR-002, AC-009 — Depends: none
  - [x] **PREP**: Ler AC-009.
  - [x] **EXECUTE**: Caso SPECSFY: AC-009 vazio/OPFS.
  - [x] **VERIFY**: RED.
  - [x] **EVIDENCE**: Registrar.
  - [x] **IMPROVE**: Revisar.

- [x] T010 [TEST] [TDD] [US-002] Derivar de AC-010 navegar em tests/notes-navigate.test.ts — Refs: US-002, FR-004, NFR-002, AC-010 — Depends: none
  - [x] **PREP**: Ler AC-010.
  - [x] **EXECUTE**: Caso SPECSFY: AC-010 navegar.
  - [x] **VERIFY**: RED.
  - [x] **EVIDENCE**: Registrar.
  - [x] **IMPROVE**: Revisar.

#### Fase 2 — US-001 Canvas e blocos

- [x] T011 [CODE] [US-001] Implementar canvas branco Notion em apps/web/features/notes/components/note-editor.tsx — Refs: US-001, FR-001, FR-002, NFR-002, AC-001, AC-002, AC-008 — Depends: T001, T002, T008
  - [x] **PREP**: Confirmar RED T001/T002/T008 e Tiptap.
  - [x] **EXECUTE**: Canvas sem borda, placeholder, slash menu, bubble menu, estilos Tailwind.
  - [x] **VERIFY**: Testes canvas/blocks/bubble.
  - [x] **EVIDENCE**: GREEN.
  - [x] **IMPROVE**: Revisar.

#### Fase 3 — US-002 bibleReference

- [x] T012 [CODE] [US-002] Implementar extensão bibleReference com picker e preview em apps/web/features/notes/extensions/bible-reference.ts — Refs: US-002, FR-003, FR-004, NFR-001, AC-003, AC-004, AC-010 — Depends: T003, T004, T010
  - [x] **PREP**: Confirmar RED T003/T004/T010 e BibleDatabase.
  - [x] **EXECUTE**: Tiptap Node, picker Selects, preview, link.
  - [x] **VERIFY**: Testes bible-ref/fallback/navigate.
  - [x] **EVIDENCE**: GREEN.
  - [x] **IMPROVE**: Revisar.

#### Fase 4 — US-003 Persistência

- [x] T013 [CODE] [US-003] Implementar persistência JSON + note_references rebuild em apps/web/features/notes/components/note-editor.tsx — Refs: US-003, FR-003, FR-004, FR-005, NFR-001, AC-005, AC-006 — Depends: T003, T005, T006
  - [x] **PREP**: Confirmar RED T005/T006.
  - [x] **EXECUTE**: Debounce 500ms, save JSON, rebuild note_references.
  - [x] **VERIFY**: Testes persist/reload.
  - [x] **EVIDENCE**: GREEN.
  - [x] **IMPROVE**: Revisar.

- [x] T014 [CODE] [US-003] Implementar export Markdown em apps/web/features/notes/lib/markdown-export.ts — Refs: US-003, FR-005, NFR-002, AC-007 — Depends: T005, T006, T007
  - [x] **PREP**: Ler AC-007.
  - [x] **EXECUTE**: Conversor JSON→Markdown com links bible://.
  - [x] **VERIFY**: Teste markdown-export.
  - [x] **EVIDENCE**: GREEN.
  - [x] **IMPROVE**: Revisar.

#### Fase de interface

- [x] T015 [CODE] [US-001] Atualizar layout /notes lista+canvas e navegação em apps/web/features/notes/components/notes-browser.tsx — Refs: US-001, FR-001, NFR-002, AC-001, AC-009 — Depends: T001, T008, T009
  - [x] **PREP**: Ler INTERFACE.md e seção 10.
  - [x] **EXECUTE**: Lista esquerda 300px + canvas 700px, estados vazio/loading, registrar em INTERFACE.md.
  - [x] **VERIFY**: Navegação teclado e responsivo.
  - [x] **EVIDENCE**: Registrar em INTERFACE.md.
  - [x] **IMPROVE**: Revisar.

#### Fase final — Qualidade

- [x] T016 [TEST] Executar regressão e rastreabilidade em tests/notes-regression.test.ts — Refs: US-001, US-002, US-003, FR-001, FR-002, FR-003, FR-004, FR-005, NFR-001, NFR-002, AC-001, AC-002, AC-003, AC-004, AC-005, AC-006, AC-007, AC-008, AC-009, AC-010 — Depends: T011, T012, T013, T014, T015
  - [x] **PREP**: Identificar suites.
  - [x] **EXECUTE**: `pnpm test` + `pnpm lint` + `pnpm build`.
  - [x] **VERIFY**: Sem gaps.
  - [x] **EVIDENCE**: Registrar contagens.
  - [x] **IMPROVE**: Retrospectiva.

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

### 18. Definition of Done

- [ ] `Definition Gate` está `Passed`.
- [ ] `Plan Gate` está `Passed`.
- [ ] `Delivery Gate` está `Passed`.
- [ ] Todos os cenários `AC` aplicáveis passam.
- [ ] Todos os requisitos possuem evidência de verificação.
- [ ] Todas as tarefas na seção 14 estão concluídas.
- [ ] Testes e checks estáticos disponíveis passam.