# Open Bible — Project Overview

## What It Is
A **Portuguese-language Bible reading web app** built with Next.js. Users can browse books/chapters, read verses, apply highlights (4 preset colors + custom), write notes linked to verses, switch light/dark/system theme, and customize accent colors. Built with v0.dev and deployed on Vercel.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | **Next.js 16** (App Router) |
| Language | **TypeScript 5.7** (strict mode) |
| UI Library | **React 19** |
| Styling | **Tailwind CSS v4** + `tw-animate-css` + `shadcn/tailwind.css` (nova style) |
| PostCSS | `@tailwindcss/postcss` |
| Component Library | Base UI React (`@base-ui/react`) via shadcn/ui (base-nova style) |
| Icons | Lucide React |
| Theme | `next-themes` (dark/light/system) + custom accent color system |
| Package Manager | **pnpm** (with pnpm overrides for hono) |
| Fonts | Google Fonts: Inter (sans), Lora (serif), Geist Mono |
| Analytics | `@vercel/analytics` (production only) |
| Deployment | Vercel |

---

## Directory Structure

```
open-bible/
├── app/                        # Next.js App Router pages
│   ├── globals.css             # Tailwind CSS v4 + shadcn theme variables
│   ├── layout.tsx              # Root layout (fonts, ThemeProvider, Analytics)
│   ├── page.tsx                # Home page — main app shell (sidebar + reader)
│   └── config/
│       └── page.tsx            # Preferences page (theme mode + accent color)
├── components/
│   ├── ui/
│   │   └── button.tsx          # shadcn/ui Button (Base UI + CVA)
│   ├── book-list.tsx           # Searchable book list with OT/NT tabs
│   ├── chapter-grid.tsx        # Grid of chapter buttons for a book
│   ├── highlight-toolbar.tsx   # Floating toolbar (color swatches, note, close)
│   ├── notes-panel.tsx         # Slide-in panel for creating/editing notes
│   ├── reader.tsx              # Main reading pane (chapter nav, verse list)
│   ├── sidebar.tsx             # Tabbed sidebar (Bible nav, Highlights, Notes)
│   ├── theme-provider.tsx      # Theme + accent color context provider
│   └── verse-row.tsx           # Single verse display (highlight, note indicator)
├── lib/
│   ├── bible-data.ts           # Book definitions, mock verses, getVerses()
│   ├── store.ts                # localStorage hooks: useHighlights(), useNotes()
│   ├── theme.ts                # Accent color presets, CSS vars, storage
│   ├── types.ts                # TypeScript interfaces (Book, Verse, Highlight, Note, etc.)
│   └── utils.ts                # cn() helper (clsx + tailwind-merge)
├── public/                     # Static assets (icons)
├── components.json             # shadcn/ui config (base-nova style)
├── next.config.mjs             # TypeScript build errors ignored, images unoptimized
├── package.json
├── pnpm-lock.yaml
├── postcss.config.mjs
├── tsconfig.json               # @/* path alias → root, strict, ES6 target
├── next-env.d.ts
├── .gitignore                  # .env*, .next/, node_modules, .vercel
└── README.md
```

---

## Routing (App Router)

| Route | File | Description |
|-------|------|-------------|
| `/` | `app/page.tsx` | Main SPA — sidebar + reader. No server rendering for content. |
| `/config` | `app/config/page.tsx` | Preferences — theme mode + accent color picker. |

Both are `"use client"` components.

---

## Data Model (`lib/types.ts`)

```typescript
Book        { id, name, abbreviation, testament: "old"|"new", chapters }
Verse       { id, bookId, chapter, verse, text }
Highlight   { id, verseId, color: "amber"|"green"|"blue"|"rose"|"custom", customHex?, createdAt }
Note        { id, verseIds: string[], content, createdAt, updatedAt }
```

