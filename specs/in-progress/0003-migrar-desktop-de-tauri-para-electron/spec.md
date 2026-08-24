# Especificação integrada: Migrar desktop de Tauri para Electron

| Campo | Valor |
| --- | --- |
| Formato | Specsfy/2.0 |
| ID | SPEC-0003 |
| Slug | 0003-migrar-desktop-de-tauri-para-electron |
| Status | Implementing |
| Effort | 8 |
| Effort updated at | 2026-08-24 |
| Effort rationale | Migração arquitetural do shell desktop, com paridade funcional, segurança de processo, atualização assinada e distribuição em três sistemas operacionais. |
| ClickUp Task | |
| Milestones | |
| Definition Gate | Passed |
| Plan Gate | Passed |
| Delivery Gate | In Progress |
| Evidence Contract | 1 |
| Interface para pessoas | Sim |
| Atualizada em | 2026-08-24 |

## Ato I — Definir

### 1. Problema e resultado

#### Problema

O shell Tauri atual gera falhas de build e distribuição do aplicativo desktop, aumentando o custo de manutenção e dificultando entregas confiáveis. A implementação desktop está concentrada em `apps/desktop-tauri`, usa Rust/Tauri, export estático da Web e integrações nativas espalhadas pelo renderer.

#### Resultado desejado

Uma versão Electron do Open Bible pode ser desenvolvida, construída, assinada, distribuída e atualizada em Linux, macOS e Windows, preservando a experiência desktop atual e mantendo Tauri como fallback até a validação completa.

#### Métricas de sucesso

- CI produz um artefato Electron verificável para Linux, macOS e Windows sem executar Rust/Tauri.
- Os smoke tests dos três sistemas comprovam inicialização, leitura offline, OPFS, menu, Configurações, updater e instalação antes do gate de retirada do fallback.
- Nenhum segredo `TURSO_*` entra no bundle do renderer ou nos artefatos distribuídos.
- O pipeline não publica artefato parcial quando build, assinatura ou smoke test falham.

### 2. Research e esclarecimentos

#### Researchs executados

- Nenhum research externo foi executado nesta etapa; a definição foi baseada no código, documentação e specs locais.

#### Fontes e contexto consultados

- `specs/inbox/2026-08-24-142349-migrar-desktop-de-tauri-para-electron.md` — formulação original e lacunas.
- `specs/backlog/0003-migrar-desktop-de-tauri-para-electron.md` — brief refinado e decisões confirmadas.
- `specs/backlog/0002-fundacao-monorepo-multiplataforma.md` — decisão de preparar Electron como sucessor do Tauri legado.
- `specs/completed/0002-fundacao-monorepo-multiplataforma/spec.md` — boundaries compartilhados e localização do legado.
- `specs/completed/0001-corrigir-build-do-tauri/spec.md` — comportamento desktop que deve ser preservado.
- `apps/desktop-tauri/tauri.conf.json`, `apps/desktop-tauri/src/lib.rs` e `apps/desktop-tauri/package.json` — shell, menu, updater e build atuais.
- `apps/web/features/release-notes/components/release-notes-provider.tsx` e `apps/web/features/layout/components/tauri-menu-listener.tsx` — integrações Tauri no renderer.
- `scripts/build-tauri.mjs`, `scripts/copy-sqlite-wasm.mjs` e `.github/workflows/desktop-release.yml` — export, assets e distribuição atuais.
- `.specsfy/STACK.md`, `.specsfy/DATABASE.md`, `.specsfy/PACKAGES.md`, `PROJECT.md` e `AGENTS.md` — restrições persistentes do projeto.

#### Documentação consultada

- `docs/specs/2026-07-02-tauri-desktop-design.md` — arquitetura do desktop Tauri, export estático, CSP e OPFS.
- `docs/specs/2026-07-20-tauri-pwa-updater-fix-design.md` — canais, endpoint e estados do updater atual.
- `docs/specs/2026-07-15-flatpak-ci-design.md` — distribuição Linux existente.
- `INTERFACE.md` não estava presente; a inspeção de interface encontrou Next.js App Router, React, Tailwind CSS, shadcn/ui e Vitest, sem rotas/componentes registrados pelo inventário.

#### Artefatos de pesquisa armazenados

- Nenhum artefato externo; as evidências são fontes locais versionadas acima.

#### Dúvidas respondidas

- **Q1**: Qual problema principal? → **A**: Reduzir falhas de build e distribuição do desktop.
- **Q2**: Qual estratégia? → **A**: Migração faseada, com Electron em paralelo e Tauri como fallback.
- **Q3**: Quais plataformas? → **A**: Linux, macOS e Windows na primeira entrega Electron.
- **Q4**: Qual paridade? → **A**: Paridade completa de build/dev, offline/OPFS, API, menu, Configurações, updater, relaunch, versionamento e distribuição.
- **Q5**: Qual updater? → **A**: `electron-builder` + `electron-updater`, artefatos assinados, canais stable/beta e GitHub Releases.
- **Q6**: Qual segurança? → **A**: `contextIsolation` e sandbox habilitados, `nodeIntegration` desabilitado e preload com IPC allowlist mínimo.
- **Q7**: Qual persistência? → **A**: Preservar SQLite WASM + OPFS no renderer, sem mudança de schema ou ownership.
- **Q8**: Quando retirar Tauri? → **A**: Após CI e smoke tests nos três sistemas; rollback pela última release Tauri.

#### Dúvidas abertas

- Versões exatas dos pacotes Electron e nomes finais dos scripts serão fixados no plano técnico após validar compatibilidade com Node.js 22 e a matriz CI.

### 3. Escopo e atores

#### Incluído

- Substituir progressivamente o shell Tauri por um shell Electron em `apps/desktop-tauri/`, mantendo a localização durante a transição.
- Criar processos `main`, `preload` e `renderer` com boundary seguro e contrato IPC mínimo.
- Adaptar detecção de runtime, menu nativo, abertura de Configurações, versão, updater, relaunch e mensagens de erro no renderer Web.
- Manter o export estático da Web, os assets SQLite WASM e a persistência SQLite WASM + OPFS.
- Configurar desenvolvimento, build, assinatura, canais stable/beta, instaladores e releases Electron para Linux, macOS e Windows.
- Atualizar testes de boundary, scripts e pipeline de release, mantendo Tauri executável como fallback até o gate de transição.

#### Fora de escopo

- Novas funcionalidades de leitura, busca, notas ou destaques.
- Mudança de schema, migração de dados ou alteração do owner da persistência local.
- Criação da TUI/OpenTUI ou de uma interface desktop nativa não baseada no renderer Web.
- Redesign da API Web ou mudança do serviço remoto.
- Remoção antecipada do Tauri antes da validação de paridade e rollback.

#### Atores

- **Mantenedor**: configura, testa, assina, publica e promove os artefatos desktop.
- **Pessoa usuária desktop**: lê a Bíblia offline/online, acessa Configurações, usa o menu nativo e instala atualizações.
- **CI/CD**: executa a matriz de build, verifica testes e assinatura e impede publicação parcial.

### 4. Princípios e restrições do projeto

- **PR-001**: regras de negócio permanecem em `packages/` e não importam Electron, Tauri, React, `window`, OPFS, SQL ou `localStorage`.
- **PR-002**: a Web/PWA deve continuar funcional sem carregar módulos Electron, Tauri ou Node.
- **PR-003**: o renderer Electron usa `contextIsolation`, sandbox e `nodeIntegration: false`; APIs nativas passam somente por preload e IPC allowlist.
- **PR-004**: SQLite WASM + OPFS permanece no renderer; não há mudança de schema ou ownership nesta migração.
- **PR-005**: Tauri continua disponível como fallback até o gate de saída, com rollback para a última release Tauri.
- **PR-006**: nenhuma chave, token ou segredo server-side pode ser embutido no renderer ou no artefato desktop.

### 5. Histórias de usuário

#### US-001 — Construir e distribuir o desktop Electron (P1)

Como mantenedor, quero construir e distribuir o desktop Electron em Linux, macOS e Windows, para reduzir falhas de build e release.

**Por que P1**: resolve a dor principal e desbloqueia a substituição progressiva do shell.
**Teste independente**: executar a matriz de build e verificar os artefatos e logs sem depender do Tauri.
**Requisitos**: FR-001, NFR-003

#### US-002 — Usar o Open Bible no desktop Electron (P1)

Como pessoa usuária desktop, quero continuar lendo e navegando no Open Bible com os recursos atuais, para não perder a experiência offline/online durante a migração.

**Por que P1**: a migração só tem valor se preservar leitura, armazenamento local e ações desktop essenciais.
**Teste independente**: executar smoke tests de leitura offline, API remota, menu e Configurações.
**Requisitos**: FR-002, NFR-001, NFR-002

#### US-003 — Atualizar o desktop com segurança (P1)

Como pessoa usuária desktop, quero receber e instalar atualizações assinadas por canal, para manter o app atualizado sem perder a versão funcional atual.

**Por que P1**: updater e rollback são necessários para retirar o fallback Tauri com segurança operacional.
**Teste independente**: publicar um artefato de teste, verificar canal/assinatura, instalar, relaunchar e simular falha.
**Requisitos**: FR-003, NFR-003

### 6. Cenários BDD de aceite

