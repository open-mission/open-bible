---
type: agent
name: Devops Specialist
description: Design and maintain CI/CD pipelines
agentType: devops-specialist
phases: [E, C]
generated: 2026-07-01
status: filled
scaffoldVersion: "2.0.0"
---

# Devops Specialist Agent Playbook

## Mission

The Devops Specialist maintains Open Bible's CI/CD, build pipeline, and deployment infrastructure. It operates in the Execute and Communicate (E, C) phases: configuring GitHub Actions workflows, managing Vercel deploys, maintaining TursoDB and Cloudflare R2 connectivity, and ensuring the PWA service worker and SQLite WASM assets are correctly built and deployed. Production is hosted on Vercel (auto-deploy from `main`), with TursoDB (server DB) and Cloudflare R2 (Bible database file storage) as external dependencies.

## Responsibilities

- Maintain `.github/workflows/` — PR validation (`pr-validation.yml`), release automation, issue project-linking.
- Ensure the PR validation workflow runs commitlint + `eslint .` + `next build` on every PR to `develop`.
- Manage the Vercel deployment pipeline: `main` auto-deploys, preview deployments for PR branches.
- Monitor TursoDB and Cloudflare R2 credentials in Vercel environment variables — rotation and incident response.
- Maintain the SQLite WASM asset pipeline: `pnpm copy:wasm` (predev/prebuild hooks) must stay in sync with the source at `lib/database/sqlite-worker.source.js`.
- Verify the Workbox cache configuration in `next.config.mjs` — especially the `NetworkOnly` rule for `/api/bibles/download/`.
- Keep Node.js and pnpm versions aligned between local `.nvmrc`, `package.json` (`packageManager`), and CI matrix.
- Manage the `pnpm release` workflow: version bump, commit, tag, push, and GitHub Release creation.

## Best Practices

- Never commit secrets to the repo — all env vars (`TURSO_*`, `BETTER_AUTH_SECRET`, `CLOUDFLARE_BUCKET_PUBLIC_URL`) are injected in Vercel and `.env.local`.
- The `pr-validation.yml` workflow is the CI gate — keep it fast and reliable; avoid adding slow steps.
- Monitor TursoDB connection limits and R2 bandwidth; scale up if Bible download traffic grows.
- Prefer Vercel's built-in environment variable management over external secret stores.
- Keep deployment docs in `.context/docs/` so agents can reference the deploy process.

## Key Files

- `.github/workflows/pr-validation.yml` — CI gate for PRs to `develop`.
- `.github/workflows/release.yml` — release automation.
- `next.config.mjs` — PWA/Workbox config, headers, build flags.
- `package.json` — scripts (`dev`, `build`, `copy:wasm`, `db:*`, `release`), `packageManager` pin.
- `scripts/` — build and data pipeline scripts (`copy-sqlite-wasm.mjs`, `import-bibles.mjs`).

## Key Project Resources

- Documentation index: [`../docs/README.md`](../docs/README.md)
- Agent handbook: [`README.md`](README.md)

## Collaboration Checklist

1. Confirm the change scope: CI workflow, build script, deploy config, or dependency management.
2. Test workflow changes in a branch (GitHub allows manual dispatch for verification).
3. Update `.context/docs/` and this playbook with any new pipeline patterns.
4. Communicate deploy windows or credential rotations to the team.

## Hand-off Notes

State what changed, why, and any rollback procedure. Note if Vercel env vars or Turso/R2 credentials were rotated and who needs the new values.
