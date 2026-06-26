# Open Bible — Project Overview

## What It Is
A **Portuguese-language Bible reading PWA** built with Next.js. Users browse 66 books/chapters, read verses from 18 Bible versions (offline-capable via IndexedDB), apply highlights, write notes, switch themes, and customize accent colors. Built with v0.dev, deployed on Vercel.

---

## Quick Commands

| Command | Purpose |
|---------|---------|
| `pnpm dev` | Start Next.js dev server |
| `pnpm build` | Build Bible data from SQLite, then Next.js build |
| `pnpm build:data` | Only rebuild `public/data/bibles/` from `resources/bibles/*.sqlite` |
| `pnpm start` | Production server |
| `pnpm lint` | ESLint (Next.js defaults) |

**Build pipeline**: `pnpm build` runs `scripts/build-bible-data.mjs` first (reads `resources/bibles/*.sqlite` → writes JSON to `public/data/bibles/`), then `next build`.

---

## Architecture

### Provider Tree (root layout)
`ThemeProvider` → `BibleVersionProvider` → `ToastProvider` → children

### Routing (App Router)
| Route | File | Description |
|-------|------|-------------|
| `/` | `app/page.tsx` | Main SPA — sidebar + reader |
| `/config` | `app/config/page.tsx` | Preferences — theme, accent color, default version |
| `/api/[...route]` | `app/api/[[...route]]/route.ts` | Hono REST API (versions, chapters, search, books) |

### Bible Version System
- **18 SQLite databases** in `resources/bibles/` (ACF, NVI, KJA, etc.)
- `scripts/build-bible-data.mjs` reads SQLite → generates per-chapter JSON in `public/data/bibles/<version>/<book>-<chapter>.json`
- Generated data is gitignored (`public/data/bibles/`)
- **IndexedDB** (`lib/bible-db.ts`) stores downloaded versions for offline use
- `BibleVersionProvider` (`lib/bible-version-context.tsx`) manages version state, download, and verse fetching
- `useBibleVerses()` hook (`lib/use-bible.ts`) loads verses (IndexedDB first, then API, then mock fallback)
- `BibleVersionSelector` and `ReaderVersionBadge` components handle version switching

### API Layer (`lib/api/`)
- **Hono + Zod OpenAPI** (`lib/api/hono-app.ts`) — endpoints for versions, chapters, search, books
- Schemas in `lib/api/schemas.ts`, service functions in `lib/api/bible-service.ts` (reads from `resources/bibles/*.sqlite` via better-sqlite3)
- Client in `lib/api-client.ts` fetches from `/api` routes
- API docs available at `/api/reference` (Scalar)
- CORS enabled for iOS app access

### Data Model (`lib/types.ts`)
```typescript
Book        { id, name, abbreviation, testament: "old"|"new", chapters }
Verse       { id, bookId, chapter, verse, text }
Highlight   { id, verseId, versionId?, color: HighlightColor, customHex?, createdAt }
Note        { id, verseIds: string[], content, createdAt, updatedAt }
BibleState  { selectedBookId, selectedChapter }
```

### State & Persistence
- **Highlights/Notes**: `localStorage` via `useHighlights()` / `useNotes()` hooks in `lib/store.ts`
- Keys: `openbible:highlights`, `openbible:notes`, `openbible:book`, `openbible:chapter`
- **Version**: `openbible:version` (active), `openbible:default-version`
- Notes support multi-verse linking (`verseIds: string[]`)
- Cross-tab sync via `CustomEvent("openbible:storage")`

### PWA
- `public/manifest.json` — standalone, pt-BR, portrait
- `public/sw.js` — caches static assets + version JSON for offline reading
- `ServiceWorkerRegister` component in root layout
- `next.config.mjs` headers ensure `sw.js` has correct MIME type and `Service-Worker-Allowed`

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | **Next.js 16** (App Router) |
| Language | **TypeScript 5.7** (strict) |
| UI | **React 19** |
| Styling | **Tailwind CSS v4** + `tw-animate-css` + shadcn/base-nova |
| Components | `@base-ui/react` via shadcn/ui |
| API | **Hono** + `@hono/zod-openapi` + Zod v4 |
| DB (build) | **better-sqlite3** (reads `.sqlite` files at build time) |
| Offline | **IndexedDB** for downloaded versions + service worker cache |
| Icons | Lucide React |
| Theme | `next-themes` + custom accent color system |
| Package Manager | **pnpm** (overrides hono to 4.12.25) |
| Fonts | Inter (sans), Lora (serif), Geist Mono |

---

## Key Conventions

- All components `"use client"` (except `app/layout.tsx` and `components/ui/button.tsx`)
- Imports use `@/` path alias → project root
- Tailwind utility classes only — no CSS modules
- Portuguese UI strings throughout
- `next.config.mjs`: `ignoreBuildErrors: true`, `images.unoptimized: true`
- `components.json`: shadcn/ui base-nova style, RSC enabled, lucide icons

---

## Known Gotchas

- `pnpm build` **must** run the data build first (`scripts/build-bible-data.mjs`) — it's wired into the build script automatically
- Generated Bible JSON (`public/data/bibles/`) is gitignored — run `pnpm build:data` to regenerate
- `better-sqlite3` is a native module; `pnpm` only builds it for the current platform
- Only 3 chapters have hardcoded mock verse text in `lib/bible-data.ts` (Gênesis 1, Salmos 23, João 1) — everything else loads from SQLite/IndexedDB or API
- No test framework, no ESLint config, no CI/CD (beyond Vercel auto-deploy)

---

## File Tree (new additions beyond original scaffold)

```
├── lib/
│   ├── bible-db.ts              # IndexedDB wrapper for offline versions
│   ├── bible-version-context.tsx # BibleVersionProvider + useBibleVersion()
│   ├── use-bible.ts             # useBibleVerses() hook
│   ├── use-media-query.ts       # useIsMobile() hook
│   ├── use-toast.tsx            # ToastProvider + useToast()
│   ├── api-client.ts            # Fetch client for /api routes
│   └── api/
│       ├── hono-app.ts          # Hono app with OpenAPI routes
│       ├── schemas.ts           # Zod schemas for API
│       └── bible-service.ts     # Service functions (SQLite reads)
├── components/
│   ├── bible-version-selector.tsx
│   ├── reader-version-badge.tsx
│   ├── note-editor-dialog.tsx
│   ├── service-worker-register.tsx
│   └── ui/bottom-sheet.tsx
├── scripts/
│   └── build-bible-data.mjs     # SQLite → JSON build script
├── resources/bibles/             # 18 SQLite databases (source of truth)
└── public/sw.js                  # Service worker
```
