# Especificação integrada: Fundação de monorepo multiplataforma

| Campo | Valor |
| --- | --- |
| Formato | Specsfy/2.0 |
| ID | SPEC-0002 |
| Slug | 0002-fundacao-monorepo-multiplataforma |
| Status | Complete |
| Effort | 8 |
| Effort updated at | 2026-08-23 |
| Effort rationale | Migra aplicações, scripts e fronteiras de domínio preservando a PWA e o desktop legado. |
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

Regras de leitura bíblica, UI Next.js e adaptadores de browser estão acoplados, dificultando variantes Electron e OpenTUI sem duplicação.

#### Resultado desejado

O repositório usa `pnpm` workspaces: PWA em `apps/web`, Tauri legado em `apps/desktop-tauri` e contratos, domínio, casos de uso e adaptadores em `packages/`.

#### Métricas de sucesso

- `pnpm lint`, `pnpm test` e `pnpm build` passam pela raiz.
- Leitura, busca e parsing de referências usam módulos que não importam runtime de plataforma.
- O build Tauri legado continua consumindo o export estático Web.

### 2. Research e esclarecimentos

#### Researchs executados

- **R-001**: análise do repositório local confirmou Next.js, SQLite WASM/OPFS, Tauri e candidatos de domínio em `features/bible-reader` e `lib/database`.

#### Fontes e contexto consultados

- `AGENTS.md`, `.specsfy/STACK.md`, `.specsfy/DATABASE.md`, `package.json`, `features/bible-reader/`, `lib/database/` e `specs/completed/0001-corrigir-build-do-tauri/spec.md`.

#### Documentação consultada

- Nenhuma fonte externa.

#### Artefatos de pesquisa armazenados

- Nenhum artefato externo.

#### Dúvidas respondidas

- **Q**: primeira entrega → **A**: somente fundação; Electron e TUI não são entregues agora.
- **Q**: Tauri → **A**: continua como legado funcional em `apps/desktop-tauri`.
- **Q**: dados → **A**: OPFS/SQLite atual permanece sem migração ou sincronização.
- **Q**: domínio inicial → **A**: versões, livros, capítulos, versículos, busca e referências.

#### Dúvidas abertas

- As specs posteriores definem Electron, OpenTUI e UI nativa.

### 3. Escopo e atores

#### Incluído

- Criar workspace e mover PWA e Tauri para os caminhos acordados.
- Criar `packages/contracts`, `packages/domain-bible`, `packages/application-bible` e `packages/adapters-web`.
- Extrair contratos e casos de uso de leitura e referências, sem mudar seus comportamentos públicos.

#### Fora de escopo

- Electron, OpenTUI, UI nativa, sync, migrations, notas, destaques, preferências e atualizações.

#### Atores

- **Pessoa usuária Web**: mantém leitura offline.
- **Mantenedor**: prepara variantes sem duplicar regras.

### 4. Princípios e restrições do projeto

- **PR-001**: domínio e aplicação não importam Next, React, Tauri, Electron, `window`, OPFS, SQL ou `localStorage`.
- **PR-002**: `adapters-web` encapsula OPFS/SQLite WASM, API e armazenamento Web.
- **PR-003**: busca mantém `LIKE %q% COLLATE NOCASE`; download permanece `NetworkOnly`.
- **PR-004**: nenhuma migration, worker RPC ou arquivo OPFS existente é alterado.

### 5. Histórias de usuário

#### US-001 — Preservar leitura durante a reorganização (P1)

Como pessoa usuária Web, quero continuar lendo e buscando a Bíblia offline, para não perder o comportamento atual.

**Por que P1**: a fundação não pode causar regressão.
**Teste independente**: testes e build Web passam; um capítulo instalado retorna os mesmos versículos.
**Requisitos**: FR-001, FR-002, NFR-001.

#### US-002 — Reutilizar regras em variantes (P1)

