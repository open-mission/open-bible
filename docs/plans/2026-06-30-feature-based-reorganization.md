# Plan: Reorganização Baseada em Features (Feature-Based Structure)

Goal: Reorganizar o projeto sob `/features` agrupando componentes, hooks, contextos e utilitários por feature.
Architecture: Módulos independentes sob `/features/auth`, `/features/theme`, `/features/service-worker`, `/features/layout`, `/features/bible-reader`.

---

## Tasks

- [ ] **Task 1: Criar a estrutura de diretórios em `features/`**
  - Criar `features/auth`
  - Criar `features/theme/components`, `features/theme/utils`
  - Criar `features/service-worker/components`, `features/service-worker/hooks`
  - Criar `features/layout/components`, `features/layout/hooks`
  - Criar `features/bible-reader/components`, `features/bible-reader/hooks`, `features/bible-reader/context`, `features/bible-reader/utils`, `features/bible-reader/lib`

- [ ] **Task 2: Mover os arquivos da feature `auth`**
  - Mover `lib/auth.ts` -> `features/auth/auth.ts`
  - Mover `lib/auth-client.ts` -> `features/auth/auth-client.ts`
  - Atualizar os imports em `app/api/auth/[...all]/route.ts`

- [ ] **Task 3: Mover os arquivos da feature `theme`**
  - Mover `components/theme-provider.tsx` -> `features/theme/components/theme-provider.tsx`
  - Mover `lib/theme.ts` -> `features/theme/utils/theme.ts`
  - Atualizar os imports nos arquivos correspondentes

- [ ] **Task 4: Mover os arquivos da feature `service-worker`**
  - Mover `components/service-worker-register.tsx` -> `features/service-worker/components/service-worker-register.tsx`
  - Mover `components/update-banner.tsx` -> `features/service-worker/components/update-banner.tsx`
  - Mover `lib/use-sw-update.ts` -> `features/service-worker/hooks/use-sw-update.ts`
  - Atualizar os imports nos arquivos correspondentes

- [ ] **Task 5: Mover os arquivos da feature `layout`**
  - Mover `components/panel-layout.tsx` -> `features/layout/components/panel-layout.tsx`
  - Mover `components/sidebar.tsx` -> `features/layout/components/sidebar.tsx`
  - Mover `components/mobile-nav.tsx` -> `features/layout/components/mobile-nav.tsx`
  - Mover `components/env-badge.tsx` -> `features/layout/components/env-badge.tsx`
  - Mover `lib/use-panel-state.ts` -> `features/layout/hooks/use-panel-state.ts`
  - Mover `lib/use-toast.tsx` -> `features/layout/hooks/use-toast.tsx`
  - Atualizar os imports nos arquivos correspondentes

- [ ] **Task 6: Mover os arquivos da feature `bible-reader`**
  - Mover componentes: `reader.tsx`, `reader-header.tsx`, `reader-empty.tsx`, `reader-chapter-nav.tsx`, `reader-version-badge.tsx`, `verse-row.tsx`, `bible-version-selector.tsx`, `book-chapter-dialog.tsx`, `book-list.tsx`, `chapter-grid.tsx`, `download-versions-dialog.tsx`, `inspector-panel.tsx`
  - Mover utilitários/contextos/hooks: `lib/bible-data.ts`, `lib/bible-db.ts`, `lib/bible-version-context.tsx`, `lib/use-bible.ts`, `lib/use-reader-position.ts`, `lib/verse-utils.ts`
  - Atualizar todos os imports nos arquivos movidos e em `app/page.tsx`, `app/layout.tsx`

- [ ] **Task 7: Executar Validação e Ajustes Finais**
  - Rodar `pnpm lint` e corrigir imports remanescentes
  - Rodar `pnpm build` para validar compilação
