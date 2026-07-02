# Version Picker Redesign — Design Spec

**Data:** 2026-07-01
**Tipo:** improvement (UX/UI)
**Modelo de referência:** `features/bible-reader/components/book-chapter-dialog.tsx`

## 1. Contexto & Problema

O seletor de versão da Bíblia hoje é um **popover rápido** no desktop e um **BottomSheet** simples no
mobile, acionado a partir de um botão compacto (abreviação, ex. "ARA") que vive numa pill
`livro | capítulo | versão` no header (desktop) e na nav inferior (mobile).

Problemas:

1. **Duplicação de código.** Existem dois componentes quase idênticos:
   - `bible-version-selector.tsx` — **órfão** (não é renderizado em lugar nenhum).
   - `reader-version-badge.tsx` — o **ativo**, usado 2× em `reader-header.tsx`.
   Ambos contêm a MESMA lógica: trigger, lista de instaladas, efeito de toast de download (duplicado
   em `useEffect`), botão "baixar mais versões".
2. **UX limitada.** O popover é estreito (sem busca, sem detalhes por versão) e o fluxo de download
   abre um **segundo modal** (`DownloadVersionsDialog`) por cima — experiência quebrada em mobile.
3. **Falta de paridade visual** com o `BookChapterDialog`, que já é um dialog rico (header fixo com
   busca, conteúdo rolante, responsivo desktop/mobile).

## 2. Objetivo

Substituir o seletor de versão (trigger + popover/sheet + dialog de download separado) por **um único
dialog rico** no estilo do `BookChapterDialog`, com **abas "Instaladas" / "Disponíveis"**, eliminando a
duplicação de código e melhorando a UX em desktop e mobile.

## 3. Decisões (aprovadas com o usuário)

| # | Decisão | Escolha |
|---|---------|---------|
| 1 | Duplicação BibleVersionSelector ↔ ReaderVersionBadge | **Unificar no `bible-version-selector.tsx`**; `reader-version-badge.tsx` é removido e seus usos passam a apontar para o novo selector. |
| 2 | Paradigma do seletor | **Dialog rico** estilo BookChapterDialog (não popover). |
| 3 | Seletor × Download | **Dialog único com abas** "Instaladas" / "Disponíveis"; o `DownloadVersionsDialog` é absorvido pela aba "Disponíveis" e o arquivo é removido. |

## 4. Arquitetura & Estrutura de Arquivos

```
features/bible-reader/components/
  bible-version-selector.tsx          # REESCRITO — trigger (Button c/ abreviação) + abre o dialog
  version-picker/                     # NOVA pasta — componentização
    version-picker-dialog.tsx         # container: branch mobile/desktop, header, tabs, busca
    version-search-header.tsx         # header fixo: InputGroup de busca + botão fechar
    installed-versions-tab.tsx        # conteúdo da aba "Instaladas"
    available-versions-tab.tsx        # conteúdo da aba "Disponíveis" (substitui DownloadVersionsDialog)
    version-row.tsx                   # linha/card de uma versão (compartilhado)
    use-version-install.ts            # hook: installVersion + lógica de toast/progress (dedup)
  reader-version-badge.tsx            # REMOVIDO
  download-versions-dialog.tsx        # REMOVIDO (absorvido pela aba "Disponíveis")
```

### Responsabilidades

- **`bible-version-selector.tsx`** (trigger): renderiza um `Button` com a abreviação da versão atual
  (preserva a aparência atual para encaixar na pill `livro | capítulo | versão`), aceitando `variant`
  e `className`. Ao clicar, abre `<VersionPickerDialog />`. Mantém o estado `open`.
- **`version-picker-dialog.tsx`** (container): decide mobile (`BottomSheet size="95"`) × desktop
  (`DesktopDialog` inline, espelhando `book-chapter-dialog.tsx`). Renderiza o header fixo, as abas e o
  conteúdo rolante. Gerencia `query` (busca) e `tab` ativa. Hospeda o hook `useVersionInstall` para
  que o toast de download funcione independentemente da aba visível.
- **`version-search-header.tsx`**: `InputGroup` com ícone `Search`, placeholder "Pesquisar versão...",
  e botão `X` para fechar. Altura fixa `h-14`, borda inferior.
- **`installed-versions-tab.tsx`**: lista `version-row` das versões instaladas filtradas por `query`.
  Selecionar ativa a versão (fecha o dialog). Lixeira desinstala (mantém `confirm()` nativo por
  paridade/escopo).
- **`available-versions-tab.tsx`**: lista `version-row` das versões disponíveis (não instaladas)
  filtradas por `query`. Botão "Baixar" dispara `installVersion` (via hook). Mostra barra de progresso
  fixa no rodapé da aba quando há download em andamento. Versões já instaladas aparecem com badge
  "Instalado".
- **`version-row.tsx`**: card reutilizável. Props: abreviação, nome, metadados (livros/tamanho),
  estado (ativo/instalado/baixando), ações (children — botão de selecionar/baixar/lixeira).
- **`use-version-install.ts`**: encapsula `installVersion` do contexto + estado `installingName` +
  efeito de toast (loading → success → auto-remove em 4s). Retorna `{ install, isInstalling,
  downloadProgress, installingName }`. Substitui o `useEffect` de toast duplicado.

### Ajustes em arquivos existentes

