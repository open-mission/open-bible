# Spec: Reorganização Baseada em Features (Feature-Based Structure)

Data: 2026-06-30  
Status: Em Revisão  
Autor: Antigravity AI  

---

## 1. Propósito e Contexto

Atualmente, o projeto possui uma estrutura de arquivos plana para componentes em `components/` e utilitários/contextos/hooks em `lib/`. Conforme o projeto cresce, isso torna difícil localizar arquivos relacionados a uma única feature (ex: tudo sobre o leitor da bíblia ou sobre autenticação).

O objetivo deste refactoring é reorganizar a estrutura do projeto sob a pasta `/features`, agrupando componentes, hooks, contextos e utilitários por feature. Isso facilita a manutenção, isolamento e modularização do código.

---

## 2. Estrutura Proposta

Criaremos uma pasta de nível superior `/features/` contendo os seguintes módulos/features:

1. **`auth`**: Autenticação (server-side, client-side, sessões).
2. **`theme`**: Provedor e utilitários de temas do sistema.
3. **`service-worker`**: Registro do service worker e atualização de banners.
4. **`layout`**: Componentes da estrutura externa (sidebar, painéis, mobile nav) e seus estados.
5. **`bible-reader`**: O leitor de bíblia em si (telas, navegação de capítulos, busca, verificação de versões, etc.).

Os componentes genéricos de UI do shadcn/ui continuarão na pasta global `/components/ui/` conforme preferência do usuário e padrão de ferramentas do ecossistema.

### Mapa de Reorganização de Arquivos

Abaixo está o mapeamento exato dos arquivos que serão movidos:

| Arquivo Original | Novo Caminho | Feature correspondente |
|------------------|--------------|------------------------|
| `lib/auth.ts` | `features/auth/auth.ts` | `auth` |
| `lib/auth-client.ts` | `features/auth/auth-client.ts` | `auth` |
| `components/theme-provider.tsx` | `features/theme/components/theme-provider.tsx` | `theme` |
| `lib/theme.ts` | `features/theme/utils/theme.ts` | `theme` |
| `components/service-worker-register.tsx` | `features/service-worker/components/service-worker-register.tsx` | `service-worker` |
| `components/update-banner.tsx` | `features/service-worker/components/update-banner.tsx` | `service-worker` |
| `lib/use-sw-update.ts` | `features/service-worker/hooks/use-sw-update.ts` | `service-worker` |
| `components/panel-layout.tsx` | `features/layout/components/panel-layout.tsx` | `layout` |
| `components/sidebar.tsx` | `features/layout/components/sidebar.tsx` | `layout` |
| `components/mobile-nav.tsx` | `features/layout/components/mobile-nav.tsx` | `layout` |
| `components/env-badge.tsx` | `features/layout/components/env-badge.tsx` | `layout` |
| `lib/use-panel-state.ts` | `features/layout/hooks/use-panel-state.ts` | `layout` |
| `lib/use-toast.tsx` | `features/layout/hooks/use-toast.tsx` | `layout` (toast do sistema) |
| `components/reader.tsx` | `features/bible-reader/components/reader.tsx` | `bible-reader` |
| `components/reader-header.tsx` | `features/bible-reader/components/reader-header.tsx` | `bible-reader` |
| `components/reader-empty.tsx` | `features/bible-reader/components/reader-empty.tsx` | `bible-reader` |
| `components/reader-chapter-nav.tsx` | `features/bible-reader/components/reader-chapter-nav.tsx` | `bible-reader` |
| `components/reader-version-badge.tsx` | `features/bible-reader/components/reader-version-badge.tsx` | `bible-reader` |
| `components/verse-row.tsx` | `features/bible-reader/components/verse-row.tsx` | `bible-reader` |
| `components/bible-version-selector.tsx` | `features/bible-reader/components/bible-version-selector.tsx` | `bible-reader` |
| `components/book-chapter-dialog.tsx` | `features/bible-reader/components/book-chapter-dialog.tsx` | `bible-reader` |
| `components/book-list.tsx` | `features/bible-reader/components/book-list.tsx` | `bible-reader` |
| `components/chapter-grid.tsx` | `features/bible-reader/components/chapter-grid.tsx` | `bible-reader` |
| `components/download-versions-dialog.tsx` | `features/bible-reader/components/download-versions-dialog.tsx` | `bible-reader` |
| `components/inspector-panel.tsx` | `features/bible-reader/components/inspector-panel.tsx` | `bible-reader` |
| `lib/bible-data.ts` | `features/bible-reader/utils/bible-data.ts` | `bible-reader` |
| `lib/bible-db.ts` | `features/bible-reader/lib/bible-db.ts` | `bible-reader` |
| `lib/bible-version-context.tsx` | `features/bible-reader/context/bible-version-context.tsx` | `bible-reader` |
| `lib/use-bible.ts` | `features/bible-reader/hooks/use-bible.ts` | `bible-reader` |
| `lib/use-reader-position.ts` | `features/bible-reader/hooks/use-reader-position.ts` | `bible-reader` |
| `lib/verse-utils.ts` | `features/bible-reader/utils/verse-utils.ts` | `bible-reader` |

---

## 3. Mudanças de Dependência e Importações

Todas as referências nos arquivos de páginas (`app/page.tsx`, `app/layout.tsx`, etc.) e nos próprios componentes movidos serão atualizadas para usar os novos caminhos `@/features/...`.

Exemplos de mapeamento de imports em `app/page.tsx`:
```typescript
// Antes:
import { Reader } from "@/components/reader"
import { ReaderEmpty } from "@/components/reader-empty"
import { PanelLayout } from "@/components/panel-layout"
import { InspectorPanel } from "@/components/inspector-panel"
import { BookChapterDialog } from "@/components/book-chapter-dialog"
import { getBook } from "@/lib/bible-data"
import { useBibleVersion } from "@/lib/bible-version-context"
import { useToast } from "@/lib/use-toast"
import { useReaderPosition } from "@/lib/use-reader-position"
import { usePanelState } from "@/lib/use-panel-state"
import { MobileNav } from "@/components/mobile-nav"

// Depois:
import { Reader } from "@/features/bible-reader/components/reader"
import { ReaderEmpty } from "@/features/bible-reader/components/reader-empty"
import { PanelLayout } from "@/features/layout/components/panel-layout"
import { InspectorPanel } from "@/features/bible-reader/components/inspector-panel"
import { BookChapterDialog } from "@/features/bible-reader/components/book-chapter-dialog"
import { getBook } from "@/features/bible-reader/utils/bible-data"
import { useBibleVersion } from "@/features/bible-reader/context/bible-version-context"
import { useToast } from "@/features/layout/hooks/use-toast"
import { useReaderPosition } from "@/features/bible-reader/hooks/use-reader-position"
import { usePanelState } from "@/features/layout/hooks/use-panel-state"
import { MobileNav } from "@/features/layout/components/mobile-nav"
```

---

## 4. Critérios de Sucesso e Validação

1. **Compilação sem erros:** A execução de `pnpm build` deve passar com sucesso (com `next build` ignorando erros de TS legados se configurado, mas sem quebrar por imports incorretos).
2. **Lint limpo:** Execução de `pnpm lint` deve reportar zero erros ou avisos relacionados ao refactoring.
3. **Funcionalidades do app intactas:**
   - Troca de livros e capítulos
   - Troca de versões da bíblia
   - Download de bíblias localmente (SQLite WASM)
   - Layout colapsável e painel do inspetor
   - Persistência e Toast de progresso
