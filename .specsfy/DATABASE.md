# Banco de dados

Mapa de persistência do sistema. Modelo inicial sugerido para
**Next.js**.

Para Next.js, explicite App Router, Server Components, Client Components e fronteiras entre servidor e navegador.

## Fontes de dados

<!-- specsfy:database:start -->
| Fonte | Tecnologia/forma | Evidência |
| --- | --- | --- |
| Estrutura | Schema Drizzle + migrations | `apps/web/lib/database/user/schema.ts` + `apps/web/lib/database/user/migrations/index.ts` (tags 0000_init, 0001_installed_bibles, 0002_highlights, 0003_highlight_content) |
| Estrutura | SQL gerado (espelho) | `apps/web/lib/database/user/migrations/sql/0000_aromatic_polaris.sql`, `0001_melodic_supreme_intelligence.sql` |
| Cliente | SQLite WASM OPFS | `apps/web/lib/database/DatabaseManager.ts`, `apps/web/lib/database/user/drizzle.ts`, `apps/web/lib/database/user/migrator.ts` |
| Servidor | TursoDB/libSQL | `apps/web/lib/auth.ts` (Better Auth Kysely LibsqlDialect), `apps/web/lib/db.ts` |
| Bíblias | SQLite read-only por versão | `apps/web/lib/database/bible/BibleDatabase.ts` (ara.db etc via OPFS worker `public/sqlite-wasm/open-bible.worker.js`) |

## Estruturas detectadas

| Estrutura | Tipo | Campos | Relações | Fonte |
| --- | --- | --- | --- | --- |
| notes | Tabela SQL (app.db) | id:text PK, title:text, content:text NOT NULL DEFAULT '', created_at:integer NOT NULL, updated_at:integer NOT NULL, deleted_at:integer | 1:N → note_references, 1:N → highlights (via note_id) | `apps/web/lib/database/user/schema.ts` + migration 0000_init |
| note_references | Tabela SQL (app.db) | id:text PK, note_id:text FK NOT NULL, bible:text NOT NULL, book:text NOT NULL, chapter:integer NOT NULL, verse_start:integer NOT NULL, verse_end:integer, order:integer NOT NULL DEFAULT 0 | N:1 → notes (CASCADE), idx_note_references_note_id | `apps/web/lib/database/user/schema.ts` + migration 0000_init |
| installed_bibles | Tabela SQL (app.db) | id:text PK, name:text NOT NULL, installed_at:integer NOT NULL, version_code:integer NOT NULL DEFAULT 1 | — | `apps/web/lib/database/user/schema.ts` + migration 0001_installed_bibles |
| highlight_categories | Tabela SQL (app.db) | id:text PK, name:text UNIQUE NOT NULL, created_at:integer NOT NULL | 1:N → highlights | `apps/web/lib/database/user/schema.ts` + migration 0002_highlights |
| highlights | Tabela SQL (app.db) | id:text PK, color:text NOT NULL, content:text NOT NULL DEFAULT '', category_id:text FK, note_id:text FK, created_at:integer NOT NULL, updated_at:integer NOT NULL | N:1 → highlight_categories (SET NULL), N:1 → notes (SET NULL), 1:N → highlight_verses | `apps/web/lib/database/user/schema.ts` + migration 0002_highlights + 0003_highlight_content |
| highlight_verses | Tabela SQL (app.db) | id:text PK, highlight_id:text FK NOT NULL, book:text NOT NULL, chapter:integer NOT NULL, verse:integer NOT NULL, bible:text NOT NULL | N:1 → highlights (CASCADE), idx_highlight_verses_lookup (book,chapter,verse,bible), idx_highlight_verses_highlight_id | `apps/web/lib/database/user/schema.ts` + migration 0002_highlights |
| __migrations | Tabela SQL (app.db) | tag:text PK, applied_at:integer NOT NULL | — | `apps/web/lib/database/user/migrator.ts` |
| bible_verses | Tabela SQL (por Bíblia, ex. ara.db) | id:integer, book:integer, chapter:integer, verse:integer, text:text | — | `apps/web/lib/database/bible/BibleDatabase.ts` (query LIKE %q% COLLATE NOCASE, sem FTS) |
| bible_books | Tabela SQL (TursoDB server) | id:integer, version_id:text, name:text, chapters:integer — PK composta (id, version_id) | — | `scripts/import-bibles.mjs` + TursoDB |
<!-- specsfy:database:end -->

## Decisões, ownership e retenção

Registre finalidade, ownership, classificação, retenção, constraints e decisões
que não estejam explícitas nos schemas.
