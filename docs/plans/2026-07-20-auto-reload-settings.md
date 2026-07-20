# Implementation Plan: Auto-Reload UI when Settings Change

## Goal
Implementar um toast de notificação com botão de ação para recarregar o aplicativo sempre que configurações não-reativas forem alteradas.

## Proposed Changes

### Configuration Utilities

#### [NEW] [settings-toast.ts](file:///Users/claudio/Projects/open-bible/lib/settings-toast.ts)
- Criar a função `triggerReloadToast()` para exibir o toast do Sonner com o botão de recarga da página.

### Component Integration

#### [MODIFY] [bible-version-context.tsx](file:///Users/claudio/Projects/open-bible/features/bible-reader/context/bible-version-context.tsx)
- Chamar `triggerReloadToast()` em `setDefaultVersionId`.

#### [MODIFY] [use-workspace-mode.ts](file:///Users/claudio/Projects/open-bible/features/workspace/hooks/use-workspace-mode.ts)
- Chamar `triggerReloadToast()` em `setMode`, `setLayout` e `setTabsOrientation`.

#### [MODIFY] [config-content.tsx](file:///Users/claudio/Projects/open-bible/features/config/components/config-content.tsx)
- Chamar `triggerReloadToast()` em `updateGutterPosition`, `updateMobileInteraction` e `updateDesktopInteraction`.

## Tasks

- [ ] Criar arquivo de utilitário `lib/settings-toast.ts` com a função `triggerReloadToast`.
- [ ] Atualizar `bible-version-context.tsx` para chamar o toast ao alterar a versão padrão.
- [ ] Atualizar `use-workspace-mode.ts` para chamar o toast ao alterar modo/layout/orientação.
- [ ] Atualizar `config-content.tsx` para chamar o toast ao alterar comportamento de destaques.
- [ ] Rodar `pnpm lint` e `pnpm build` para assegurar que a compilação esteja livre de erros.
- [ ] Executar `.agents/skills/deslop` para higienizar qualquer slop de IA.
- [ ] Commitar as alterações com Conventional Commits.
- [ ] Abrir PR para a branch `develop`.
