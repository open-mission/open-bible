---
type: doc
name: development-workflow
description: Day-to-day engineering processes, branching, and contribution guidelines
category: workflow
generated: 2026-07-01
status: filled
scaffoldVersion: "2.0.0"
---

## Development Workflow

Open Bible is a Portuguese Bible PWA (Next.js 16, TursoDB server-side, SQLite WASM + OPFS + Drizzle ORM client-side). Every feature, fix, or improvement flows through GitHub issues, an isolated branch cut from `develop`, semantic commits, and a squash-merged PR back into `develop`. Agents should start any task with the `feature-dev` skill (`.agents/skills/`), which orchestrates spec → plan → isolated worktree → implementation. The git mechanics live in the `dev-workflow` skill.

Authoritative sources: [`AGENTS.md`](../../AGENTS.md) (workflow + architecture) and [`CONTRIBUTING.md`](../../CONTRIBUTING.md) (full human guide).

## Branching & Releases

- **Model**: `main` (protected, auto-deploy via Vercel) ← `develop` (integration base for all PRs) ← short-lived feature branches.
- **Branch naming**: `feat/{issue-nr}-desc`, `fix/{issue-nr}-desc`, `improve/{issue-nr}-desc` — always cut from `develop`.
- **Release**: merging `develop` → `main` triggers a release + automatic Vercel deploy. `pnpm release` guides the version bump, commit, tag, push, and GitHub Release.
- **Commit types** (validated by `commitlint`): `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `improve`, `test`, `chore`, `ci`, `revert`, `wip`. Use `pnpm commit` for the guided Commitizen prompt.

## Local Development

- Install: `pnpm install`
- Run dev server (port 3000): `pnpm dev` — the `predev` hook copies sqlite-wasm assets to `public/`
- Lint: `pnpm lint` (`eslint .`)
- Production build: `pnpm build` — **note**: passes even with TS errors (`ignoreBuildErrors: true`); `prebuild` copies sqlite-wasm assets
- Init TursoDB tables: `pnpm db:init`
- Import Bibles into TursoDB: `pnpm db:import`
- Desktop (Tauri): `pnpm desktop:dev` / `pnpm desktop:build`

## Code Review Expectations

- Open PRs **against `develop`** referencing the issue (`Closes #nr`). CI (`.github/workflows/pr-validation.yml`) validates commits (commitlint) + lint + build.
- Squash merge is preferred. Issues auto-close and move to "Done" on the Open Bible GitHub Project (org `open-mission`, project #2).
- **Never** use `--no-verify`, never force-push to `main`/`develop`, and avoid destructive git commands without an explicit request. If a hook fails, fix it and create a **new** commit — never `--amend`.
- There is no test suite or typecheck gate yet, so review carefully for correctness; the build alone will not catch type errors.

## Onboarding Tasks

- Read [`AGENTS.md`](../../AGENTS.md) end-to-end — the architecture and "Key Gotchas" sections encode hard-won constraints (OPFS locking, Workbox cache overrides, composite PKs).
- Create issues via templates: `gh issue create --template bug_report.md` / `feature_request.md` / `improvement.md`.
- See also [testing-strategy.md](testing-strategy.md) and [tooling.md](tooling.md).
