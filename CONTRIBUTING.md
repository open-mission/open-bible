# Contributing to Open Bible

Thank you for wanting to contribute! This guide explains how to keep the repository organized and professional.

---

## 📦 Environment Setup

```bash
# Clone the repository
git clone git@github.com:open-mission/open-bible.git
cd open-bible

# Install dependencies (includes husky and commitlint)
pnpm install

# Configure environment variables
cp .env.local.example .env.local   # edit with your keys

# Start the development server
pnpm dev
```

> **Note**: `pnpm install` automatically runs the `prepare` script, which installs Husky git hooks.

---

## 🌿 Branch Convention

Use the format `<type>/<short-description>` with lowercase letters and hyphens:

| Prefix | When to use | Example |
|---------|-------------|---------|
| `feat/` | New feature | `feat/offline-sync` |
| `fix/` | Bug fix | `fix/ios-scroll-crash` |
| `docs/` | Documentation | `docs/api-reference` |
| `refactor/` | Refactoring | `refactor/bible-database` |
| `perf/` | Performance | `perf/verse-loading` |
| `chore/` | Maintenance | `chore/update-deps` |
| `ci/` | CI/CD | `ci/add-lint-workflow` |

### Branch Flow

```
main          ← production (protected, auto-deploy via Vercel)
 └── develop  ← integration (base for PRs)
       └── feat/my-feature        ← working branches
       └── fix/critical-bug
```

- Always create your branches from `develop`
- PRs should be opened against `develop`, not `main`
- Merging `develop` → `main` creates a release

---

## 💬 Commit Convention (Conventional Commits)

This project uses **[Conventional Commits](https://www.conventionalcommits.org/)** automatically validated via `commitlint` in the `commit-msg` hook.

### Format

```
<type>(<optional scope>): <short description>

[optional body]

[optional footer — e.g.: BREAKING CHANGE, Closes #123]
```

### Allowed Types

| Type | When to use | Version impact |
|------|-------------|----------------|
| `feat` | New feature | `minor` (0.X.0) |
| `fix` | Bug fix | `patch` (0.0.X) |
| `docs` | Documentation only | none |
| `style` | Formatting without logic | none |
| `refactor` | Refactoring without feat/fix | none |
| `perf` | Performance improvement | `patch` |
| `test` | Adding or fixing tests | none |
| `chore` | Maintenance, CI, deps | none |
| `ci` | CI/CD pipeline changes | none |
| `revert` | Revert a previous commit | depends |
| `wip` | Work in progress (local only) | none |

### Valid Commit Examples

```bash
feat(reader): add font size adjustment slider
fix(install): prevent duplicate bible download on retry
docs: update contributing guide with branch conventions
chore(deps): upgrade next to 16.3.0
perf(search): cache verse lookup results in memory
refactor(database): extract BibleDatabase class to own module

# Breaking change (increments MAJOR):
feat!: redesign Bible version selection API

# With scope and body:
fix(ios): prevent keyboard from hiding verse input

Fixes an issue where the soft keyboard would obscure
the active input field on iOS Safari due to missing
viewport meta adjustments.

Closes #42
```

### Using the Interactive CLI

```bash
pnpm commit   # opens Commitizen — guides you through the correct format
```

### Invalid Commits (rejected by hook)

```bash
git commit -m "fix bug"          # ❌ no conventional type
git commit -m "Fix: something"   # ❌ uppercase type
git commit -m "feat(SCOPE): x"   # ❌ uppercase scope
```

---

## 🚀 Creating a Release

```bash
pnpm release           # interactive — choose patch/minor/major
pnpm release patch     # direct patch bump
pnpm release minor     # direct minor bump
pnpm release major     # direct major bump
pnpm release --dry-run # simulate without making changes
```

The script automatically:
1. Validates that the working directory is clean
2. Bumps the version in `package.json`
3. Creates a `chore(release): vX.Y.Z` commit
4. Creates an annotated `vX.Y.Z` tag
5. Pushes the branch and tag
6. Creates a GitHub Release with auto-generated notes

---

## 🔍 Code Review

- PRs must have a clear description of what changes and why
- Use the PR template available at `.github/pull_request_template.md`
- Prefer small, focused PRs over large ones
- Add screenshots for UI changes

---

## 📂 Project Structure

```
open-bible/
├── app/                    # Next.js App Router (server components)
│   ├── api/                # Hono API routes
│   ├── layout.tsx          # Root layout with providers
│   └── page.tsx            # Main page (reader)
├── components/             # React components
│   └── ui/                 # shadcn/ui base-nova
├── hooks/                  # Custom React hooks
├── lib/                    # Utilities and business logic
│   ├── database/           # SQLite WASM + Drizzle ORM
│   └── auth.ts             # Better Auth config
├── public/                 # Static assets (wasm, service worker)
├── scripts/                # Maintenance scripts
└── resources/              # Bibles in SQLite (not committed)
```
