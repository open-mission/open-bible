# Exibição de versão do app + badge de ambiente — Design

**Data:** 2026-06-30
**Status:** Aprovado (aguardando review do usuário)

## Objetivo

Mostrar na interface a versão do Open Bible (hoje `0.2.1`) e, quando o app **não**
estiver rodando em produção, exibir um badge de ambiente ("Development" ou "beta")
para deixar claro que aquele build é pré-release.

## Decisões (tomadas no brainstorming)

| Tema | Decisão |
|------|---------|
| Detecção de ambiente | Variável explícita `NEXT_PUBLIC_APP_ENV` (`development` \| `staging` \| `production`) |
| Fonte da versão | `package.json` injetado no build via `next.config.mjs` (`pnpm release` já bumpa o package.json) |
| Onde exibir | (1) badge dentro do `reader-header.tsx` e (2) seção "Sobre" na `/config` |
| Texto dos badges | `development` → **"Development"**, `staging` → **"beta"** |
| Cores | `development` → vermelho discreto (`variant="destructive"`); `staging`/beta → neutro (`variant="secondary"`) |
| `.env.example` | Criar arquivo versionado documentando as variáveis públicas |

## Contexto técnico

- Next.js 16 (App Router). `process.env.NODE_ENV` só assume `development` | `production` | `test` —
  **não há "staging" nativo**. Por isso usamos `NEXT_PUBLIC_APP_ENV` para distinguir staging de produção.
- Variáveis com prefixo `NEXT_PUBLIC_` são embutidas no bundle no momento do build e ficam
  disponíveis no cliente.
- Já existe um componente `ReaderVersionBadge` (`components/reader-version-badge.tsx`) — ele é a
  **versão da Bíblia** (tradução, ex: ARA). **Não confundir** com a versão do app. Não será alterado.
- Já existe `components/ui/badge.tsx` com variantes `default | secondary | destructive | outline | ghost | link`.

## Arquitetura

```
package.json (version) ──► next.config.mjs (env: NEXT_PUBLIC_APP_VERSION = pkg.version)
.env.local (NEXT_PUBLIC_APP_ENV) ───────────────┐
                                                 ▼
                                        lib/app-env.ts  ◄── fonte única tipada
                                           │           │
                           ┌───────────────┘           └──────────────┐
                           ▼                                           ▼
               <EnvBadge /> em reader-header.tsx          Seção "Sobre" em /config
               (renderiza null em produção)               (versão sempre + EnvBadge)
```

Princípio: **nenhum** componente lê `process.env.NEXT_PUBLIC_*` diretamente; tudo passa por
`lib/app-env.ts`.

## Componentes

### 1. `lib/app-env.ts` (novo)

Fonte única, tipada, da informação de versão e ambiente.

```ts
export type AppEnv = "development" | "staging" | "production"

export const APP_VERSION: string = process.env.NEXT_PUBLIC_APP_VERSION ?? "0.0.0"

export const APP_ENV: AppEnv =
  (process.env.NEXT_PUBLIC_APP_ENV as AppEnv) ?? "development"

/** true em development e staging — false em production */
export const isPreRelease: boolean = APP_ENV !== "production"

export const ENV_LABEL: Record<AppEnv, string> = {
  development: "Development",
  staging: "beta",
  production: "",
}
```

### 2. `next.config.mjs` (modificar)

Injeta a versão do `package.json` no build. Lê o arquivo via `fs` (sem `import` de JSON, que exige flag).

```js
import { readFileSync } from "node:fs"

const pkg = JSON.parse(
  readFileSync(new URL("./package.json", import.meta.url), "utf-8")
)

// dentro do objeto de config do Next:
env: {
  NEXT_PUBLIC_APP_VERSION: pkg.version,
},
```

> A chave `env` mescla-se com a config existente. Se já houver um `env`, adicionar a chave nele.

### 3. `components/env-badge.tsx` (novo)

```tsx
import { Badge } from "@/components/ui/badge"
import { APP_ENV, ENV_LABEL, isPreRelease } from "@/lib/app-env"
import { cn } from "@/lib/utils"

export function EnvBadge({ className }: { className?: string }) {
  if (!isPreRelease) return null
  const variant = APP_ENV === "development" ? "destructive" : "secondary"
  return (
    <Badge variant={variant} className={cn("uppercase tracking-wide", className)}>
      {ENV_LABEL[APP_ENV]}
    </Badge>
  )
}
```

