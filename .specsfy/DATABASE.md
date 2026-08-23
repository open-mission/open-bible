# Banco de dados

Mapa de persistência do sistema. Modelo inicial sugerido para
**Next.js**.

Para Next.js, explicite App Router, Server Components, Client Components e fronteiras entre servidor e navegador.

## Fontes de dados

<!-- specsfy:database:start -->
| Fonte | Tecnologia/forma | Evidência |
| --- | --- | --- |
| Principal (client) | SQLite WASM + OPFS (app.db) via Drizzle ORM | `lib/database/user/schema.ts` + `lib/database/user/migrations/index.ts` (OPFS SAHPool VFS em `lib/database/sqlite-worker.source.js`) |
| Principal (server) | TursoDB / libSQL | `lib/db/schema.ts` (`SCHEMA_SQL`) + `lib/turso.ts` + `TURSO_DATABASE_URL` em `.env.example` |
| Auth | Better Auth (Kysely + LibsqlDialect) | `lib/auth.ts` (7 dias sessão, email/password) |
| Estrutura | Schema/migration | `lib/database/user/migrations/sql/0000_aromatic_polaris.sql` |
| Estrutura | Schema/migration | `lib/database/user/migrations/sql/0001_melodic_supreme_intelligence.sql` |
| Estrutura | Migration embarcada (browser) | `lib/database/user/migrations/index.ts` (`MIGRATIONS` 0000→0003) |

## Estruturas detectadas

| Estrutura | Tipo | Campos | Relações | Fonte |
| --- | --- | --- | --- | --- |
| notes | Tabela SQL (client) | id:text PK, title:text, content:text NOT NULL DEFAULT '', created_at:integer NOT NULL, updated_at:integer NOT NULL, deleted_at:integer | 1—N → note_references | `lib/database/user/schema.ts` (`notes`) + `lib/database/user/migrations/index.ts:0000_init` |
| note_references | Tabela SQL (client) | id:text PK, note_id:text NOT NULL FK→notes.id CASCADE, bible:text NOT NULL, book:text NOT NULL, chapter:integer NOT NULL, verse_start:integer NOT NULL, verse_end:integer, order:integer DEFAULT 0 | N—1 → notes | `lib/database/user/schema.ts` (`noteReferences`) + `lib/database/user/migrations/sql/0000_aromatic_polaris.sql` |
| installed_bibles | Tabela SQL (client) | id:text PK, name:text NOT NULL, installed_at:integer NOT NULL, version_code:integer DEFAULT 1 | — | `lib/database/user/schema.ts` (`installedBibles`) + `lib/database/user/migrations/index.ts:0001` |
| highlight_categories | Tabela SQL (client) | id:text PK, name:text NOT NULL UNIQUE, created_at:integer NOT NULL | 1—N → highlights | `lib/database/user/schema.ts` (`highlightCategories`) + `lib/database/user/migrations/index.ts:0002_highlights` |
| highlights | Tabela SQL (client) | id:text PK, color:text NOT NULL, content:text DEFAULT '' NOT NULL, category_id:text FK→highlight_categories.id SET NULL, note_id:text FK→notes.id SET NULL, created_at:integer NOT NULL, updated_at:integer NOT NULL | N—1 → highlight_categories, N—1 → notes, 1—N → highlight_verses | `lib/database/user/schema.ts` (`highlights`) + `lib/database/user/migrations/index.ts:0002` |
| highlight_verses | Tabela SQL (client) | id:text PK, highlight_id:text NOT NULL FK→highlights.id CASCADE, book:text NOT NULL, chapter:integer NOT NULL, verse:integer NOT NULL, bible:text NOT NULL | N—1 → highlights | `lib/database/user/schema.ts` (`highlightVerses`) (`idx_highlight_verses_lookup`, `idx_highlight_verses_highlight_id`) |
| bible_versions | Tabela SQL (server Turso) | id:text PK, name:text NOT NULL, total_books:integer NOT NULL, download_url:text, version:integer DEFAULT 1 | 1—N → bible_books | `lib/db/schema.ts` (`bible_versions`) |
| bible_books | Tabela SQL (server Turso) | id:text NOT NULL, version_id:text NOT NULL FK→bible_versions.id, name:text NOT NULL, abbreviation:text NOT NULL, testament:text CHECK('old','new'), chapters:integer NOT NULL, PK(id,version_id) | N—1 → bible_versions | `lib/db/schema.ts` (`bible_books`) |
| bible_verses | Tabela SQL (server Turso) | id:text PK, version_id:text NOT NULL, book_id:text NOT NULL, chapter:integer NOT NULL, verse:integer NOT NULL, text:text NOT NULL | — (índice version_id,book_id,chapter) | `lib/db/schema.ts` (`bible_verses`) |
<!-- specsfy:database:end -->

## Decisões, ownership e retenção

Registre finalidade, ownership, classificação, retenção, constraints e decisões
que não estejam explícitas nos schemas.
