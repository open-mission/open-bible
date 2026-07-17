# Spec: Corrigir popup de PWA que reaparece após atualizar

**Data:** 2026-07-17
**Tipo:** fix
**Status:** Aprovada

## Problema

Após #187 (pop-ups unificados), o pop-up de atualização do PWA **reaparece mesmo após o usuário clicar
"Atualizar"** (reload do SW). Também some apenas da sessão quando se clica "Agora não" no caso PWA.

Causa em `features/release-notes/components/release-notes-provider.tsx`:
- `updatePwa()` → `updateNow()` (reload), mas `isDismissed` é estado em memória → some no reload.
- `useServiceWorkerUpdate` continua vendo `registration.waiting` → `hasPwaUpdate` volta `true`.
- `dismiss()` só faz `setIsDismissed(true)` (memória).

## Solução

Persistir o estado de PWA em `localStorage`, consistente com a versão do app:

1. **"Atualizar" (PWA):** chamar `updateNow()` E gravar flag `openbible:pwa-updated = appVersion`
   (no momento do clique, antes do reload). No mount do provider, se `pwa-updated === appVersion`
   E o hook SW ainda reporta `waiting`, tratar como já atualizado (não mostrar). Na prática o reload
   ativa o novo SW e o hook limpa sozinho; o flag é a rede de segurança contra reaparecimento
   transitorio.
2. **"Agora não" (PWA):** gravar `openbible:pwa-dismissed-version = appVersion`. No mount, se
   `pwa-dismissed-version === appVersion`, não mostrar o aviso de PWA. Se o app fizer novo deploy
   (versão sobe), `appVersion` muda → avisa de novo.
3. **App update (version.ts):** comportamento atual de `lastSeen` permanece inalterado.

## Arquitetura

```
lib/release-notes/version.ts (ESTENDER):
  - getPwaUpdatedVersion(): string | null   (localStorage openbible:pwa-updated)
  - setPwaUpdatedVersion(v): void
  - getPwaDismissedVersion(): string | null (localStorage openbible:pwa-dismissed-version)
  - setPwaDismissedVersion(v): void
  - todos SSR-safe (typeof window guard, try/catch)

features/release-notes/components/release-notes-provider.tsx (MODIFICAR):
  - ler hasPwaUpdate do hook
  - appVersion = getAppVersion()
  - pwaDismissed = getPwaDismissedVersion() === appVersion
  - pwaUpdated = getPwaUpdatedVersion() === appVersion
  - showPwa = hasPwaUpdate && !pwaDismissed && !pwaUpdated
  - hasUpdate = (hasAppUpdate || showPwa) && !isDismissedAppOnly...
    (simpler: manter hasUpdate = (hasAppUpdate || showPwa) com isDismissed cobrindo ambos)
  - updatePwa = () => { setPwaUpdatedVersion(appVersion); updateNow() }
  - dismiss = () => {
      if (hasAppUpdate) setLastSeenVersion(latestVersion)
      if (hasPwaUpdate) setPwaDismissedVersion(appVersion)
      setIsDismissed(true)
    }

features/release-notes/components/release-notes-toast.tsx: sem mudança de lógica
  (já usa hasPwaUpdate/hasAppUpdate condicionalmente).
```

## Tratamento de erro
- localStorage indisponível (modo privado) → try/catch, cai no comportamento em memória (não quebra).
- Hook SW mantido intacto.

## Critérios de aceite
- [ ] Após clicar "Atualizar" e o reload acontecer, o pop-up NÃO reaparece (flag persiste).
- [ ] "Agora não" silencia o aviso de PWA até a próxima versão do app (persiste por versão).
- [ ] App update (version.ts lastSeen) continua funcionando como antes.
- [ ] `pnpm lint` e `pnpm build` passam; `public/sw.js` revertido se alterado.
- [ ] Commit `fix:` + PR para develop referenciando #188.

## Fora de escopo
- Alterar `use-sw-update.ts`.
- Auto-reload silencioso do PWA.
