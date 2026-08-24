# Banco de dados

Mapa de persistência do sistema. Modelo inicial sugerido para
**Next.js**.

Para Next.js, explicite App Router, Server Components, Client Components e fronteiras entre servidor e navegador.

## Fontes de dados

<!-- specsfy:database:start -->
| Fonte | Tecnologia/forma | Evidência |
| --- | --- | --- |
| Estrutura | Schema/migration | `apps/web/lib/database/user/migrations/sql/0000_aromatic_polaris.sql` |
| Estrutura | Schema/migration | `apps/web/lib/database/user/migrations/sql/0001_melodic_supreme_intelligence.sql` |

## Estruturas detectadas

| Estrutura | Tipo | Campos | Relações | Fonte |
| --- | --- | --- | --- | --- |
| note_references | Tabela SQL | id:text, note_id:text, bible:text, book:text, chapter:integer, verse_start:integer, verse_end:integer, order:integer | Não detectadas | `apps/web/lib/database/user/migrations/sql/0000_aromatic_polaris.sql` |
| notes | Tabela SQL | id:text, title:text, content:text, created_at:integer, updated_at:integer, deleted_at:integer | Não detectadas | `apps/web/lib/database/user/migrations/sql/0000_aromatic_polaris.sql` |
| installed_bibles | Tabela SQL | id:text, name:text, installed_at:integer, version_code:integer | Não detectadas | `apps/web/lib/database/user/migrations/sql/0001_melodic_supreme_intelligence.sql` |
<!-- specsfy:database:end -->

## Decisões, ownership e retenção

Registre finalidade, ownership, classificação, retenção, constraints e decisões
que não estejam explícitas nos schemas.
