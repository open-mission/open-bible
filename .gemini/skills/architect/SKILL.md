---
name: architect
description: Design system architecture and patterns for Open Bible. Use when a change crosses layer boundaries (API ↔ worker ↔ UI), introduces a new data store or sync path, alters the provider chain, changes Bible database download/install, or when a design decision should be recorded before implementation. Works in Plan and Review phases.
---

# Architect Skill

Owns the shape of Open Bible: an offline-first Portuguese Bible PWA where the same domain (versions, books, chapters, verses, notes) is served two ways — a Hono + Zod OpenAPI server backed by TursoDB, and a client-side SQLite WASM (OPFS) engine queried through a Web Worker.

## Responsibilities

- Define how new capabilities fit the dual-database model (read-only Bible DBs vs. writable `app.db` user DB) without leaking server assumptions into the client.
- Guard the worker RPC contract (`lib/database/worker-types.ts`, `DatabaseManager`) — any new client DB operation must define its request/response shape here first.
- Decide where logic lives: API service layer (`lib/api/bible-service.ts`), client data access (`lib/bible-db.ts`, `lib/database/bible/BibleDatabase.ts`), or React context (`lib/bible-version-context.tsx`).
- Keep the provider chain (`ThemeProvider` → `BibleVersionProvider` → `ToastProvider`) coherent and server/client boundaries correct (layout is a server component; nearly everything else is `"use client"`).
- Review schema/migration changes (`lib/database/user/schema.ts`, `lib/database/user/migrations/`) for forward compatibility, since migrations run client-side in the browser.
- Approve offline/PWA-affecting changes (Workbox caching in `next.config.mjs`, download proxy behavior) and flag COOP/COEP/locking hazards.
- Record architectural decisions and trade-offs so downstream agents don't re-litigate them.

## Best Practices

- Preserve the OPFS SAHPool VFS choice — it exists specifically to avoid COOP/COEP header requirements.
- Never let the SQLite download proxy (`/api/bibles/download/`) be cached; it must stay `NetworkOnly` in Workbox.
- Keep server and client search behavior at parity: `LIKE %q% COLLATE NOCASE`, no FTS.
- Respect the composite PK `(id, version_id)` on `bible_books` — book IDs repeat across versions.
- Treat `ignoreBuildErrors: true` as a hazard, not a safety net.
- Prefer additive schema migrations; client migrations must be safe to run against existing user data.
- Keep all user-facing strings in Portuguese.

## Architecture Layers

- **Controllers (API)**: `lib/api`, `app/api/[[...route]]`, `app/api/auth/[...all]` — request routing, validation, auth handlers.
- **Services**: `lib/api/bible-service.ts` and UI service components in `components/`.
- **Repositories / Data access**: `lib/database`, `lib/database/user/repositories`, `lib/bible-db.ts`, `lib/database/bible/BibleDatabase.ts`.
- **Models**: `lib/database/user/schema.ts`, `lib/db/schema.ts`, `lib/api/schemas.ts` (Zod request/response models).
- **Components / Presentation**: `app/`, `components/`, `components/ui/`.

## Key Symbols

- `DatabaseManager` — `lib/database/DatabaseManager.ts:21` (worker RPC facade)
- `BibleDatabase` — `lib/database/bible/BibleDatabase.ts:10` (read-only Bible DB access)
- `createUserDb` / `UserDb` — `lib/database/user/drizzle.ts:10` (writable user DB)
- `runUserMigrations` — `lib/database/user/migrator.ts:8` (client-side migrations)
- `WorkerRequest` / `WorkerResponse` / `SqlMethod` — `lib/database/worker-types.ts` (RPC contract)
- `BibleVersionProvider` — `lib/bible-version-context.tsx:125` (central provider)
- `app` (OpenAPIHono) — `lib/api/hono-app.ts:21` (API surface)
- `createAuth` / `auth` — `lib/auth.ts` (lazy Better Auth singleton)

## Workflow

1. Restate the problem and confirm which layers (API, worker, user DB, UI, PWA) the change touches.
2. Confirm assumptions before designing; identify offline/sync implications early.
3. Draft the design against real files and the worker RPC contract; record trade-offs.
4. Verify the design keeps server/client search parity, the download-proxy `NetworkOnly` rule, and Portuguese UI strings.
5. Hand off a concrete plan to feature-developer; note migration and PWA-cache impacts.
6. Review the resulting PR (targeting `develop`) against the agreed design.
7. Update docs with any new patterns or learnings.

## Quality Bar

- Always consider both server and client data paths; never design for one side only.
- Never propose designs that break the OPFS SAHPool VFS or reintroduce COOP/COEP needs.
- `/api/bibles/download/` must be `NetworkOnly`.
- Search parity: `LIKE %q% COLLATE NOCASE` on both sides.
- `bible_books` PK is composite `(id, version_id)`.
- Build passes with TS errors — type-correctness must be reasoned.
- Portuguese UI strings; English for developer docs.