Como mantenedor, quero consumir leitura e referências por contratos independentes de plataforma, para preparar Electron e OpenTUI sem duplicação.

**Por que P1**: é a finalidade da mudança.
**Teste independente**: testes de domínio importam apenas `packages/`.
**Requisitos**: FR-001, FR-003, NFR-002.

### 6. Cenários BDD de aceite

#### AC-001 — Leitura Web preservada

**Cobre**: US-001, US-002, FR-001, FR-002, FR-003, NFR-001, NFR-002

```gherkin
Scenario: Ler capítulo instalado após a migração
  Given uma versão instalada no armazenamento Web existente
  When a PWA consulta um capítulo pelo caso de uso compartilhado
  Then recebe os mesmos versículos ordenados sem alterar o banco local
```

#### AC-002 — Caso de uso sem plataforma

**Cobre**: US-001, US-002, FR-001, FR-002, FR-003, NFR-001, NFR-002

```gherkin
Scenario: Buscar sem APIs de browser
  Given um adaptador que implementa a porta de leitura bíblica
  When o caso de uso pesquisa texto
  Then aplica busca case-insensitive sem importar módulos de apps ou browser
```

#### AC-003 — Desktop legado preservado

**Cobre**: US-001, US-002, FR-001, FR-002, FR-003, NFR-001, NFR-002

```gherkin
Scenario: Construir Tauri legado
  Given Web em apps/web e Tauri em apps/desktop-tauri
  When o build desktop é chamado pela raiz
  Then o shell consome o export Web sem remover rotas da PWA
```

### 7. Requisitos

#### Funcionais

- **FR-001**: contratos e casos de uso de leitura/referências devem ser independentes de plataforma.
- **FR-002**: PWA e Tauri legado devem manter o comportamento de leitura, busca e instalação atual.
- **FR-003**: adaptadores Web devem implementar as portas sem migrar dados locais.

#### Não funcionais

- **NFR-001**: lint, teste, build Web e build Tauri legado continuam executáveis da raiz. **Verificação**: comandos `pnpm` verdes.
- **NFR-002**: domínio e aplicação não importam runtimes de apps/plataformas. **Verificação**: teste de fronteiras de imports.

#### Erros e casos-limite

- Versão não instalada preserva retorno vazio atual e não altera dados.
- Falha de build não move arquivos fora da aplicação-alvo.

## Ato II — Projetar e provar

### 8. Plano técnico

#### Contexto existente

Next.js 16/React, Hono, SQLite WASM/OPFS e Tauri 2 hoje estão na raiz. `BibleDatabase` e `DatabaseManager` são browser-only.

#### Arquitetura e módulos

- `contracts`: DTOs Zod e portas `BibleCatalog`, `BibleReader` e `ReferenceParser`.
- `domain-bible`: tipos, normalização e parsing de referências.
- `application-bible`: `listVersions`, `getChapter`, `searchVerses` e `parseReference`, dependentes somente de portas.
- `adapters-web`: ponte para SQLite WASM/OPFS, API e localStorage.
- `apps/web`: Next/UI; `apps/desktop-tauri`: Rust, configuração e scripts do shell legado.

#### Migrations

Não aplicável: schemas e migrations são preservados.

#### Models

Versão, livro, capítulo, versículo e referência tornam-se tipos compartilhados, preservando as formas públicas atuais.

#### Controllers e casos de uso

Hooks e rotas existentes chamam casos de uso; autenticação e notas não entram nesta fatia.

#### Views e experiência

Não aplicável: nenhuma tela nova ou alterada.

#### Queries e repositórios

`adapters-web` encapsula `BibleDatabase`, `DatabaseManager` e API. SQL de busca e RPC do worker não mudam.

#### Jobs e processamento assíncrono

Não aplicável.

#### Estrutura de arquivos

```text
apps/web/
apps/desktop-tauri/
packages/contracts/
packages/domain-bible/
packages/application-bible/
packages/adapters-web/
```

### 9. Modelo de dados

