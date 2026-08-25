# Interface do projeto

Este arquivo é a fonte canônica para construir e reaproveitar a interface.
Atualize-o antes e depois de cada tarefa que criar ou mudar uma tela React.

## Base observada

- Stack: Next.js
- Política: toda interface React é composta por componentes React.
- Primitives: shadcn/ui.
- Composições gratuitas: ReUI.

Para Next.js, explicite App Router, Server Components, Client Components e fronteiras entre servidor e navegador.

## Design system

| Item | Localização ou valor | Uso no projeto |
| --- | --- | --- |
| Tokens e tema | `apps/web/app/globals.css`, `apps/web/lib/theme.ts` | Cores, tipografia, espaçamento, raio e temas controlados por `next-themes`. |
| Configuração shadcn/ui | `apps/web/components.json` | Base UI/shadcn com aliases `@/components`, `@/lib` e `@/hooks`. |
| Registry ReUI | Não usado nesta superfície | Não criar uma composição ReUI para Configurações ou updater sem necessidade comprovada. |
| Primitives compartilhadas | `apps/web/components/ui/` | `Dialog`, `Drawer` e `Button` são as primitives reutilizadas nesta superfície. |
| Composições de domínio | `apps/web/features/config/`, `apps/web/features/release-notes/` | Configurações e atualização são compostas nas features, não na rota. |

## Boundaries

- App Router: `apps/web/app/` contém a rota `/config`; a página é Client Component porque coordena router, sidebar e componentes interativos.
- Server Components: podem compor o shell quando não precisam de estado ou browser APIs.
- Client Components: `ConfigPage`, `ConfigDialog`, `ConfigContent`, `UpdateDialog` e `TauriMenuListener` usam `"use client"`.
- Runtime desktop: `apps/web/lib/desktop-runtime.ts` é o único contrato consumido pela UI para eventos nativos, updater e relaunch. O preload Electron permanece fora do renderer.
- Fallback Web/Tauri: o mesmo adapter seleciona Web, Tauri ou Electron; a UI não acessa `window.desktopRuntime` diretamente.

## Blocos criados e reaproveitáveis

Registre todos os blocos criados no projeto, inclusive os internos de uma
feature. Um bloco é um componente React com responsabilidade própria, como
grade, formulário, filtro, cabeçalho, cartão, diálogo, painel lateral, estado
vazio, upload ou ação em lote.

| Bloco | Tipo | Arquivo | Origem | Finalidade e API pública | Estados e acessibilidade | Consumidores | Reaproveitar ou estender |
| --- | --- | --- | --- | --- | --- | --- | --- |
| ConfigContent | Composição de domínio | `apps/web/features/config/components/config-content.tsx` | Próprio + shadcn/ui | `defaultTab?: string`; usa contextos de tema, versão bíblica e release-notes | Abas, foco, estados de verificação, download, sucesso e erro; ações são botões operáveis por teclado | `ConfigDialog`, `/config` | Reutilizar para qualquer superfície de preferências; não duplicar os painéis de versão, tema ou atualização. |
| ConfigDialog | Composição de domínio | `apps/web/features/config/components/config-dialog.tsx` | shadcn/ui `Dialog` e `Drawer` | `open`, `onOpenChange`, `focus?: "changelog"` | Dialog centralizado em viewport >= 768px; Drawer em mobile; fecha por controles padrão e preserva foco | Sidebar, mobile nav, workspace header | Reutilizar para abrir preferências em contexto; manter `ConfigContent` compartilhado. |
| DesktopTitlebar | Shell desktop | `apps/web/features/layout/components/desktop-titlebar.tsx` | shadcn/ui `Menubar` + `DesktopRuntime` | Sem props; menu de Configurações/Sair e controles de janela | Drag region, foco por teclado, controles Minimize/Maximize/Close; macOS posiciona controles à esquerda, Linux/Windows à direita | Root layout Electron | Reutilizar como titlebar do shell Electron; não duplicar controles nativos no renderer. |
| UpdateDialog | Composição de domínio | `apps/web/features/release-notes/components/update-dialog.tsx` | shadcn/ui `Dialog`, `Button` | Usa `useReleaseNotes`; ações de dismiss, download/install e relaunch | Estados `available`, `downloading`, `downloaded` e `error`; bloqueia fechamento e botão durante download; retry após erro | Shell global de release notes | Reutilizar o diálogo; não expor objetos Electron nem criar outro fluxo de updater. |
| TauriMenuListener | Bridge de composição | `apps/web/features/layout/components/tauri-menu-listener.tsx` | Próprio + Next Router | Sem props; registra `desktopRuntime.onOpenSettings` | Invisível; cleanup do listener no unmount; fallback Tauri navega para `/config` | Layout legado Tauri | Manter o nome do arquivo por compatibilidade; Electron usa `DesktopTitlebar`. |
| DesktopRuntime | Contrato de runtime | `apps/web/lib/desktop-runtime.ts` | Próprio | `kind`, `onOpenSettings`, `updater.check`, `updater.downloadInstall`, `updater.relaunch` | Web sem ações nativas; Tauri fallback; Electron com IPC allowlisted e erros serializáveis | Provider de release notes e listener de menu | É a única porta para runtime desktop; não importar APIs Tauri/Electron nos componentes. |
| HighlightsPage | Composição de domínio | `apps/web/features/highlights/components/highlights-page.tsx` | Próprio + `BibleDatabase` | Sem props; orquestra filtros, grid, navegação e estados | Loading skeleton, vazio CTA, erro OPFS, foco teclado, navegação versículo | `apps/web/app/highlights/page.tsx` | Reutilizar para rota /highlights; não duplicar grid de cards. |
| HighlightsFilterBar | Composição de domínio | `apps/web/features/highlights/components/highlights-filter-bar.tsx` | shadcn/ui `Sheet`, `Drawer`, `Select`, `Input`, `Button` | `value: HighlightFilters`, `entries`, `onChange`; busca persistente e filtros reativos | Busca permanece visível; botão abre Sheet >=768px ou Drawer mobile; swatches têm `aria-label`/`aria-pressed`; nomes completos de livros; Escape e foco são geridos pelos primitives | `HighlightsPage` | Reutilizar a composição para filtros de highlights; não duplicar overlay ou estado de filtros. |
| HighlightEditDialog | Composição de domínio | `apps/web/features/highlights/components/highlight-edit-dialog.tsx` | shadcn/ui `Dialog`/`Sheet` | `highlightId`, `open`, `onSave({color, category, content})` | Dialog desktop / Sheet mobile, foco trap, validação categoria | `HighlightsPage`, `HighlightCard` | Reutilizar para edição; manter `highlight-category-input` compartilhado. |
| NoteEditor | Composição de domínio | `apps/web/features/notes/components/note-editor.tsx` | Tiptap + shadcn/ui | `value: string (JSON)`, `onChange(html)`, `placeholder="Escreva / para comandos"`; canvas branco sem borda | Placeholder, slash menu, BubbleMenu, foco, estados loading/vazio/erro OPFS, debounce save | `NotesBrowser`, `/notes` | Reutilizar canvas branco; não recriar editor com borda/form. |
| BibleReference | Extensão Tiptap | `apps/web/features/notes/extensions/bible-reference.ts` | Tiptap Node | `bible/book/chapter/verseStart/verseEnd`; render preview via `BibleDatabase` | Preview navegável, fallback sem texto, link `/?book=&chapter=` | `NoteEditor` | Reutilizar bloco bibleReference; não criar segundo Node para referências. |
| BibleReferencePicker | Composição de domínio | `apps/web/features/notes/components/bible-reference-picker.tsx` | shadcn/ui `Select` | `onSelect({bible, book, chapter, verse})` com preview | Selects com preview, fallback aviso, foco trap | `NoteEditor` via slash | Reutilizar picker; manter lógica de preview centralizada. |

