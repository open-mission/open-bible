---
name: code-review
description: Review code quality, patterns, and best practices. Use when Reviewing code changes for quality, Checking adherence to coding standards, or Identifying potential bugs or issues
---

## Workflow

1. Read the PR/diff and the linked issue. Confirm the branch is `feat/`, `fix/`, or `improve/{nr}-desc` off `develop` and the PR targets `develop` with `Closes #nr` (per AGENTS.md). Flag anything targeting `main` directly.
2. Run the same gates CI runs — there are NO tests, so these three are the review floor:
   - `pnpm lint` (ESLint; also runs on staged files via lint-staged/pre-commit and in `.github/workflows/pr-validation.yml`).
   - `pnpm build` — but remember it will NOT fail on TS errors (`ignoreBuildErrors: true`). Manually eyeball types in changed `.ts/.tsx`; a green build is not type safety.
   - Commit messages against commitlint types: `feat, fix, docs, style, refactor, perf, improve, test, chore, ci, revert, wip`.
3. Check the correct layer for correctness:
   - Client DB (`lib/database/*`, `DatabaseManager.ts`, worker): confirm edits are in the SOURCE `lib/database/sqlite-worker.source.js`, not the generated `public/sqlite-wasm/open-bible.worker.js`. Confirm queries scope by `version_id` (composite PK `(id, version_id)` on `bible_books`).
   - API (`app/api/[[...route]]/route.ts`, `lib/api/bible-service.ts`, `lib/api/schemas.ts`): Zod schemas updated alongside routes; `/api/bibles/download/` still routed `NetworkOnly` in `next.config.mjs` workbox config.
   - Auth (`lib/auth.ts`, `lib/auth-client.ts`): no secrets logged or committed; `BETTER_AUTH_SECRET` still sourced from env (min 32 chars).
4. Verify React boundaries: `app/layout.tsx` is a server component; components adding client state/hooks/context must be `"use client"`. Check the provider order (ThemeProvider → BibleVersionProvider → ToastProvider) is intact.
5. Confirm user-facing strings are Portuguese and match existing tone.
6. Leave findings ordered by impact (correctness > data loss/locks > perf > style). Explain the "why" and give a concrete fix.

## Examples

**Correctness: query crosses Bible versions**
```
// Flag: bible_books has composite PK (id, version_id). Filtering by book id
// alone leaks rows from other installed versions.
db.select().from(bibleBooks).where(eq(bibleBooks.id, bookId));       // wrong

// Suggest:
db.select().from(bibleBooks)
  .where(and(eq(bibleBooks.id, bookId), eq(bibleBooks.versionId, versionId)));
```

**Process: edited the generated worker copy**
```
Diff touches public/sqlite-wasm/open-bible.worker.js directly.
Request change: edit the source lib/database/sqlite-worker.source.js and run
`pnpm copy:wasm`; the public/ file is regenerated on predev/prebuild and will
overwrite these edits.
```

## Quality Bar

- Treat `pnpm lint` + `pnpm build` passing as necessary but NOT sufficient — no tests means logic must be reasoned through and, ideally, exercised in `pnpm dev`.
- `pnpm build` green does NOT mean type-safe (`ignoreBuildErrors: true`). Do not approve type-risky code on build success alone.
- Block any diff that edits `public/sqlite-wasm/open-bible.worker.js` instead of `lib/database/sqlite-worker.source.js`.
- Block removal of the `NetworkOnly` rule for `/api/bibles/download/` in `next.config.mjs` (causes OPFS import hangs in prod).
- Verify SQLite/Drizzle queries scope by `version_id`; watch for missing `COLLATE NOCASE` parity between server and client search.
- Confirm no secrets in the diff (`.env.local`, `BETTER_AUTH_SECRET`, `TURSO_AUTH_TOKEN`).
- Confirm the PR targets `develop`, uses `Closes #nr`, conventional commit types, and will be squash-merged. Never approve `--no-verify` bypasses.
- Praise correct patterns (proper `"use client"` boundaries, scoped queries) so they propagate.

## Examples of scope

Review the diff, not the whole repo. Focus on files the PR touches plus their direct dependents (e.g. `lib/database/database.ts` is imported by 7 files — a change there warrants checking consumers).

## Resource Strategy

- Add `references/` only for a durable review checklist that outgrows this file (e.g. an OPFS/worker review matrix).
- Add `scripts/` only if a deterministic pre-review command bundle (lint + build) becomes worth scripting; otherwise call the pnpm commands directly.
- Do not add `assets/`; review produces comments, not shipped files.
- Keep findings in the PR review, not extra files in this skill folder.
