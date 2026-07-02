# Design — Ajustes de UI: Reader Header, Dev Bar, Update Toast, Picker Dialogs

**Data:** 2026-07-02
**Tipo:** improvement
**Branch:** `improve/ui-reader-picker-adjustments`

## Resumo

Conjunto de ajustes de UI no bible-reader e componentes de layout, alinhando o
cabeçalho do leitor, a barra de ambiente, o toast de atualização do service worker
e os dialogs de seleção (livro/capítulo e versão) ao padrão visual shadcn/ui
(base-vega) e corrigindo bugs de exibição.

## Requisitos

| # | Requisito | Arquivo(s) |
|---|-----------|-----------|
| 1 | Botão "Exibição" não aparece no desktop do `reader-header` (bug `hidden` sem `md:flex`) | `reader-header.tsx` |
| 2 | Remover a barra de dev (top); colocar a versão no bottom-left e o ambiente ao lado (badge) | `dev-banner.tsx`, `version-label.tsx`, `app/layout.tsx` |
| 3 | Toast de atualização (`update-banner.tsx`) com novo visual alinhado ao shadcn/ui | `update-banner.tsx` |
| 4 | Header do `book-chapter-dialog` (busca/versão/fechar) só aparece na seleção de livro, não na de capítulo | `book-chapter-dialog.tsx` |
| 5 | Seletor de versão dentro do campo de busca mostra a **abreviação** (não o nome completo) | `app/page.tsx`, `book-chapter-dialog.tsx` |
| 6 | Botão fechar dos dialogs (`book-chapter-dialog`, `version-picker-dialog`) só no desktop, dentro do input via `InputGroup` | `book-chapter-dialog.tsx`, `version-search-header.tsx` |
| 7 | Bottom sheets preenchem 95% da tela; aba "Instaladas" do picker de versão não fica com altura pequena | `bottom-sheet.tsx`, `version-picker-dialog.tsx` |
| 8 | Botão "Exibição" do `reader-header` tem a mesma aparência do seletor de livros/capítulos (entra no mesmo grupo/pill) | `reader-header.tsx` |
## Decisões

| # | Decisão | Escolha |
|---|---------|---------|
| 1 | Botão "Exibição" desktop | Entra na **pill arredondada** existente (`livro | capítulo | versão | exibição`) como `Button variant="ghost"` + `Popover`, espelhando os botões de livro/capítulo. O container `hidden` vira `hidden md:flex`. |
| 2 | Barra de dev | **Removida** do layout. `VersionLabel` passa a renderizar **sempre**: `v{APP_VERSION}` no bottom-left + um `Badge` ao lado com o rótulo do ambiente quando `isPreRelease`. O `pt-6` do body é removido. O arquivo `dev-banner.tsx` é excluído (dead code). |
| 3 | Toast de atualização | O `<Toaster>` do `sonner` **não está montado** no projeto (confirmado); o app usa um `ToastProvider` custom sem suporte a action button. Manter um banner flutuante dedicado, reconstruído com tokens semânticos (`bg-popover`, `border-border`, `text-popover-foreground`), ícone tabler em círculo `bg-primary/10 text-primary`, e `Button size="sm"` para a ação. |
| 4 | Header do book-chapter-dialog | Renderizar o `<header>` (busca + dropdown de versão + fade) **somente quando `shouldShowBooks`**. Na etapa de capítulo, o topo do conteúdo já tem o botão "Voltar para Livros" + livro selecionado. |
| 5 | Abreviação da versão | `app/page.tsx` passa `versionId.toUpperCase()` como `versionAbbreviation` (em vez de `currentVersion?.name`). O dialog já exibe `{versionAbbreviation ?? versionId}`. |
| 6 | Botão fechar | Vira `InputGroupButton` dentro de `InputGroupAddon align="inline-end"`, com `className="hidden md:flex"` (só desktop). No mobile, o `BottomSheet` (vaul) fecha por swipe/overlay; nenhum botão explícito. |
| 7 | Bottom sheet 95% | `BottomSheet`: para `size="95"`, além de `max-h-[95dvh]` adicionar `h-[95dvh]` no `DrawerContent` para o drawer **sempre** preencher 95% (vaul encolhe a conteúdo com só max-h). `version-picker-dialog`: troca `size="full" fullScreen` por `size="95"` e reestrutura o conteúdo: `<Tabs>` vira `flex-1 min-h-0 flex flex-col`, `TabsList` fica `shrink-0`, `TabsContent` vira `flex-1 min-h-0` com o scroll interno `h-full overflow-y-auto`. |
| 8 | Aparência unificada | Coberto pela decisão #1 — mesmo grupo/pill, mesmas classes `h-8 rounded-full px-3` dos botões de livro/capítulo. |

## Arquivos impactados

| Arquivo | Mudança |
|---------|---------|
| `features/bible-reader/components/reader-header.tsx` | Reescrever seção desktop: pill única com livro/capítulo/versão/exibição; corrigir `hidden md:flex`; remover seção direita órfã. |
| `features/bible-reader/components/book-chapter-dialog.tsx` | Header condicional a `shouldShowBooks`; botão fechar dentro do `InputGroup` (desktop-only). |
| `features/bible-reader/components/version-picker/version-search-header.tsx` | Botão fechar dentro do `InputGroup` (desktop-only). |
| `features/bible-reader/components/version-picker/version-picker-dialog.tsx` | `size="95"`; reestruturar layout do `Tabs` para preencher altura. |
| `app/page.tsx` | `versionAbbreviation={versionId.toUpperCase()}`. |
| `features/layout/components/version-label.tsx` | Renderizar sempre; adicionar `Badge` do ambiente ao lado da versão quando `isPreRelease`. |
| `features/layout/components/dev-banner.tsx` | **Excluir** (dead code após remoção do uso). |
| `app/layout.tsx` | Remover `<DevBanner />` e import; remover `pt-6` condicional do body. |
| `features/service-worker/components/update-banner.tsx` | Reconstruir com tokens semânticos + ícone + `Button`. |
| `components/ui/bottom-sheet.tsx` | `size="95"` → adicionar `h-[95dvh]` no `DrawerContent`. |

## Critérios de sucesso

- Desktop: pill `livro | capítulo | versão | exibição` visível e funcional; Popover de exibição abre alinhado.
- Nenhuma barra colorida no topo; `v{APP_VERSION}` no bottom-left com badge de ambiente ao lado (dev/beta) apenas quando aplicável.
- Update banner usa apenas tokens semânticos (`bg-popover`, `border-border`, `text-popover-foreground`, `bg-primary/10 text-primary`), com `Button` shadcn.
- `book-chapter-dialog`: na etapa de capítulo o header de busca não aparece; na de livro aparece.
- Seletor de versão no campo de busca mostra `ARA` (abreviação), não "Almeida...".
- Botão fechar dentro do input (InputGroup) só no desktop; mobile fecha via swipe.
- Picker de versão (mobile) preenche 95% da tela; aba "Instaladas" ocupa toda a altura disponível e rola.
- `pnpm lint` e `pnpm build` passam.

## Fora de escopo

- Montar `sonner` globalmente / migrar o `ToastProvider` custom (risco de regressão no fluxo de download).
- Alterar o `bible-version-selector.tsx` (trigger da pill) — já mostra abreviação.

