---
source: AGENTS.md
type: codex
---

# Open Bible

Portuguese Bible PWA — Next.js 16, TursoDB (Server), SQLite WASM + OPFS + Drizzle ORM (Local), Tailwind v4, shadcn/ui (base-nova).

## Commands

| Command | Purpose |
|---------|---------|
| `pnpm dev` | Dev server (port 3000) — runs `predev` to copy sqlite-wasm assets |
| `pnpm build` | Production build — ignores TS errors, runs `prebuild` to copy sqlite-wasm assets |
| `pnpm copy:wasm` | Copies sqlite-wasm assets and seed Bibles to `public/` |
| `pnpm build:data` | SQLite → JSON export (fallback only) |
| `pnpm db:init` | Create TursoDB tables |
| `pnpm db:import` | Import 18 SQLite files into TursoDB |
| `pnpm start` | Production server |
| `pnpm lint` | `eslint .` (no config file in repo) |
| `pnpm release` | Guides version bump, commits, tags, pushes, and creates a GitHub Release |

No tests, no typecheck pass. CI valida commits + lint + build em cada PR (`.github/workflows/pr-validation.yml`).

## Workflow de Desenvolvimento

**Regras para agentes**: Toda nova feature, melhoria ou fix DEVE seguir este fluxo:

> **Skills (`.agents/skills/`)**: ao iniciar qualquer feature/fix/melhoria, use a skill
> **`feature-dev`** — ela orquestra spec → plano → branch isolada (worktree de `develop`) →
> implementação, usando o superpowers quando disponível. A mecânica de git está em **`dev-workflow`**.

### Criando Issues
- **Bug**: Usar template "Bug Report" → `gh issue create --template bug_report.md`
- **Feature**: Usar template "Feature Request" → `gh issue create --template feature_request.md`
- **Melhoria**: Usar template "Improvement" → `gh issue create --template improvement.md`

### Fluxo de Trabalho
1. **Criar issue** com template adequado e labels (`bug`, `enhancement`, `improvement`, `priority:*`)
2. **Criar branch** a partir de `develop`:
   - `fix/{issue-nr}-desc` para bugs
   - `feat/{issue-nr}-desc` para features
   - `improve/{issue-nr}-desc` para melhorias
3. **Desenvolver** com commits semânticos (`fix:`, `feat:`, `improve:`)
4. **Abrir PR para `develop`** referenciando a issue: `Closes #nr`
5. **Merge** após review (squash merge preferencial) — CI de PR deve passar
6. **Issue é automaticamente fechada** e movida para "Done" no projeto

> O merge de `develop` → `main` gera um release (deploy automático via Vercel).

### Estrutura de Branches
```
main          ← produção (protegida, deploy automático)
 └── develop  ← integração (base para todos os PRs)
       └── feat/42-highlight-verses
       └── fix/15-crash-on-search
       └── improve/38-dark-mode-toggle
```

### Branch Naming
```
feat/42-highlight-verses
fix/15-crash-on-search
improve/38-dark-mode-toggle
```

### Commit Messages
Tipos válidos (validados por `commitlint`): `feat`, `fix`, `docs`, `style`, `refactor`,
`perf`, `improve`, `test`, `chore`, `ci`, `revert`, `wip`.
```
feat: add verse highlighting
fix: crash when searching special characters
improve: better dark mode toggle UX
```
> Nunca use `--no-verify`. Os hooks (`commit-msg` valida o commitlint, `pre-commit` roda lint)
> e o CI de PR aplicam essas regras tanto para pessoas quanto para agentes.

### GitHub Project
- Projeto: **Open Bible** (nº 2) na organização `open-mission`
- URL: `https://github.com/orgs/open-mission/projects/2`
- Colunas: Backlog → To Do → In Progress → In Review → Done
- Issues são adicionadas automaticamente ao projeto via `gh project item-add`

## Architecture

**Provider chain** (`app/layout.tsx`): `ThemeProvider` → `BibleVersionProvider` → `ToastProvider` → children. Layout is a server component; all other components are `"use client"` (except `components/ui/button.tsx`).

