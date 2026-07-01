# Spec: Banner de Ambiente + Label de Versão Global

**Data:** 2026-07-01
**Status:** Aprovado
**Escopo:** Substituir `EnvBadge` por dois indicadores globais — banner superior em não-produção e versão no canto em produção.

---

## Objetivo

Substituir o badge inline `EnvBadge` (que aparece no header do leitor bíblico e na `/config`) por:

1. **Não-produção (dev/staging):** barra fina fixa no topo da tela, estilo iOS/macOS, exibindo ambiente + versão, visível globalmente.
2. **Produção:** apenas o número de versão (`vX.Y.Z`) no canto inferior esquerdo, fixo, global.
3. Remover completamente o componente `EnvBadge` e seus usos.

---

## Arquitetura

```
layout.tsx (server component, provider chain)
  └─ <DevBanner />          ← renderiza apenas em dev/staging (fixed top-0)
  └─ <VersionLabel />       ← renderiza apenas em produção (fixed bottom-left)
  └─ {children}

lib/app-env.ts              ← já existe: APP_VERSION, APP_ENV, isPreRelease, ENV_LABEL
features/layout/components/dev-banner.tsx     ← NOVO
features/layout/components/version-label.tsx  ← NOVO
features/layout/components/env-badge.tsx      ← DELETAR
```

Dois componentes independentes em vez de um único com condicionais, porque os padrões visuais são fundamentalmente diferentes (banner superior vs. label de canto). A constante de versão já é compartilhada via `lib/app-env.ts`.

---

## Componentes

### 1. `DevBanner` (`features/layout/components/dev-banner.tsx`)

- **Renderização:** só quando `isPreRelease === true`. Caso contrário, `null`.
- **Posição:** `fixed top-0 left-0 right-0 z-50` — acima de headers (`z-20`), navs (`z-30`, `z-40`).
- **Dimensões:** altura `h-6` (24px), fina e discreta.
- **Estilo:** fundo semitransparente com blur:
  - `development`: `bg-red-500/85 backdrop-blur text-white`
  - `staging`: `bg-amber-500/85 backdrop-blur text-black`
- **Conteúdo:** `{ENV_LABEL[APP_ENV]} · v{APP_VERSION}` centralizado horizontalmente, `text-xs font-medium`.
- **Semântica:** `<aside>` com `role="banner"` e `aria-label="Ambiente de desenvolvimento"` (ou staging).
- **Layout:** não afeta o fluxo (é `fixed`). O conteúdo da página começa abaixo do banner — sem padding compensatório automático; o banner é fino o suficiente (24px) para não atrapalhar a UX.

### 2. `VersionLabel` (`features/layout/components/version-label.tsx`)

- **Renderização:** só quando `APP_ENV === "production"`. Caso contrário, `null`.
- **Posição:** `fixed bottom-4 left-4 z-40` — acima do `mobile-nav` (`z-40` mesmo nível, mas no canto esquerdo não conflita com os botões centrais do nav mobile).
- **Estilo:** `text-xs text-muted-foreground/40 font-mono` — muito discreto, sem fundo.
- **Conteúdo:** `v{APP_VERSION}` apenas.
- **Semântica:** `<span aria-hidden="true">` — decorativo.
- **Mobile safe:** com `pb-[calc(1rem+env(safe-area-inset-bottom))]` nos casos em que safe-area é relevante.

### 3. Remoções

| Arquivo | Remover |
|---------|---------|
| `features/bible-reader/components/reader-header.tsx` | `import { EnvBadge }` (linha 7), `<EnvBadge />` (linha 138), `<EnvBadge className="mr-1" />` (linha 202) |
| `app/config/page.tsx` | `import { EnvBadge }` (linha 13), `<span>v{APP_VERSION}</span>` (linha 265), `<EnvBadge />` (linha 266) |
| `features/layout/components/env-badge.tsx` | **Deletar arquivo** |

> A versão em `/config` é removida porque o `VersionLabel` global já a exibe.

---

## Fluxo de dados

```
Build time:  next.config.mjs lê package.json → NEXT_PUBLIC_APP_VERSION
Runtime:     .env.local → NEXT_PUBLIC_APP_ENV
             lib/app-env.ts → APP_VERSION, APP_ENV, isPreRelease, ENV_LABEL
             DevBanner     → isPreRelease ? banner topo : null
             VersionLabel  → APP_ENV === "production" ? label canto : null
```

Os dois componentes são mutuamente exclusivos: em dev/staging só o DevBanner aparece; em produção só o VersionLabel aparece.

---

## Tratamento de erro / edge cases

- **`NEXT_PUBLIC_APP_ENV` ausente:** default `"development"` → DevBanner aparece. Seguro: falha para o lado de mostrar.
- **`NEXT_PUBLIC_APP_VERSION` ausente:** default `"0.0.0"`. Seguro.
- **Valor inesperado em `APP_ENV`** (ex.: `"prod"`): `ENV_LABEL` pode ser `undefined`. Mitigação: `ENV_LABEL[APP_ENV] ?? ""` como fallback.
- **Conflito de z-index com bottom sheet / drawer:** `DevBanner` em `z-50` fica acima dos drawers (`z-50` do vaul). O banner é fino e não interativo, então não atrapalha.

---

## Fora de escopo (YAGNI)

- Toggle para esconder o banner ou label
- Configuração de posição do label pelo usuário
- Indicador de build number/hash
- Integração com sistema de updates do service worker