#### Entidades

| Entidade | Identidade | Atributos e regras | Relações |
| --- | --- | --- | --- |
| Versão bíblica | id | nome, livros | contém livros |
| Livro | id + versão | nome, abreviação, testamento | contém capítulos |
| Referência | livro, capítulo, intervalo | parser normaliza | aponta para versículos |

#### Estados e transições

Não aplicável.

#### Migração e retenção

Não aplicável; dados existentes permanecem intactos.

### 10. Interfaces e contratos

#### Interface para pessoas

- **Há interface para pessoas**: Não. A entrega somente reorganiza módulos e preserva as telas existentes.

#### Stack e convenções de interface

Next.js/React/Tailwind/shadcn permanecem em `apps/web`.

#### Telas e responsabilidades

Não aplicável.

#### Fluxo de informação e navegação

Não aplicável.

#### Menus e navegação principal

Não aplicável.

#### Formulários e ações

Não aplicável.

#### Composição e disposição

Não aplicável.

#### Blocos React e componentes selecionados

Não aplicável.

#### Estados e acessibilidade

Estados existentes são preservados.

#### APIs expostas

Não há nova API HTTP; contratos internos TypeScript preservam formatos já usados pela Web.

#### APIs externas utilizadas

Nenhuma nova.

#### Documentação das APIs consultadas

Nenhuma externa.

#### Eventos e outros contratos

Portas internas TypeScript não importam runtime de aplicações.

### 11. Estratégia TDD

- **Unidade**: parser, normalização, casos de uso e fronteiras de pacotes.
- **Integração/contrato**: adaptador Web contra fixtures e portas.
- **BDD/aceite**: AC-001 a AC-003.
- **Runner TDD**: Vitest, via novo script `pnpm test:tdd` (`vitest run`).
- **E2E**: não aplicável.
- **Verificação manual**: abrir capítulo instalado na PWA e no Tauri legado, pois OPFS/WebView dependem do ambiente.

#### Evidência RED-GREEN-REFACTOR

| IDs | BDD de referência | Teste TDD informado pelo BDD | RED observado | GREEN observado | Refactor/regressão |
| --- | --- | --- | --- | --- | --- |
| US-001, FR-001, NFR-001, AC-001 | AC-001 | `tests/packages/bible-application.test.ts` | Caracterização: implementação parcial já presente; os três casos passaram | Passed: 71 testes, build Web e integração do hook | Passed: regressão raiz concluída |
| US-002, FR-003, NFR-002, AC-002 | AC-002 | `tests/packages/boundaries.test.ts` | Falha observada e corrigida: `packages/domain-bible/src/index.ts` inexistente | Passed: domínio e adaptadores sem runtime de plataforma | Passed: fronteiras e adaptadores verdes |
| US-001, FR-002, NFR-001, AC-003 | AC-003 | `tests/workspace/tauri-legacy.test.ts` | Falhas observadas e corrigidas: shell e export foram movidos | Passed: export estático e binário Tauri release gerados | Passed: build Tauri `--no-bundle` concluído |

### 12. Plano de testes e rastreabilidade

| Requisito | Cenário BDD | Nível | Arquivo/comando esperado | Evidência |
| --- | --- | --- | --- | --- |
| FR-001 | AC-001, AC-002, AC-003 | Unidade | `tests/packages/bible-application.test.ts` | Passed: testes compartilhados verdes |
| FR-002 | AC-001, AC-002, AC-003 | Integração | `pnpm test` e `pnpm build` | Passed: 71 testes e build Web verdes |
| FR-003 | AC-001, AC-002, AC-003 | Contrato | `tests/packages/adapters-web.test.ts` | Passed: catálogo, busca e leitor Web delegam corretamente |
| NFR-001 | AC-001, AC-002, AC-003 | Build | `pnpm lint && pnpm test && pnpm build` | Passed: lint sem erros, 71 testes e build verdes |
| NFR-002 | AC-001, AC-002, AC-003 | Unidade | `tests/packages/boundaries.test.ts` | Passed: domínio/aplicação sem imports de plataforma |