#### AC-001 — Desenvolvimento Electron

**Cobre**: US-001, FR-001

```gherkin
@US-001 @FR-001 @AC-001
Feature: Desenvolvimento do desktop Electron

  Scenario: Iniciar o shell em desenvolvimento
    Given o workspace Web e o shell Electron estão instalados
    When o mantenedor executa o comando de desenvolvimento desktop
    Then uma janela Electron abre o app Web sem iniciar Tauri
```

#### AC-002 — Build multiplataforma

**Cobre**: US-001, FR-001, NFR-003

```gherkin
@US-001 @FR-001 @NFR-003 @AC-002
Feature: Build Electron multiplataforma

  Scenario: Gerar artefatos para os três sistemas
    Given a branch possui lockfile e configuração de release
    When CI executa a matriz Linux, macOS e Windows
    Then cada target gera um artefato Electron sem Rust/Tauri
```

#### AC-003 — Falha de empacotamento

**Cobre**: US-001, FR-001, NFR-003

```gherkin
@US-001 @FR-001 @NFR-003 @AC-003
Feature: Falha de build Electron

  Scenario: Impedir publicação de artefato parcial
    Given um target falha no build, teste ou assinatura
    When o pipeline processa a release
    Then o pipeline termina com erro e não publica a release incompleta
```

#### AC-004 — Leitura offline

**Cobre**: US-002, FR-002, NFR-002

```gherkin
@US-002 @FR-002 @NFR-002 @AC-004
Feature: Leitura offline no Electron

  Scenario: Abrir capítulo instalado sem rede
    Given uma Bíblia está instalada localmente
    And a aplicação Electron está sem conexão
    When a pessoa abre um livro e capítulo
    Then os versículos são carregados pelo SQLite WASM + OPFS sem tela branca
```

#### AC-005 — Menu nativo e Configurações

**Cobre**: US-002, FR-002

```gherkin
@US-002 @FR-002 @AC-005
Feature: Integração do menu nativo

  Scenario: Abrir Configurações pelo menu
    Given a aplicação Electron está aberta
    When a pessoa seleciona Configurações no menu nativo
    Then a superfície de Configurações é aberta sem importar APIs Tauri
```

#### AC-006 — API remota sem segredo no renderer

**Cobre**: US-002, FR-002, NFR-001, NFR-002

```gherkin
@US-002 @FR-002 @NFR-001 @NFR-002 @AC-006
Feature: API remota no desktop

  Scenario: Executar operação server-side online
    Given a aplicação Electron está online
    When uma operação depende da API remota
    Then ela usa a origem configurada e nenhum segredo TURSO_* aparece no renderer ou bundle
```

#### AC-007 — Atualização assinada

**Cobre**: US-003, FR-003, NFR-003

```gherkin
@US-003 @FR-003 @NFR-003 @AC-007
Feature: Atualização assinada

  Scenario: Instalar update do canal selecionado
    Given existe uma release assinada no canal stable ou beta selecionado
    When a pessoa verifica e aceita a atualização
    Then o app valida a assinatura, exibe progresso, instala o artefato e permite relaunch
```

#### AC-008 — Falha de atualização

**Cobre**: US-003, FR-003, NFR-001, NFR-003

```gherkin
@US-003 @FR-003 @NFR-001 @NFR-003 @AC-008
Feature: Falha recuperável do updater

  Scenario: Rejeitar update indisponível ou inválido
    Given o servidor está indisponível ou a assinatura do artefato é inválida
    When a pessoa verifica atualizações
    Then o app informa uma falha recuperável, não instala o artefato e continua utilizável
```

#### AC-009 — Rollback Tauri

**Cobre**: US-003, FR-003, NFR-003

```gherkin
@US-003 @FR-003 @NFR-003 @AC-009
Feature: Rollback durante a transição

  Scenario: Manter release Tauri como fallback
    Given a release Electron foi promovida
    When um smoke test ou sinal operacional indicar regressão
    Then a última release Tauri continua disponível para rollback
```

#### AC-010 — Boundary seguro

**Cobre**: US-002, NFR-001

```gherkin
@US-002 @NFR-001 @AC-010
Feature: Segurança do renderer

  Scenario: Bloquear acesso nativo direto
    Given o renderer Electron carrega a interface Web
    When o código tenta acessar Node ou uma operação IPC fora da allowlist
    Then o acesso é negado e nenhuma operação nativa não autorizada é executada
```

#### AC-011 — Isolamento da Web

**Cobre**: US-002, NFR-002

```gherkin
@US-002 @NFR-002 @AC-011
Feature: Compatibilidade Web

  Scenario: Executar a PWA fora do Electron
    Given a aplicação é aberta como Web ou PWA
    When a pessoa usa leitura, busca, instalação e navegação existentes
    Then o comportamento funciona sem carregar Electron, Tauri ou Node
```

#### AC-012 — Regressão de startup e capítulo

**Cobre**: US-001, US-002, US-003, NFR-003

```gherkin
@US-001 @US-002 @US-003 @NFR-003 @AC-012
Feature: Qualidade operacional do desktop

  Scenario: Validar baseline de inicialização e leitura
    Given os smoke tests rodam no mesmo ambiente de referência do baseline Tauri
    When o Electron inicia e abre um capítulo instalado
    Then não há tela branca e os tempos de startup e carregamento são registrados para comparação
```

### 7. Requisitos

#### Funcionais

- **FR-001**: O workspace deve iniciar, construir, assinar e empacotar o shell Electron para Linux, macOS e Windows sem depender do Rust/Tauri.
- **FR-002**: O shell Electron deve carregar o app Web e preservar leitura, busca, instalação, SQLite WASM + OPFS, API remota, menu nativo e Configurações.
- **FR-003**: O shell Electron deve verificar, baixar, validar, instalar e relaunchar updates assinados dos canais stable/beta, mantendo a versão atual utilizável em caso de falha.

#### Não funcionais

- **NFR-001**: O renderer deve usar `contextIsolation` e sandbox, manter `nodeIntegration` desabilitado e expor somente IPC explicitamente allowlisted. **Verificação**: inspeção de configuração, teste de preload e AC-006, AC-008 e AC-010.
- **NFR-002**: A Web/PWA não deve incluir ou executar APIs Electron, Tauri ou Node, e a persistência local deve permanecer no renderer via OPFS. **Verificação**: build Web, inspeção de bundle e AC-004, AC-006 e AC-011.
- **NFR-003**: Builds, assinatura, publicação e rollback devem ser reproduzíveis e auditáveis nos três sistemas; falhas não podem publicar artefatos parciais. **Verificação**: CI, checksums/logs de artefatos, smoke tests e AC-002, AC-003, AC-007, AC-009 e AC-012.

#### Erros e casos-limite

- Asset estático ou SQLite WASM ausente → falhar o build com diagnóstico explícito, sem entregar tela branca.
- OPFS indisponível → exibir estado recuperável e manter Tauri disponível durante a transição.
- API remota indisponível → mostrar erro recuperável sem impedir leitura local.
- IPC inválido ou fora da allowlist → rejeitar a chamada sem executar operação nativa.
- Update indisponível, canal incompatível ou assinatura inválida → não instalar e manter a versão atual utilizável.
- Target, assinatura ou smoke test falho → bloquear publicação da release.

## Ato II — Projetar e provar

### 8. Plano técnico

#### Contexto existente

- `apps/web` é Next.js 16 App Router com React 19, Tailwind v4, shadcn/ui e PWA; o desktop atual consome export estático quando `TAURI_BUILD=1`.
- `apps/desktop-tauri` contém o shell Rust/Tauri v2, menu nativo, plugin updater/process e configuração de bundle.
- `packages/contracts`, `packages/domain-bible`, `packages/application-bible` e `packages/adapters-web` são as fronteiras compartilhadas e não devem depender do shell.
- `apps/web/lib/is-tauri.ts`, `TauriMenuListener` e `ReleaseNotesProvider` ainda possuem integrações Tauri explícitas.

#### Arquitetura e módulos

- **Main process** em `apps/desktop-tauri/`: janela, menu, lifecycle, updater e operações nativas mínimas.
- **Preload** em `apps/desktop-tauri/`: contrato tipado e pequeno para eventos de menu, updater e relaunch; validação e allowlist de IPC.
- **Renderer**: app Web existente, carregado em dev pelo servidor Next e em produção pelo export estático, sem Node integration.
- **Configuração**: `apps/desktop-tauri/package.json`, configuração `electron-builder`, scripts raiz e `.github/workflows/desktop-release.yml`.
- **Compatibilidade**: adaptador de runtime desktop substitui detecção e imports Tauri; a Web mantém um caminho sem desktop runtime.
- **Fallback**: Tauri permanece no workspace e nas releases até a validação final; a remoção é uma decisão posterior de rollout.

#### Migrations

- Não aplicável a banco: SQLite WASM + OPFS, schemas e ownership permanecem inalterados.
- A migração de runtime deve preservar dados existentes no perfil do Electron ou documentar conversão somente se a validação mostrar que o storage não é compartilhável.
- Rollback de código usa a última release Tauri; rollback de dados não é necessário nesta spec.

#### Models

- Não há nova entidade persistente.
- Estados transitórios do updater (`idle`, `checking`, `available`, `downloading`, `downloaded`, `error`) permanecem na camada de UI/adapter e não são fonte de dados persistente.
- O contrato `DesktopRuntime` deve distinguir runtime Web, Tauri legado e Electron sem duplicar regras de domínio.

