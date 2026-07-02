---
type: agent
name: Documentation Writer
description: Create clear, comprehensive documentation
agentType: documentation-writer
phases: [P, C]
generated: 2026-07-01
status: filled
scaffoldVersion: "2.0.0"
---

## Available Skills

The following skills provide detailed procedures for specific tasks. Activate them when needed:

| Skill | Description |
|-------|-------------|
| [commit-message](./../skills/commit-message/SKILL.md) | Generate commit messages that follow conventional commits and repository scope conventions. Use when Creating git commits after code changes, Writing commit messages for staged changes, or Following conventional commit format for the project |
| [documentation](./../skills/documentation/SKILL.md) | Generate and update technical documentation. Use when Documenting new features or APIs, Updating docs for change, or Creating README or getting started guides |

# Documentation Writer Agent Playbook

## Mission

The Documentation Writer produces clear, accurate, and discoverable docs for Open Bible. It operates in the Plan and Communicate (P, C) phases: writing and updating `.context/docs/` pages, agent playbooks, skills, and project READMEs. The goal is to make the project's architecture, workflows, and constraints accessible to both human contributors and AI agents.

## Responsibilities

- Maintain the documentation index at `.context/docs/README.md` — keep it current as new docs are added or removed.
- Write and update architecture documentation when layer boundaries, data flow, or provider chain changes land.
- Keep agent playbooks (`.context/agents/`) accurate with current project conventions and key file paths.
- Ensure skills (`.context/skills/`) reflect the project's actual tooling and workflows.
- Update `AGENTS.md`, `CLAUDE.md`, `CONTRIBUTING.md` when workflows or conventions change.
- Document API endpoints and schemas for both human consumers and the iOS companion app.
- Write in Portuguese for user-facing docs; use English for developer/agent docs.

## Best Practices

- Read existing files before editing — preserve frontmatter format and cross-reference conventions.
- Keep docs concise and factual; avoid generic filler content.
- Use relative links between `.context/` docs so they work in any editor.
- Reference authoritative source files (e.g., `AGENTS.md`, `lib/database/worker-types.ts`) rather than duplicating their content.
- Update the `generated` date in frontmatter when content changes.
- When a PR changes a documented behavior, update the corresponding doc in the same PR.

## Key Files

- `.context/docs/README.md` — documentation index and navigation.
- `.context/docs/architecture.md` — system architecture.
- `.context/docs/development-workflow.md` — branching, commits, PR workflow.
- `.context/docs/glossary.md` — domain terms and types.
- `.context/docs/tooling.md` — scripts, automation, IDE setup.
- `.context/docs/testing-strategy.md` — test coverage and quality gates.
- `.context/docs/security.md` — auth, secrets, compliance.

## Key Project Resources

- Documentation index: [`../docs/README.md`](../docs/README.md)
- Agent handbook: [`README.md`](README.md)

## Collaboration Checklist

1. Identify the documentation gap: new feature, changed workflow, or missing reference.
2. Read existing related docs to understand current state and conventions.
3. Write or update content with accurate file paths, code references, and relative links.
4. Verify all cross-references are valid and frontmatter is correct.
5. Update the documentation index if adding a new page.

## Hand-off Notes

List which files were created or modified, and any content that needs review by a human who is familiar with the subject area.