### 13. Validações

#### Gate do Ato I — Definição

- **Resultado**: READY (2026-08-23)
- **Comando**: `node .agents/skills/specsfy-04-validate/scripts/validate_spec.mjs specs/draft/0002-fundacao-monorepo-multiplataforma/spec.md`
- **Achados**: cobertura completa: 2 US, 3 FR e 2 NFR, cada qual associado a AC-001, AC-002 e AC-003. Sem BLOCKER aberto.

#### Gate do Ato II — Plano

- **Resultado**: Passed (2026-08-23)
- **Comando**: `node .agents/skills/specsfy-05-tasks/scripts/validate_tasks.mjs specs/defined/0002-fundacao-monorepo-multiplataforma/spec.md`
- **Achados**: 9 tarefas válidas, três predecessoras TDD materializadas, com RED registrado para AC-002 e AC-003 e caracterização para a leitura já presente no worktree.

#### Gate do Ato III — Entrega

- **Resultado**: Passed (2026-08-23)
- **Comando**: `pnpm lint && pnpm test && pnpm build && pnpm --filter @open-bible/desktop-tauri exec tauri build --no-bundle`; `node .agents/skills/specsfy-06-tdd-bdd/scripts/check_traceability.mjs specs/in-progress/0002-fundacao-monorepo-multiplataforma/spec.md . --full-chain`
- **Achados**: lint sem erros, 71 testes verdes, build Web verde, binário Tauri release gerado e 10/10 IDs rastreáveis. Bundles deb/rpm também foram gerados; AppImage exige `linuxdeploy` e assinatura exige `TAURI_SIGNING_PRIVATE_KEY`, ausentes neste ambiente.

### 14. Tarefas

#### Fase 1 — Testes RED

- [x] T001 [TEST] [TDD] [US-001] Criar testes de leitura compartilhada em `tests/packages/bible-application.test.ts` — Refs: US-001, US-002, FR-001, FR-002, FR-003, NFR-001, NFR-002, AC-001 — Depends: none
  - [x] **PREP**: Confirmar AC-001 e fixtures de leitura.
  - [x] **EXECUTE**: Criados casos de delegação, versão não instalada e erro do adaptador.
  - [x] **VERIFY**: `pnpm exec vitest run tests/packages/bible-application.test.ts` passa isoladamente.
  - [x] **EVIDENCE**: Os três casos têm marcadores SPECSFY; caracterização necessária porque `getChapter` já existia no worktree.
  - [x] **IMPROVE**: Fixtures locais eliminam dependência de OPFS e duplicação de setup.
- [x] T002 [TEST] [TDD] [US-002] Criar testes de fronteira dos pacotes em `tests/packages/boundaries.test.ts` — Refs: US-001, US-002, FR-001, FR-002, FR-003, NFR-001, NFR-002, AC-002 — Depends: none
  - [x] **PREP**: Confirmar AC-002 e limites de importação.
  - [x] **EXECUTE**: Criado teste RED que exige o pacote de domínio sem imports de plataforma.
  - [x] **VERIFY**: `pnpm exec vitest run tests/packages/boundaries.test.ts` falha por ausência de `packages/domain-bible/src/index.ts`.
  - [x] **EVIDENCE**: RED registrado para AC-002 e IDs associados.
  - [x] **IMPROVE**: A inspeção de fontes evita mockar a fronteira arquitetural que o cenário prova.
