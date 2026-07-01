---
type: doc
name: architecture
description: System architecture, layers, patterns, and design decisions
category: architecture
generated: 2026-07-01
status: filled
scaffoldVersion: "2.0.0"
---

# Architecture Notes

Open Bible is a single Next.js 16 application that plays three roles at once: a
React reader UI, a Hono-based REST API, and an offline data engine that runs
SQLite in the browser. The defining design decision is that Bible text is not
fetched per-request in production — each version is downloaded once as a complete
SQLite database and queried locally through a Web Worker running
`@sqlite.org/sqlite-wasm` over the OPFS SAHPool VFS. The server side exists mostly
to (a) serve the initial download of those databases and (b) provide a REST/OpenAPI
surface for native clients (an iOS app). This split keeps the reader instant and
offline-capable while still exposing a conventional API.

## System Architecture Overview

Topology: a modular monolith deployed on Vercel. One Next.js app hosts the UI
(App Router pages under `app/`), the API (a catch-all route that mounts a Hono
app), and auth (a Better Auth catch-all route).

Request flow, server side: a request to `/api/bibles/*` hits
`app/api/[[...route]]/route.ts`, which delegates to the Hono app in
`lib/api/hono-app.ts`. Route handlers call the service layer
(`lib/api/bible-service.ts`), which queries TursoDB via `lib/turso.ts` and caches
results in an in-process TTL map.

Request flow, client side: the reader UI renders inside the provider chain
established in `app/layout.tsx`. `BibleVersionProvider` asks `DatabaseManager` to
open a version's local database; `DatabaseManager` posts an RPC message to the
single SQLite Web Worker, which executes SQL against the OPFS-backed file and
returns rows. Control pivots from React → context → `DatabaseManager` (promise
API) → worker (message passing) → SQLite WASM. In production, verse reads never
touch the network once a version is installed.

## Architectural Layers

- **UI / Components**: `app/`, `components/`, `components/ui/` — App Router pages
  and React components. Layout is a server component; feature components are
  `"use client"`.
- **State / Contexts & Hooks**: `lib/bible-version-context.tsx`,
  `components/theme-provider.tsx`, `lib/use-toast.tsx`, `lib/use-bible.ts`,
  `lib/use-reader-position.ts` — React context providers and hooks.
- **API Controllers**: `app/api/[[...route]]/route.ts`,
  `app/api/auth/[...all]/route.ts`, `lib/api/hono-app.ts` — HTTP entry points and
  route definitions.
- **API Services**: `lib/api/bible-service.ts`, `lib/api/schemas.ts` — business
  logic + Zod schemas shared with OpenAPI.
- **Client Data (offline engine)**: `lib/database/DatabaseManager.ts`,
  `lib/database/worker-types.ts`, `lib/database/sqlite-worker.source.js`,
  `lib/database/bible/BibleDatabase.ts` — worker RPC and read-only Bible queries.
- **Client Data (user)**: `lib/database/user/` — Drizzle schema, sqlite-proxy
  driver, migrator, and repositories for notes/references.
- **Server Data**: `lib/turso.ts`, `lib/auth.ts` — TursoDB client and Better Auth
  (Kysely `LibsqlDialect`).
- **Legacy/HTTP client**: `lib/api-client.ts`, `lib/bible-db.ts`,
  `lib/bible-data.ts` — typed fetch client and older IndexedDB/placeholder paths.

> Use `context({ action: "getMap", section: "all" })` for generated architecture
> and dependency summaries.

## Detected Design Patterns

| Pattern | Confidence | Locations | Description |
|---------|------------|-----------|-------------|
| Facade / Manager | High | `DatabaseManager` (`lib/database/DatabaseManager.ts:21`) | Single object owns the SQLite worker and exposes a typed promise API; UI and repositories never touch the worker directly. |
| Message-passing RPC | High | `DatabaseManager.rpc` + `lib/database/worker-types.ts` | Sequenced request/response over `postMessage`, correlated by numeric `id` with a pending-map. |
| Lazy singleton (Proxy) | High | `auth` (`lib/auth.ts:28`), `turso` (`lib/turso.ts`) | Deferred client construction via `Proxy` so the build succeeds without env vars set. |
| Repository | Medium | `lib/database/user/repositories/notesRepository.ts`, `noteReferencesRepository.ts` | Encapsulate Drizzle queries for user entities. |
| Provider / Context | High | `BibleVersionProvider`, `ThemeProvider`, `ToastProvider` | React context chain in `app/layout.tsx`. |
| Service + in-memory cache | Medium | `getCached`/`setCache`/`queryCached` (`lib/api/bible-service.ts`) | TTL cache wraps TursoDB reads in the API layer. |
| Schema-first API | High | `lib/api/schemas.ts` + `@hono/zod-openapi` | Zod schemas drive validation and the generated OpenAPI spec. |

## Entry Points

- [`app/layout.tsx`](../../app/layout.tsx) — root server layout and provider chain.
- [`app/page.tsx`](../../app/page.tsx) — reader home page.
- [`app/api/[[...route]]/route.ts`](../../app/api/[[...route]]/route.ts) — API
  catch-all, exports `GET`/`POST`/`OPTIONS`.