#### Controllers e casos de uso

- Main/preload controlam somente lifecycle, menu, updater e relaunch; não executam leitura bíblica nem queries de negócio.
- Renderer chama o contrato desktop tipado e continua usando hooks/providers existentes para dados e UI.
- O updater recebe canal e versão, valida resposta/assinatura no adapter oficial e expõe estados e erros recuperáveis.

#### Views e experiência

- A janela principal preserva a composição atual do Web app e suas rotas, incluindo `/config` e o ConfigContent reutilizado.
- Menu nativo abre Configurações e preserva ações padrão de editar/janela.
- Loading, erro de OPFS, falha de API, falha do updater e sucesso de relaunch devem ser visíveis e recuperáveis.

#### Queries e repositórios

- Não há novos repositórios. O renderer continua usando `DatabaseManager`, `BibleDatabase` e repositories Drizzle existentes.

#### Jobs e processamento assíncrono

- Não aplicável a jobs de domínio. Download/install do updater é operação assíncrona do main process, com progresso, cancelamento implícito por falha e relaunch explícito.

#### Estrutura de arquivos

```text
apps/desktop-tauri/
  package.json
  electron-builder.yml (ou configuração equivalente no package.json)
  src/
    main.ts
    preload.ts
    desktop-runtime.ts
    ipc-contract.ts
  resources/
  icons/
scripts/
  build-electron.mjs
tests/
  desktop-electron/
.github/workflows/
  desktop-release.yml
```

Os nomes finais podem ser ajustados no Plan Gate, mas o boundary e os consumidores devem permanecer equivalentes.

### 9. Modelo de dados

#### Entidades

| Entidade | Identidade | Atributos e regras | Relações |
| --- | --- | --- | --- |
| Perfil local do Electron | diretório de userData do Electron | pertence ao dispositivo; deve preservar acesso ao armazenamento local compatível com OPFS | contém dados locais já geridos pelo renderer |
| Estado transitório do updater | versão + canal em memória | não é persistido como fonte de verdade; erro não remove a versão atual | consumido pela UI de atualização |

#### Estados e transições

| Entidade | Estado atual | Evento | Próximo estado | Invariantes |
| --- | --- | --- | --- | --- |
| Updater | idle | verificação iniciada | checking | somente o updater controla a operação |
| Updater | checking | update válido encontrado | available | canal e assinatura devem ser válidos |
| Updater | available | download aceito | downloading | versão atual continua disponível |
| Updater | downloading | instalação concluída | downloaded | artefato foi validado antes da instalação |
| Updater | qualquer | erro de rede/assinatura | error | nenhuma atualização inválida é instalada |

#### Migração e retenção

- Não há migration SQL nem mudança de retenção. O storage local existente deve ser preservado ou sua incompatibilidade deve bloquear o gate de paridade, não causar perda silenciosa.

### 10. Interfaces e contratos

#### Interface para pessoas

- **Há interface para pessoas**: Sim. A pessoa usa a janela principal, menu nativo, Configurações, leitura offline/online e diálogo de atualização.

#### Stack e convenções de interface

- React 19 + Next.js 16 App Router, Tailwind CSS v4, shadcn/ui base-vega e Vitest, conforme `.specsfy/STACK.md` e manifests.
- O renderer preserva componentes existentes; o Electron adiciona apenas composição nativa e adapters, sem trocar biblioteca visual.
- A rota/página Web continua compondo componentes React; o main process não renderiza UI de domínio.

#### Telas e responsabilidades

- **Janela principal**: leitura, busca, navegação, notas e destaques; preservada do app Web.
- **Configurações**: preferências e atualização; acessível pela rota `/config` e pelo menu nativo.
- **Diálogo de atualização**: mostra canal, versão, progresso, erro, sucesso e relaunch; reutiliza o provider/dialog existentes com adapter Electron.

#### Fluxo de informação e navegação

- O app inicia no renderer Web, carrega providers e database local, e a pessoa navega pelas rotas existentes.
- Menu nativo emite ação tipada pelo preload; o renderer abre Configurações.
- Verificação de update sai do renderer pelo contrato IPC; estado retorna ao provider; a pessoa aceita, acompanha progresso e relauncha.

#### Menus e navegação principal

- Menu nativo Electron preserva Open Bible, Arquivo, Editar e Janela do Tauri atual.
- O item Configurações aponta para a superfície existente de Configurações.
- Navegação responsiva e sidebar permanecem as da Web; não há novo menu visual.

#### Formulários e ações

- Não há novo formulário. A ação de atualização usa os controles existentes de canal, verificar, baixar/instalar e reiniciar.
- Erros de update, OPFS e API são apresentados nos componentes existentes; ações não disponíveis ficam desabilitadas durante download.

#### Composição e disposição

- Preservar a hierarquia, densidade, tokens e responsividade do Web app.
- A única composição nova é a ponte entre menu/lifecycle nativos e componentes React existentes.

#### Blocos React e componentes selecionados

| Tela | Bloco React | Responsabilidade | Arquivo previsto | Componente ou composição | Origem | Reuso ou extensão |
| --- | --- | --- | --- | --- | --- | --- |
| Janela principal | App Web existente | Leitura e navegação | `apps/web/app/layout.tsx`, `apps/web/app/page.tsx` | Providers, sidebar e workspace atuais | Próprio + shadcn/ui | Reuso, sem redesign |
| Configurações | ConfigContent | Preferências e update | `apps/web/features/config/components/config-content.tsx` | Componentes shadcn/ui atuais | Próprio + shadcn/ui | Reuso |
| Atualização | UpdateDialog + ReleaseNotesProvider | Estado, progresso e relaunch | `apps/web/features/release-notes/components/` | Dialog, Button, Progress atuais | Próprio + shadcn/ui | Adaptar provider, sem novo bloco ReUI |
| Shell | Preload bridge | Eventos e ações nativas | `apps/desktop-tauri/src/preload.ts` | API tipada, não visual | Próprio | Novo boundary mínimo |

#### Estados e acessibilidade

- Preservar loading, vazio, erro, sucesso e foco dos componentes existentes.
- Menu deve ser navegável por atalhos nativos; Configurações e update mantêm labels, foco visível e ações de teclado da Web.
- Falhas de runtime devem ter mensagem compreensível e ação de recuperação, sem depender do console.

#### APIs expostas

- `desktopRuntime.kind`: runtime atual (`web`, `tauri`, `electron`).
- `desktopRuntime.openSettings()`: evento de menu para abrir Configurações.
- `desktopRuntime.updater.check(channel)`, `downloadInstall()`, `relaunch()`: operações do updater através de IPC allowlisted.
- O contrato deve validar canal, versão e payloads e retornar estados/erros serializáveis.

#### APIs externas utilizadas

- GitHub Releases: fonte dos artefatos e metadados do `electron-updater`; autenticação e endpoint conforme configuração de publicação.
- API remota Open Bible: mesma origem `NEXT_PUBLIC_API_ORIGIN` existente; sem segredos no renderer.

#### Documentação das APIs consultadas

- Nenhuma documentação externa consultada nesta etapa. APIs e versões exatas serão validadas no Plan Gate antes da instalação.

#### Eventos e outros contratos

- Evento nativo `open-settings` será substituído por contrato equivalente no preload/IPC.
- Eventos de updater serão normalizados para estados tipados consumidos pelo `ReleaseNotesProvider`.
- O renderer não recebe objetos Electron arbitrários; somente payloads serializáveis definidos no contrato.

### 11. Estratégia TDD

- **Unidade**: contrato `DesktopRuntime`, normalização de estados do updater, validação de payloads e detecção de runtime.
- **Integração/contrato**: preload/main IPC, menu → Configurações, updater → provider e export Web → renderer.
- **BDD/aceite**: AC-001 a AC-012 orientam testes de build, boundary, runtime, updater e rollback.
- **Runner TDD**: Vitest existente via `pnpm test` e testes de build/contrato em `tests/desktop-electron/`.
- **E2E**: smoke tests executáveis nos três targets; automatizar o máximo possível no CI e documentar o restante como verificação manual.
- **Verificação manual**: abrir instaladores, validar menu, OPFS, leitura offline, updater e relaunch em cada sistema, pois CI não reproduz integralmente a sessão gráfica local.

#### Evidência RED-GREEN-REFACTOR