- [x] T003 [TEST] [TDD] [US-001] Criar teste do build Tauri legado no workspace em `tests/workspace/tauri-legacy.test.ts` — Refs: US-001, US-002, FR-001, FR-002, FR-003, NFR-001, NFR-002, AC-003 — Depends: none
  - [x] **PREP**: Confirmar AC-003 e caminhos atuais.
  - [x] **EXECUTE**: Criados testes RED para o shell em `apps/desktop-tauri`, export Web e script raiz.
  - [x] **VERIFY**: `pnpm exec vitest run tests/workspace/tauri-legacy.test.ts` falha porque o shell permanece na raiz e o script não delega ao workspace.
  - [x] **EVIDENCE**: RED registrado para AC-003 e IDs associados.
  - [x] **IMPROVE**: Testes somente inspecionam arquivos, sem depender de ambiente gráfico.

#### Fase 2 — Fundação do workspace

- [x] T004 [CODE] Adicionar workspaces e `test:tdd` em `package.json` e `pnpm-workspace.yaml` — Refs: FR-001, NFR-001, NFR-002 — Depends: T001, T002, T003
  - [x] **PREP**: Confirmados REDs de AC-002 e AC-003 e manifests raiz e dos pacotes.
  - [x] **EXECUTE**: Configurados workspaces `apps/*` e `packages/*`, script `test:tdd` e dependências workspace.
  - [x] **VERIFY**: `pnpm install --frozen-lockfile`, `pnpm exec vitest run tests/packages/bible-application.test.ts` e `pnpm exec eslint tests/packages/bible-application.test.ts` passaram; a suíte completa permanece RED pelas tarefas T006 e T007.
  - [x] **EVIDENCE**: Lockfile atualizado para `@open-bible/contracts`; monitor e documentação derivada estão atuais.
  <!-- specsfy:evidence {"task":"T004","refs":["FR-001","NFR-001","NFR-002"],"files":["package.json","pnpm-workspace.yaml","pnpm-lock.yaml","packages/contracts/package.json","packages/application-bible/package.json","packages/adapters-web/package.json"],"commands":[{"run":"pnpm install --frozen-lockfile","exit":0},{"run":"pnpm exec vitest run tests/packages/bible-application.test.ts","exit":0},{"run":"pnpm exec eslint tests/packages/bible-application.test.ts","exit":0}]} -->
  - [x] **IMPROVE**: Nenhuma melhoria adicional necessária; o script dedicado preserva a suíte TDD existente sem duplicar configuração.
- [x] T005 [CODE] Mover PWA para `apps/web` e adaptar scripts/configurações de raiz — Refs: US-001, FR-002, NFR-001, AC-001 — Depends: T004
  - [x] **PREP**: Confirmados caminhos Next, aliases `@/` e ativos SQLite/OPFS.
  - [x] **EXECUTE**: Aplicação, configurações, `public` e persistência movidos para `apps/web`; scripts raiz delegam ao workspace.
  - [x] **VERIFY**: `pnpm build` e `pnpm lint` passaram; lint encerrou com 27 avisos legados e zero erros.
  - [x] **EVIDENCE**: Export Web gerado em `apps/web/.next`; documentação de banco atualizada para os novos caminhos.
  <!-- specsfy:evidence {"task":"T005","refs":["US-001","FR-002","NFR-001","AC-001"],"files":["apps/web/package.json","apps/web/next.config.mjs","apps/web/app","apps/web/lib","apps/web/public","package.json","vitest.config.ts"],"commands":[{"run":"pnpm build","exit":0},{"run":"pnpm lint","exit":0}]} -->
  - [x] **IMPROVE**: Scripts de raiz foram reduzidos a delegadores, evitando duplicação de configuração entre workspace e aplicação.
