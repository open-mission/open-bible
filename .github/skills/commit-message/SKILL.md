---
name: commit-message
description: Generate commit messages that follow conventional commits and repository scope conventions. Use when Creating git commits after code changes, Writing commit messages for staged changes, or Following conventional commit format for the project
---

## Workflow

1. Review staged changes with `git diff --staged`.
2. Pick a type from the commitlint-allowed set ONLY (enforced by the `commit-msg` hook and CI): `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `improve`, `test`, `chore`, `ci`, `revert`, `wip`. Note `improve` is project-specific (used for enhancements, mirroring `improve/` branches); there is no `build` type here.
3. Scope is optional; when useful, use an area name that matches the codebase (`api`, `auth`, `db`, `reader`, `search`, `pwa`, `ui`, `deps`).
4. Write a concise, imperative subject (no trailing period). Portuguese or English are both present in history — match the surrounding commits on the branch.
5. Add a body only to explain the "why" if it is not obvious from the diff.
6. Reference the issue in the PR body with `Closes #nr` (branches are squash-merged into `develop`, so the final squash message is what matters most). Individual commit footers may use `Refs #nr`.
7. Prefer `pnpm commit` (Commitizen / `cz-conventional-changelog`) for a guided prompt that guarantees a valid format. Never bypass with `--no-verify`.

## Examples

**Feature (guided via `pnpm commit` or written directly):**
```
feat(reader): add multi-verse note linking

Notes can now span a verse range (verseStart..verseEnd) within a
book/chapter, matching the note_references schema.

Refs #42
```

**Bug fix:**
```
fix(db): route /api/bibles/download as NetworkOnly

Cached download responses corrupted concurrent OPFS writes and hung
Bible imports in production.

Refs #57
```

**Project-specific enhancement type:**
```
improve(search): case-insensitive LIKE parity between server and client
```

## Quality Bar

- Type MUST be one of: `feat, fix, docs, style, refactor, perf, improve, test, chore, ci, revert, wip`. Any other type fails the `commit-msg` hook and PR CI.
- Imperative mood, no trailing period, keep the subject short (~50 chars).
- One logical change per commit; the branch is squash-merged so keep the eventual squash subject meaningful.
- Blank line between subject and body; body explains why, not what.
- Never use `--no-verify` to skip commitlint or the pre-commit lint hook.
- If a hook fails, fix the issue and create a NEW commit — do not `--amend` to sneak past hooks.
- Put `Closes #nr` in the PR description (targeting `develop`) so the issue auto-closes and moves to Done.

## Resource Strategy

- No helper resources needed — the guided `pnpm commit` flow plus this type list is sufficient.
- Add `references/` only if the team later adopts a longer scope taxonomy worth codifying.
- Do not add `scripts/` or `assets/`; commitlint config already lives in the repo and enforces the rules.
