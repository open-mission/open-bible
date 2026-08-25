# Testes

<!-- specsfy:documentator:start -->
## Resumo

- Arquivos de teste: 60.
- Runner: Vitest.
- Scripts: dev: pnpm --filter @open-bible/web dev; build: pnpm --filter @open-bible/web build; build:tauri: pnpm --filter @open-bible/desktop-tauri build; build:data: node scripts/build-bible-data.mjs; db:init: node scripts/init-db.mjs; db:import: node scripts/import-bibles.mjs; copy:wasm: pnpm --filter @open-bible/web copy:wasm; predev: ; prebuild: ; start: pnpm --filter @open-bible/web start; tauri: pnpm --filter @open-bible/desktop-tauri tauri; desktop:dev: pnpm --filter @open-bible/desktop-tauri dev; desktop:build: pnpm --filter @open-bible/desktop-tauri build; lint: pnpm --filter @open-bible/web lint; test: vitest run; test:tdd: vitest run; release: node scripts/release.mjs; commit: git-cz; prepare: husky.

| Arquivo |
| --- |
| apps/tui/tests/bible-manager.test.ts |
| apps/tui/tests/book-picker.test.ts |
| apps/tui/tests/download.test.ts |
| apps/tui/tests/filter-books.test.ts |
| apps/tui/tests/installed-store.test.ts |
| apps/tui/tests/navigation-state.test.ts |
| apps/tui/tests/parse-reference.test.ts |
| apps/tui/tests/paths.test.ts |
| tests/arch-package.test.ts |
| tests/build-tauri/build-tauri.test.ts |
| tests/build-tauri/copy-wasm.test.ts |
| tests/build-tauri/next-config.test.ts |
| tests/build-tauri/out-assets.test.ts |
| tests/build-tauri/tauri-build.test.ts |
| tests/build-tauri/tauri-conf.test.ts |
| tests/desktop-electron/api-boundary.test.ts |
| tests/desktop-electron/build-matrix.test.ts |
| tests/desktop-electron/dev-command.test.ts |
| tests/desktop-electron/menu-settings.test.ts |
| tests/desktop-electron/opfs-runtime.test.ts |
| tests/desktop-electron/preload-security.test.ts |
| tests/desktop-electron/release-failure.test.ts |
| tests/desktop-electron/release-version.test.ts |
| tests/desktop-electron/release-workflow.test.ts |
| tests/desktop-electron/rollback.test.ts |
| tests/desktop-electron/smoke-baseline.test.ts |
| tests/desktop-electron/updater-failure.test.ts |
| tests/desktop-electron/updater-success.test.ts |
| tests/desktop-electron/web-boundary.test.ts |
| tests/highlight-copy.test.ts |
| tests/highlight-delete.test.ts |
| tests/highlight-edit.test.ts |
| tests/highlight-navigate.test.ts |
| tests/highlights-date.test.ts |
| tests/highlights-empty.test.ts |
| tests/highlights-filter.test.ts |
| tests/highlights-opfs.test.ts |
| tests/highlights-page.test.ts |
| tests/highlights-search.test.ts |
| tests/note-references.test.ts |
| tests/notes-bible-fallback.test.ts |
| tests/notes-bible-ref.test.ts |
| tests/notes-blocks.test.ts |
| tests/notes-bubble.test.ts |
| tests/notes-canvas.test.ts |
| tests/notes-empty-opfs.test.ts |
| tests/notes-markdown-export.test.ts |
| tests/notes-navigate.test.ts |
| tests/notes-persist.test.ts |
| tests/notes-regression.test.ts |
| tests/notes-reload.test.ts |
| tests/packages/adapters-web.test.ts |
| tests/packages/bible-application.test.ts |
| tests/packages/boundaries.test.ts |
| tests/parse-bible-ref.test.ts |
| tests/release-notes-format.test.ts |
| tests/semver.test.ts |
| tests/updater-api.test.ts |
| tests/utils.test.ts |
| tests/workspace/tauri-legacy.test.ts |
<!-- specsfy:documentator:end -->