- [x] T006 [CODE] Mover Tauri legado para `apps/desktop-tauri` e atualizar caminhos de build — Refs: US-001, FR-002, NFR-001, AC-003 — Depends: T005
  - [x] **PREP**: Confirmados `frontendDist`, schema da CLI e comandos de build existentes.
  - [x] **EXECUTE**: Shell Rust movido para `apps/desktop-tauri`; build temporário remove/restaura `apps/web/app/api` e gera export estático.
  - [x] **VERIFY**: `pnpm exec vitest run tests/workspace/tauri-legacy.test.ts` passou com 3 testes; export estático foi gerado durante `pnpm build:tauri`.
  - [x] **EVIDENCE**: Configuração aponta para `../web/out` e o script raiz delega ao pacote desktop.
  <!-- specsfy:evidence {"task":"T006","refs":["US-001","FR-002","NFR-001","AC-003"],"files":["apps/desktop-tauri/tauri.conf.json","apps/desktop-tauri/package.json","scripts/build-tauri.mjs","tests/workspace/tauri-legacy.test.ts"],"commands":[{"run":"pnpm exec vitest run tests/workspace/tauri-legacy.test.ts","exit":0}]} -->
  - [x] **IMPROVE**: O build legado foi preservado com restauração em `finally`, evitando deixar as rotas API ausentes após falha.
- [x] T007 [CODE] Criar contratos, domínio, aplicação e adaptador Web em `packages/` e migrar leitura/referências — Refs: US-002, FR-001, FR-003, NFR-002, AC-001, AC-002 — Depends: T004, T005
  - [x] **PREP**: Confirmados contratos existentes, API de versões/busca e leitor SQLite/OPFS.
  - [x] **EXECUTE**: Criados contratos de catálogo/busca, parser independente de plataforma, adaptadores Web e integração no hook/contexto da PWA.
  - [x] **VERIFY**: `pnpm test` passou com 71 testes; parsing, fronteiras, catálogo, busca e leitura compartilhada estão cobertos.
  - [x] **EVIDENCE**: `useBibleVerses` usa `getChapter`; contexto usa `listVersions` e `searchVerses` por adaptadores Web.
  <!-- specsfy:evidence {"task":"T007","refs":["US-002","FR-001","FR-003","NFR-002","AC-001","AC-002"],"files":["packages/contracts/src/index.ts","packages/domain-bible/src/index.ts","packages/application-bible/src/index.ts","packages/adapters-web/src/index.ts","apps/web/features/bible-reader/context/bible-version-context.tsx","apps/web/features/bible-reader/hooks/use-bible.ts","tests/packages/adapters-web.test.ts"],"commands":[{"run":"pnpm test","exit":0},{"run":"pnpm build","exit":0}]} -->
  - [x] **IMPROVE**: O parser recebe livros como entrada, removendo a dependência da lista específica da Web no domínio.

#### Fase 3 — Fechamento

- [x] T008 [DOC] Atualizar `.specsfy/STACK.md`, `.specsfy/RULES.md`, `PROJECT.md`, docs e a evidência da spec — Refs: FR-001, NFR-001, NFR-002 — Depends: T006, T007
  - [x] **PREP**: Conferidas as fronteiras Web, Tauri, pacotes e persistência movidas.
  - [x] **EXECUTE**: Reconstruídos `docs/`, `.specsfy/PACKAGES.md`, `.specsfy/STACK.md` e `.specsfy/DATABASE.md`; registrada em RULES a convenção de lint da aplicação Web em `apps/web`.
  - [x] **VERIFY**: `build_documentation.mjs --check` e monitor de contexto passaram.
  - [x] **EVIDENCE**: Documentação representa `apps/web`, `apps/desktop-tauri` e os quatro pacotes compartilhados.
  <!-- specsfy:evidence {"task":"T008","refs":["FR-001","NFR-001","NFR-002"],"files":[".specsfy/STACK.md",".specsfy/DATABASE.md",".specsfy/RULES.md",".specsfy/PACKAGES.md","docs/README.md","docs/architecture.md","PROJECT.md"],"commands":[{"run":"node .agents/skills/specsfy-documentator/scripts/build_documentation.mjs --project . --check","exit":0},{"run":"node .agents/skills/specsfy-aux-rules/scripts/add_rule.mjs --project . --section Monorepo --rule A configuração e a execução do ESLint da aplicação Web devem permanecer em apps/web; o script lint da raiz deve delegar ao workspace Web.","exit":0},{"run":"node .agents/skills/specsfy-setup/scripts/monitor_context.mjs --project . --check","exit":0}]} -->
  - [x] **IMPROVE**: A documentação foi reconstruída por projeção, evitando manter inventários manuais duplicados.
