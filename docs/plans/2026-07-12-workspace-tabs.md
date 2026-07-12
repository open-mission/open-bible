# Workspace de Abas — Plano de Implementação (Phase 1)

**Data:** 2026-07-12
**Spec:** docs/specs/2026-07-12-workspace-tabs-design.md

## Goal

Entregar o Phase 1 do workspace de abas: fundação do modelo `Workspace`/`Pane`, abas
estilo navegador (mobile+desktop), version scoping por painel, reader autocontido
(`BiblePaneView`), reescrita de `app/page.tsx` com toggle Modo Simples/Avançado, e o
setting na página de Configurações.

## Architecture

Novo feature `features/workspace/` detém o estado do workspace (panes + active + layout).
A superfície de leitura bifurca em `app/page.tsx` conforme `openbible:workspace-mode`:
Simples renderiza o fluxo atual; Avançado renderiza o `WorkspaceView` (abas). Cada painel
bíblico é autocontido via `BiblePaneView`, que escopa version/notes/highlights com
providers dedicados. Display settings (font/mode/spacing) continuam globais.

## Tech Stack

Next.js 16 (client components), React 19, Tailwind v4, `@base-ui/react` (tabs),
`react-resizable-panels` (já instalado, usado no Phase 2), `@tabler/icons-react`,
`localStorage` para persistência. Sem novos deps.

## Mapa de arquivos

### Criar
- `features/workspace/types.ts` — tipos `Pane`, `PaneType`, `PaneState`, `LayoutMode`.
- `features/workspace/context/workspace-context.tsx` — `WorkspaceProvider` + `useWorkspace()`.
- `features/workspace/hooks/use-workspace-mode.ts` — lê `openbible:workspace-mode`.
- `features/workspace/hooks/use-reader-settings.ts` — display settings globais (extrai de use-reader-position).
- `features/workspace/components/workspace-tabs.tsx` — barra de abas.
- `features/workspace/components/workspace-view.tsx` — renderiza painel ativo.
- `features/workspace/components/bible-pane-view.tsx` — painel bíblico autocontido.
- `features/workspace/lib/pane-title.ts` — helper título do painel (ex.: "João 3").

### Modificar
- `features/bible-reader/context/bible-version-context.tsx` — add `BibleVersionScopeProvider`.
- `features/bible-reader/components/reader.tsx` — version via scope/prop (não global direto).
- `app/page.tsx` — bifurcar Simples vs Avançado.
- `app/config/page.tsx` — add seção "Modo de leitura" (Simples/Avançado).

## Tarefas

- [ ] T1: `features/workspace/types.ts`
- [ ] T2: `use-workspace-mode.ts`
- [ ] T3: `BibleVersionScopeProvider` em bible-version-context
- [ ] T4: `use-reader-settings.ts` (display settings globais)
- [ ] T5: `workspace-context.tsx` (Provider + reducer + persistência/migração)
- [ ] T6: `pane-title.ts`
- [ ] T7: `bible-pane-view.tsx` (reader autocontido)
- [ ] T8: `workspace-tabs.tsx` (barra de abas)
- [ ] T9: `workspace-view.tsx` (render ativo)
- [ ] T10: rewrite `app/page.tsx` (toggle Simples/Avançado)
- [ ] T11: setting em `app/config/page.tsx`
- [ ] T12: `pnpm lint && pnpm build` + checagem manual
