# Testes

<!-- specsfy:documentator:start -->
## Resumo

- Arquivos de teste: 40.
- Runner: Vitest.
- Scripts: dev: pnpm --filter @open-bible/web dev; build: pnpm --filter @open-bible/web build; build:tauri: pnpm --filter @open-bible/desktop-tauri build; build:data: node scripts/build-bible-data.mjs; db:init: node scripts/init-db.mjs; db:import: node scripts/import-bibles.mjs; copy:wasm: pnpm --filter @open-bible/web copy:wasm; predev: ; prebuild: ; start: pnpm --filter @open-bible/web start; tauri: pnpm --filter @open-bible/desktop-tauri tauri; desktop:dev: pnpm --filter @open-bible/desktop-tauri dev; desktop:build: pnpm --filter @open-bible/desktop-tauri build; lint: pnpm --filter @open-bible/web lint; test: vitest run; test:tdd: vitest run; release: node scripts/release.mjs; commit: git-cz; prepare: husky.

| Arquivo |
| --- |
| .worktrees/feat/257-monorepo-foundation/tests/arch-package.test.ts |
| .worktrees/feat/257-monorepo-foundation/tests/note-references.test.ts |
| .worktrees/feat/257-monorepo-foundation/tests/packages/adapters-web.test.ts |
| .worktrees/feat/257-monorepo-foundation/tests/packages/bible-application.test.ts |
| .worktrees/feat/257-monorepo-foundation/tests/packages/boundaries.test.ts |
| .worktrees/feat/257-monorepo-foundation/tests/parse-bible-ref.test.ts |
| .worktrees/feat/257-monorepo-foundation/tests/semver.test.ts |
| .worktrees/feat/257-monorepo-foundation/tests/updater-api.test.ts |
| .worktrees/feat/257-monorepo-foundation/tests/utils.test.ts |
| .worktrees/feat/257-monorepo-foundation/tests/workspace/tauri-legacy.test.ts |
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