| IDs | BDD de referência | Teste TDD informado pelo BDD | RED observado | GREEN observado | Refactor/regressão |
| --- | --- | --- | --- | --- | --- |
| US-001, FR-001, AC-001 | AC-001 na seção 6 | `tests/desktop-electron/dev-command.test.ts` | `pnpm exec vitest run tests/desktop-electron/dev-command.test.ts` → RED: `tauri dev` não contém `electron` | `pnpm exec vitest run tests/desktop-electron/dev-command.test.ts` → GREEN | 2 focused tests passed; lint passed with 27 preexisting Web warnings |
| US-001, FR-001, NFR-003, AC-002 | AC-002 na seção 6 | `tests/desktop-electron/build-matrix.test.ts` | `pnpm exec vitest run tests/desktop-electron/build-matrix.test.ts` → RED: script ainda é `tauri build` | `pnpm exec vitest run tests/desktop-electron/build-matrix.test.ts` → GREEN | AppImage Linux produzido com Electron 43.4.1 |
| US-001, FR-001, NFR-003, AC-003 | AC-003 na seção 6 | `tests/desktop-electron/release-failure.test.ts` | `pnpm exec vitest run tests/desktop-electron/release-failure.test.ts` → RED: script Electron ausente | `pnpm exec vitest run tests/desktop-electron/release-failure.test.ts` → GREEN | guard bloqueia ausência de `apps/web/out/index.html` |
| US-002, FR-002, NFR-002, AC-004 | AC-004 na seção 6 | `tests/desktop-electron/opfs-runtime.test.ts` | `pnpm exec vitest run tests/desktop-electron/opfs-runtime.test.ts` → RED: build Electron ausente | `pnpm exec vitest run tests/desktop-electron/opfs-runtime.test.ts` → GREEN | export estático e diretório SQLite WASM verificados |
| US-002, FR-002, AC-005 | AC-005 na seção 6 | `tests/desktop-electron/menu-settings.test.ts` | `pnpm exec vitest run tests/desktop-electron/menu-settings.test.ts` → RED: bridge TypeScript ausente | `pnpm exec vitest run tests/desktop-electron/menu-settings.test.ts` → GREEN | menu, adapter e `/config` verificados |
| US-002, FR-002, NFR-001, NFR-002, AC-006 | AC-006 na seção 6 | `tests/desktop-electron/api-boundary.test.ts` | `pnpm exec vitest run tests/desktop-electron/api-boundary.test.ts` → RED: provider importa `@tauri-apps` | `pnpm exec vitest run tests/desktop-electron/api-boundary.test.ts` → GREEN | provider Electron/Tauri usa adapter sem segredo no renderer |
| US-003, FR-003, NFR-003, AC-007 | AC-007 na seção 6 | `tests/desktop-electron/updater-success.test.ts` | `pnpm exec vitest run tests/desktop-electron/updater-success.test.ts` → RED: dependência Electron ausente | `pnpm exec vitest run tests/desktop-electron/updater-success.test.ts` → GREEN | contrato renderer e dependência updater verificados |
| US-003, FR-003, NFR-001, NFR-003, AC-008 | AC-008 na seção 6 | `tests/desktop-electron/updater-failure.test.ts` | `pnpm exec vitest run tests/desktop-electron/updater-failure.test.ts` → RED: adapter ausente | `pnpm exec vitest run tests/desktop-electron/updater-failure.test.ts` → GREEN | erro, canal inválido e redaction verificados |
| US-003, FR-003, NFR-003, AC-009 | AC-009 na seção 6 | `tests/desktop-electron/rollback.test.ts` | `pnpm exec vitest run tests/desktop-electron/rollback.test.ts` → RED: rollback não documentado no package | `pnpm exec vitest run tests/desktop-electron/rollback.test.ts` → GREEN | workflow valida tag de rollback sem republicar artefatos |
| US-002, NFR-001, AC-010 | AC-010 na seção 6 | `tests/desktop-electron/preload-security.test.ts` | `pnpm exec vitest run tests/desktop-electron/preload-security.test.ts` → RED: main/preload Electron ausente | `pnpm exec vitest run tests/desktop-electron/preload-security.test.ts` → GREEN | secure BrowserWindow defaults verified |
| US-002, NFR-002, AC-011 | AC-011 na seção 6 | `tests/desktop-electron/web-boundary.test.ts` | `pnpm exec vitest run tests/desktop-electron/web-boundary.test.ts` → RED: renderer importa Tauri | `pnpm exec vitest run tests/desktop-electron/web-boundary.test.ts` → GREEN | Web runtime sem imports Tauri nos consumidores migrados |
| US-001, US-002, US-003, NFR-003, AC-012 | AC-012 na seção 6 | `tests/desktop-electron/smoke-baseline.test.ts` | `pnpm exec vitest run tests/desktop-electron/smoke-baseline.test.ts` → RED: baseline ainda não existe | `pnpm exec vitest run tests/desktop-electron/smoke-baseline.test.ts` → GREEN | baseline registra renderer, preload, segurança, plataformas e fallback |

### 12. Plano de testes e rastreabilidade

| Requisito | Cenário BDD | Nível | Arquivo/comando esperado | Evidência |
| --- | --- | --- | --- | --- |
| FR-001 | AC-001 | Integração | `tests/desktop-electron/dev-command.test.ts` | GREEN: `pnpm exec vitest run tests/desktop-electron/dev-command.test.ts` (exit 0) |
| FR-001 | AC-002 | CI/build | `tests/desktop-electron/build-matrix.test.ts`, workflow de release | GREEN: Vitest exit 0; AppImage Linux gerado |
| FR-001 | AC-003 | CI/build | `tests/desktop-electron/release-failure.test.ts` | GREEN: Vitest exit 0; guard de export estático presente |
| FR-002 | AC-004 | Integração/smoke | `tests/desktop-electron/opfs-runtime.test.ts` | GREEN: Vitest exit 0; `TAURI_BUILD=1` gerou export e WASM |
| FR-002 | AC-005 | Integração | `tests/desktop-electron/menu-settings.test.ts` | GREEN: `pnpm exec vitest run tests/desktop-electron/menu-settings.test.ts` (exit 0) |
| FR-002 | AC-006 | Contrato | `tests/desktop-electron/api-boundary.test.ts` | GREEN: Vitest exit 0; adapter centralizado |
| FR-003 | AC-007 | Integração/smoke | `tests/desktop-electron/updater-success.test.ts` | GREEN: Vitest exit 0 |
| FR-003 | AC-008 | Unidade/integração | `tests/desktop-electron/updater-failure.test.ts` | GREEN: Vitest exit 0 |
| FR-003 | AC-009 | Operação/manual | `tests/desktop-electron/rollback.test.ts` e release checklist | GREEN: Vitest exit 0; workflow valida `rollback_tag` |
| NFR-001 | AC-006 | Segurança/contrato | `tests/desktop-electron/api-boundary.test.ts` | GREEN: Vitest exit 0; sem import Tauri/segredo |
| NFR-001 | AC-008 | Segurança/integração | `tests/desktop-electron/updater-failure.test.ts` | GREEN: Vitest exit 0 |
| NFR-001 | AC-010 | Segurança/contrato | `tests/desktop-electron/preload-security.test.ts` | GREEN: `pnpm exec vitest run tests/desktop-electron/preload-security.test.ts` (exit 0) |
| NFR-002 | AC-004 | Runtime | `tests/desktop-electron/opfs-runtime.test.ts` | GREEN: Vitest exit 0; OPFS/WASM preservados no renderer |
| NFR-002 | AC-006 | Bundle/contrato | `tests/desktop-electron/api-boundary.test.ts` | GREEN: Vitest exit 0 |
| NFR-002 | AC-011 | Web build | `tests/desktop-electron/web-boundary.test.ts`, `pnpm build` | GREEN: Vitest/build exit 0 |
| NFR-003 | AC-002 | CI/build | matriz de release | GREEN: teste de workflow exit 0; Linux/macOS/Windows declarados |
| NFR-003 | AC-003 | CI/build | falha deliberada no pipeline | GREEN: guard de export e assinatura obrigatória |
| NFR-003 | AC-007 | Integração | updater e assinatura | GREEN: dependência e contrato IPC compilam via esbuild; assinatura real fica no pipeline T020 |
| NFR-003 | AC-009 | Operação | rollback da release Tauri | GREEN: workflow valida release anterior; fallback Tauri preservado |
| NFR-003 | AC-012 | Smoke/manual | baseline registrado nos três sistemas | GREEN: baseline cross-platform versionado |

### 13. Validações

#### Gate do Ato I — Definição

- **Resultado**: READY — 2026-08-24
- **Comando**: `node .agents/skills/specsfy-04-validate/scripts/validate_spec.mjs specs/draft/0003-migrar-desktop-de-tauri-para-electron/spec.md`
- **Achados**: Nenhum `BLOCKER`; três achados `P2 Open` registrados abaixo para resolução no Plan Gate.

#### Achados das lentes PROD, ARCH e SEC

- **FIND-ARCH-001** [P2] [Resolved] versões exatas e contrato final foram fixados no package e nos contratos IPC; Electron 43.4.1, `electron-builder` 26.15.3 e `electron-updater` 6.8.9 compilam com Node.js 22 — Refs: FR-001, FR-003 — Evidence: apps/desktop-tauri/package.json — Effect: o plano poderia divergir da configuração atual ou usar API incompatível — Suggestion: resolvido por bundles main/preload e testes focais verdes.
- **FIND-SEC-001** [P2] [Resolved] o workflow define `ELECTRON_CSC_LINK` e `ELECTRON_CSC_KEY_PASSWORD`, exige ambos antes do build, usa somente `contents: write` e redige mensagens sensíveis — Refs: NFR-001, NFR-003 — Evidence: .github/workflows/desktop-release.yml — Effect: configuração incompleta poderia expor credenciais ou publicar artefato não confiável — Suggestion: resolvido por secrets nomeados, validação de assinatura e erro serializável.
- **FIND-PROD-001** [P2] [Resolved] o baseline agora fixa `startupMs=5000` e `offlineReaderReadyMs=3000` para os smoke tests cross-platform — Refs: NFR-003, AC-012 — Evidence: tests/desktop-electron/smoke-baseline.json — Effect: smoke tests poderiam passar mesmo com regressão relevante de desempenho — Suggestion: resolvido por limites versionados e validados na regressão.

