# Open Bible

Portuguese Bible PWA — Next.js 16, TursoDB, Tailwind v4, shadcn/ui (base-nova).

## Commands

| Command | Purpose |
|---------|---------|
| `pnpm dev` | Dev server (port 3000) |
| `pnpm build` | Reads TursoDB at build time; ignores all TS errors |
| `pnpm build:data` | SQLite → JSON export (fallback only) |
| `pnpm db:init` | Create TursoDB tables |
| `pnpm db:import` | Import 18 SQLite files into TursoDB |
| `pnpm start` | Production server |
| `pnpm lint` | `eslint .` (no config file in repo) |

No tests, no CI, no typecheck pass.

## Architecture

**Provider chain** (`app/layout.tsx`): `ThemeProvider` → `BibleVersionProvider` → `ToastProvider` → children. Layout is a server component; all other components are `"use client"` (except `components/ui/button.tsx`).

**Data flow**: `useBibleVerses()` → `BibleVersionContext.getVerses()` → IndexedDB (if installed) → API fallback (`/api/bibles/...`) → mock fallback (`lib/bible-data.ts`).

**API**: Hono + Zod OpenAPI at `app/api/[[...route]]/route.ts` (GET/POST/OPTIONS). Routes: `/api/bibles`, `/api/bibles/{version}`, `/api/bibles/{version}/books/{bookId}/chapters/{chapter}`, `/api/bibles/{version}/search`, `/api/bibles/{version}/books`. Docs at `/api/docs` (Scalar). CORS open for iOS app.

**Auth**: Better Auth at `app/api/auth/[...all]/route.ts`. Server (`lib/auth.ts`) uses TursoDB via Kysely dialect, email/password only, 7-day sessions. Client at `lib/auth-client.ts`.

**Highlights/Notes**: Dual persistence — localStorage (primary, via `lib/store.ts`) + TursoDB (via `app/api/highlights/route.ts`, `app/api/notes/route.ts`). Cross-tab sync via `CustomEvent("openbible:storage")`. Notes support multi-verse linking (`verseIds: string[]`); migration from single `verseId` in `migrateNotes()`.

## Storage Keys (localStorage)

`openbible:highlights`, `openbible:notes`, `openbible:book`, `openbible:chapter`, `openbible:version`, `openbible:default-version`

## Env (.env.local)

```
TURSO_DATABASE_URL=libsql://...
TURSO_AUTH_TOKEN=...
BETTER_AUTH_SECRET=... (min 32 chars)
BETTER_AUTH_URL=http://localhost:3000
```

## Key Gotchas

- `pnpm build` silently passes despite any TS errors (`ignoreBuildErrors: true` in both `tsconfig.json` and `next.config.mjs`)
- Search uses `LIKE %q% COLLATE NOCASE` (no FTS) — 31k verses × 18 versions
- `bible_books` uses composite PK `(id, version_id)` — book IDs repeat across versions
- `better-sqlite3` is native, dev-only, for import scripts only (`scripts/import-bibles.mjs`)
- pnpm overrides `hono` to `4.12.25` (pinned in package.json.pnpm.overrides)
- Tailwind v4 (`@tailwindcss/postcss`) — no `tailwind.config.js`, CSS via `@import "tailwindcss"`
- 15 accent colors defined in `lib/theme.ts` as CSS custom property overrides, controlled by `next-themes`
- `@base-ui/react` components via shadcn/ui base-nova style
- Service worker at `public/sw.js` (manual, not Next.js PWA config); MIME type + `Service-Worker-Allowed` header set in `next.config.mjs`
- `@vercel/analytics` renders only in production (`process.env.NODE_ENV === 'production'`)
- Portuguese UI strings throughout
