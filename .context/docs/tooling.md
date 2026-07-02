---
type: doc
name: tooling
description: Scripts, IDE settings, automation, and developer productivity tips
category: tooling
generated: 2026-07-01
status: filled
scaffoldVersion: "2.0.0"
---

## Tooling & Productivity Guide

The scripts, automation, and conventions that keep Open Bible contributors efficient. The stack is Next.js 16 + React 19, TypeScript 5.7, Tailwind v4, shadcn/ui (base-nova), Hono + Zod OpenAPI for the API, Drizzle ORM + SQLite WASM/OPFS on the client, and TursoDB (libSQL) on the server. Package manager is **pnpm 10.22**.

## Required Tooling

- **pnpm 10.22** — the only supported package manager (`packageManager` field pins it). Install deps with `pnpm install`.
- **Node.js 24+** (`@types/node: ^24`) — runtime for build scripts under `scripts/`.
- **TypeScript 5.7.3** — note builds ignore type errors (`ignoreBuildErrors: true`), so run editor typechecking manually.
- **Tauri CLI 2.x** (`@tauri-apps/cli`) — only needed for the desktop build (`pnpm desktop:dev` / `pnpm desktop:build`); requires a Rust toolchain.
- **better-sqlite3** (native, dev-only) — used exclusively by `scripts/import-bibles.mjs`; listed in `pnpm.onlyBuiltDependencies`.
- **drizzle-kit** (dev-only, `drizzle.config.ts`) — generates migrations that are hand-embedded or run client-side by the browser-safe migrator.

## Recommended Automation

- **Git hooks (Husky)**: `prepare` installs Husky. `commit-msg` runs `commitlint` (Conventional Commits); `pre-commit` runs `lint-staged`.
- **lint-staged**: `*.{ts,tsx,js,mjs}` → `eslint --fix` on staged files.
- **Semantic commits**: `pnpm commit` opens the Commitizen (`cz-conventional-changelog`) guided prompt.
- **SQLite WASM assets**: `pnpm copy:wasm` copies sqlite-wasm + seed Bibles into `public/`. Runs automatically via `predev` and `prebuild`.
- **Data pipeline**: `pnpm db:init` (create TursoDB tables), `pnpm db:import` (import 18 SQLite Bibles), `pnpm build:data` (SQLite → JSON fallback export).
- **Release**: `pnpm release` bumps version, commits, tags, pushes, and cuts a GitHub Release.
- **Never** bypass hooks with `--no-verify` — CI (`pr-validation.yml`) re-enforces commitlint + lint + build anyway.

## IDE / Editor Setup

- ESLint (`eslint-config-next`) — enable format-on-save with `eslint --fix` to match `lint-staged`.
- Tailwind CSS IntelliSense — Tailwind v4 has **no** `tailwind.config.js`; CSS is imported via `@import "tailwindcss"`.
- TypeScript workspace version pinned to 5.7.3 — select "Use Workspace Version" so editor diagnostics match the repo.

## Productivity Tips

- After pulling changes that touch sqlite-wasm, re-run `pnpm copy:wasm` (or just `pnpm dev`, which triggers `predev`).
- The SQLite Web Worker source of truth is `lib/database/sqlite-worker.source.js` (tracked in git); the copied artifact at `public/sqlite-wasm/open-bible.worker.js` is generated — edit the source, not the copy.
- Env lives in `.env.local` (see [security.md](security.md) for required keys).
- See also [development-workflow.md](development-workflow.md).