- **66 books** defined in `lib/bible-data.ts` (39 OT + 27 NT), all in Portuguese.
- **Verse data**: Only 3 mocked chapters (Gênesis 1, Salmos 23, João 1) have real text. All others generate placeholder text (`[Versículo N] ...`).
- `getVerses(bookId, chapter)` returns real or placeholder verses.

---

## State & Persistence

- **Highlights** and **Notes** persisted to `localStorage` via custom hooks in `lib/store.ts`.
- Keys: `openbible:highlights`, `openbible:notes`.
- Theme mode stored in `openbible:mode` (via `next-themes`).
- Accent color stored in `openbible:theme`.
- Notes support multi-verse linking (via `verseIds: string[]`). Migration from legacy `verseId` field included.

---

## Theme System

- **Mode**: light / dark / system — via `next-themes` (class strategy).
- **Accent colors**: 15 presets (neutral, amber, blue, cyan, emerald, fuchsia, green, indigo, lime, orange, pink, rose, violet, yellow, zinc).
- Accent colors override CSS custom properties `--primary`, `--primary-foreground`, `--ring` via `data-color` attribute on `<html>`.
- **Bible highlight colors**: amber, green, blue, rose (each with light + dark mode OKLCH values).

---

## Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| next | 16.2.6 | Framework |
| react / react-dom | 19.2.4 | UI |
| @base-ui/react | ^1.5.0 | Accessible UI primitives (Button) |
| @vercel/analytics | 1.6.1 | Production analytics |
| class-variance-authority | ^0.7.1 | Button variant/size classes |
| clsx | ^2.1.1 | Class name utility |
| lucide-react | ^1.16.0 | Icons |
| next-themes | ^0.4.6 | Theme toggle |
| tailwind-merge | ^3.3.1 | Merge Tailwind classes |
| tw-animate-css | ^1.4.0 | CSS animations |
| tailwindcss | ^4.2.0 | CSS framework |
| typescript | 5.7.3 | Type checking |

---

## Config Files

- **`components.json`**: shadcn/ui — base-nova style, RSC enabled, Tailwind v4, lucide icons, CSS variables.
- **`tsconfig.json`**: strict, `@/*` → root, ES6 target, bundler module resolution.
- **`next.config.mjs`**: `ignoreBuildErrors: true`, `images.unoptimized: true`.
- **`postcss.config.mjs`**: Only `@tailwindcss/postcss` plugin.
- **`.gitignore`**: Ignores `.env*`, `.next/`, `node_modules`, `.vercel`.

---

## Testing

**No test framework or test files found.** No test scripts in `package.json`. No ESLint or Prettier config files.

---

## Style & Conventions

- All components use `"use client"` except `app/layout.tsx` (RSC) and `components/ui/button.tsx`.
- Imports use `@/` path alias.
- Tailwind utility classes throughout (no CSS modules).
- Semantic HTML with `aria-*` attributes for accessibility.
- Portuguese UI strings throughout.
- `"type": "module"` not set — uses Next.js built-in ESM.
- Font variables passed via CSS custom properties (`--font-inter`, `--font-lora`, `--font-geist-mono`).

---

## Environment Variables

No `.env` files present. No environment variables defined. `@vercel/analytics` conditionally loaded via `process.env.NODE_ENV === 'production'`.

---

## Git History (main branch, 12 commits)

- Initial commit from v0.dev scaffold
- Several feature PRs (sidebar, theme, highlights, notes)
- Only branch with commits: `main`, one stale remote `v0/cafgdev-5954-a927621f`

---

## Known Gaps / TODOs

- No real Bible verse data (only 3 chapters mocked with real text).
- No search functionality across verses.
- No backend or API layer.
- No tests.
- No CI/CD configuration (beyond Vercel auto-deploy).

---

## Scripts

| Command | Action |
|---------|--------|
| `pnpm dev` | Start Next.js dev server |
| `pnpm build` | Production build |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint (no config found — likely uses Next.js defaults) |
