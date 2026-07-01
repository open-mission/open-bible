# CLAUDE.md

Orientações para Claude Code (e demais agentes) neste repositório.

> **Fonte de verdade**: o fluxo de trabalho, convenções de commit/branch e arquitetura estão em
> [`AGENTS.md`](AGENTS.md). O guia humano completo está em [`CONTRIBUTING.md`](CONTRIBUTING.md).
> Leia `AGENTS.md` antes de qualquer mudança. Este arquivo é só um resumo de bolso.

## Skills do projeto (`.agents/skills/`)

### Fluxo de trabalho
- **`feature-dev`** — ponto de entrada para qualquer feature/fix/melhoria: orquestra spec →
  plano → branch isolada (worktree de `develop`) → implementação.
- **`dev-workflow`** — a mecânica de git (issue → branch de `develop` → commits → PR → merge).

### Agentes especializados
- **`bug-fixer`** — diagnóstico e resolução de bugs com foco na causa raiz.
- **`architect`** — design de arquitetura e padrões, decisões cross-layer.

### Qualidade de código
- **`code-review`** — revisão de código, padrões e boas práticas do Open Bible.
- **`bug-investigation`** — investigação sistemática de bugs e análise de causa raiz.
- **`security-audit`** — auditoria de segurança (OWASP top 10, auth, secrets).

### Ciclo de desenvolvimento
- **`commit-message`** — geração de mensagens Conventional Commits.
- **`pr-review`** — revisão de PRs contra os padrões do time.
- **`feature-breakdown`** — quebra de features em tarefas implementáveis.
- **`refactoring`** — refatoração segura com passo a passo.
- **`test-generation`** — geração de casos de teste abrangentes.
- **`documentation`** — geração e atualização de docs técnicos.

### UI
- **`shadcn`** — componentes shadcn/ui, presets e composição.

## Fluxo obrigatório (features, fixes, melhorias)

1. Criar/identificar a issue.
2. Criar branch **a partir de `develop`**: `feat/{nr}-desc`, `fix/{nr}-desc` ou `improve/{nr}-desc`.
3. Commits semânticos (Conventional Commits) — use `pnpm commit` para o prompt guiado.
4. Abrir PR **para `develop`** com `Closes #nr`. O CI valida commits + lint + build.
5. Merge após review (squash). `develop` → `main` gera release.

## Tipos de commit válidos

`feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `improve`, `test`, `chore`, `ci`, `revert`, `wip`
(validados por `commitlint` no hook `commit-msg`).

## Comandos essenciais

| Comando | Uso |
|---------|-----|
| `pnpm dev` | Servidor de desenvolvimento (porta 3000) |
| `pnpm lint` | ESLint |
| `pnpm build` | Build de produção |
| `pnpm commit` | Commit semântico interativo (Commitizen) |
| `pnpm release` | Bump de versão + tag + GitHub Release |

## Segurança git (não negociável)

- **Nunca** use `--no-verify` para pular hooks.
- **Nunca** force-push para `main` ou `develop`.
- Sem destrutivos (`reset --hard`, `--force`) sem pedido explícito.
- Se um hook falhar, corrija e crie um **novo** commit (não use `--amend`).
