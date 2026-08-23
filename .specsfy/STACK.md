# Stack do sistema

Documente tecnologias estruturais e a evidência executável que confirma cada
uma. Preserve decisões humanas nas seções livres deste arquivo.

## Inventário detectado

<!-- specsfy:stack:start -->
| Camada | Tecnologia | Evidência |
| --- | --- | --- |
| Framework | Next.js | `package.json` (`next`) |
| Biblioteca | React | `package.json` (`react`) |
| Linguagem | TypeScript | `package.json` (`typescript`) |
| Testes | Vitest | `package.json` (`vitest`) |
| Persistência | Drizzle ORM | `package.json` (`drizzle-orm`) |
| Estilização | Tailwind CSS | `package.json` (`tailwindcss`, `@tailwindcss/postcss`) |
| UI | shadcn/ui (base-vega) + ReUI | `components.json` + `package.json` (`@shadcn/react`, `@base-ui/react`) |
| API | Hono | `package.json` (`hono`, `@hono/zod-openapi`) |
| Auth | Better Auth | `package.json` (`better-auth`) |
| Banco (server) | TursoDB / libSQL | `package.json` (`@libsql/client`, `@libsql/kysely-libsql`) |
| Banco (client) | SQLite WASM + OPFS | `package.json` (`@sqlite.org/sqlite-wasm`) + `lib/database/sqlite-worker.source.js` |
| Desktop | Tauri | `src-tauri/Cargo.toml` + `package.json` (`@tauri-apps/api`) |
| Runtime | Node.js | `package.json` |
<!-- specsfy:stack:end -->

## Decisões e observações do projeto

Acrescente aqui escolhas, restrições e contexto que não podem ser inferidos dos
manifests.
