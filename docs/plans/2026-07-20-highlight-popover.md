# Implementation Plan: Fix Highlight Popover & Stacking Highlights

## Goal
Corrigir o comportamento do menu de destaques para fechar o popover após a seleção de uma cor e atualizar a cor de um destaque existente em vez de duplicá-lo se a seleção for idêntica.

## Proposed Changes

### Component: Highlights Menu

#### [MODIFY] [highlight-menu.tsx](file:///Users/claudio/Projects/open-bible/features/highlights/components/highlight-menu.tsx)
- Adicionar `onUpdateHighlight` nas propriedades do `HighlightMenu`.
- Modificar `handleColorSelect` para:
  1. Encontrar qualquer destaque existente exatamente para os mesmos versículos selecionados.
  2. Se houver e for da mesma cor, deletar o destaque (toggle off).
  3. Se houver e for de cor diferente, atualizar a cor usando `onUpdateHighlight`.
  4. Se não houver, criar um novo com `onCreateHighlight`.
  5. Chamar `onClose()` em todos os casos de sucesso para fechar o popover de seleção.

#### [MODIFY] [verse-selection-popover.tsx](file:///Users/claudio/Projects/open-bible/features/bible-reader/components/verse-selection-popover.tsx)
- Extrair `updateHighlight` de `useHighlightMutations()`.
- Passar `onUpdateHighlight={updateHighlight}` para o componente `HighlightMenu`.

## Tasks

- [ ] Criar branch a partir de `develop` e inicializar worktree (ver skill `dev-workflow`).
- [ ] Modificar `verse-selection-popover.tsx` para passar `updateHighlight` para o `HighlightMenu`.
- [ ] Modificar `highlight-menu.tsx` para atualizar/deletar destaques correspondentes e invocar `onClose()`.
- [ ] Rodar `pnpm lint` e `pnpm build` para validar as alterações de build/TypeScript.
- [ ] Executar `pnpm deslop` antes do commit para limpar qualquer slop.
- [ ] Abrir PR para `develop` com o fluxo da issue.
