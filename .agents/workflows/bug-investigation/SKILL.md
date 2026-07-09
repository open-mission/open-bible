---
name: bug-investigation
description: Investigate bugs systematically and perform root cause analysis. Use when Investigating reported bugs, Diagnosing unexpected behavior, or Finding the root cause of issues
---

## Workflow

1. Reproduce first. Run `pnpm dev` (port 3000) and reproduce with exact steps, device, and Bible version. There is NO test suite, so reproduction is your only reliable signal — never trust "should work".
2. Classify the layer. Most Open Bible bugs live in one of four places:
   - **Offline client DB** (`lib/database/DatabaseManager.ts`, worker `public/sqlite-wasm/open-bible.worker.js`, OPFS SAHPool VFS) — hangs, "database is locked", missing verses after install.
   - **Server API** (`app/api/[[...route]]/route.ts` → `lib/api/bible-service.ts`) — 4xx/5xx, wrong search results, CORS.
   - **Auth** (`lib/auth.ts` Better Auth over TursoDB/Kysely, `lib/auth-client.ts`) — session/login failures.
   - **UI/state** (provider chain in `app/layout.tsx`: ThemeProvider → BibleVersionProvider → ToastProvider; `lib/bible-version-context.tsx`, hooks in `lib/use-*.ts`).
3. Trace the offline-first data flow when reading/verses are wrong: `useBibleVerses()` (`lib/use-bible.ts`) → `BibleVersionContext.getVerses()` → `DatabaseManager.openBible(versionId)` → worker RPC → SQLite WASM OPFS query. If a version is not installed it falls back to empty — an "empty chapter" is often "version not installed", not a query bug.
4. Check the classic gotchas before deep debugging (see Quality Bar) — worker source vs deployed copy, workbox NetworkOnly, `ignoreBuildErrors`, OPFS locks.
5. Inspect state in the browser: DevTools → Application → OPFS/IndexedDB for `app.db` and installed Bible DBs; Console for worker RPC errors; Network for `/api/bibles/*` and `/api/bibles/download/{version}`.
6. Bisect if the bug is a regression: `git log --oneline` on `develop`, then `git bisect`. Branches are short-lived and squash-merged, so suspect recent squashed commits on `develop`.
7. Form one hypothesis, confirm it with a log/breakpoint, then write the fix on a `fix/{issue-nr}-desc` branch off `develop`.
8. Verify manually: reproduce the original steps and confirm they now pass, then run `pnpm lint` and `pnpm build` (the CI gates — remember `build` will NOT fail on TS errors).

## Examples

**Bug: chapter loads empty after installing a Bible version**
```
## Bug: ARA chapter shows no verses after download

### Reproduction:
1. Fresh browser profile, open app, download "ARA" version
2. Open Genesis 1 — verses list is empty, no error toast

### Investigation:
- Network: GET /api/bibles/download/ara returned 200 (gzipped .db)
- Console: worker RPC "openBible" resolved, but query returned 0 rows
- OPFS (Application tab): ara.db present but 0 bytes
- Root cause: the download import hit a concurrent read/write LOCK —
  service worker was serving /api/bibles/download/ from cache instead of
  NetworkOnly, corrupting the OPFS write (see next.config.mjs workbox rule).

### Fix approach:
Ensure `/api/bibles/download/` is registered NetworkOnly in the workbox
runtimeCaching in next.config.mjs; re-import and confirm ara.db is non-empty.
```

**Bug: worker fix "doesn't apply" in production**
```
Symptom: patched worker logic works in `pnpm dev` but not after `pnpm build`.
Root cause: edited public/sqlite-wasm/open-bible.worker.js directly — that file
is a generated COPY. The tracked source is lib/database/sqlite-worker.source.js,
copied to public/ by scripts/copy-sqlite-wasm.mjs (runs on predev/prebuild).
Fix: edit lib/database/sqlite-worker.source.js, then `pnpm copy:wasm`.
```

## Quality Bar

- Reproduce before theorizing — with no automated tests, an unreproduced bug is an unverified fix.
- Never edit `public/sqlite-wasm/open-bible.worker.js` directly; the source of truth is `lib/database/sqlite-worker.source.js` (copied via `pnpm copy:wasm`).
- For OPFS "database is locked" / hanging imports: confirm `/api/bibles/download/` is `NetworkOnly` in the workbox config (`next.config.mjs`). Cached download responses corrupt concurrent OPFS writes.
- Remember `pnpm build` passes even with TypeScript errors (`ignoreBuildErrors: true` in `tsconfig.json` and `next.config.mjs`) — a green build does NOT mean type-safe. Read TS diagnostics in the editor/`tsc` manually if a type bug is suspected.
- Search behavior: server and client both use `LIKE %q% COLLATE NOCASE` (no FTS). Wrong/slow search is expected behavior, not a bug, unless results are actually incorrect.
- `bible_books` has composite PK `(id, version_id)` — a query joining/filtering by book `id` alone will cross versions. Always scope by `version_id`.
- Verify the fix with the original reproduction steps, then `pnpm lint` (pre-commit + CI) and `pnpm build` (CI). Commit on a `fix/{nr}-desc` branch off `develop`, PR to `develop`, `Closes #nr`.
- Never use `--no-verify`; never force-push `main`/`develop`; never `reset --hard` without explicit request.

## Resource Strategy

- Add `scripts/` only for a deterministic repro harness that is genuinely reused (e.g. a repeatable OPFS state reset) — otherwise reproduce manually in the browser.
- Add `references/` only when a recurring bug class needs a longer writeup than fits here (e.g. an OPFS lock troubleshooting matrix).
- Do not add `assets/`; bug investigation produces no shipped files.
- Prefer capturing findings in the GitHub issue (bug_report.md template) and the fix PR, not extra files in this skill folder.
