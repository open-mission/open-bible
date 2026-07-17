# Plano de Implementação — improve/186 Unificar pop-ups de atualização

**Goal:** Fundir `UpdateBanner` (SW/PWA) no `ReleaseNotesToast` para um único pop-up sem colisão no mobile.

**Architecture:** `ReleaseNotesProvider` passa a consumir `useServiceWorkerUpdate()` e expõe estado unificado.
`ReleaseNotesToast` renderiza layout responsivo: desktop = card com changelog; mobile = bottom sheet compacto.
`UpdateBanner` é removido (arquivo + import no layout).

## Tarefas

- [ ] **T1 — Provider unificado** `features/release-notes/components/release-notes-provider.tsx`
  - Importar `useServiceWorkerUpdate` de `@/features/service-worker/hooks/use-sw-update`.
  - Manter detecção de versão do app (version.ts) + fetch `/api/version` (best-effort).
  - Estados: `hasAppUpdate` (version.ts), `hasPwaUpdate` (SW), `latestVersion`, `summary`.
  - `hasUpdate = hasAppUpdate || hasPwaUpdate`.
  - Contexto: `{ hasUpdate, hasPwaUpdate, hasAppUpdate, latestVersion, summary, dismiss, updatePwa, openConfig }`.
  - `updatePwa()` → chama `updateNow()` do hook.
  - `dismiss()`: se `hasAppUpdate` → `setLastSeenVersion(latestVersion)`; sempre `setHasUpdate(false)` (esconde ambos até próximo load).

- [ ] **T2 — Toast responsivo** `features/release-notes/components/release-notes-toast.tsx`
  - `useReleaseNotes()`. Se `!hasUpdate` return null.
  - Botões condicionais:
    - "Atualizar" aparece SÓ se `hasPwaUpdate` → `updatePwa()`.
    - "Ver mudanças" aparece SÓ se `hasAppUpdate` → abre Config (`setConfigFocus("changelog")`, `setConfigOpen(true)`).
    - "Agora não" → `dismiss()`.
  - **Desktop (md+):** manter card `fixed bottom-4 right-4 w-80` com `<ul>` de changelog (resumo, max 4).
  - **Mobile (< md):** `fixed inset-x-0 bottom-0 rounded-t-2xl` — ESCONDER o `<ul>` de changelog
    (ou seja, só mostrar changelog quando `md:` via classe `hidden md:block` no `<ul>`). Manter título
    "Nova versão disponível" + botões. Isso satisfaz "mobile compacto, sem modal de changelog".
  - Respeitar next-themes (bg-popover etc) e `pointer-events` (padrão atual).

- [ ] **T3 — Remover UpdateBanner**
  - `app/layout.tsx`: remover `import { UpdateBanner }` e a linha `<UpdateBanner />`.
  - Deletar arquivo `features/service-worker/components/update-banner.tsx` (git rm).
  - NÃO alterar `use-sw-update.ts` (reutilizado).

- [ ] **T4 — Verificação**
  - `pnpm install` (checar `pnpm-lock.yaml` diff — reverter se só reformatação).
  - `pnpm lint` → 0 erros.
  - `pnpm build` → passa. Se `public/sw.js` mudou, `git checkout HEAD -- public/sw.js`.
  - Grep sanity: garantir nenhum import quebrado de `update-banner`.

- [ ] **T5 — Commit & PR**
  - `git add -A && git commit -m "improve(release-notes): unify PWA update and release-notes popups"`
  - NÃO push/PR (orquestrador faz).

## Mapa de arquivos
| Arquivo | Ação |
|---------|------|
| features/release-notes/components/release-notes-provider.tsx | modificar (unificar SW + app) |
| features/release-notes/components/release-notes-toast.tsx | modificar (responsivo, botões condicionais) |
| features/service-worker/components/update-banner.tsx | DELETAR |
| app/layout.tsx | modificar (remover UpdateBanner) |
