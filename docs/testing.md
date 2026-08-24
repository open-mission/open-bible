# Testes

<!-- specsfy:documentator:start -->
## Resumo

- Arquivos de teste: 10.
- Runner: Vitest.
- Scripts: dev: pnpm --filter @open-bible/web dev; build: pnpm --filter @open-bible/web build; build:tauri: pnpm --filter @open-bible/desktop-tauri build; build:data: node scripts/build-bible-data.mjs; db:init: node scripts/init-db.mjs; db:import: node scripts/import-bibles.mjs; copy:wasm: pnpm --filter @open-bible/web copy:wasm; predev: ; prebuild: ; start: pnpm --filter @open-bible/web start; tauri: pnpm --filter @open-bible/desktop-tauri tauri; desktop:dev: pnpm --filter @open-bible/desktop-tauri dev; desktop:build: pnpm --filter @open-bible/desktop-tauri build; lint: pnpm --filter @open-bible/web lint; test: vitest run; test:tdd: vitest run; release: node scripts/release.mjs; commit: git-cz; prepare: husky.

| Arquivo |
| --- |
| tests/arch-package.test.ts |
| tests/note-references.test.ts |
| tests/packages/adapters-web.test.ts |
| tests/packages/bible-application.test.ts |
| tests/packages/boundaries.test.ts |
| tests/parse-bible-ref.test.ts |
| tests/semver.test.ts |
| tests/updater-api.test.ts |
| tests/utils.test.ts |
| tests/workspace/tauri-legacy.test.ts |
<!-- specsfy:documentator:end -->