**Client Database (Offline-First)**:
- Single dedicated **Web Worker** (`public/sqlite-wasm/open-bible.worker.js`) running official `@sqlite.org/sqlite-wasm` module with **OPFS SAHPool VFS** (sidestepping COOP/COEP header requirements).
- `DatabaseManager` wraps worker RPC with a promise API.
- User Database (`app.db`) runs **Drizzle ORM** client-side via `sqlite-proxy` driver.
- User schemas (`lib/database/user/schema.ts`) contain `notes`, `note_references`, and `installed_bibles`.
- Bible Databases (`ara.db`, ...) are opened read-only and queried via `BibleDatabase`.

**Data flow**: `useBibleVerses()` → `BibleVersionContext.getVerses()` → `database.openBible(versionId)` (local SQLite WASM OPFS query) → returns verses. If not installed, falls back to empty.

**API**: Hono + Zod OpenAPI at `app/api/[[...route]]/route.ts` (GET/POST/OPTIONS).
- Routes: `/api/bibles`, `/api/bibles/{version}`, `/api/bibles/{version}/books/{bookId}/chapters/{chapter}`, `/api/bibles/{version}/search`, `/api/bibles/{version}/books`.
- Download endpoint: `/api/bibles/download/{version}` proxies gzipped SQLite database files from TursoDB URL or Cloudflare R2 bucket.
- Docs at `/api/docs` (Scalar). CORS open for iOS app.

**Auth**: Better Auth at `app/api/auth/[...all]/route.ts`. Server (`lib/auth.ts`) uses TursoDB via Kysely dialect (`LibsqlDialect`), email/password only, 7-day sessions. Client at `lib/auth-client.ts`.

**Notes/Highlights**:
- Notes & Note References: Stored client-side in SQLite WASM (`app.db`) via `database.notes` and `database.noteReferences` (Drizzle repositories).
- Support multi-verse linking with ranges (`verseStart`, `verseEnd`, `book`, `chapter`, `bible`).
- Highlights: Schema/migration-ready, but not currently active in UI or stored locally.

## Storage Keys (localStorage)

`openbible:book`, `openbible:chapter`, `openbible:version`, `openbible:default-version`

## Env (.env.local)

```
TURSO_DATABASE_URL=libsql://...
TURSO_AUTH_TOKEN=...
BETTER_AUTH_SECRET=... (min 32 chars)
BETTER_AUTH_URL=http://localhost:3000
CLOUDFLARE_BUCKET_PUBLIC_URL=...
```

## Key Gotchas

- `pnpm build` silently passes despite any TS errors (`ignoreBuildErrors: true` in both `tsconfig.json` and `next.config.mjs`)
- SQLite Web Worker source lives in `lib/database/sqlite-worker.source.js` (tracked in git) and is deployed/copied to `public/sqlite-wasm/open-bible.worker.js` via the copy script.
- Workbox cache overrides in `next.config.mjs` MUST set `/api/bibles/download/` as `NetworkOnly` to avoid concurrent read/write locks that hang OPFS database imports in production.
- `drizzle-kit` is dev-only (`drizzle.config.ts`) and is used to generate migrations that are hand-embedded or run as client-side migrations via a browser-safe runtime migrator.
- Search uses `LIKE %q% COLLATE NOCASE` (no FTS) — 31k verses × 18 versions on server; local SQLite uses case-insensitive substring search for parity.
- `bible_books` uses composite PK `(id, version_id)` — book IDs repeat across versions on server.
- `better-sqlite3` is native, dev-only, for import scripts only (`scripts/import-bibles.mjs`).
- pnpm overrides `hono` to `4.12.25` (pinned in package.json.pnpm.overrides).
- Tailwind v4 (`@tailwindcss/postcss`) — no `tailwind.config.js`, CSS via `@import "tailwindcss"`.
- 15 accent colors defined in `lib/theme.ts` as CSS custom property overrides, controlled by `next-themes`.
- `@base-ui/react` components via shadcn/ui base-nova style.
- Service worker generated at `public/sw.js` by `@ducanh2912/next-pwa` at build time; MIME type + `Service-Worker-Allowed` headers set in `next.config.mjs`.
- `@vercel/analytics` renders only in production (`process.env.NODE_ENV === 'production'`).
- Portuguese UI strings throughout.
## AI Context References
- Documentation index: `.context/docs/README.md`
- Agent playbooks: `.context/agents/README.md`

