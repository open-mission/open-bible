# GitHub Copilot — instruções do Open Bible

**Fonte de verdade**: o fluxo completo e a arquitetura estão em [`AGENTS.md`](../AGENTS.md) e
[`CONTRIBUTING.md`](../CONTRIBUTING.md). Resumo essencial abaixo.

## Fluxo de trabalho

- Crie branches **a partir de `develop`**: `feat/{nr}-desc`, `fix/{nr}-desc`, `improve/{nr}-desc`.
- Abra PRs **para `develop`**, referenciando a issue com `Closes #nr`.
- O CI valida mensagens de commit, lint e build em cada PR.

## Commits (Conventional Commits, validados por `commitlint`)

Tipos válidos: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `improve`, `test`, `chore`,
`ci`, `revert`, `wip`. Formato: `<tipo>(<escopo opcional>): <descrição>` em minúsculas,
cabeçalho de até 100 caracteres.

## Stack

Next.js 16 (App Router), React 19, TypeScript, Tailwind v4, shadcn/ui (base-nova), Hono + Zod
(API), SQLite WASM + OPFS + Drizzle ORM (local), TursoDB (server), Better Auth.

## Segurança git

Nunca pule hooks (`--no-verify`). Nunca force-push para `main`/`develop`.