- [`app/api/auth/[...all]/route.ts`](../../app/api/auth/[...all]/route.ts) — auth
  catch-all.
- [`lib/api/hono-app.ts`](../../lib/api/hono-app.ts) — Hono OpenAPI app + download proxy.
- [`public/sqlite-wasm/open-bible.worker.js`](../../public/sqlite-wasm/open-bible.worker.js) —
  the SQLite worker (built from `lib/database/sqlite-worker.source.js`).

## Public API

| Symbol | Type | Location |
|--------|------|----------|
| `GET` / `POST` | Route handlers | `app/api/[[...route]]/route.ts:5` |
| `DatabaseManager` | Class | `lib/database/DatabaseManager.ts:21` |
| `BibleDatabase` | Class | `lib/database/bible/BibleDatabase.ts:10` |
| `createUserDb` / `UserDb` | Factory / type | `lib/database/user/drizzle.ts:10` |
| `runUserMigrations` | Function | `lib/database/user/migrator.ts:8` |
| `BibleVersionProvider` | Component | `lib/bible-version-context.tsx:125` |
| `useBibleVerses` | Hook | `lib/use-bible.ts:7` |
| `listVersions` / `getVersionDetail` / `getChapterVerses` / `searchVerses` / `listBooksForVersion` | Functions | `lib/api/bible-service.ts` |
| `fetchVersions` / `fetchChapterVerses` / `searchVerses` / `fetchBooks` | Functions | `lib/api-client.ts` |
| `downloadAndInstallVersion` / `getInstalledVersions` / `removeVersion` | Functions | `lib/bible-db.ts` |
| `Version` / `VersionDetail` / `ChapterResponse` / `SearchResult` schemas | Zod schemas/types | `lib/api/schemas.ts` |
| `Note` / `NoteReference` / `InstalledBible` | Drizzle types | `lib/database/user/schema.ts` |

## Internal System Boundaries

There are two distinct SQLite "worlds" on the client, both funneled through the
one worker: read-only **Bible databases** (`ara.db`, `acf.db`, …) owned by
`BibleDatabase`, and the read/write **user database** (`app.db`) owned by Drizzle
via a sqlite-proxy that calls back into `DatabaseManager.exec`. Bible data is
immutable once downloaded; user data (notes, note references, installed-bibles
registry) is the only mutable local state and is the seam earmarked for a future
server-sync feature (schema is soft-delete-ready via `deletedAt`).

Server-side, Bible content in TursoDB is authoritative for the API and for the
download proxy's URL lookup; auth tables in the same TursoDB are owned by Better
Auth's migrations, not by the app's Drizzle schema.

## External Service Dependencies

- **TursoDB (libSQL)** — server Bible content + auth tables. Auth via
  `TURSO_DATABASE_URL` + `TURSO_AUTH_TOKEN`. Clients are constructed lazily so a
  missing URL doesn't break the build.
- **Cloudflare R2** — public bucket serving the raw `.sqlite` Bible files; used as
  the fallback origin by the download proxy when TursoDB has no `download_url`
  (`CLOUDFLARE_BUCKET_PUBLIC_URL`).
- **Vercel** — hosting + Analytics (`@vercel/analytics`, production only) and
  auto-deploy on `develop` → `main`.

## Key Decisions & Trade-offs

- **OPFS SAHPool VFS instead of shared-memory OPFS** avoids the COOP/COEP
  cross-origin isolation headers that would otherwise be required, at the cost of
  a single-connection pool model.
- **Download proxy gzips and forces `NetworkOnly`** — the service worker must not
  cache `/api/bibles/download/` (`next.config.mjs`), because caching a multi-MB
  binary concurrently with the OPFS write hangs `importDb` in production.
- **`ignoreBuildErrors: true`** trades type-safety-at-build for shipping speed;
  there is no typecheck gate, so correctness relies on lint + manual review.
- **LIKE search, no FTS** — parity between server and client search behavior was
  prioritized over performance; acceptable at ~31k verses per version.

## Risks & Constraints

- No automated tests and no typecheck gate: regressions can reach `develop`/`main`
  if lint and manual verification miss them (see [Testing Strategy](./testing-strategy.md)).
- OPFS storage can be evicted under pressure; `requestPersistentStorage()`
  mitigates but does not guarantee retention.
- The single worker serializes all SQL; heavy concurrent queries share one thread.
- `bible_books` uses a composite PK `(id, version_id)` on the server — book IDs
  are only unique within a version.

## Top Directories Snapshot

- `components/` — ~19 top-level files + `ui/` primitives.
- `lib/` — ~19 top-level files + `api/`, `database/`, `db/` subtrees.
- `app/` — 4 files + 6 route/page directories (`api`, `auth` nested, `config`,
  `test-panel`, `database-test`, `~offline`).
- `scripts/` — 5 Node ESM scripts.
- `public/sqlite-wasm/` — WASM runtime (`jswasm/`) + generated worker.

## Related Resources

- [Project Overview](./project-overview.md)
- [Development Workflow](./development-workflow.md)
- [Security & Compliance Notes](./security.md)
- [Glossary & Domain Concepts](./glossary.md)
