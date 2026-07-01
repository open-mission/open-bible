---
source: .cursor/rules/project.mdc
type: cursorrules
---

---
description: Convenções de commit, branch e fluxo do Open Bible
alwaysApply: true
---

# Open Bible — regras do projeto

**Fonte de verdade**: leia [`AGENTS.md`](mdc:AGENTS.md) e [`CONTRIBUTING.md`](mdc:CONTRIBUTING.md)
para o fluxo completo e a arquitetura. Resumo essencial abaixo.

## Fluxo (toda feature/fix/melhoria)

- Crie a branch **a partir de `develop`**: `feat/{nr}-desc`, `fix/{nr}-desc`, `improve/{nr}-desc`.
- Abra o PR **para `develop`** com `Closes #nr`. O CI valida commits + lint + build.

## Commits — Conventional Commits (validados por `commitlint`)

Tipos válidos: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `improve`, `test`, `chore`,
`ci`, `revert`, `wip`. Formato: `<tipo>(<escopo>): <descrição>` (escopo e descrição em minúsculas,
máx. 100 chars no cabeçalho). Use `pnpm commit` para o prompt guiado.

## Segurança git

Nunca use `--no-verify`. Nunca force-push para `main`/`develop`. Se um hook falhar, corrija e crie
um novo commit (não use `--amend`).
