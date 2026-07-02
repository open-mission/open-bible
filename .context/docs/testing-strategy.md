---
type: doc
name: testing-strategy
description: Test frameworks, patterns, coverage requirements, and quality gates
category: testing
generated: 2026-07-01
status: filled
scaffoldVersion: "2.0.0"
---

## Testing Strategy

Open Bible currently has **no automated test suite and no typecheck gate**. Quality is maintained through ESLint, commit-message validation, a green production build in CI, and manual verification of the PWA in the browser. This document describes the present reality and the conventions to adopt when tests are introduced.

## Test Types

- **Unit**: none yet. When added, colocate as `src/**/*.test.ts` (the dotcontext navigation config already points here). Pure targets first: `lib/api/schemas.ts`, `features/bible-reader/utils/verse-utils.ts` (`parseVerseId`), `lib/database/bible/book-meta.ts` (`testamentForBookInt`).
- **Integration**: none yet. Highest-value candidates are the Hono API handlers (`lib/api/bible-service.ts`, `app/api/[[...route]]/route.ts`) and the client SQLite WASM/OPFS data flow (`DatabaseManager`, `BibleDatabase`, `features/bible-reader/lib/bible-db.ts`).
- **E2E**: none yet. The offline-first reader flow (install a version → read a chapter → navigate) is the core journey worth covering, ideally with Playwright against `pnpm dev`.

## Running Tests

No test runner is configured. Available quality commands:

- Lint all files: `pnpm lint`
- Auto-fix staged files (runs on `pre-commit`): handled by `lint-staged`
- Production build (must stay green in CI): `pnpm build`

> Reminder: `pnpm build` passes even with TypeScript errors (`ignoreBuildErrors: true` in both `tsconfig.json` and `next.config.mjs`), so it does **not** function as a type gate.

## Quality Gates

- **CI** (`.github/workflows/pr-validation.yml`) runs on every PR to `develop`: commitlint (Conventional Commits) + `eslint .` + `next build`.
- **Git hooks**: `commit-msg` (commitlint) and `pre-commit` (lint-staged) enforce the same locally. Never bypass with `--no-verify`.
- **Coverage**: no threshold defined (no suite yet). When tests land, gate new modules rather than retrofitting the whole codebase at once.
- **Manual UI verification**: because there is no E2E coverage, verify feature and edge-case behavior in a browser before marking work complete — especially anything touching OPFS database import/read.

## Troubleshooting

- OPFS database imports can hang if Workbox caches the download route — `next.config.mjs` must keep `/api/bibles/download/` as `NetworkOnly` to avoid concurrent read/write locks.
- SQLite WASM runs in a single dedicated Web Worker with the OPFS SAHPool VFS; when debugging data issues, confirm the worker artifact was copied (`pnpm copy:wasm`).
- See also [development-workflow.md](development-workflow.md).
