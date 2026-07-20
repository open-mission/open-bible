# Design Spec: Fix Highlight Popover & Stacking Highlights

## Contexto & Problema
Quando um usuário seleciona versículos na tela de leitura da Bíblia e abre o popover de destaque, clicar em uma cor cria o destaque correspondente no banco local (SQLite WASM via Drizzle/OPFS). No entanto, o popover da barra de seleção não fecha após essa ação. Com isso, o usuário pode clicar consecutivamente em outras cores, gerando múltiplos registros de destaque empilhados sobre os mesmos versículos.

O comportamento esperado é que:
1. Ao selecionar uma cor de destaque, a barra/popover de seleção de versículos seja fechada automaticamente.
2. Se já existir um destaque para a exata seleção de versículos atual, selecionar uma cor diferente deve atualizar a cor desse destaque existente, em vez de empilhar um novo. Clicar na mesma cor do destaque existente (toggled state) deve remover o destaque.

## Abordagem Proposta

### 1. Fechamento do Popover de Seleção (`onClose`)
Atualmente, o componente `HighlightMenu` recebe o callback `onClose` do componente pai `VerseSelectionPopover` (que limpa o estado de seleção e fecha a barra), mas esse callback é renomeado para `_onClose` e ignorado.
- **Mudança**: Passar a chamar `onClose()` após a execução bem-sucedida de `handleColorSelect(color)` em `HighlightMenu`.

### 2. Atualização / Substituição de Destaques Existentes (`onUpdateHighlight`)
Atualmente, `HighlightMenu` só verifica se existe um destaque ativo com a *mesma* cor para fazer o toggle off (remoção). Se a cor for diferente, ele cria um novo destaque com a função `onCreateHighlight`.
- **Mudança**:
  1. Alterar `HighlightMenu` para identificar se existe algum destaque nos exatos versículos selecionados, independentemente da cor.
  2. Adicionar o callback `onUpdateHighlight` nas propriedades do `HighlightMenu` para permitir atualizar a cor de um destaque existente.
  3. No callback `handleColorSelect`:
     - Se houver um destaque existente nos mesmos versículos com a mesma cor: remover o destaque (comportamento atual).
     - Se houver um destaque existente nos mesmos versículos com cor diferente: atualizar a cor do destaque existente usando `onUpdateHighlight`.
     - Se não houver destaque: criar um novo com `onCreateHighlight`.

## Impacto na Arquitetura & Fluxo de Dados
- **Fluxo de dados atual**:
  ```
  [User Clicks Color] -> handleColorSelect -> onCreateHighlight (creates duplicate) -> popover stays open
  ```
- **Fluxo de dados proposto**:
  ```
  [User Clicks Color] -> handleColorSelect
                          ├── Matches exact selection & same color -> onDeleteHighlight -> onClose()
                          ├── Matches exact selection & diff color -> onUpdateHighlight -> onClose()
                          └── No match -> onCreateHighlight -> onClose()
  ```

## Plano de Testes / Verificação
1. **Manual**:
   - Selecionar um versículo, clicar em uma cor de destaque. Verificar se o popover fecha e o destaque é criado na cor correta.
   - Selecionar o mesmo versículo novamente, clicar em uma cor diferente. Verificar se o destaque existente é atualizado para a nova cor sem criar registros duplicados no banco local.
   - Selecionar o mesmo versículo novamente, clicar na mesma cor ativa. Verificar se o destaque é removido e o popover fecha.
2. **Automático**:
   - Rodar `pnpm lint` e `pnpm build` para garantir que as assinaturas de tipo TypeScript estão corretas.
