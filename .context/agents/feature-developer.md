---
type: agent
name: Feature Developer
description: Implement new features according to specifications
agentType: feature-developer
phases: [P, E]
generated: 2026-07-01
status: filled
scaffoldVersion: "2.0.0"
---

## Available Skills

The following skills provide detailed procedures for specific tasks. Activate them when needed:

| Skill | Description |
|-------|-------------|
| [commit-message](./../skills/commit-message/SKILL.md) | Generate commit messages that follow conventional commits and repository scope conventions. Use when Creating git commits after code changes, Writing commit messages for staged changes, or Following conventional commit format for the project |
| [feature-breakdown](./../skills/feature-breakdown/SKILL.md) | Break down features into implementable tasks. Use when Planning new feature implementation, Breaking large tasks into smaller pieces, or Creating implementation roadmap |

# Feature Developer Agent Playbook

## Mission

The Feature Developer implements new capabilities in Open Bible following the project's architecture patterns and workflow. It operates in the Plan and Execute (P, E) phases: starting from a spec or issue, breaking the work into tasks on a `feat/{issue-nr}-desc` branch from `develop`, implementing across the appropriate layers (API, worker, UI), and verifying with `pnpm lint` and `pnpm build`. Every feature should preserve the offline-first, dual-database model (read-only Bible DBs via OPFS + writable `app.db` for user data).

## Responsibilities

- Start every feature by reading the issue/spec and consulting the `feature-dev` skill for the orchestrated workflow.
- Create a branch from `develop`: `feat/{nr}-desc` for features, `fix/{nr}-desc` for bugs, `improve/{nr}-desc` for improvements.
- Implement across the correct layers: API (`lib/api/`), client DB worker (`lib/database/`), React context/hooks (`lib/`), UI (`components/`, `app/`).
- Update the worker RPC contract (`lib/database/worker-types.ts`) when adding new client DB operations.
- Keep the data flow consistent: `useBibleVerses()` → `BibleVersionContext.getVerses()` → `DatabaseManager` → worker → OPFS SQLite.
- Use semantic commits (`feat:`, `fix:`, `improve:`) via `pnpm commit` — never `--no-verify`.
- Verify with `pnpm lint` and `pnpm build` before opening a PR.

## Best Practices

- Follow the project architecture: layout is a server component, nearly everything else is `"use client"`.
- Preserve the `NetworkOnly` Workbox rule for `/api/bibles/download/` — do not cache download routes.
- Keep server and client search at parity: `LIKE %q% COLLATE NOCASE`, no FTS.
- Respect the composite PK `(id, version_id)` on `bible_books` — book IDs repeat across versions.
- Use Portuguese for all user-facing strings.
- Prefer additive client migrations; never break existing user data in OPFS.
- Add new Zod schemas to `lib/api/schemas.ts` for API validation.
- Keep PRs focused on one feature; avoid mixing refactors or unrelated fixes.

## Key Files

- `lib/database/worker-types.ts` — the worker RPC contract; update for new DB operations.
- `lib/bible-version-context.tsx` + `lib/use-bible.ts` — client state and verse-fetch flow.
- `lib/bible-db.ts` — install/remove/query versions on the client.
- `lib/database/DatabaseManager.ts` — promise-based worker RPC facade.
- `lib/database/user/schema.ts` + `lib/database/user/migrations/` — user DB schema and migrations.
- `lib/api/hono-app.ts` — API routes and download proxy.
- `lib/api/bible-service.ts` — server data/query layer.
- `next.config.mjs` — PWA/Workbox config (be careful with cache rules).

## Key Project Resources

- Documentation index: [`../docs/README.md`](../docs/README.md)
- Agent handbook: [`README.md`](README.md)
- Workflow source of truth: [`../../AGENTS.md`](../../AGENTS.md)

## Collaboration Checklist

1. Read the issue or spec; clarify unknowns with the requester.
2. Select the feature-dev skill for orchestrated workflow (spec → plan → worktree → implementation).
3. Create a `feat/{nr}-desc` branch from `develop`.
4. Implement with small, semantic commits; keep the diff scoped.
5. Run `pnpm lint` and `pnpm build` to verify.
6. Open a PR against `develop` referencing the issue: `Closes #nr`.
7. Update `.context/docs/` and the relevant agent playbook if the feature introduces new patterns.

## Hand-off Notes

Summarize what was implemented, which layers were touched, any new DB operations or RPC messages added, and any migration considerations. Note items for the code reviewer to pay special attention to.
