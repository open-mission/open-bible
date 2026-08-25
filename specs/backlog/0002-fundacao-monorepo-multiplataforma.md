# Backlog: Fundação de monorepo multiplataforma

| Metainformação | Valor |
| --- | --- |
| ID | BACKLOG-0002 |
| Status | Promoted |
| Produto | Open Bible |
| Épico | Fundação e organização multiplataforma |
| Funcionalidade | Monorepo com pacotes compartilhados |
| Tipo | Técnico |
| Prioridade | Alta |
| Milestones | |
| Criado em | 2026-08-23 |
| Spec promovida | specs/completed/0002-fundacao-monorepo-multiplataforma/spec.md |

## Ideia original

Organizar o Open Bible como monorepo para suportar Web, desktop com Electron, TUI com OpenTUI e futura versão desktop com UI nativa, preservando uma única regra de negócio. A primeira entrega será somente a fundação: workspaces, núcleo de domínio compartilhado e contratos; a Web continua funcionando e Electron/TUI ficam preparados, sem lançar interfaces novas ainda.

## Problema percebido

A aplicação atual concentra interface, regras de negócio e adaptadores de armazenamento em um único projeto Next.js, dificultando a criação de variantes sem duplicação.

## Pessoa afetada ou beneficiada

Equipe mantenedora e pessoas usuárias futuras das versões Web, desktop e TUI.

## Resultado ou valor esperado

Uma base de workspaces que isola regras e casos de uso de framework e plataforma, preservando a PWA funcional e habilitando implementações posteriores de Electron, OpenTUI e UI nativa.

## Contexto

O projeto usa Next.js, SQLite WASM com OPFS e Tauri. A direção confirmada é substituir Tauri por Electron em entrega futura, usar OpenTUI para TUI e manter uma futura versão de UI desktop nativa. Referência relacionada: specs/inbox/2026-08-23-143301-arquitetura-multiplataforma-com-monorepo.md; precedente: specs/completed/0001-corrigir-build-do-tauri/spec.md.

## Referências relacionadas

- `specs/inbox/2026-08-23-143301-arquitetura-multiplataforma-com-monorepo.md` — origem da iniciativa.
- `specs/completed/0001-corrigir-build-do-tauri/spec.md` — precedente: mantém o comportamento e a distribuição Tauri que esta entrega deve preservar.

## Comportamento esperado

- Workspaces `apps/web`, `apps/desktop-tauri` e `packages/*` configurados na raiz.
- Contratos, domínio, aplicação e adaptadores Web extraídos e sem imports de plataforma.
- PWA e Tauri legado mantêm leitura, busca, parsing e build existentes.

## Regras de negócio

- A primeira entrega extrai apenas contratos, regras e casos de uso independentes de plataforma; interfaces Electron, TUI e UI desktop nativa não são entregues nesta fase.
- A PWA existente continua funcional durante e após a reorganização.
- O desktop Tauri continua funcional como adaptador legado até que uma entrega posterior de Electron o substitua; esta fase não remove recursos, builds nem releases Tauri.
- Dados locais existentes permanecem no armazenamento atual da PWA (SQLite WASM + OPFS); a fundação define portas de persistência, mas não migra banco nem implementa sincronização.
- A extração inicial do domínio cobre leitura bíblica e referências: versões, livros, capítulos, versículos, busca e parsing de referências. Notas, destaques, preferências e atualizações ficam fora desta fatia.
- A estrutura alvo coloca a aplicação Next.js/PWA em `apps/web`; a raiz do repositório contém somente configuração e orquestração do workspace, e os módulos compartilhados ficam em `packages/`.
- O Tauri legado fica em `apps/desktop-tauri` e continua consumindo o build estático da Web até ser substituído por Electron em uma entrega posterior.

## Critérios de aceitação

- Scenario: Ler capítulo instalado após migração — PWA consulta capítulo pelo caso de uso compartilhado e recebe os mesmos versículos.
- Scenario: Buscar sem APIs de browser — caso de uso aplica busca case-insensitive sem importar módulos de apps.
- Scenario: Construir Tauri legado — shell em `apps/desktop-tauri` consome export Web sem remover rotas da PWA.

## Qualidades e operação

- Segurança: domínio sem imports de plataforma; fronteiras validadas.
- Privacidade: sem coleta nova; dados locais preservados.
- Desempenho e volume: build Web e leitura mantidos; sem regressão.
- Auditoria e observabilidade: lint, testes e build verdes registrados na spec.

## Dependências

- pnpm workspaces, Next.js, Vitest, SQLite WASM e Tauri existentes.

## Situações de erro

- Versão não instalada preserva retorno vazio sem alterar dados.
- Falha de build não move arquivos fora da aplicação-alvo.

## Escopo

- Dentro: criar workspaces, mover PWA e Tauri, extrair contratos/domínio/aplicação/adapters Web.
- Fora: Electron, OpenTUI, UI nativa, sync, migrations, notas, destaques, preferências e atualizações.

## Dúvidas, decisões e riscos

- Decisão confirmada: a primeira entrega é a fundação do monorepo, sem novas interfaces Electron ou TUI.
- Decisão confirmada: preservar Tauri como legado funcional até a substituição por Electron.
- Decisão confirmada: preservar os dados locais existentes e introduzir apenas contratos de persistência nesta fase.
- Decisão confirmada: iniciar a extração pelo domínio de leitura bíblica e referências.
- Decisão confirmada: mover a aplicação Web para `apps/web` nesta entrega.
- Decisão confirmada: mover o shell Tauri legado para `apps/desktop-tauri` nesta entrega.

## Pronto para desenvolvimento

- [x] O problema e a pessoa beneficiada estão claros.
- [x] O evento inicial e o resultado esperado estão claros.
- [x] Permissões, regras e exceções relevantes estão claras.
- [x] O resultado pode ser verificado objetivamente.
- [x] Segurança, privacidade e desempenho foram avaliados conforme o risco.
- [x] Fora de escopo, dependências e decisões pendentes estão registrados.

## Próximo passo

Concluído — promovido para `specs/completed/0002-fundacao-monorepo-multiplataforma/spec.md` (Delivery Gate Passed).