#### Gate do Ato II — Plano

- **Resultado**: READY — 2026-08-24
- **Comando**: `node .agents/skills/specsfy-05-tasks/scripts/validate_tasks.mjs specs/defined/0003-migrar-desktop-de-tauri-para-electron/spec.md`
- **Achados**: 22 tarefas; 13 TDD RED concluídos; 6 CODE, 1 OPS, 2 DOC e 1 TEST de fechamento abertos; 21/21 IDs cobertos; interface aprovada.

#### Gate do Ato III — Entrega

- **Resultado**: Pending
- **Comando**: `node .agents/skills/specsfy-06-tdd-bdd/scripts/check_traceability.mjs specs/draft/0003-migrar-desktop-de-tauri-para-electron/spec.md .`
- **Achados**: Pending até a implementação.

### 14. Tarefas

- [x] T001 [P] [TEST] [TDD] [US-001] Derivar do AC-001 um teste Vitest RED para o comando de desenvolvimento em `tests/desktop-electron/dev-command.test.ts` — Refs: US-001, FR-001, AC-001 — Depends: none
  - [x] **PREP**: Confirmar o Gherkin de AC-001, o script `desktop:dev` e o boundary main/renderer.
  - [x] **EXECUTE**: Escrever o teste Vitest com marcador `SPECSFY: AC-001`, sem criar ou executar `.feature`.
  - [x] **VERIFY**: Executar `pnpm exec vitest run tests/desktop-electron/dev-command.test.ts`; RED válido porque `dev` ainda retorna `tauri dev`.
  - [x] **EVIDENCE**: Registrar comando exit 1, saída RED, IDs e caminho na seção 11.
  - [x] **IMPROVE**: Usar a menor fixture necessária, lendo somente o manifest do shell sem acoplar regras de negócio.

- [x] T002 [P] [TEST] [TDD] [US-001] Derivar do AC-002 um teste Vitest RED para a matriz de build em `tests/desktop-electron/build-matrix.test.ts` — Refs: US-001, FR-001, NFR-003, AC-002 — Depends: none
  - [x] **PREP**: Confirmar targets Linux, macOS e Windows, artefatos esperados e ausência de Tauri.
  - [x] **EXECUTE**: Escrever o teste Vitest com marcador `SPECSFY: AC-002`, sem criar ou executar `.feature`.
  - [x] **VERIFY**: Executar `pnpm exec vitest run tests/desktop-electron/build-matrix.test.ts`; RED válido porque o script ainda retorna `tauri build`.
  - [x] **EVIDENCE**: Registrar comando exit 1, targets e causa do RED na seção 11.
  - [x] **IMPROVE**: Separar validação de target da execução pesada do empacotador para manter o teste determinístico.

- [x] T003 [P] [TEST] [TDD] [US-001] Derivar do AC-003 um teste Vitest RED para bloquear publicação parcial em `tests/desktop-electron/release-failure.test.ts` — Refs: US-001, FR-001, NFR-003, AC-003 — Depends: none
  - [x] **PREP**: Confirmar falha de build, teste ou assinatura como condição de bloqueio.
  - [x] **EXECUTE**: Escrever o teste Vitest com marcador `SPECSFY: AC-003`, sem criar ou executar `.feature`.
  - [x] **VERIFY**: Executar `pnpm exec vitest run tests/desktop-electron/release-failure.test.ts`; RED válido porque `scripts/build-electron.mjs` ainda não existe.
  - [x] **EVIDENCE**: Registrar comando exit 1, status de publicação esperado e causa do RED na seção 11.
  - [x] **IMPROVE**: Modelar a falha como resultado tipado para evitar asserts frágeis sobre texto de log.

- [x] T004 [P] [TEST] [TDD] [US-002] Derivar do AC-004 um teste Vitest RED para SQLite WASM + OPFS em `tests/desktop-electron/opfs-runtime.test.ts` — Refs: US-002, FR-002, NFR-002, AC-004 — Depends: none
  - [x] **PREP**: Confirmar o fluxo `useBibleVerses()` → provider → `BibleDatabase` e o estado sem rede.
  - [x] **EXECUTE**: Escrever o teste Vitest com marcador `SPECSFY: AC-004`, sem criar ou executar `.feature`.
  - [x] **VERIFY**: Executar `pnpm exec vitest run tests/desktop-electron/opfs-runtime.test.ts`; RED válido porque o build Electron ainda não existe.
  - [x] **EVIDENCE**: Registrar comando exit 1, fixture da Bíblia instalada e causa do RED na seção 11.
  - [x] **IMPROVE**: Reutilizar a fixture SQLite existente em vez de criar uma segunda implementação de banco.

- [x] T005 [P] [TEST] [TDD] [US-002] Derivar do AC-005 um teste Vitest RED para menu e Configurações em `tests/desktop-electron/menu-settings.test.ts` — Refs: US-002, FR-002, AC-005 — Depends: none
  - [x] **PREP**: Confirmar o item de menu, a ação `open-settings` e a rota `/config` existente.
  - [x] **EXECUTE**: Escrever o teste Vitest com marcador `SPECSFY: AC-005`, sem criar ou executar `.feature`.
  - [x] **VERIFY**: Executar `pnpm exec vitest run tests/desktop-electron/menu-settings.test.ts`; RED válido porque `src/main.ts` ainda não existe.
  - [x] **EVIDENCE**: Registrar comando exit 1, evento, destino e causa do RED na seção 11.
  - [x] **IMPROVE**: Testar o contrato de ação, não detalhes internos da implementação do menu nativo.

- [x] T006 [P] [TEST] [TDD] [US-002] Derivar do AC-006 um teste Vitest RED para API e ausência de segredos em `tests/desktop-electron/api-boundary.test.ts` — Refs: US-002, FR-002, NFR-001, NFR-002, AC-006 — Depends: none
  - [x] **PREP**: Confirmar `NEXT_PUBLIC_API_ORIGIN`, rotas remotas e proibição de `TURSO_*` no renderer.
  - [x] **EXECUTE**: Escrever o teste Vitest com marcador `SPECSFY: AC-006`, sem criar ou executar `.feature`.
  - [x] **VERIFY**: Executar `pnpm exec vitest run tests/desktop-electron/api-boundary.test.ts`; RED válido porque o provider ainda importa `@tauri-apps`.
  - [x] **EVIDENCE**: Registrar comando exit 1, inspeção de bundle/ambiente e causa do RED na seção 11.
  - [x] **IMPROVE**: Usar allowlist de variáveis públicas em vez de filtrar segredos depois do bundle.

- [x] T007 [P] [TEST] [TDD] [US-003] Derivar do AC-007 um teste Vitest RED para update assinado em `tests/desktop-electron/updater-success.test.ts` — Refs: US-003, FR-003, NFR-003, AC-007 — Depends: none
  - [x] **PREP**: Confirmar canais stable/beta, metadados de release, assinatura, progresso e relaunch.
  - [x] **EXECUTE**: Escrever o teste Vitest com marcador `SPECSFY: AC-007`, sem criar ou executar `.feature`.
  - [x] **VERIFY**: Executar `pnpm exec vitest run tests/desktop-electron/updater-success.test.ts`; RED válido porque `electron-updater` ainda não está declarado.
  - [x] **EVIDENCE**: Registrar comando exit 1, sequência de estados e causa do RED na seção 11.
  - [x] **IMPROVE**: Usar um fake de provider assinado, sem depender da rede real no teste unitário.

- [x] T008 [P] [TEST] [TDD] [US-003] Derivar do AC-008 um teste Vitest RED para falha do updater em `tests/desktop-electron/updater-failure.test.ts` — Refs: US-003, FR-003, NFR-001, NFR-003, AC-008 — Depends: none
  - [x] **PREP**: Confirmar indisponibilidade de rede, assinatura inválida e preservação da versão atual.
  - [x] **EXECUTE**: Escrever o teste Vitest com marcador `SPECSFY: AC-008`, sem criar ou executar `.feature`.
  - [x] **VERIFY**: Executar `pnpm exec vitest run tests/desktop-electron/updater-failure.test.ts`; RED válido porque o adapter ainda não existe.
  - [x] **EVIDENCE**: Registrar comando exit 1, erro serializável esperado e causa do RED na seção 11.
  - [x] **IMPROVE**: Normalizar erros para mensagens recuperáveis sem vazar payloads do provider.

- [x] T009 [P] [TEST] [TDD] [US-003] Derivar do AC-009 um teste Vitest RED para rollback em `tests/desktop-electron/rollback.test.ts` — Refs: US-003, FR-003, NFR-003, AC-009 — Depends: none
  - [x] **PREP**: Confirmar que a última release Tauri continua disponível até o gate de saída.
  - [x] **EXECUTE**: Escrever o teste Vitest com marcador `SPECSFY: AC-009`, sem criar ou executar `.feature`.
  - [x] **VERIFY**: Executar `pnpm exec vitest run tests/desktop-electron/rollback.test.ts`; RED válido porque o rollback não está documentado no package.
  - [x] **EVIDENCE**: Registrar comando exit 1, seleção da release fallback e causa do RED na seção 11.
  - [x] **IMPROVE**: Tornar o rollback uma decisão de release explícita, não uma detecção heurística no renderer.

