---
type: doc
name: glossary
description: Project terminology, type definitions, domain entities, and business rules
category: glossary
generated: 2026-07-01
status: filled
scaffoldVersion: "2.0.0"
---

## Glossary & Domain Concepts

Open Bible models a Bible as **versions** (translations) containing **books**, each with numbered **chapters**, each with numbered **verses**. Users read verses offline and can attach **notes** (optionally spanning multiple verses via **note references**) and **highlights**. Translations are downloaded on demand as standalone SQLite databases and stored in the browser via OPFS.

## Type Definitions

- `Testament` — `"old" | "new"` @ `lib/types.ts:1`
- `Book` — book metadata (id, name, abbreviation, testament, chapters) @ `lib/types.ts:3`
- `Verse` — a single verse (id, bookId, chapter, verse, text) @ `lib/types.ts:11`
- `BibleState` — current reader selection (selectedBookId, selectedChapter) @ `lib/types.ts:18`
- API contracts (Zod) — `Version`, `VersionDetail`, `Book`, `Verse`, `ChapterResponse`, `SearchResult`, and their `Compact*` counterparts @ `lib/api/schemas.ts`
- User schema (Drizzle) — `Note`, `NoteReference`, `InstalledBible` (+ `New*` insert types) @ `lib/database/user/schema.ts`
- `VersionMeta` / `AvailableVersion` — installed vs. downloadable translation descriptors @ `features/bible-reader/lib/bible-db.ts`
- Theme — `ThemeColor`, `ThemeMode`, `ThemePalette`, `ThemeConfig` @ `features/theme/utils/theme.ts`

## Enumerations

There are no TypeScript `enum` declarations in application code. Bounded domains are expressed as string union types instead — notably `Testament` (`"old" | "new"`) and the theme unions (`ThemeMode`, `ThemePalette`, `ThemeColor`). (The `enum` entries in the raw symbol index all originate from vendored `sqlite-wasm` bundles under `public/`/`out/` and are not project code.)

## Core Terms

- **Version** — a Bible translation (e.g. `ara`). Identified by a `versionId`. 18 versions live on the server; each downloads as its own read-only SQLite DB (`ara.db`, …).
- **Installed version** — a translation the user has downloaded into OPFS; tracked in `installed_bibles` (`InstalledBible`).
- **Book** — a Bible book. On the server, `bible_books` uses a **composite primary key `(id, version_id)`** because book IDs repeat across versions.
- **Verse ID** — canonical reference parsed by `parseVerseId` @ `features/bible-reader/utils/verse-utils.ts`.
- **Note / Note Reference** — user annotation stored client-side; references support multi-verse ranges (`verseStart`, `verseEnd`, `book`, `chapter`, `bible`).
- **Highlight** — schema/migration-ready but **not currently active** in the UI or stored locally.
- **OPFS SAHPool VFS** — the SQLite WASM storage backend used client-side, chosen to sidestep COOP/COEP header requirements.
- **DatabaseManager / BibleDatabase** — the worker-RPC wrapper and the read-only Bible query interface, respectively.

## Acronyms & Abbreviations

- **PWA** — Progressive Web App (offline-first; service worker generated at `public/sw.js` by `@ducanh2912/next-pwa`).
- **OPFS** — Origin Private File System; persistent browser storage backing the SQLite databases.
- **VFS** — Virtual File System (SQLite abstraction; here the SAHPool implementation).
- **FTS** — Full-Text Search; **not** used. Search is `LIKE %q% COLLATE NOCASE` substring matching over ~31k verses × 18 versions.
- **R2** — Cloudflare R2 object storage; serves gzipped Bible database files via the download proxy.
- **ARA** — Almeida Revista e Atualizada, one Portuguese translation (example `versionId`).

## Personas / Actors

The primary user is a Portuguese-speaking Bible reader who wants fast, offline reading with personal notes. Their core workflow: pick a translation → download it → read and navigate chapters → optionally annotate verses. A secondary consumer is the companion **iOS app**, which reads the same open `/api/*` endpoints (hence CORS is open).

## Domain Rules & Invariants

- User annotations and reading position stay **on-device** (OPFS `app.db`); the server holds only auth data. See [security.md](security.md).
- `bible_books` composite PK `(id, version_id)` must be respected in all server queries — a book ID alone is not unique.
- Search parity: server and local SQLite both use case-insensitive substring matching (no FTS) so results match across online/offline modes.
- All user-facing strings are Portuguese.
