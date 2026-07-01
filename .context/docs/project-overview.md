---
type: doc
name: project-overview
description: High-level overview of the project, its purpose, and key components
category: overview
generated: 2026-07-01
status: filled
scaffoldVersion: "2.0.0"
---

# Project Overview

Open Bible is a Portuguese-language Bible reader delivered as an offline-first
Progressive Web App. It lets readers download individual Bible versions (ACF,
ARA, NVI, NAA, and 14 more) into the browser, then read, navigate, and search
their text with zero network dependency once installed. The same server also
exposes a public, CORS-enabled REST API so a companion iOS app can consume the
same Bible data. The value proposition: a fast, installable, fully offline
Scripture reader that puts each version's SQLite database directly in the user's
browser (OPFS), plus an API that lets native clients reuse the backend.

## Codebase Reference

> **Semantic Snapshot**: Use `context({ action: "getMap", section: "all" })` for
> a generated view of the stack, architecture layers, key files, and dependency
> hotspots. This document summarizes the human-relevant highlights; the snapshot
> is the source of truth for the full symbol inventory.

## Quick Facts

- Root: `/Users/claudio/Projects/open-bible`
- Languages: TypeScript (app + API), JavaScript ESM (build/ops scripts)
- Framework: Next.js 16 (App Router) + React 19
- Package manager: pnpm 10 (`packageManager` pinned in `package.json`)
- API entry: `app/api/[[...route]]/route.ts` (Hono + Zod OpenAPI)
- App entry: `app/layout.tsx` (server component) → `app/page.tsx`
- Client DB worker: `public/sqlite-wasm/open-bible.worker.js` (source in `lib/database/sqlite-worker.source.js`)
- Semantic snapshot: `context({ action: "getMap", section: "all" })`

## Entry Points

- [`app/layout.tsx`](../../app/layout.tsx) — root server layout; mounts the
  provider chain (ThemeProvider → BibleVersionProvider → ToastProvider).
- [`app/page.tsx`](../../app/page.tsx) — the reader home page.
- [`app/api/[[...route]]/route.ts`](../../app/api/[[...route]]/route.ts) —
  catch-all Hono handler exporting `GET`, `POST`, `OPTIONS`.
- [`app/api/auth/[...all]/route.ts`](../../app/api/auth/[...all]/route.ts) —
  Better Auth handler (email/password).
- [`lib/api/hono-app.ts`](../../lib/api/hono-app.ts) — the OpenAPI Hono app with
  all `/api/bibles/*` routes, the download proxy, and Scalar docs at `/api/docs`.

## Key Exports

- `DatabaseManager` (`lib/database/DatabaseManager.ts:21`) — single owner of the
  SQLite worker; typed promise API for all client-side SQL.
- `BibleDatabase` (`lib/database/bible/BibleDatabase.ts:10`) — read-only queries
  against an installed version database.
- `createUserDb` / `UserDb` (`lib/database/user/drizzle.ts:10`) — Drizzle ORM
  client bound to `app.db` via the worker's sqlite-proxy.
- `BibleVersionProvider` (`lib/bible-version-context.tsx:125`) — React context for
  the active version, installed versions, and verse loading.
- `useBibleVerses` (`lib/use-bible.ts:7`) — hook that surfaces the current
  chapter's verses to components.
- API service functions (`lib/api/bible-service.ts`): `listVersions`,
  `getVersionDetail`, `getChapterVerses`, `searchVerses`, `listBooksForVersion`.
- Typed HTTP client (`lib/api-client.ts`): `fetchVersions`, `fetchChapterVerses`,
  `searchVerses`, `fetchBooks`, plus the `ApiError` class.

## File Structure & Code Organization

- `app/` — Next.js App Router pages, layout, the API catch-all, auth route, and
  utility pages (`~offline`, `config`, `test-panel`, `database-test`).
- `components/` — React UI (reader, sidebar, dialogs, version selector); `ui/`
  holds shadcn/ui (base-nova / `@base-ui/react`) primitives.
