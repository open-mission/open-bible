<div align="center">

<img src="public/icon.png" alt="Open Bible Logo" width="96" height="96" />

# Open Bible

**Offline-first Holy Bible for web and mobile devices**

[![Version](https://img.shields.io/github/v/release/open-mission/open-bible?style=for-the-badge&logo=github&color=5c6bc0)](https://github.com/open-mission/open-bible/releases)
[![License](https://img.shields.io/github/license/open-mission/open-bible?style=for-the-badge&color=26c6da)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=for-the-badge)](CONTRIBUTING.md)
[![Last Commit](https://img.shields.io/github/last-commit/open-mission/open-bible/develop?style=for-the-badge&label=updated)](https://github.com/open-mission/open-bible/commits/develop)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![PWA](https://img.shields.io/badge/PWA-Offline--First-5c6bc0?style=for-the-badge&logo=pwa)](https://web.dev/progressive-web-apps/)

[**🌐 Open App**](https://open-bible.vercel.app) · [**🐛 Report Bug**](https://github.com/open-mission/open-bible/issues/new?template=bug_report.md) · [**✨ Feature Request**](https://github.com/open-mission/open-bible/issues/new?template=feature_request.md)

[🇧🇷 **Português**](README.pt-BR.md)

</div>

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