- Retorna `null` em produção → zero impacto no layout final dos usuários.
- `development` → vermelho discreto; `staging` → neutro.

### 4. `components/reader-header.tsx` (modificar)

Importar e renderizar `<EnvBadge />` em dois pontos já existentes:

- **Desktop**: no grupo de tools à direita (perto do botão "Exibição", ~linha 380), antes do `<Popover>`.
- **Mobile**: no nav fixo inferior (~linha 407-419), dentro do grupo de botões.

Como o badge retorna `null` em produção, esses pontos ficam inalterados para o usuário final.

### 5. `app/config/page.tsx` (modificar)

Adicionar uma seção "Sobre" no rodapé do conteúdo (antes do `<MobileNav>` de fechamento):

```tsx
<div className="pt-6 mt-6 border-t border-border/50">
  <h2 className="text-lg font-serif font-medium text-foreground mb-1">Sobre</h2>
  <div className="flex items-center gap-2 text-sm text-muted-foreground">
    <span>Open Bible</span>
    <span className="font-mono text-foreground">v{APP_VERSION}</span>
    <EnvBadge />
  </div>
</div>
```

A versão aparece **sempre**; o badge só em dev/staging.

### 6. `.env.local` (modificar) e `.env.example` (novo)

- `.env.local` ganha: `NEXT_PUBLIC_APP_ENV=development`
- `.env.example` (versionado) documenta as variáveis públicas:

```bash
# Ambiente da aplicação: development | staging | production
# Controla a exibição do badge de ambiente (Development / beta) na UI.
NEXT_PUBLIC_APP_ENV=development

# NEXT_PUBLIC_APP_VERSION é injetada automaticamente no build a partir do package.json.
# Não precisa definir manualmente.
```

> `.env.example` **não** deve conter segredos — apenas variáveis públicas/documentação. As chaves
> sensíveis (Turso, Better Auth) permanecem só no `.env.local`, fora do versionamento.

## Fluxo de dados

1. **Build:** `next.config.mjs` lê `package.json` → expõe `NEXT_PUBLIC_APP_VERSION`.
2. **Runtime do bundle:** `NEXT_PUBLIC_APP_ENV` (do `.env`) e a versão chegam ao cliente.
3. `lib/app-env.ts` normaliza em `APP_VERSION`, `APP_ENV`, `isPreRelease`, `ENV_LABEL`.
4. `EnvBadge` decide render/cor; `/config` mostra a versão.

## Tratamento de erro / edge cases

- **`NEXT_PUBLIC_APP_ENV` ausente:** default `"development"` → badge "Development" aparece. Seguro:
  falha para o lado de mostrar (dev), nunca esconde indevidamente.
- **`NEXT_PUBLIC_APP_VERSION` ausente:** default `"0.0.0"` (só ocorreria se o next.config falhasse).
- **Valor inesperado em `APP_ENV`** (ex.: `"prod"`): cai no `as AppEnv`; `ENV_LABEL` não teria a chave
  → badge vazio. Mitigação: documentar os 3 valores válidos no `.env.example`.

## Testes / verificação

O Open Bible não tem suíte de testes. Verificação por:

1. `pnpm lint` — sem erros novos.
2. `pnpm build` — compila com a versão injetada.
3. **Manual (`pnpm dev`):**
   - Sem `NEXT_PUBLIC_APP_ENV` ou `=development` → badge **"Development"** (vermelho) no header e na /config.
   - `NEXT_PUBLIC_APP_ENV=staging` → badge **"beta"** (neutro).
   - `NEXT_PUBLIC_APP_ENV=production` → **nenhum** badge; versão `v0.2.1` visível só na /config.
   - Versão exibida bate com `package.json`.

## Fora de escopo (YAGNI)

- Exibir hash de commit / data de build.
- Link para changelog ou "novidades".
- Tooltip detalhado no badge.
- Detecção automática via Vercel/hostname (descartado em favor da var explícita).
