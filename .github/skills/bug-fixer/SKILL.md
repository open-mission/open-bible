---
name: bug-fixer
description: Diagnose and resolve defects in Open Bible with root-cause focus. Use when investigating crashes, wrong verse/search results, offline/OPFS failures, PWA/service-worker issues, auth errors, or API 4xx/5xx responses. Triggers on bug reports, error messages, or unexpected behavior.
---

# Bug Fixer Skill

Diagnoses and resolves defects in Open Bible with a bias toward root cause over symptom. Operates in the Execute and Verify (E, V) phases: reproduce, isolate, fix on a `fix/{issue-nr}-desc` branch off `develop`, and verify with `pnpm lint` and `pnpm build`.

## Responsibilities

- Reproduce the reported bug and pin down which layer owns it: API (`lib/api/`), client SQLite worker (`lib/database/`), React UI (`components/`, `app/`), auth (`lib/auth.ts`), or PWA/service worker (`next.config.mjs`, generated `public/sw.js`).
- Trace data flow: `useBibleVerses()` → `BibleVersionContext.getVerses()` → `DatabaseManager` → worker → OPFS SQLite, and the parallel server path through `bible-service.ts`.
- Fix the root cause with the smallest safe change; add a guard or comment where a subtle invariant was violated.
- Verify the fix manually in `pnpm dev` and confirm `pnpm lint` and `pnpm build` pass.
- Write a regression note in the PR describing repro steps.

## Workflow

1. Reproduce before fixing; never patch a symptom you cannot trigger.
2. Classify the layer: Offline client DB, Server API, Auth, UI/state.
3. Trace the offline-first data flow when reading/verses are wrong.
4. Check classic gotchas before deep debugging (see Quality Bar).
5. Inspect state in the browser: DevTools → Application → OPFS.
6. Bisect if regression: `git log --oneline` on `develop`, then `git bisect`.
7. Form one hypothesis, confirm it, write the fix on a `fix/{issue-nr}-desc` branch off `develop`.
8. Verify manually, then `pnpm lint` and `pnpm build`.

## Key Gotchas

- `pnpm build` passes even with TS errors (`ignoreBuildErrors: true`).
- Worker source is `lib/database/sqlite-worker.source.js`, NOT the deployed copy in `public/sqlite-wasm/open-bible.worker.js`. Run `pnpm copy:wasm` if they diverge.
- `/api/bibles/download/` MUST be `NetworkOnly` in Workbox config (`next.config.mjs`).
- Search is `LIKE %q% COLLATE NOCASE` (no FTS) on both server and client.
- `bible_books` has composite PK `(id, version_id)` — book IDs repeat across versions.
- For stale-app bugs, check `useServiceWorkerUpdate` / `update-banner.tsx`.

## Key Files

- `lib/database/DatabaseManager.ts` — worker RPC facade
- `lib/database/sqlite-worker.source.js` — worker logic (OPFS SAHPool VFS)
- `lib/database/bible/BibleDatabase.ts` — read-only Bible queries
- `lib/bible-db.ts` — install/remove/query versions
- `lib/bible-version-context.tsx` + `lib/use-bible.ts` — client state and verse-fetch flow
- `lib/api/hono-app.ts` + `lib/api/bible-service.ts` — server routes and query/caching
- `lib/auth.ts` — Better Auth server
- `next.config.mjs` — Workbox caching and headers

## Quality Bar

- Reproduce before theorizing — no automated tests, so reproduction is the only reliable signal.
- Never edit `public/sqlite-wasm/open-bible.worker.js` directly.
- For OPFS "database is locked" / hanging imports: confirm `/api/bibles/download/` is `NetworkOnly`.
- `pnpm build` green does NOT mean type-safe (`ignoreBuildErrors: true`).
- Search behavior: LIKE parity between server and client.
- Always scope queries by `version_id` on `bible_books`.
- Fix branch: `fix/{nr}-desc` off `develop`, PR to `develop`, `Closes #nr`.
- Never use `--no-verify`; never force-push `main`/`develop`.
