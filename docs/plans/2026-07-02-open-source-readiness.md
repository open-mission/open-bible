# Open Source Readiness — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the Open Bible repository into a polished, credible open-source project ready for public promotion across social media.

**Architecture:** All changes are file-level (creation, modification, deletion) plus GitHub Settings toggles. No runtime code changes. Work can be parallelized across independent tasks.

**Tech Stack:** Markdown, YAML, GitHub UI, git, Bash

## Global Constraints

- All new docs must follow existing style of CONTRIBUTING.md/README.md
- `main` and `develop` branches are protected — all changes go through PRs to `develop`
- Conventional Commits format required for all commits
- No runtime application code changes

---

### Task 1: Create SECURITY.md

**Files:**
- Create: `SECURITY.md`
- Reference: `.github/CODEOWNERS`

- [ ] Create `SECURITY.md` with:
  - Supported versions (latest only)
  - Private reporting process (email or security advisory via GitHub)
  - Disclosure timeline (90 days to patch)
  - Attribution policy
- [ ] Commit

---

### Task 2: Create .gitattributes

**Files:**
- Create: `.gitattributes`

- [ ] Create `.gitattributes`:
  ```
  * text=auto eol=lf
  *.png binary
  *.jpg binary
  *.ico binary
  *.wasm binary
  *.sqlite binary
  *.db binary
  CHANGELOG.md merge=union
  ```
- [ ] Commit

---

### Task 3: Consolidate AI Agent Configs into `.agents/`

**Files:**
- Modify: `.gitignore`
- Remove from git tracking: various AI config dirs

- [ ] Inventory what's useful in each AI config dir
- [ ] Move non-redundant configs into `.agents/` with clear subdirectory naming
- [ ] Add to `.gitignore` patterns for AI tool configs
- [ ] Remove tracked AI config files from git
- [ ] Commit

---

### Task 4: Change package.json `private` to `false`

**Files:**
- Modify: `package.json`

- [ ] Change `"private": true` to `"private": false`
- [ ] Commit

---

### Task 5: Translate README to English (bilingual)

**Files:**
- Rename: `README.md` → `README.pt-BR.md`
- Create: `README.md` (English version)

- [ ] Rename `README.md` → `README.pt-BR.md`
- [ ] Create new `README.md` in English with same structure
- [ ] Add language links in both versions
- [ ] Commit

---

### Task 6: Create FUNDING.yml

**Files:**
- Create: `.github/FUNDING.yml`

- [ ] Create `.github/FUNDING.yml` with placeholder entries
- [ ] Commit

---

### Task 7: Create SUPPORT.md

**Files:**
- Create: `SUPPORT.md`

- [ ] Create `SUPPORT.md` with support channels documentation
- [ ] Commit

---

### Task 8: Expand GitHub Repository Topics

- [ ] Run `gh repo edit` to add topics: `bible-study`, `sqlite-wasm`, `tauri`, `opfs`, `drizzle`, `offline-first`, `progressive-web-app`, `shadcn-ui`, `tailwindcss`, `portuguese`

---

### Task 9: GitHub Settings Changes (manual — via UI)

- [ ] Enable Discussions
- [ ] Enable Wiki
- [ ] Enable Dependabot Security Alerts
- [ ] Enable Secret Scanning
- [ ] Verify branch protection on `main` and `develop`

---

### Task 10: Add GitHub Stale Bot

**Files:**
- Create: `.github/workflows/stale.yml`

- [ ] Create `.github/workflows/stale.yml` with 60-day stale policy
- [ ] Commit

---

### Task 11: Add Community Badges to README

**Files:**
- Modify: `README.md` (English)
- Modify: `README.pt-BR.md` (Portuguese)

- [ ] Add PRs Welcome, Last Commit, Repo Size badges to both README files
- [ ] Commit

---

### Task 12: Add Basic Smoke Tests

**Files:**
- Create: `vitest.config.ts`
- Create: `tests/basic.test.ts`
- Modify: `package.json`

- [ ] Install vitest
- [ ] Create vitest config
- [ ] Write basic smoke test
- [ ] Add test script to package.json
- [ ] Run and verify
- [ ] Commit

---

### Task 13: Release Notes Enhancement

**Files:**
- Create: `.github/release.yml`

- [ ] Create `.github/release.yml` with label-based categories
- [ ] Commit

---

### Execution Order

```
Phase 1 — Foundation (Tasks 1-4): SECURITY.md, .gitattributes, agent cleanup, private→false
Phase 2 — Content (Tasks 5-8): Bilingual README, FUNDING, SUPPORT, topics
Phase 3 — CI/GitHub (Tasks 9-10): Settings + stale bot
Phase 4 — Polish (Tasks 11-13): Badges, tests, release notes
```

Tasks within a phase can be parallelized. Phase 3 (Task 9 — GitHub Settings) requires UI access.