- `lib/` — application logic: `api/` (Hono app, service, schemas),
  `database/` (worker manager, bible + user DB layers, migrations,
  repositories), plus contexts, hooks, theme, and utilities.
- `hooks/` — a small set of standalone React hooks (e.g. `use-mobile.ts`).
- `scripts/` — Node ESM ops/build scripts (WASM copy, DB init/import, release).
- `public/sqlite-wasm/` — the SQLite WASM runtime and generated worker, copied
  in by `scripts/copy-sqlite-wasm.mjs` before dev/build.
- `.context/` — this AI knowledge base (docs, agents, skills).

## Technology Stack Summary

The app runs on Next.js 16 with the App Router and React 19, written in
TypeScript. The server API is built on Hono with `@hono/zod-openapi` for typed
routes and an auto-generated OpenAPI spec rendered by Scalar. The server database
is TursoDB (libSQL), accessed via `@libsql/client` and, for auth, Kysely's
`LibsqlDialect`. On the client, each Bible ships as its own SQLite database run
in-browser via `@sqlite.org/sqlite-wasm` with the OPFS SAHPool VFS; the user's
notes live in `app.db` accessed through Drizzle ORM's sqlite-proxy driver.
Styling is Tailwind CSS v4 (no `tailwind.config.js`; config lives in CSS). PWA
behavior (service worker, offline fallback, runtime caching) comes from
`@ducanh2912/next-pwa`. Tooling: ESLint 9 (flat config, `eslint-config-next`),
Husky + lint-staged + commitlint for commit hygiene, and Commitizen for guided
commits. There is no test runner and no typecheck gate — builds intentionally run
with `ignoreBuildErrors: true`.

## Core Framework Stack

- Frontend: React 19 + Next.js 16 App Router; client components use `"use client"`,
  the layout stays a server component.
- API: Hono + Zod OpenAPI, deployed as a Next.js route handler.
- Server data: TursoDB (libSQL) for Bible content and Better Auth tables.
- Client data: SQLite WASM (OPFS) per-version read-only DBs + a Drizzle-managed
  `app.db` for user notes.

## UI & Interaction Libraries

UI is built with shadcn/ui in the base-nova style on top of `@base-ui/react`,
with `lucide-react` and `@tabler/icons-react` for icons, `sonner` for toasts,
`vaul`/bottom-sheet for mobile sheets, `cmdk` for command palettes, and
`react-resizable-panels` for the split reader/inspector layout. Theming is driven
by `next-themes` with 15 accent colors defined as CSS custom properties in
`lib/theme.ts`. All user-facing strings are in Portuguese.

## Development Tools Overview

Day-to-day work uses `pnpm dev` (which runs `predev` to copy WASM assets),
`pnpm lint`, and `pnpm build`. Commits go through `pnpm commit` (Commitizen) and
are validated by commitlint. See the [Tooling guide](./tooling.md) for the full
script inventory and hook setup.

## Getting Started Checklist

1. Install dependencies: `pnpm install`.
2. Create `.env.local` with `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`,
   `BETTER_AUTH_SECRET` (min 32 chars), `BETTER_AUTH_URL`, and
   `CLOUDFLARE_BUCKET_PUBLIC_URL`.
3. Start the dev server: `pnpm dev` (port 3000; `predev` copies the SQLite WASM
   worker into `public/`).
4. Open `http://localhost:3000` and download a version to exercise the offline
   flow; browse the API docs at `http://localhost:3000/api/docs`.
5. Verify your change with `pnpm lint` and `pnpm build` before opening a PR.
6. Read the [Development Workflow](./development-workflow.md) for branching and
   commit conventions.

## Next Steps

For deeper architecture detail see [Architecture](./architecture.md); for the
contribution process see [Development Workflow](./development-workflow.md) and
[Tooling](./tooling.md). Governance, branch rules, and the full command table
live in the repo's `AGENTS.md` and `CLAUDE.md`.