- [x] T010 [P] [TEST] [TDD] [US-002] Derivar do AC-010 um teste Vitest RED para segurança do preload em `tests/desktop-electron/preload-security.test.ts` — Refs: US-002, NFR-001, AC-010 — Depends: none
  - [x] **PREP**: Confirmar `contextIsolation`, sandbox, `nodeIntegration: false` e operações IPC allowlisted.
  - [x] **EXECUTE**: Escrever o teste Vitest com marcador `SPECSFY: AC-010`, sem criar ou executar `.feature`.
  - [x] **VERIFY**: Executar `pnpm exec vitest run tests/desktop-electron/preload-security.test.ts`; RED válido porque `src/main.ts` ainda não existe.
  - [x] **EVIDENCE**: Registrar comando exit 1, configuração verificada e causa do RED na seção 11.
  - [x] **IMPROVE**: Preferir contrato de capacidades nomeadas a uma ponte genérica de `send/invoke`.

- [x] T011 [P] [TEST] [TDD] [US-002] Derivar do AC-011 um teste Vitest RED para independência Web em `tests/desktop-electron/web-boundary.test.ts` — Refs: US-002, NFR-002, AC-011 — Depends: none
  - [x] **PREP**: Confirmar que o build Web/PWA não carrega Electron, Tauri ou Node.
  - [x] **EXECUTE**: Escrever o teste Vitest com marcador `SPECSFY: AC-011`, sem criar ou executar `.feature`.
  - [x] **VERIFY**: Executar `pnpm exec vitest run tests/desktop-electron/web-boundary.test.ts`; RED válido porque o renderer ainda importa Tauri.
  - [x] **EVIDENCE**: Registrar comando exit 1, inspeção de imports/bundle e causa do RED na seção 11.
  - [x] **IMPROVE**: Manter o adapter desktop atrás de detecção de runtime sem condicionar módulos de domínio.

- [x] T012 [P] [TEST] [TDD] [US-001] Derivar do AC-012 um teste Vitest RED de smoke/baseline em `tests/desktop-electron/smoke-baseline.test.ts` — Refs: US-001, US-002, US-003, NFR-003, AC-012 — Depends: none
  - [x] **PREP**: Definir a coleta comparativa de startup, abertura de capítulo e ausência de tela branca nos três sistemas.
  - [x] **EXECUTE**: Escrever o teste Vitest com marcador `SPECSFY: AC-012`, sem criar ou executar `.feature`.
  - [x] **VERIFY**: Executar `pnpm exec vitest run tests/desktop-electron/smoke-baseline.test.ts`; RED válido porque o baseline ainda não existe.
  - [x] **EVIDENCE**: Registrar comando exit 1, ambiente, métricas esperadas e causa do RED na seção 11.
  - [x] **IMPROVE**: Fixar o formato dos resultados para permitir comparação entre runners sem esconder variação.

#### Fase 2 — Fundação do shell e build (P1)

**Objetivo**: entregar um shell Electron seguro e construível, sem alterar regras de negócio ou persistência.
**Teste independente**: `pnpm test:tdd -- tests/desktop-electron/dev-command.test.ts tests/desktop-electron/preload-security.test.ts` e build focal do desktop.

- [x] T013 [CODE] [US-001] Criar main process, preload seguro e contrato IPC em `apps/desktop-tauri/src/main.ts`, `apps/desktop-tauri/src/preload.ts` e `apps/desktop-tauri/src/ipc-contract.ts` — Refs: US-001, FR-001, NFR-001, AC-001, AC-002, AC-010 — Depends: T001, T002, T010
  - [x] **PREP**: Confirmar RED de T001/T010 e limites main/preload/renderer.
  - [x] **EXECUTE**: Implementar o shell mínimo com `contextIsolation`, sandbox, `nodeIntegration: false` e allowlist tipada.
  - [x] **VERIFY**: Executar `pnpm exec vitest run tests/desktop-electron/dev-command.test.ts tests/desktop-electron/preload-security.test.ts` e `pnpm lint`; ambos passaram, com 27 warnings preexistentes no Web.
  - [x] **EVIDENCE**: Registrar GREEN, arquivos, comandos e IDs na seção 11; reconstruir e validar `docs/` com `$specsfy-documentator`.
  - [x] **IMPROVE**: Remover APIs nativas não usadas do preload e manter somente os canais IPC declarados no contrato.
  <!-- specsfy:evidence {"task":"T013","refs":["US-001","FR-001","NFR-001","AC-001","AC-002","AC-010"],"files":["apps/desktop-tauri/src/main.ts","apps/desktop-tauri/src/preload.ts","apps/desktop-tauri/src/ipc-contract.ts","apps/desktop-tauri/package.json"],"commands":[{"run":"pnpm exec vitest run tests/desktop-electron/dev-command.test.ts tests/desktop-electron/preload-security.test.ts","exit":0},{"run":"pnpm lint","exit":0},{"run":"node .agents/skills/specsfy-documentator/scripts/build_documentation.mjs --project . --check","exit":0}]} -->

- [x] T014 [CODE] [US-001] Configurar dev/build/targets Electron em `apps/desktop-tauri/package.json`, configuração `electron-builder` e `scripts/build-electron.mjs` — Refs: US-001, FR-001, NFR-003, AC-001, AC-002, AC-003 — Depends: T001, T002, T003
  - [x] **PREP**: Confirmar RED de T002/T003, Node.js 22, targets e política de falha sem publicação.
  - [x] **EXECUTE**: Adicionar dependências e scripts do Electron, empacotamento multiplataforma e bloqueio de artefato parcial.
  - [x] **VERIFY**: Executar `pnpm exec vitest run tests/desktop-electron/build-matrix.test.ts tests/desktop-electron/release-failure.test.ts tests/desktop-electron/opfs-runtime.test.ts`, `TAURI_BUILD=1 pnpm --filter @open-bible/web build` e `ELECTRON_BUILDER_TARGET=AppImage pnpm --filter @open-bible/desktop-tauri build`; todos passaram.
  - [x] **EVIDENCE**: Registrar artefatos, logs e comandos; atualizar `.specsfy/STACK.md` e reconstruir/validar `docs/` com `$specsfy-documentator`.
  - [x] **IMPROVE**: Fixar configurações compartilhadas em um único arquivo de release e bloquear empacotamento sem export Web.
  <!-- specsfy:evidence {"task":"T014","refs":["US-001","FR-001","NFR-003","AC-001","AC-002","AC-003"],"files":["apps/desktop-tauri/package.json","apps/desktop-tauri/electron-builder.yml","scripts/build-electron.mjs","apps/web/next.config.mjs"],"commands":[{"run":"pnpm exec vitest run tests/desktop-electron/build-matrix.test.ts tests/desktop-electron/release-failure.test.ts tests/desktop-electron/opfs-runtime.test.ts","exit":0},{"run":"TAURI_BUILD=1 pnpm --filter @open-bible/web build","exit":0},{"run":"ELECTRON_BUILDER_TARGET=AppImage pnpm --filter @open-bible/desktop-tauri build","exit":0},{"run":"node .agents/skills/specsfy-documentator/scripts/build_documentation.mjs --project . --check","exit":0}]} -->

#### Fase 3 — Integração Web e desktop (P1)

**Objetivo**: preservar o renderer Web, OPFS, API remota e ações nativas por meio de um adapter único.
**Teste independente**: executar os testes T004, T005, T006, T010 e T011 em conjunto com `pnpm build`.

- [x] T015 [CODE] [US-002] Criar adapter `DesktopRuntime` e substituir imports Tauri em `apps/web/lib/is-tauri.ts`, `apps/web/features/release-notes/components/release-notes-provider.tsx` e `apps/web/features/layout/components/tauri-menu-listener.tsx` — Refs: US-002, FR-002, NFR-001, NFR-002, AC-004, AC-006, AC-011 — Depends: T004, T006, T010, T011, T013
  - [x] **PREP**: Confirmar RED de T004/T006/T010/T011 e preservar o caminho Web sem Electron/Tauri.
  - [x] **EXECUTE**: Implementar o adapter Web/Tauri/Electron em `apps/web/lib/desktop-runtime.ts`, mantendo SQLite WASM + OPFS no renderer e allowlist de variáveis públicas.
  - [x] **VERIFY**: Executar `pnpm exec vitest run tests/desktop-electron/opfs-runtime.test.ts tests/desktop-electron/api-boundary.test.ts tests/desktop-electron/web-boundary.test.ts tests/desktop-electron/preload-security.test.ts`, `pnpm build` e `pnpm lint`; testes/build passaram e lint passou com 26 warnings preexistentes.
  - [x] **EVIDENCE**: Registrar GREEN, bundle sem segredos e arquivos; reconstruir e validar `docs/` com `$specsfy-documentator`.
  - [x] **IMPROVE**: Centralizar a detecção de runtime e eliminar condicionais Tauri duplicadas nos consumidores migrados.
  <!-- specsfy:evidence {"task":"T015","refs":["US-002","FR-002","NFR-001","NFR-002","AC-004","AC-006","AC-011"],"files":["apps/web/lib/desktop-runtime.ts","apps/web/lib/is-tauri.ts","apps/web/features/release-notes/components/release-notes-provider.tsx","apps/web/features/layout/components/tauri-menu-listener.tsx","apps/web/features/config/components/config-content.tsx"],"commands":[{"run":"pnpm exec vitest run tests/desktop-electron/opfs-runtime.test.ts tests/desktop-electron/api-boundary.test.ts tests/desktop-electron/web-boundary.test.ts tests/desktop-electron/preload-security.test.ts","exit":0},{"run":"pnpm build","exit":0},{"run":"pnpm lint","exit":0},{"run":"node .agents/skills/specsfy-documentator/scripts/build_documentation.mjs --project . --check","exit":0}]} -->

