# Workspace de Abas — Design Spec

**Data:** 2026-07-12
**Tipo:** feat
**Status:** Aprovado (Phase 1 em implementação)

## Goal

Permitir que o usuário tenha vários textos bíblicos abertos simultaneamente em abas
(estilo navegador) e, no desktop, em um grid tiling redimensionável (estilo i3wm/tmux).
O sistema de abas é genérico: pode abrigar um texto bíblico, uma nota ou um sermão
(sermão é feature futura). Um toggle nas Configurações (Modo Simples / Modo Avançado)
controla se o workspace é ativado.

## Background — estado atual

- `app/page.tsx` é a única superfície de leitura. Compõe `NotesProvider` (escopado a um
  book/chapter/version) → `SidebarProvider` → `SidebarInset` → `PanelLayout(main=Reader, right=…)`.
- `useReaderPosition()` mantém UM `selectedBookId`/`selectedChapter` global, persistido em
  `localStorage` com chaves fixas (`openbible:book`, `openbible:chapter`).
- `BibleVersionContext` mantém UM `versionId` global para toda a app. `useBibleVerses`,
  `BibleVersionSelector` e a lógica de download/instalação leem esse contexto.
- `Reader` recebe props (bookId, chapter, font/mode) mas internamente chama
  `useBibleVersion()` (version global) e se envolve em `HighlightsProvider` (escopado por
  book/chapter/version). Notes vêm do `NotesProvider` a nível de página.
- `PanelLayout` já usa `react-resizable-panels` (split horizontal left/main/right).
  `components/ui/resizable.tsx` e `components/ui/tabs.tsx` (`@base-ui/react/tabs`) já estão
  instalados.
- Mobile usa `NoteSheet` (bottom sheet) + `MobileNav`; desktop usa o painel direito.
  `useIsMobile()` (breakpoint 768px) e `is-tauri.ts`/`useIsTauriMacOS` tratam plataformas.

### Acoplamentos a resolver para multi-painel
1. **`versionId` global** — `BibleVersionSelector` e `useBibleVerses` leem o contexto global.
   Para diferentes passagens/traduções em painéis distintos, torna-se overridable por painel.
2. **Posição global do reader** — `useReaderPosition` é fonte única. Book/chapter tornam-se
   por painel.
3. **`NotesProvider` a nível de página** — envolve a página inteira com um escopo. Move para
   dentro de cada painel bíblico.
4. **Estado UI de notes** (`notesOpen`/`notesTarget`) — a nível de página; torna-se por painel
   (cada painel tem seu próprio dock notes/highlights).
5. **`BookChapterDialog`** — uma instância global; cada painel precisa do seu próprio picker.

## Decisões aprovadas

1. **Version por painel (per-pane version).** Cada aba/painel pode mostrar uma tradução
   diferente (ex.: ARA numa aba, NVI em outra) → leitura paralela estilo Logos. Implementado
   via `BibleVersionScopeProvider` que sobrescreve `versionId`/`setVersionId` num subtree,
   delegando install/uninstall/listing/`getVerses` ao provider global.

2. **Toggle Modo Simples / Modo Avançado** em `app/config/page.tsx`. Simples = comportamento
   atual (um reader, sem abas, sem grid). Avançado = ativa o `WorkspaceProvider` com abas
   (mobile+desktop) e grid tiling (desktop). Persistido em `localStorage`
   (`openbible:workspace-mode`). Default: **Simples** (não altera experiência de usuários
   existentes sem consentimento).

3. **Mobile é sempre abas** (quando no Avançado). Grid é desktop-only. Barra de abas
   horizontal scrollable no topo — referência: Bible Logos mobile.

4. **Settings de exibição (font/mode/spacing/font) permanecem globais** (uma preferência
   aplicada em todos os painéis). Book/chapter/version tornam-se por painel.

## Design

### Modelo de dados — Workspace

`features/workspace/` detém `types.ts`, `context/workspace-context.tsx`,
`hooks/use-workspace-mode.ts`, `hooks/use-reader-settings.ts`, `components/` (workspace-tabs,
workspace-view, bible-pane-view) e `lib/pane-title.ts`.

