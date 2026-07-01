---
type: skill
name: Documentation
description: Generate and update technical documentation. Use when Documenting new features or APIs, Updating docs for code changes, or Creating README or getting started guides
skillSlug: documentation
phases: [P, C]
generated: 2026-07-01
status: filled
scaffoldVersion: "2.0.0"
---
## Workflow

1. Identify the source of truth before writing. In this repo the canonical docs hierarchy is: `AGENTS.md` (workflow, architecture, gotchas — the primary source), `CLAUDE.md` (pocket summary that points to AGENTS.md), `CONTRIBUTING.md` (human guide), and the `.context/` knowledge base (`.context/docs/README.md` index, `.context/agents/README.md` playbooks, `.context/skills/`).
2. Decide where the change belongs. Update the ONE authoritative place, then reconcile summaries — do not duplicate architecture prose across CLAUDE.md and AGENTS.md; CLAUDE.md should link, not restate.
3. For API docs, prefer the self-describing source: routes are Hono + Zod OpenAPI (`app/api/[[...route]]/route.ts`, schemas in `lib/api/schemas.ts`), rendered at `/api/docs` (Scalar). Keep Zod schemas as the contract; document behavior/edge cases in prose only where the schema cannot express it.
4. Write in the established voice: developer/agent docs in English; end-user UI strings in Portuguese.
5. Include copy-pasteable commands from the real script set (`pnpm dev`, `pnpm build`, `pnpm lint`, `pnpm copy:wasm`, `pnpm db:init`, `pnpm db:import`, `pnpm commit`, `pnpm release`). Do not invent a `pnpm test` — there is no test runner.
6. Ship docs in the same PR as the code change (targeting `develop`), so the two never drift.
7. Verify every command and path you cite actually exists before committing.

## Examples

**Documenting a new API route (prose complementing the Zod/OpenAPI contract):**
```
### GET /api/bibles/{version}/search?q=...
Case-insensitive substring search (`LIKE %q% COLLATE NOCASE`, no FTS) across
~31k verses. Schema: SearchResult (lib/api/schemas.ts). The local client
mirrors this behavior for offline parity. Response is also browsable at /api/docs.
```

**Reconciling the docs hierarchy (avoid duplication):**
```
Added the "Notes/Highlights" data model.
- Authoritative detail -> AGENTS.md (Architecture section)
- .context/docs -> add/refresh the relevant doc and its README index entry
- CLAUDE.md -> no change (it links to AGENTS.md; do not restate)
```

## Quality Bar

- AGENTS.md is the source of truth for workflow and architecture; keep it accurate first, then update summaries that reference it.
- Never document tooling that does not exist (no tests, no typecheck gate). Be honest that CI = commits + lint + build only.
- Cite real paths and commands; verify them against the repo before committing.
- Respect language split: English for contributor/agent docs, Portuguese for UI-facing copy.
- Prefer the Zod/OpenAPI schema + `/api/docs` as living API documentation over hand-maintained endpoint tables.
- Update docs in the same PR as the code; a `docs:` commit type exists for docs-only changes.
- Keep `.context/docs/README.md` and `.context/agents/README.md` indexes current when adding files there.

## Resource Strategy

- Add `references/` only when a topic (e.g. the OPFS/worker data flow) needs a long-form explainer that would bloat the primary doc.
- Add `assets/` only for diagrams/images that are actually embedded in the docs.
- Do not add `scripts/`; documentation is authored, not generated here.
- Prefer editing existing docs (AGENTS.md, `.context/docs/*`) over creating new files; never create README/*.md unless explicitly requested.
