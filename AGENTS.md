# Open Bible — Project Overview

## What It Is
A **Portuguese-language Bible reading PWA** built with Next.js. Users browse 66 books/chapters, read verses from 18 Bible versions (offline-capable via IndexedDB), apply highlights, write notes, switch themes, and customize accent colors. Built with v0.dev, deployed on Vercel.

---

## Quick Commands

| Command | Purpose |
|---------|---------|
| `pnpm dev` | Start Next.js dev server |
| `pnpm build` | Next.js build (reads Bible data from TursoDB) |
| `pnpm build:data` | Generate JSON from SQLite (fallback/export only) |
| `pnpm db:init` | Initialize TursoDB tables |
| `pnpm db:import` | Import 18 SQLite databases into TursoDB |
| `pnpm start` | Production server |
| `pnpm lint` | ESLint (Next.js defaults) |

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
| `/api/auth/[...all]` | `app/api/auth/[...all]/route.ts` | Better Auth route handler |
| `/api/highlights` | `app/api/highlights/route.ts` | Highlights CRUD |
| `/api/notes` | `app/api/notes/route.ts` | Notes CRUD |

### Bible Version System
- **TursoDB** (`libsql://open-bible-claudioalberto.aws-us-east-2.turso.io`) — primary database for all Bible data
- Tables: `bible_versions` (18), `bible_books` (1,188), `bible_verses` (541,330)
- `lib/turso.ts` — TursoDB serverless client singleton
- `lib/api/bible-service.ts` — reads from TursoDB with 5-minute in-memory cache
- **IndexedDB** (`lib/bible-db.ts`) stores downloaded versions for offline use
- `BibleVersionProvider` (`lib/bible-version-context.tsx`) manages version state, download, and verse fetching
- `useBibleVerses()` hook (`lib/use-bible.ts`) loads verses (IndexedDB first, then API, then mock fallback)
- `BibleVersionSelector` and `ReaderVersionBadge` components handle version switching

### API Layer (`lib/api/`)
- **Hono + Zod OpenAPI** (`lib/api/hono-app.ts`) — endpoints for versions, chapters, search, books
- Schemas in `lib/api/schemas.ts`, service functions in `lib/api/bible-service.ts` (reads from TursoDB)
- Client in `lib/api-client.ts` fetches from `/api` routes
- API docs available at `/api/reference` (Scalar)
- CORS enabled for iOS app access

### Database Schema (`lib/db/schema.ts`)
```sql
bible_versions  (id PK, name, total_books)
bible_books     (id, version_id, name, abbreviation, testament, chapters, PK(id, version_id))
bible_verses    (id PK, version_id, book_id, chapter, verse, text)
highlights      (id PK, user_id, version_id, verse_id, color, custom_hex, created_at)
notes           (id PK, user_id, verse_ids, content, created_at, updated_at)
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
| Database | **TursoDB** (serverless libSQL) — Bible data, highlights, notes |
| Auth | **Better Auth** with libSQL adapter |
| Offline | **IndexedDB** for downloaded versions + service worker cache |
| DB (build) | **better-sqlite3** (reads `.sqlite` files for data import) |
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

- `pnpm build` reads Bible data from TursoDB at runtime — no local data build needed
- `.env.local` contains `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`, and `BETTER_AUTH_SECRET` — never committed
- `better-sqlite3` is a native module used only for data import (`scripts/import-bibles.mjs`)
- `bible_books` uses composite PK `(id, version_id)` — book IDs repeat across versions
- Search uses `LIKE` (no FTS) — acceptable for 18 versions with ~31k verses each
- No test framework, no ESLint config, no CI/CD (beyond Vercel auto-deploy)

---

## File Tree

```
├── lib/
│   ├── turso.ts                  # TursoDB serverless client
│   ├── auth.ts                   # Better Auth server config
│   ├── auth-client.ts            # Better Auth React client
│   ├── bible-db.ts               # IndexedDB wrapper for offline versions
│   ├── bible-version-context.tsx  # BibleVersionProvider + useBibleVersion()
│   ├── use-bible.ts              # useBibleVerses() hook
│   ├── use-media-query.ts        # useIsMobile() hook
│   ├── use-toast.tsx             # ToastProvider + useToast()
│   ├── api-client.ts             # Fetch client for /api routes
│   ├── store.ts                  # localStorage persistence + API helpers
│   ├── db/
│   │   ├── schema.ts             # SQL schema for all 5 tables
│   │   └── index.ts              # initializeDatabase() + turso re-export
│   └── api/
│       ├── hono-app.ts           # Hono app with OpenAPI routes
│       ├── schemas.ts            # Zod schemas for API
│       └── bible-service.ts      # Service functions (TursoDB reads)
├── components/
│   ├── bible-version-selector.tsx
│   ├── reader-version-badge.tsx
│   ├── note-editor-dialog.tsx
│   ├── service-worker-register.tsx
│   └── ui/bottom-sheet.tsx
├── scripts/
│   ├── build-bible-data.mjs      # SQLite → JSON (fallback/export only)
│   ├── import-bibles.mjs         # SQLite → TursoDB import
│   └── init-db.mjs               # Initialize TursoDB tables
├── resources/bibles/              # 18 SQLite databases (source for import)
└── public/sw.js                   # Service worker
```
