# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Everyday Brazilian readers: Christians who read Scripture on their phones — on the commute, at church, before bed. Simplicity and offline reliability outrank study-tool depth. Serious students are served secondarily (workspace tabs, multi-version comparison, notes), never at the cost of the casual reading flow.

## Product Purpose

Open Bible is an offline-first Holy Bible PWA in Portuguese. It lets anyone read 18 Portuguese Bible versions without an account, without a connection, and without their reading data leaving the device. Success means a reader installs it once and it simply works everywhere — subway, rural areas, airplane mode — with their notes and highlights intact and private.

## Positioning

True offline plus privacy: the entire Bible library runs as SQLite (WASM + OPFS) inside the browser, so reading, notes, and highlights work fully offline and stay client-side by default. Big apps treat offline as a cached-afterthought tied to an account and telemetry; Open Bible treats the device as the primary store. This mechanism — not marketing copy — is what a neighboring product could not truthfully copy overnight.

## Operating Context

- Used primarily as an installed PWA on phones (Android/iOS), also in desktop browsers.
- Tauri v2 wraps the same web app for desktop (macOS/Linux/Windows); Flatpak packaging exists.
- Real usage happens in low-connectivity environments; church use often means dim rooms and one-handed reading.
- Distribution: Vercel (web), GitHub Releases (desktop). Organization: open-mission (https://github.com/open-mission).

## Capabilities and Constraints

- 18 Portuguese Bible versions downloadable as SQLite databases into OPFS; read-only query layer per version (`BibleDatabase`).
- User data (notes, note references, highlights, categories) lives in a local `app.db` via Drizzle ORM over SQLite WASM; schema exists, highlights UI is still pending (v1.0 goal).
- Optional email/password accounts (Better Auth) exist server-side; reading requires none.
- Search is substring-based (`LIKE %q% COLLATE NOCASE`, mirrored locally); no FTS.
- Dark/light themes with 15 accent colors; Portuguese UI strings throughout.
- PWA service worker; `/api/bibles/download/` must stay NetworkOnly to avoid OPFS import deadlocks.
- Undecided product facts: cross-device sync (v1.x idea), verse sharing as images, reading plans, more languages — all explicitly future considerations, not commitments.

## Brand Commitments

- Name: **Open Bible**; GitHub organization **open-mission**; MIT-licensed open source (durable commitment).
- Local-first data: notes/highlights remain client-side by design (OPFS); any future sync must be explicit opt-in (durable commitment).
- Interface language: Portuguese (pt-BR) across all user-facing strings.

## Evidence on Hand

- Hero artwork: `public/hero.png`; Portuguese README: `README.pt-BR.md`.
- 18 real SQLite Bible database files used as seed/import sources (via `pnpm copy:wasm`, `scripts/`).
- Release history: `CHANGELOG.md`; forward plan: `ROADMAP.md`.
- No testimonials, user counts, benchmarks, press, or pricing claims exist — future work must not fabricate any.

## Product Principles

1. Offline is the default state, never a degraded fallback.
2. The reader's data belongs to the reader — on their device, by design.
3. An everyday reader must reach any verse within seconds; depth features may never complicate the first screen.
4. Portuguese-native experience: language and content decisions are made for Brazilian readers first.
5. Open and inspectable: the code, the data format, and the behavior can all be verified by anyone.
