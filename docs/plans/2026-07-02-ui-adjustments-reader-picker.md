# Plano — Ajustes de UI: Reader Header, Dev Bar, Update Toast, Picker Dialogs

**Goal:** Corrigir o botão de exibição do reader-header, remover a barra de dev, alinhar o toast de atualização ao shadcn/ui, ajustar os dialogs de livro/capítulo e versão (header condicional, abreviação, botão fechar no input, bottom sheet 95%).
**Architecture:** Tudo é UI client-side; reutiliza primitives shadcn existentes (`Button`, `Popover`, `InputGroup`/`InputGroupAddon`/`InputGroupButton`, `Badge`, `BottomSheet`, `Tabs`). Sem novas dependências.
**Tech Stack:** Next.js 16, React, Tailwind v4, shadcn/ui (base-vega, `@base-ui/react`), `@tabler/icons-react`, vaul (`Drawer`/`BottomSheet`).

## Tarefas

- [ ] T1: `app/page.tsx` — passar `versionId.toUpperCase()` em `versionAbbreviation`.
- [ ] T2: `components/ui/bottom-sheet.tsx` — `size="95"` adiciona `h-[95dvh]` no `DrawerContent`.
- [ ] T3: `features/layout/components/version-label.tsx` — renderizar sempre; `Badge` do ambiente ao lado quando `isPreRelease`.
- [ ] T4: `app/layout.tsx` — remover `<DevBanner />` + import; remover `pt-6` condicional e import `ENV_LABEL` não usado.
- [ ] T5: excluir `features/layout/components/dev-banner.tsx`.
- [ ] T6: `features/service-worker/components/update-banner.tsx` — reconstruir com tokens semânticos + `Button` + ícone tabler.
- [ ] T7: `features/bible-reader/components/version-picker/version-search-header.tsx` — botão fechar dentro do `InputGroup` (desktop-only).
- [ ] T8: `features/bible-reader/components/book-chapter-dialog.tsx` — header condicional a `shouldShowBooks`; botão fechar dentro do `InputGroup` (desktop-only).
- [ ] T9: `features/bible-reader/components/version-picker/version-picker-dialog.tsx` — `size="95"`; reestruturar `Tabs` para preencher altura.
- [ ] T10: `features/bible-reader/components/reader-header.tsx` — pill única desktop com livro/capítulo/versão/exibição; corrigir `hidden md:flex`; remover seção direita órfã.
- [ ] Verificar: `pnpm lint` (escopo fonte) + `pnpm build`.
- [ ] Commit semântico por grupo lógico.