- **`reader-header.tsx`**: trocar as 2 ocorrências de `<ReaderVersionBadge variant="ghost" ... />`
  por `<BibleVersionSelector variant="ghost" ... />`, e o import. Nenhuma outra mudança.

## 5. UX — Comportamento detalhado

### Trigger
- Botão compacto mostrando a **abreviação** da versão atual (uppercase), igual ao badge atual.
- `title` = nome completo da versão (tooltip). `aria-label="Selecionar versão da Bíblia"`.
- Ao clicar: abre o dialog.

### Dialog (desktop)
- `DesktopDialog` (definido inline, idêntico ao do `book-chapter-dialog.tsx`): overlay
  `bg-black/80 backdrop-blur-xs`, container `max-w-2xl` (672px), `max-h-[80vh]`, `rounded-xl`,
  `border border-border`, animação `fade-in zoom-in-95`.
- **Header fixo** `h-14` com busca à esquerda (flex-1) e botão `X` à direita.
- **Tabs** logo abaixo do header: "Instaladas (n)" / "Disponíveis (n)" — `variant="line"`, com contagem.
- **Conteúdo rolante** (`flex-1 overflow-y-auto custom-scrollbar`), `p-4 md:p-6`, `bg-background`.

### Dialog (mobile)
- `BottomSheet size="95"` (idêntico ao `book-chapter-dialog.tsx`).
- Mesmo header + tabs + conteúdo.

### Busca
- Filtra a **aba ativa** por `name` ou `id` (case-insensitive). Não troca de aba.
- Inputs maiores no mobile (`text-base`) para evitar zoom no iOS — espelha o `book-chapter-dialog.tsx`
  (`text-base md:text-sm`).

### Aba "Instaladas"
- Uma `version-row` por versão instalada: abreviação (bold uppercase) + nome completo + "{n} livros".
- Versão ativa destacada (`bg-accent text-accent-foreground`) com ícone `Check`.
- Clicar ativa a versão **e fecha o dialog**.
- Botão lixeira (`Trash2`) por linha → `confirm()` nativo → `uninstallVersion`.

### Aba "Disponíveis"
- Lista **somente as versões não instaladas** (reduz ruído; quem quer ver instaladas está na outra
  aba).
- Cada `version-row`: abreviação + nome + "{n} livros • {tamanho} • SQLite".
- Botão "Baixar" (`Download`) → `installVersion(id)` via hook. Desabilitado enquanto `isInstalling`.
- Barra de progresso fixa no rodapé da aba: "Baixando {nome}... {pct}%" + barra animada.
- Ao concluir: toast "disponível offline" (sucesso, auto-remove 4s) — comportamento preservado.

### Tamanhos das versões
- Mover o `VERSION_SIZES` (hoje em `download-versions-dialog.tsx`) para
  `version-picker/use-version-install.ts` (ou um `version-meta.ts` constants) para reutilização.

### Fechamento
- Botão `X` no header, clique fora (overlay), ou seleção de versão instalada → `onClose`.

## 6. Tratamento de erros / casos extremos

- **Nenhuma versão instalada:** aba "Instaladas" mostra estado vazio
  (`BookOpen` + "Nenhuma versão instalada. Baixe uma na aba Disponíveis.").
- **Busca sem resultados:** mensagem "Nenhuma versão encontrada para \"{q}\"".
- **Download falha:** o `installVersion` já lança; o toast de loading permanece até o `finally` do
  contexto zerar `isInstalling`. Manter um toast de erro: se a promise rejeitar, mostrar toast
  "Falha ao baixar {nome}" (tipo `error`) — **adicionar ao hook** (melhoria mínima sobre o atual).
- **`isInstalling` global:** enquanto um download roda, todos os botões "Baixar" ficam desabilitados
  (comportamento atual preservado).

## 7. Acessibilidade

- `Dialog`/`BottomSheet` já trazem semântica de focus-trap via primitivas base-ui/vaul.
- Trigger tem `aria-label` e `title`.
- Tabs usam `TabsPrimitive` (base-ui) — `role="tab"`, `aria-selected`, navegação por teclado.
- Botões de ação têm `aria-label` descritivos (ex.: `aria-label="Baixar {nome}"`,
  `aria-label="Remover {nome}"`).

## 8. Fora de escopo

- Não introduzir `AlertDialog` para desinstalar (mantém `confirm()` nativo).
- Não adicionar UI para definir versão "padrão" (`setDefaultVersionId`) — não existe hoje na UI.
- Não mudar o contexto `BibleVersionProvider`, a API, nem o worker/OPFS.
- Não adicionar testes (projeto não tem suíte; verificação por `pnpm lint` + `pnpm build` + manual).

## 9. Critérios de sucesso

- [ ] Um único dialog rico substitui popover + BottomSheet + dialog de download.
- [ ] Mobile e desktop com boa UX (header fixo, busca, conteúdo rolante, alvo de toque adequado).
- [ ] Duplicação eliminada: `reader-version-badge.tsx` e `download-versions-dialog.tsx` removidos.
- [ ] Componentização em `version-picker/` (≥5 sub-componentes/hook).
- [ ] Funcionalidades preservadas: selecionar versão, desinstalar, baixar com progresso, toast.
- [ ] `pnpm lint` e `pnpm build` passam.
- [ ] Trigger continua encaixando na pill do header (desktop) e nav inferior (mobile).
