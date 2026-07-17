# Spec: Unificar pop-ups de atualização (PWA + Novidades)

**Data:** 2026-07-16
**Tipo:** improve (correção de UX pós #185)
**Status:** Aprovada

## Problema

Após #185, existem DOIS pop-ups no mobile colidindo no canto inferior:
- `UpdateBanner` (SW/PWA): "Nova versão disponível → Atualizar" (`features/service-worker/components/update-banner.tsx`, montado em `app/layout.tsx:88`).
- `ReleaseNotesToast`: "Nova versão vX disponível → Atualizar / Ver tudo / Agora não".

Isso gera sobreposição visual e duas fontes de "atualização".

## Solução (Abordagem A — pop-up único)

Fundir o `UpdateBanner` no `ReleaseNotesToast`. Um único pop-up controla os dois estados:

| Estado | Gatilho | Ação primária | Ação secundária |
|--------|---------|---------------|-----------------|
| PWA update disponível | `useServiceWorkerUpdate().isUpdateAvailable` | "Atualizar" → `updateNow()` (reload SW) | "Agora não" (some até próximo load) |
| Nova versão do app / novidades | `latest > lastSeen` (version.ts) | "Ver mudanças" → abre Config (aba Novidades) | "Agora não" (persiste lastSeen) |
| Ambos | ambos true | "Atualizar" (PWA) + "Ver mudanças" (novidades) | "Agora não" |

**Layout responsivo:**
- **Desktop (md+):** card canto inferior direito (`fixed bottom-4 right-4 w-80`) com resumo do changelog + botões. Mantém comportamento de #185.
- **Mobile (< md):** bottom sheet compacto (`fixed inset-x-0 bottom-0 rounded-t-2xl`) — SEM o bloco de changelog extenso; mostra só título "Nova versão disponível" + botão "Ver mudanças" (+ "Atualizar" se houver SW waiting) + "Agora não". O changelog completo fica nas Configurações (aba Novidades), acessado por "Ver mudanças".

## Arquitetura

```
app/layout.tsx
  - REMOVER <UpdateBanner /> (linha 88)
  - MANTER <ReleaseNotesProvider> + <ReleaseNotesToast /> (já adicionado em #185)

features/release-notes/components/release-notes-provider.tsx
  - importar useServiceWorkerUpdate de @/features/service-worker/hooks/use-sw-update
  - estado: hasAppUpdate (version.ts), hasPwaUpdate (SW), latestVersion, summary
  - contexto expõe: hasUpdate (|| dos dois), hasPwaUpdate, latestVersion, summary,
    dismiss(), updatePwa() (chama updateNow do hook), openConfig(focus)

features/release-notes/components/release-notes-toast.tsx
  - useReleaseNotes()
  - desktop: card com changelog + [Atualizar?] [Ver mudanças] [Agora não]
  - mobile: sheet compacto, esconde <ul> de changelog (mostra só se md+),
    botões [Ver mudanças] [Atualizar?] [Agora não]
  - "Atualizar" só aparece se hasPwaUpdate; "Ver mudanças" só aparece se hasAppUpdate

features/service-worker/components/update-banner.tsx
  - REMOVER arquivo (ou deixar órfão? NÃO — remover e limpar import em layout)

lib/release-notes/version.ts — sem mudança (já faz lastSeen)
```

## Tratamento de erro
- `useServiceWorkerUpdate` já é SSR-safe e falha silenciosamente offline.
- `fetch('/api/version')` best-effort (igual #185).
- Dismiss de PWA (ignore) vs dismiss de app (lastSeen): "Agora não" deve silenciar AMBOS
  até a próxima versão. Critério: se hasPwaUpdate → ao dismiss, apenas esconde (SW waiting
  persiste, reaparece no reload — comportamento aceitável); se hasAppUpdate → setLastSeenVersion(latest).

## Critérios de aceite
- [ ] Não há dois pop-ups no mobile (UpdateBanner removido).
- [ ] Pop-up único aparece para PWA update, para nova versão do app, ou ambos.
- [ ] Mobile: layout compacto (sem changelog extenso), botão "Ver mudanças" abre Config.
- [ ] Desktop: card completo com changelog (comportamento #185 preservado).
- [ ] "Atualizar" (quando há SW waiting) recarrega o PWA corretamente.
- [ ] `pnpm lint` e `pnpm build` passam; `public/sw.js` revertido se alterado.
- [ ] Commit `improve:` + PR para develop referenciando #186.

## Fora de escopo
- Mudar o hook `useServiceWorkerUpdate` (reutilizado como está).
- Auto-reload silencioso do PWA (mantém ação explícita do usuário).