## Telas e composição

| Tela ou rota | Arquivo | Componentes React usados | Dados e ações | Estados |
| --- | --- | --- | --- | --- |
| Janela principal desktop | `apps/desktop-tauri/src/main.ts` + renderer Web | BrowserWindow frameless, protocolo `open-bible://`, preload e `DesktopTitlebar` | Menubar React, controles IPC e ações de janela por plataforma | Janela segura; Linux/Windows mostram controles à direita e macOS à esquerda |
| Configurações em contexto | `ConfigDialog` + `ConfigContent` | `Dialog` desktop ou `Drawer` mobile, abas e controles de preferência | Versão bíblica, tema, leitura, canal de atualização e updater | Idle, checking, available, downloading, downloaded, error; foco e fechamento controlados |
| Configurações por rota | `apps/web/app/config/page.tsx` | `SidebarProvider`, `SidebarInset`, `MobileNav`, `ConfigContent` | Deep link, fallback Web/PWA e retorno via router | Carregamento normal da rota; navegação de retorno; mesma composição de ConfigContent |
| Atualização do aplicativo | `apps/web/features/release-notes/components/release-notes-provider.tsx` + `apps/web/features/release-notes/components/update-dialog.tsx` | `DesktopRuntime`, `Dialog`, `Button` | Verificação, download/install, dismiss e relaunch | Sem atualização, disponível, progresso, baixada, erro recuperável e retry |
| Highlights dedicada | `apps/web/app/highlights/page.tsx` + `apps/web/features/highlights/components/highlights-page.tsx` | `HighlightsPage`, `HighlightsFilterBar`, `HighlightCard`, `HighlightEditDialog` | Lista highlights via OPFS, busca persistente, Sheet desktop/Drawer mobile para filtros cor/categoria/livro/bíblia/data, navegação ao leitor, edição/cópia/exclusão | Loading skeleton, vazio CTA, erro OPFS, overlay fechável por Escape, swatches acessíveis, nomes completos de livros, sucesso toast |
| Notas Notion canvas | `apps/web/app/notes/page.tsx` + `apps/web/features/notes/components/note-editor.tsx` | `NoteEditor`, `BibleReference`, `BibleReferencePicker` | Lista notas + canvas branco Tiptap JSON, slash/bubble, bibleReference picker com preview, debounce save, note_references rebuild, export Markdown | Loading skeleton, vazio CTA, erro OPFS/corrompido, foco placeholder, acessibilidade teclado slash/bubble |

## Regras de composição

1. Páginas e rotas coordenam dados e compõem componentes; não concentram a
   grade, formulário, filtros, overlays ou cartões reutilizáveis.
2. Antes de criar um componente, consulte esta tabela e reaproveite o item
   existente quando ele atender à mesma intenção.
3. Todo item instalado de shadcn/ui ou ReUI entra na tabela com seu arquivo,
   origem, explicação, API, estados e consumidores reais.
4. ReUI usa somente itens gratuitos `@reui/c-*`; use shadcn/ui para
   primitives e ReUI para composições de produto.
5. Ao criar um bloco, registre-o nesta tabela na mesma tarefa. Ao alterar ou
   remover um bloco, atualize seus consumidores e a orientação de reuso.
