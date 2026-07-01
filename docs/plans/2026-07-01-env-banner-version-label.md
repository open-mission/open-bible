# Plano: Banner de Ambiente + Label de Versão Global

**Data:** 2026-07-01
**Spec:** `docs/specs/2026-07-01-env-banner-version-label-design.md`

## Header

- **Goal:** Substituir `EnvBadge` por `DevBanner` (não-produção) e `VersionLabel` (produção), ambos globais via `layout.tsx`.
- **Architecture:** Dois componentes independentes em `features/layout/components/`, renderizados condicionalmente no `app/layout.tsx`. Consomem `lib/app-env.ts` (já existente). `EnvBadge` é removido de `reader-header.tsx`, `app/config/page.tsx`, e deletado.
- **Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind v4.

---

## Mapa de Arquivos

| Arquivo | Ação | Responsabilidade |
|---------|------|-----------------|
| `features/layout/components/dev-banner.tsx` | **Criar** | Banner fino no topo (dev/staging) com env + versão |
| `features/layout/components/version-label.tsx` | **Criar** | Label discreto no canto inferior esquerdo (produção) |
| `app/layout.tsx` | **Modificar** | Adicionar `<DevBanner />` e `<VersionLabel />` |
| `features/bible-reader/components/reader-header.tsx` | **Modificar** | Remover import e usos do `EnvBadge` |
| `app/config/page.tsx` | **Modificar** | Remover versão inline e `EnvBadge` da seção "Sobre" |
| `features/layout/components/env-badge.tsx` | **Deletar** | Não é mais necessário |

---

## Tarefas

### Task 1: Criar `DevBanner` (`features/layout/components/dev-banner.tsx`)

- [ ] **Step 1: Criar o componente**

```tsx
"use client";

import { APP_ENV, APP_VERSION, ENV_LABEL, isPreRelease } from "@/lib/app-env";

export function DevBanner() {
  if (!isPreRelease) return null;

  const bgColor =
    APP_ENV === "development" ? "bg-red-500/85" : "bg-amber-500/85";
  const textColor = APP_ENV === "development" ? "text-white" : "text-black";
  const label = ENV_LABEL[APP_ENV] ?? "";

  return (
    <aside
      role="banner"
      aria-label={`Ambiente de ${label}`}
      className={`fixed top-0 left-0 right-0 z-50 h-6 ${bgColor} backdrop-blur flex items-center justify-center`}
    >
      <span className={`text-xs font-medium ${textColor} select-none`}>
        {label} · v{APP_VERSION}
      </span>
    </aside>
  );
}
```

**Verificação:** `pnpm lint` (componente novo, sem imports não usados).

---

### Task 2: Criar `VersionLabel` (`features/layout/components/version-label.tsx`)

- [ ] **Step 1: Criar o componente**

```tsx
"use client";

import { APP_ENV, APP_VERSION } from "@/lib/app-env";

export function VersionLabel() {
  if (APP_ENV !== "production") return null;

  return (
    <span
      aria-hidden="true"
      className="fixed bottom-4 left-4 z-40 text-xs text-muted-foreground/40 font-mono select-none"
    >
      v{APP_VERSION}
    </span>
  );
}
```

**Verificação:** `pnpm lint`.

---

### Task 3: Adicionar componentes ao `app/layout.tsx`

- [ ] **Step 1: Adicionar imports e renderização**

Após o import do `UpdateBanner` (linha 8), adicionar:

```tsx
import { DevBanner } from "@/features/layout/components/dev-banner";
import { VersionLabel } from "@/features/layout/components/version-label";
```

Dentro do `<body>`, antes do `<ThemeProvider>`:

```tsx
<DevBanner />
<VersionLabel />
```

**Verificação:** `pnpm lint && pnpm build`.

---

### Task 4: Remover `EnvBadge` do `reader-header.tsx`

- [ ] **Step 1: Remover import**

Remover linha 7:
```tsx
import { EnvBadge } from "@/features/layout/components/env-badge";
```

- [ ] **Step 2: Remover uso no desktop (linha 138)**

Remover `<EnvBadge />` da linha 138 (dentro do bloco `hidden md:flex`).

- [ ] **Step 3: Remover uso no mobile nav (linha 202)**

Remover `<EnvBadge className="mr-1" />` da linha 202.

**Verificação:** `pnpm lint` (import não usado será detectado).

---

### Task 5: Remover versão e `EnvBadge` do `app/config/page.tsx`

- [ ] **Step 1: Remover imports**

Remover linha 12 (`APP_VERSION`) e linha 13 (`EnvBadge`):

Antes:
```tsx
import { APP_VERSION } from "@/lib/app-env"
import { EnvBadge } from "@/features/layout/components/env-badge"
```
Depois: ambas as linhas removidas.

- [ ] **Step 2: Simplificar seção "Sobre"**

Remover `<span>v{APP_VERSION}</span>` (linha 265) e `<EnvBadge />` (linha 266). A seção "Sobre" fica:

```tsx
<div className="px-1 pt-6 mt-6 border-t border-border/50">
  <h2 className="text-lg font-serif font-medium text-foreground mb-2">Sobre</h2>
  <div className="flex items-center gap-2 text-sm text-muted-foreground">
    <span>Open Bible</span>
  </div>
</div>
```

**Verificação:** `pnpm lint` (imports não usados detectados).

---

### Task 6: Deletar `env-badge.tsx`

- [ ] **Step 1: Deletar o arquivo**

```bash
rm features/layout/components/env-badge.tsx
```

**Verificação:** `pnpm lint && pnpm build` — build não deve falhar (arquivo não é mais importado de lugar nenhum).

---

### Task 7: Verificação final

- [ ] **Step 1: Lint + Build**

```bash
pnpm lint && pnpm build
```

- [ ] **Step 2: Verificação manual (`pnpm dev`)**

| Cenário | Esperado |
|---------|----------|
| `NEXT_PUBLIC_APP_ENV=development` | Banner fino vermelho no topo: "Development · v0.2.2". Sem label no canto. Sem EnvBadge em lugar nenhum. |
| `NEXT_PUBLIC_APP_ENV=staging` | Banner fino âmbar no topo: "beta · v0.2.2". Sem label no canto. |
| `NEXT_PUBLIC_APP_ENV=production` | Sem banner no topo. "v0.2.2" discreto no canto inferior esquerdo. Mobile nav continua visível e funcional. `/config` mostra "Sobre: Open Bible" sem versão inline. |

---

## Auto-revisão

- [x] Cada requisito da spec tem tarefa correspondente.
- [x] Nomes e assinaturas consistentes entre tarefas (`DevBanner`, `VersionLabel`, `isPreRelease`, `APP_ENV`, `APP_VERSION`, `ENV_LABEL`).
- [x] Sem placeholders — todo código é real e completo.
- [x] DRY: constantes vêm de `lib/app-env.ts`, sem duplicação.
- [x] YAGNI: sem funcionalidades extras.
- [x] Verificação: `pnpm lint` + `pnpm build` por tarefa, verificação manual no final.