```ts
type PaneType = "bible" | "note" | "sermon"

interface BiblePaneState  { type: "bible";  bookId: string; chapter: number; versionId: string }
interface NotePaneState   { type: "note";   noteId: string }
interface SermonPaneState { type: "sermon"; sermonId: string }

type PaneState = BiblePaneState | NotePaneState | SermonPaneState

interface Pane { id: string; title: string; state: PaneState }

type LayoutMode = "tabs" | "grid"   // grid = phase 2
```

- `WorkspaceProvider`: `panes: Pane[]`, `activePaneId`, `layoutMode`, ações
  (`openPane`, `closePane`, `activatePane`, `updatePaneState`, `setLayoutMode`).
- Persistido sob UMA chave `openbible:workspace`. **Migra** `openbible:book`/`chapter`/`version`
  existentes na primeira execução para preservar a posição atual do usuário. Se vazio, semeia
  um painel bíblico default.
- `useWorkspaceMode()`: lê `openbible:workspace-mode` (`"simple" | "advanced"`).

### Version scoping

`bible-version-context.tsx` ganha `BibleVersionScopeProvider({ versionId, setVersionId })`
que sobrescreve `versionId`/`setVersionId` no subtree. `useBibleVersion()` retorna o scope
mais próximo (fallback no global). Install/uninstall/listing/`getVerses` continuam no global —
o scope só sobrescreve o `versionId` ativo daquele subtree.

### BiblePaneView (reader autocontido)

`bible-pane-view.tsx` envolve `BibleVersionScopeProvider(pane.versionId)` +
`NotesProvider(pane book/chapter/version)` + `HighlightsProvider` + Reader internals (header,
verse rows, selection popover, dock per-pane). Tem seu próprio `BookChapterDialog`. O
`BibleVersionSelector` no header troca **apenas** a version daquele painel.

`reader.tsx` é refatorado para que a version exibida venha de props/scoped context em vez do
contexto global (já recebe `bookId`/`chapter` como props).

### Entry points para abrir painéis
- Botão `+` na barra de abas → novo painel bíblico (abre picker escopado ao painel).
- BookChapterDialog ganha ação "Abrir em nova aba".
- Menu de contexto do versículo → "Abrir em nova aba" (phase posterior).
- Listas de notes/sermons → "Abrir em nova aba" (Phase 3).

## Fases de entrega

| Fase | Escopo |
|------|--------|
| **1 — Fundação + Abas + Setting** | `WorkspaceProvider` + `Pane` + persistência/migração; refactor `Reader` → `BiblePaneView` com version scoped + notes/highlights por painel; barra de abas; rewrite `app/page.tsx` com toggle Simples/Avançado; mobile = tabs-only. |
| **2 — Grid (tiling)** | Split-tree binário + render recursivo com `react-resizable-panels`; ações split/close/orientate; toggle tabs↔grid (desktop). |
| **3 — Note & Sermon pane types** | `note-pane-view`, `sermon-pane-view` placeholder, abrir da lista. |
| **4 — Polish** | Drag-to-reorder abas, atalhos (⌘T/⌘W/⌃⇥), overflow de abas, layout de grid persistido, tests vitest do reducer. |

## Critérios de sucesso (Phase 1)

- Modo Simples: experiência idêntica à atual (um reader, sem abas). Sem regressão.
- Modo Avançado: múltiplos painéis bíblicos em abas; cada aba tem seu próprio book/chapter/version;
  abas podem mostrar traduções diferentes (ao ativar/alternar).
- Toggle funciona em runtime e persiste entre sessões.
- Mobile (Avançado): barra de abas horizontal scrollable; sem grid.
- `pnpm lint` e `pnpm build` passam; commits semânticos; branch a partir de `develop`.

## Fora de escopo (Phase 1)

- Grid tiling (Phase 2), pane types note/sermon (Phase 3), drag reorder/atalhos (Phase 4).
- Sincronização de abas entre dispositivos.

