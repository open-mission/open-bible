![Open Bible](public/hero.svg)

<p align="center">
  <h1 align="center"><b>Open Bible</b></h1>
  <p align="center">
    The offline-first Holy Bible for web, mobile, and desktop
    <br />
    <a href="https://openbible-prod.vercel.app"><strong>🌐 Open App »</strong></a>
    <br />
    <br />
    <a href="https://github.com/open-mission/open-bible/issues">Report Bug</a>
    ·
    <a href="https://github.com/open-mission/open-bible/issues">Feature Request</a>
    ·
    <a href="CONTRIBUTING.md">Contributing</a>
  </p>
</p>

<p align="center">
  <a href="https://github.com/open-mission/open-bible/releases">
    <img src="https://img.shields.io/github/v/release/open-mission/open-bible?style=for-the-badge&logo=github&color=5c6bc0" alt="Version" />
  </a>
  <a href="LICENSE">
    <img src="https://img.shields.io/github/license/open-mission/open-bible?style=for-the-badge&color=26c6da" alt="License" />
  </a>
  <a href="https://nextjs.org">
    <img src="https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  </a>
  <a href="https://openbible-prod.vercel.app">
    <img src="https://img.shields.io/badge/PWA-Offline--First-5c6bc0?style=for-the-badge&logo=pwa" alt="PWA" />
  </a>
  <img src="https://img.shields.io/github/last-commit/open-mission/open-bible/develop?style=for-the-badge&label=updated" alt="Last Commit" />
</p>

<p align="center">
  <a href="README.pt-BR.md">🇧🇷 Português</a>
</p>

---

## ✨ Features

- 📖 **18 Bible versions** in Portuguese available for download and offline use
- ⚡ **Offline-First** — SQLite WASM running directly in the browser via OPFS
- 📝 **Notes and annotations** saved locally per verse
- 🌙 **Dark/Light theme** with 15 customizable accent colors
- 📱 **Installable PWA** — works like a native app on iOS and Android

### Coming Soon 🚀

- 🔍 **Advanced search** by word or phrase across any version
- 🎨 **Highlights and bookmarks** with customizable colors

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | [Next.js 16](https://nextjs.org) (App Router) |
| **UI** | [shadcn/ui](https://ui.shadcn.com) + [Tailwind CSS v4](https://tailwindcss.com) |
| **Database** | SQLite WASM + OPFS + [Drizzle ORM](https://orm.drizzle.team) |
| **Desktop** | [Tauri v2](https://tauri.app) (macOS, Linux, Windows) |
| **Deploy** | [Vercel](https://vercel.com) |

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) ≥ 20
- [pnpm](https://pnpm.io) ≥ 9

### Installation

```bash
git clone git@github.com:open-mission/open-bible.git
cd open-bible
pnpm install
cp .env.local.example .env.local
pnpm dev
```

> The `predev` script automatically copies SQLite WASM assets to `public/`.

---

## 📋 Available Scripts

| Script | Description |
|--------|-------------|
| `pnpm dev` | Development server (port 3000) |
| `pnpm build` | Production build |
| `pnpm commit` | Interactive semantic commit |
| `pnpm release` | Create a release with version bump |
| `pnpm desktop:dev` | Desktop app (Tauri) dev mode |
| `pnpm desktop:build` | Production desktop app build |

---

## 🖥️ Desktop (Tauri)

Open Bible also runs as a native app (macOS, Linux, and Windows) via [Tauri v2](https://tauri.app),
reusing the same Next.js frontend (static export) and the offline SQLite WASM + OPFS reading stack.
The `/api/*` routes are excluded from the desktop bundle — Bible version downloads point to the remote API.

### Prerequisites

- [Rust](https://www.rust-lang.org/tools/install) (stable toolchain)
- System dependencies by OS:
  - **macOS** — Xcode Command Line Tools (`xcode-select --install`)
  - **Linux** — `libwebkit2gtk-4.1-dev libappindicator3-dev librsvg2-dev patchelf`
  - **Windows** — [Microsoft C++ Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/) + WebView2

### Development

```bash
pnpm desktop:dev     # opens the native window pointing to dev server (port 3000)
pnpm desktop:build   # generates installer in src-tauri/target/release/bundle/
```

### Release

Pushing a `v*` tag triggers the [`desktop-release.yml`](.github/workflows/desktop-release.yml) workflow,
which builds for all three OSes in parallel and attaches the installers to a **draft GitHub Release**
for review before publishing.

> ⚠️ **Unsigned builds.** Current installers lack code signing. On **macOS**, bypass Gatekeeper
> with right-click → *Open* (or `xattr -dr com.apple.quarantine "Open Bible.app"`). On **Windows**,
> click *More info* → *Run anyway* on the SmartScreen prompt.

---

## 🌿 Commits & Branches

This project uses **[Conventional Commits](https://www.conventionalcommits.org/)** with automatic validation via `commitlint` and `husky`.

### Semantic Commits

```bash
feat(reader): add font size adjustment
fix(ios): prevent keyboard from hiding input
docs: update API documentation
chore(deps): upgrade Next.js to 16.3
```

Use `pnpm commit` for an interactive guide.

### Branch Strategy

```
main          ← production (auto-deploy via Vercel)
 └── develop  ← integration (base for PRs)
       └── feat/feature-name
       └── fix/bug-name
       └── improve/enhancement-name
```

### Workflow

1. **Create an issue** using the appropriate template
2. **Create a branch** from `develop`:
   - `feat/{nr}-desc` for features
   - `fix/{nr}-desc` for bugs
   - `improve/{nr}-desc` for improvements
3. **Develop** with semantic commits
4. **Open a PR** referencing the issue: `Closes #nr`
5. **Merge** after review → Issue auto-closes

> See [CONTRIBUTING.md](CONTRIBUTING.md) for the full guide.

---

## 📜 License

Distributed under the [MIT license](LICENSE). See `LICENSE` for more details.

---

<div align="center">

Built with ❤️ for the mission — [open-mission](https://github.com/open-mission)

</div>