- [x] T009 [TEST] Executar regressão e rastreabilidade em `tests/packages/`, `tests/workspace/` e `specs/in-progress/0002-fundacao-monorepo-multiplataforma/spec.md` — Refs: US-001, US-002, FR-001, FR-002, FR-003, NFR-001, NFR-002, AC-001, AC-002, AC-003 — Depends: T008
  - [x] **PREP**: Identificadas suítes de aplicação, pacotes, fronteiras e workspace Tauri.
  - [x] **EXECUTE**: Executados lint, testes, build Web, build estático Tauri e rastreabilidade.
  - [x] **VERIFY**: `pnpm test` passou com 71 testes; `pnpm build` passou; `pnpm lint` passou sem erros; `pnpm --filter @open-bible/desktop-tauri exec tauri build --no-bundle` passou; rastreabilidade cobriu 10/10 IDs.
  - [x] **EVIDENCE**: Os três ACs têm testes e evidência; build Tauri validou o export Web e avançou para compilação nativa.
  <!-- specsfy:evidence {"task":"T009","refs":["US-001","US-002","FR-001","FR-002","FR-003","NFR-001","NFR-002","AC-001","AC-002","AC-003"],"files":["tests/packages","tests/workspace","specs/in-progress/0002-fundacao-monorepo-multiplataforma/spec.md","apps/desktop-tauri/target/release/open-bible"],"commands":[{"run":"pnpm lint","exit":0},{"run":"pnpm test","exit":0},{"run":"pnpm build","exit":0},{"run":"pnpm --filter @open-bible/desktop-tauri exec tauri build --no-bundle","exit":0},{"run":"node .agents/skills/specsfy-06-tdd-bdd/scripts/check_traceability.mjs specs/in-progress/0002-fundacao-monorepo-multiplataforma/spec.md . --full-chain","exit":0}]} -->
  - [x] **IMPROVE**: O teste de layout Tauri permanece independente de ambiente gráfico e a suíte raiz cobre todos os testes.

### 15. Ordem de execução

- Caminho crítico: T001/T002/T003 → T004 → T005 → T006/T007 → T008 → T009.
- Tarefas paralelas: T001, T002 e T003; T006 e T007 após T005.
- Estratégia de MVP: PWA e Tauri legado preservados com leitura e referências consumindo o núcleo.

## Ato III — Entregar e validar

### 16. Dependências, riscos e suposições

#### Dependências

- `pnpm` workspaces, Next.js, Vitest, SQLite WASM e Tauri existentes.

#### Riscos

- Caminhos relativos podem quebrar após mover apps → centralizar e cobrir com testes.
- Importações browser no domínio → teste de fronteiras.
- OPFS/worker podem regredir → preservar RPC e paths persistentes.

#### Suposições

- Electron e OpenTUI serão abordados em specs posteriores pelos contratos estabelecidos.

### 17. Decisões

- **DEC-001**: Web em `apps/web` e Tauri em `apps/desktop-tauri` — separa executáveis e mantém legado.
- **DEC-002**: dados OPFS/SQLite não migram — reduz risco offline.
- **DEC-003**: leitura e referências são o primeiro núcleo — menor recorte útil multiplataforma.
- **DEC-004**: Vitest é o runner TDD, exposto por `pnpm test:tdd` — mantém o runner já adotado pelo projeto.

### 18. Definition of Done

- [ ] `Definition Gate` está `Passed`.
- [ ] `Plan Gate` está `Passed`.
- [ ] `Delivery Gate` está `Passed`.
- [ ] Cenários AC passam.
- [ ] Requisitos têm evidência.
- [ ] Tarefas da seção 14 estão concluídas.
- [ ] Testes e checks estáticos passam.
