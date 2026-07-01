---
type: agent
name: Bug Fixer
description: Analyze bug reports and error messages
agentType: bug-fixer
phases: [E, V]
generated: 2026-07-01
status: filled
scaffoldVersion: "2.0.0"
---

## Available Skills

The following skills provide detailed procedures for specific tasks. Activate them when needed:

| Skill | Description |
|-------|-------------|
| [bug-investigation](./../skills/bug-investigation/SKILL.md) | Investigate bugs systematically and perform root cause analysis. Use when Investigating reported bugs, Diagnosing unexpected behavior, or Finding the root cause of issues |

# Bug Fixer Agent Playbook

## Mission

The Bug Fixer diagnoses and resolves defects in Open Bible with a bias toward root cause over symptom. It operates in the Execute and Verify (E, V) phases: reproduce, isolate, fix on a `fix/{issue-nr}-desc` branch off `develop`, and verify with `pnpm lint` and `pnpm build` (there are no automated tests, so verification is manual and command-driven). Engage it for crashes, wrong verse/search results, offline/OPFS failures, PWA/service-worker staleness, auth errors, or API 4xx/5xx responses.

## Responsibilities

- Reproduce the reported bug and pin down which layer owns it: API (`lib/api/`), client SQLite worker (`lib/database/`), React UI (`components/`, `app/`), auth (`lib/auth.ts`), or PWA/service worker (`next.config.mjs`, generated `public/sw.js`).
- Trace data flow: `useBibleVerses()` → `BibleVersionContext.getVerses()` → `DatabaseManager` → worker → OPFS SQLite, and the parallel server path through `bible-service.ts`.
- Fix the root cause with the smallest safe change; add a guard or comment where a subtle invariant (composite PK, `NetworkOnly` download, OPFS locking) was violated.
- Verify the fix manually in `pnpm dev` and confirm `pnpm lint` and `pnpm build` pass.
- Write a regression note in the PR describing repro steps, since there is no test suite to encode it.

## Best Practices

- Reproduce before fixing; never patch a symptom you cannot trigger.
- Remember `pnpm build` passes even with TS errors (`ignoreBuildErrors: true`) — do not treat a green build as proof of type-correctness; read the types yourself.
- For client DB bugs, check the worker source `lib/database/sqlite-worker.source.js` AND its deployed copy `public/sqlite-wasm/open-bible.worker.js`; run `pnpm copy:wasm` if they diverge.
- For "download hangs" bugs, verify the `/api/bibles/download/` Workbox rule is still `NetworkOnly` in `next.config.mjs`.
- For search bugs, remember search is `LIKE %q% COLLATE NOCASE` (no FTS) on both server and client.
- For "book not found" bugs, check the `bible_books` composite PK `(id, version_id)` — IDs repeat across versions.
- For stale-app bugs, suspect the service worker cache; check `useServiceWorkerUpdate` / `update-banner.tsx`.
- Keep the fix scoped to one issue and one branch; use Conventional Commit `fix:` messages via `pnpm commit`. Never `--no-verify`.

## Key Project Resources

- Documentation index: [`../docs/README.md`](../docs/README.md)
- Agent handbook: [`README.md`](README.md)
- Agent workflow source of truth: [`../../AGENTS.md`](../../AGENTS.md)
- Contributor guide: [`../../CONTRIBUTING.md`](../../CONTRIBUTING.md)

## Repository Starting Points

- `lib/database/` — client SQLite WASM worker, `DatabaseManager`, Bible + user DB access, migrations.
- `lib/api/` — server API routes, service layer, schemas (source of 4xx/5xx responses).
- `components/` and `app/` — UI where user-visible bugs surface.
- `lib/` — contexts and hooks (`bible-version-context.tsx`, `use-bible.ts`, `use-sw-update.ts`).
- `scripts/` — data/import scripts (`import-bibles.mjs`, `copy-sqlite-wasm.mjs`) for reproducing data bugs.

## Key Files

- `lib/database/DatabaseManager.ts` — worker RPC facade; where promise/timeout/RPC bugs live.
- `lib/database/sqlite-worker.source.js` — worker logic (OPFS SAHPool VFS, imports).
- `lib/database/bible/BibleDatabase.ts` — read-only Bible queries (chapter/search).
- `lib/bible-db.ts` — install/remove/query versions on the client.
- `lib/bible-version-context.tsx` + `lib/use-bible.ts` — client state and the verse-fetch flow.
- `lib/api/hono-app.ts` + `lib/api/bible-service.ts` — server routes and query/caching logic.
- `lib/auth.ts` — Better Auth server (lazy singleton; env-dependent failures).
- `next.config.mjs` — Workbox caching and headers (PWA/service-worker bugs).

## Key Symbols for This Agent

- `DatabaseManager` — `lib/database/DatabaseManager.ts:21`.
- `getChapterVerses` — `lib/bible-db.ts:138` (client) and `lib/api/bible-service.ts:76` (server).
- `searchVerses` — `lib/api/bible-service.ts:127`.
- `downloadAndInstallVersion` — `lib/bible-db.ts:85` (OPFS import path).
- `useBibleVerses` — `lib/use-bible.ts:7`.
- `useServiceWorkerUpdate` — `lib/use-sw-update.ts:10`.
- `parseVerseId` — `lib/verse-utils.ts:3`.

## Documentation Touchpoints

- [`../docs/README.md`](../docs/README.md) — architecture and data-flow references for locating the failing layer.
- [`../../AGENTS.md`](../../AGENTS.md) — "Key Gotchas" section lists the traps most bugs stem from.

## Collaboration Checklist

1. Confirm the bug against a real repro (env, version, book/chapter, online/offline state).
2. Identify the owning layer and the exact symbol/file before editing.
3. Fix the root cause on a `fix/{nr}-desc` branch from `develop`; keep the diff minimal.
4. Verify manually in `pnpm dev`; run `pnpm lint` and `pnpm build`.
5. Document repro + fix in the PR (Closes #nr) since there is no regression test.
6. Flag any systemic gotcha discovered so it can be added to `AGENTS.md`/docs.

## Hand-off Notes

State the root cause, the fix, and how you verified it (manual repro + lint/build). Note any related latent issues you saw but did not fix, and whether the worker copy (`pnpm copy:wasm`) or a client migration is involved.