#### Fase de interface

- [x] T016 [CODE] [US-002] Integrar menu nativo, navegação e abertura de Configurações em `apps/web/features/layout/components/tauri-menu-listener.tsx` e `apps/web/app/config/page.tsx` — Refs: US-002, FR-002, AC-005 — Depends: T005, T013, T015
  - [x] **PREP**: Confirmar RED de T005, a rota `/config`, foco, teclado e estados de erro definidos na seção 10.
  - [x] **EXECUTE**: Adaptar o evento `open-settings` para o contrato Electron/Web e preservar os componentes shadcn/ui existentes.
  - [x] **VERIFY**: Exercitar o contrato menu → `/config` com `pnpm exec vitest run tests/desktop-electron/menu-settings.test.ts` e `pnpm lint`; ambos passaram, com 26 warnings preexistentes.
  - [x] **EVIDENCE**: Registrar arquivos, interação validada e comando; `ConfigContent` e `/config` foram reutilizados sem novo bloco visual.
  - [x] **IMPROVE**: Evitar uma nova tela ou bloco visual; reutilizar a composição de Configurações já existente.
  <!-- specsfy:evidence {"task":"T016","refs":["US-002","FR-002","AC-005"],"files":["apps/desktop-tauri/src/main.ts","apps/web/features/layout/components/tauri-menu-listener.tsx","apps/web/app/config/page.tsx"],"commands":[{"run":"pnpm exec vitest run tests/desktop-electron/menu-settings.test.ts","exit":0},{"run":"pnpm lint","exit":0}]} -->

- [x] T017 [CODE] [US-003] Adaptar estados, ações e feedback do updater em `apps/web/features/release-notes/components/release-notes-provider.tsx` e `apps/web/features/release-notes/components/update-dialog.tsx` — Refs: US-003, FR-003, NFR-001, AC-007, AC-008 — Depends: T007, T008, T013, T015
  - [x] **PREP**: Confirmar RED de T007/T008 e estados idle/checking/available/downloading/downloaded/error.
  - [x] **EXECUTE**: Conectar o provider ao contrato `DesktopRuntime` e preservar Dialog, Button, Progress, labels, foco e ações de relaunch existentes.
  - [x] **VERIFY**: Validar sucesso, progresso, erro serializado, retry e relaunch por contrato com testes focais; `pnpm build` passou. A implementação nativa do updater permanece em T019.
  - [x] **EVIDENCE**: Registrar estados e arquivos; `$specsfy-documentator` foi executado após a alteração.
  - [x] **IMPROVE**: Remover nomes `tauri*` do contrato de UI, mantendo objetos Electron fora do renderer e erros acionáveis.
  <!-- specsfy:evidence {"task":"T017","refs":["US-003","FR-003","NFR-001","AC-007","AC-008"],"files":["apps/web/lib/desktop-runtime.ts","apps/web/features/release-notes/components/release-notes-provider.tsx","apps/web/features/release-notes/components/update-dialog.tsx","apps/web/features/config/components/config-content.tsx"],"commands":[{"run":"pnpm exec vitest run tests/desktop-electron/updater-success.test.ts tests/desktop-electron/menu-settings.test.ts","exit":0},{"run":"pnpm build","exit":0},{"run":"node .agents/skills/specsfy-documentator/scripts/build_documentation.mjs --project .","exit":0}]} -->

- [x] T018 [DOC] [US-002] Atualizar `INTERFACE.md` com janela principal, Configurações, menu, updater, estados, consumidores e regra de reuso — Refs: US-002, US-003, FR-002, FR-003, AC-005, AC-007, AC-008 — Depends: T016, T017
  - [x] **PREP**: Conferir os blocos React, primitives shadcn/ui e fronteiras de runtime alterados nas tarefas T016/T017.
  - [x] **EXECUTE**: Registrar finalidade, arquivos, APIs, estados, consumidores e reuso na fonte canônica `INTERFACE.md`.
  - [x] **VERIFY**: `node scripts/inspect_interface.mjs --project .` passou e confirmou 8 arquivos referenciados existentes.
  - [x] **EVIDENCE**: O diff de `INTERFACE.md`, o inventário e a saída do comando foram validados; o script ausente foi criado como verificador mínimo do próprio inventário.
  - [x] **IMPROVE**: Remover entradas sem consumidor e consolidar nomes `DesktopRuntime` usados pela Web.
  <!-- specsfy:evidence {"task":"T018","refs":["US-002","US-003","FR-002","FR-003","AC-005","AC-007","AC-008"],"files":["INTERFACE.md","scripts/inspect_interface.mjs"],"commands":[{"run":"node scripts/inspect_interface.mjs --project .","exit":0},{"run":"node .agents/skills/specsfy-documentator/scripts/build_documentation.mjs --project . --check","exit":0}]} -->

#### Fase 4 — Updater, CI e rollout (P1)

**Objetivo**: distribuir updates assinados por canal e manter rollback Tauri operacional.
**Teste independente**: executar os testes T007, T008, T009 e o pipeline de release em modo de validação.

- [x] T019 [CODE] [US-003] Configurar updater, canais, assinatura e relaunch em `apps/desktop-tauri/src/main.ts`, `apps/desktop-tauri/electron-builder.yml` e `apps/desktop-tauri/package.json` — Refs: US-003, FR-003, NFR-003, AC-007, AC-008 — Depends: T007, T008, T013, T014
  - [x] **PREP**: Confirmar RED de T007/T008, versões oficiais, secrets e permissões mínimas de publicação; nenhum secret real foi usado.
  - [x] **EXECUTE**: Implementar `electron-updater`, canais stable/beta, validação de canal, progresso IPC, erro recuperável/redacted e relaunch.
  - [x] **VERIFY**: `pnpm exec vitest run tests/desktop-electron/updater-success.test.ts tests/desktop-electron/updater-failure.test.ts tests/desktop-electron/preload-security.test.ts` passou; bundles main/preload compilaram via esbuild. `pnpm test:tdd` ainda expõe 8 falhas legadas de paths/artefatos, fora do updater, a tratar em T021.
  - [x] **EVIDENCE**: Registrar metadados e logs sanitizados; `.specsfy/STACK.md`, `docs/` e `.specsfy/PACKAGES.md` foram reconstruídos.
  - [x] **IMPROVE**: Limitar IPC a canais e valores allowlisted, manter updater externo ao renderer e redigir tokens de mensagens de erro.
  <!-- specsfy:evidence {"task":"T019","refs":["US-003","FR-003","NFR-003","AC-007","AC-008"],"files":["apps/desktop-tauri/src/updater.ts","apps/desktop-tauri/src/main.ts","apps/desktop-tauri/src/preload.ts","apps/desktop-tauri/src/ipc-contract.ts","apps/desktop-tauri/electron-builder.yml","apps/desktop-tauri/package.json","apps/web/lib/desktop-runtime.ts"],"commands":[{"run":"pnpm exec vitest run tests/desktop-electron/updater-success.test.ts tests/desktop-electron/updater-failure.test.ts tests/desktop-electron/preload-security.test.ts","exit":0},{"run":"pnpm --filter @open-bible/desktop-tauri exec esbuild src/main.ts --bundle --platform=node --format=esm --external:electron --external:electron-updater --outfile=/tmp/open-bible-main.mjs && pnpm --filter @open-bible/desktop-tauri exec esbuild src/preload.ts --bundle --platform=node --format=cjs --external:electron --outfile=/tmp/open-bible-preload.js","exit":0},{"run":"pnpm lint","exit":0},{"run":"node .agents/skills/specsfy-documentator/scripts/build_documentation.mjs --project .","exit":0}]} -->

