# Plano de Implementação — fix/188 Popup de PWA reaparece

**Goal:** Impedir que o pop-up de atualização do PWA reapareça após o usuário clicar "Atualizar" (reload) ou "Agora não", persistindo o estado em localStorage por versão do app.

**Architecture:** Estender `lib/release-notes/version.ts` com helpers de PWA (SSR-safe) e usar no `ReleaseNotesProvider` para calcular `showPwa` (PWA update visível) de forma persistente.

## Tarefas

- [ ] **T1 — Helpers PWA em version.ts** `lib/release-notes/version.ts`
  - `getPwaUpdatedVersion(): string | null` → localStorage `openbible:pwa-updated`
  - `setPwaUpdatedVersion(v: string): void`
  - `getPwaDismissedVersion(): string | null` → localStorage `openbible:pwa-dismissed-version`
  - `setPwaDismissedVersion(v: string): void`
  - Todos com `typeof window` guard + try/catch (SSR-safe, não quebram em modo privado).
  - Seguir o padrão existente de `getLastSeenVersion`/`setLastSeenVersion`.

- [ ] **T2 — Provider persistente** `features/release-notes/components/release-notes-provider.tsx`
  - Importar os 4 helpers novos.
  - No body do provider (fora do useEffect, calculado por render ou num effect de mount):
    - `const appVersion = getAppVersion()`
    - `const pwaUpdated = getPwaUpdatedVersion() === appVersion`
    - `const pwaDismissed = getPwaDismissedVersion() === appVersion`
  - `const showPwa = hasPwaUpdate && !pwaDismissed && !pwaUpdated`
  - `hasUpdate = (hasAppUpdate || showPwa) && !isDismissed`
  - `updatePwa = () => { setPwaUpdatedVersion(appVersion); updateNow() }`
  - `dismiss = () => { if (hasAppUpdate) setLastSeenVersion(latestVersion); if (hasPwaUpdate) setPwaDismissedVersion(appVersion); setIsDismissed(true) }`
  - Importante: `appVersion` deve ser obtido de forma estável (pode ser `getAppVersion()` direto no render, é síncrono e barato). O `useEffect` de checkVersion já seta `latestVersion` (que para PWA = appVersion). Para evitar divergência, usar `latestVersion || appVersion` ao gravar os flags, ou simplesmente `getAppVersion()` no momento do clique (mais correto, é a versão corrente do bundle).
  - Contexto continua expondo `hasUpdate, hasPwaUpdate, hasAppUpdate, latestVersion, summary, dismiss, updatePwa`. O toast usa `hasPwaUpdate` para decidir botão "Atualizar" — manter assim (o botão some naturalmente quando showPwa=false após gravar flag).

- [ ] **T3 — Verificação**
  - `pnpm install` (checar pnpm-lock.yaml diff — reverter se só reformatação).
  - `pnpm lint` → 0 erros.
  - `pnpm build` → passa. Se `public/sw.js` mudou, `git checkout HEAD -- public/sw.js`.

- [ ] **T4 — Commit & PR**
  - `git add -A && git commit -m "fix(release-notes): prevent PWA update popup from reappearing after update"`
  - NÃO push/PR (orquestrador faz).

## Mapa de arquivos
| Arquivo | Ação |
|---------|------|
| lib/release-notes/version.ts | modificar (helpers PWA) |
| features/release-notes/components/release-notes-provider.tsx | modificar (showPwa persistente) |
