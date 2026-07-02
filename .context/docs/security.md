---
type: doc
name: security
description: Security policies, authentication, secrets management, and compliance requirements
category: security
generated: 2026-07-01
status: filled
scaffoldVersion: "2.0.0"
---

## Security & Compliance Notes

Open Bible is a public, read-mostly Bible PWA. Sensitive surface area is limited to user accounts (Better Auth), the TursoDB server database, and the download proxy for Bible database files. Bible content itself is public; user-generated data (notes, highlights, reading position) is stored **client-side** in the browser's OPFS SQLite database, not on the server.

## Authentication & Authorization

- **Provider**: Better Auth. Server config in `lib/auth.ts` (referenced as `features/auth/auth.ts` in code), mounted at `app/api/auth/[...all]/route.ts`. Client helper in `lib/auth-client.ts`.
- **Backing store**: TursoDB (libSQL) via the Kysely `LibsqlDialect`.
- **Method**: email/password only. Sessions last **7 days**.
- **Authorization model**: no role/permission tiers today — authentication gates account features; Bible reading and version download are open/unauthenticated.
- **API CORS**: intentionally open on `/api/*` to support the companion iOS app. Keep this in mind before adding any state-changing, authenticated endpoints under that router.

## Secrets & Sensitive Data

- Secrets live in `.env.local` (git-ignored), injected as environment variables in Vercel for production. Required keys:
  - `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN` — server database credentials
  - `BETTER_AUTH_SECRET` — **min 32 chars**; rotating it invalidates existing sessions
  - `BETTER_AUTH_URL` — base URL for auth callbacks
  - `CLOUDFLARE_BUCKET_PUBLIC_URL` — R2 bucket base for Bible database downloads
- **Never** commit `.env.local` or paste tokens into code, issues, or PRs.
- User notes/highlights are **not** transmitted to the server by default — they persist in the client OPFS database (`app.db`). Treat any future sync feature as a new data-classification decision.

## Compliance & Policies

- No formal compliance regime (GDPR/SOC2/HIPAA) is declared for this project.
- Data minimization is effectively the default: the server stores only auth records; personal reading data stays on-device.
- Follow OWASP Top 10 hygiene for any new server route: validate/parse input with the existing Zod schemas (`lib/api/schemas.ts`), never interpolate untrusted input into SQL. Search uses parameterized `LIKE ... COLLATE NOCASE` — keep it parameterized.

## Incident Response

- Production is hosted on Vercel (auto-deploy from `main`); TursoDB and Cloudflare R2 are the external dependencies to check first during an incident.
- To revoke all sessions in an emergency, rotate `BETTER_AUTH_SECRET`.
- If a token leaks, rotate the corresponding Turso/Cloudflare credential and redeploy. See [development-workflow.md](development-workflow.md) for release/deploy mechanics.