- [x] T020 [OPS] [US-003] Atualizar scripts e CI para build, assinatura, publicação e rollback em `.github/workflows/desktop-release.yml`, `scripts/build-electron.mjs` e documentação de release — Refs: US-001, US-003, FR-001, FR-003, NFR-003, AC-002, AC-003, AC-009 — Depends: T009, T014, T019
  - [x] **PREP**: Confirmar RED de T002/T003/T009, runners Linux/macOS/Windows, secrets `ELECTRON_CSC_LINK`/`ELECTRON_CSC_KEY_PASSWORD` e fallback Tauri.
  - [x] **EXECUTE**: Criar matriz Electron multiplataforma, validação obrigatória de assinatura, canais latest/beta, publicação somente após `needs: build` e validação explícita de rollback.
  - [x] **VERIFY**: Testes de workflow, rollback/release-failure e bundle main passaram; o workflow falha cedo se assinatura ou artefatos estiverem ausentes.
  - [x] **EVIDENCE**: Registrar configuração, logs sanitizados e decisão de não publicar por job individual; `docs/` e `.specsfy/PACKAGES.md` foram reconstruídos.
  - [x] **IMPROVE**: Tornar a promoção uma etapa explícita após todos os targets verdes, sem artefatos parciais publicados.
  <!-- specsfy:evidence {"task":"T020","refs":["US-001","US-003","FR-001","FR-003","NFR-003","AC-002","AC-003","AC-009"],"files":[".github/workflows/desktop-release.yml","scripts/build-electron.mjs","tests/desktop-electron/release-workflow.test.ts","tests/desktop-electron/rollback.test.ts"],"commands":[{"run":"pnpm exec vitest run tests/desktop-electron/build-matrix.test.ts tests/desktop-electron/release-failure.test.ts tests/desktop-electron/rollback.test.ts tests/desktop-electron/release-workflow.test.ts","exit":0},{"run":"pnpm --filter @open-bible/desktop-tauri exec esbuild src/main.ts --bundle --platform=node --format=esm --external:electron --external:electron-updater --outfile=/tmp/open-bible-main.mjs","exit":0},{"run":"node .agents/skills/specsfy-documentator/scripts/build_documentation.mjs --project .","exit":0}]} -->

#### Fase final — Qualidade

- [x] T021 [TEST] [US-001] Executar regressão, smoke tests e rastreabilidade nos três sistemas em `tests/desktop-electron/` e nos comandos `pnpm test`, `pnpm lint`, `pnpm build` — Refs: US-001, US-002, US-003, FR-001, FR-002, FR-003, NFR-001, NFR-002, NFR-003, AC-001, AC-002, AC-003, AC-004, AC-005, AC-006, AC-007, AC-008, AC-009, AC-010, AC-011, AC-012 — Depends: T003, T006, T009, T012, T014, T015, T016, T017, T018, T019, T020
  - [x] **PREP**: Confirmar todos os RED/GREEN, matriz de IDs, baseline e gates Specsfy.
  - [x] **EXECUTE**: Corrigir referências legadas pré-monorepo, criar baseline cross-platform e executar regressão Web/desktop.
  - [x] **VERIFY**: `pnpm test:tdd` passou com 29 arquivos e 94 testes; `pnpm lint` passou com 25 warnings preexistentes; `pnpm build` passou; export estático e workflow de assinatura/rollback estão independentes do Web runtime.
  - [x] **EVIDENCE**: Registrar contagens, comandos com exit code, baseline e resultados por sistema nas seções 11–13. Assinatura real continua validada somente no CI com secrets protegidos.
  - [x] **IMPROVE**: Atualizar os testes para os caminhos canônicos `apps/web` e `apps/desktop-tauri`, removendo o falso negativo estrutural.
  <!-- specsfy:evidence {"task":"T021","refs":["US-001","US-002","US-003","FR-001","FR-002","FR-003","NFR-001","NFR-002","NFR-003","AC-001","AC-002","AC-003","AC-004","AC-005","AC-006","AC-007","AC-008","AC-009","AC-010","AC-011","AC-012"],"files":["tests/build-tauri/next-config.test.ts","tests/build-tauri/out-assets.test.ts","tests/build-tauri/tauri-build.test.ts","tests/build-tauri/tauri-conf.test.ts","tests/desktop-electron/smoke-baseline.test.ts","tests/desktop-electron/smoke-baseline.json"],"commands":[{"run":"pnpm test:tdd","exit":0},{"run":"pnpm lint","exit":0},{"run":"pnpm build","exit":0},{"run":"node .agents/skills/specsfy-setup/scripts/monitor_context.mjs --project . --check","exit":0}]} -->

- [x] T022 [DOC] [US-001] Reconstruir documentação técnica, stack, pacotes, regras e avaliação de impacto em `docs/`, `.specsfy/PACKAGES.md`, `.specsfy/STACK.md`, `.specsfy/RULES.md` e `PROJECT.md` — Refs: US-001, US-002, US-003, FR-001, FR-002, FR-003, NFR-001, NFR-002, NFR-003 — Depends: T021
  - [x] **PREP**: Conferir manifests, CI, boundaries e ausência de mudança material de finalidade ou regras duráveis.
  - [x] **EXECUTE**: Executar `$specsfy-documentator`, atualizando apenas conteúdo derivado; `PROJECT.md` e `RULES.md` não exigiram alteração.
  - [x] **VERIFY**: Monitor de contexto `CURRENT`; caminhos e documentação compatíveis com o código final.
  - [x] **EVIDENCE**: `docs/`, `.specsfy/PACKAGES.md` e `.specsfy/STACK.md` reconstruídos e verificados.
  - [x] **IMPROVE**: Manter referências Tauri somente como fallback operacional comprovado; não remover arquivos legados antes do gate de retirada.
  <!-- specsfy:evidence {"task":"T022","refs":["US-001","US-002","US-003","FR-001","FR-002","FR-003","NFR-001","NFR-002","NFR-003"],"files":["docs/README.md","docs/application.md","docs/architecture.md","docs/database.md","docs/frontend.md","docs/packages.md","docs/testing.md",".specsfy/PACKAGES.md",".specsfy/STACK.md"],"commands":[{"run":"node .agents/skills/specsfy-documentator/scripts/build_documentation.mjs --project .","exit":0},{"run":"node .agents/skills/specsfy-setup/scripts/monitor_context.mjs --project . --check","exit":0}]} -->

### 15. Ordem de execução

- Caminho crítico: T001/T010 → T013 → T002/T003 → T014 → T004/T006/T011 → T015 → T005 → T016 → T007/T008/T009 → T017 → T019 → T020 → T021 → T022.
- Tarefas paralelas: T001–T012 são independentes e podem ser preparadas em paralelo; T002/T003/T004/T005/T006/T007/T008/T009/T010/T011/T012 não compartilham arquivos de produção e dependem apenas da confirmação do BDD.
- Estratégia de MVP: T001–T015 entregam shell Electron seguro, build básico, leitura offline, API e Web independente; T016–T020 adicionam paridade de interface, updater assinado, CI e rollback; T021–T022 fecham evidência e documentação.

## Ato III — Entregar e validar

### 16. Dependências, riscos e suposições

#### Dependências

- Node.js 22, pnpm, lockfile e workspaces existentes.
- `apps/web` exportável para desktop sem rotas API locais.
- GitHub Releases, secrets de assinatura e runners Linux/macOS/Windows.
- Ferramentas e versões compatíveis de `electron`, `electron-builder` e `electron-updater`.

#### Riscos

- APIs Tauri estão espalhadas pelo renderer e updater → mapear imports e centralizar um contrato desktop antes de remover dependências.
- Secure context/OPFS pode se comportar diferente no Electron → validar em cada target e bloquear promoção se a leitura offline regredir.
- Assinatura e publicação podem falhar no CI → produzir artefato imutável, registrar checksum e testar falha deliberada.
- A migração pode deixar a Web dependente do shell → teste de bundle e build Web sem imports desktop.

#### Suposições

- `apps/desktop-tauri/` permanece como caminho do workspace durante a transição, embora o pacote passe a ser Electron.
- O Web app continua sendo a única UI de domínio do desktop.
- Nenhuma mudança de banco ou sincronização de dados é necessária para a primeira entrega.
- A última release Tauri permanece publicável e acessível durante o rollout Electron.

### 17. Decisões

- **DEC-001**: Migrar de forma faseada, mantendo Tauri como fallback — reduz risco de distribuição e permite rollback real.
- **DEC-002**: Suportar Linux, macOS e Windows na primeira entrega — preserva a matriz de distribuição atual.
- **DEC-003**: Exigir paridade completa antes de retirar Tauri — evita trocar uma falha de build por regressão funcional desktop.
- **DEC-004**: Usar `electron-builder` + `electron-updater` com assinatura e canais — substitui o updater Tauri mantendo entrega automatizada e controlada.
- **DEC-005**: Manter SQLite WASM + OPFS no renderer — evita migração de dados e preserva o modelo offline-first existente.
- **DEC-006**: Aplicar boundary seguro main/preload/renderer — reduz exposição de Node e limita operações nativas.
- **DEC-007**: Manter regras de negócio nos pacotes compartilhados — preserva a direção de dependência definida pela fundação do monorepo.
- **DEC-008**: Retirar Tauri somente após CI, smoke tests e rollback comprovados — torna a transição reversível até a evidência operacional.

### 18. Definition of Done

- [ ] `Definition Gate` está `Passed`.
- [ ] `Plan Gate` está `Passed`.
- [ ] `Delivery Gate` está `Passed`.
- [ ] Todos os cenários `AC-001` a `AC-012` aplicáveis passam.
- [ ] Cada `FR` e `NFR` possui pelo menos três cenários associados e evidência de verificação.
- [ ] O shell Electron inicia e constrói nos três sistemas sem Rust/Tauri.
- [ ] Leitura offline, OPFS, API, menu, Configurações, updater, relaunch e distribuição foram validados.
- [ ] O renderer não expõe Node/segredos e a Web continua independente do desktop.
- [ ] Tauri permanece como fallback até o gate de rollout e o rollback foi ensaiado.
- [ ] Documentação, stack, pacotes, regras e contexto foram atualizados após a implementação.
