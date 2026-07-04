# App Version + Environment Badge Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Exibir a versão do app (do `package.json`) na interface e um badge de ambiente ("Development"/"beta") quando não estiver em produção.

**Architecture:** Uma fonte única tipada (`lib/app-env.ts`) lê `NEXT_PUBLIC_APP_VERSION` (injetada do `package.json` pelo `next.config.mjs`) e `NEXT_PUBLIC_APP_ENV` (do `.env`). Um componente `EnvBadge` consome essa fonte e renderiza `null` em produção. O badge entra no `reader-header.tsx`; a versão entra numa seção "Sobre" da `/config`.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind v4, componente `Badge` (base-ui + cva).

> **Nota de verificação:** O Open Bible não tem suíte de testes. A verificação de cada tarefa é
> `pnpm lint` + (quando relevante) `pnpm build` + checagem manual no `pnpm dev`. Não há TDD aqui.

---

### Task 1: Fonte única de ambiente (`lib/app-env.ts`)

**Files:**
- Create: `lib/app-env.ts`

- [ ] **Step 1: Criar o módulo**

```ts
// lib/app-env.ts
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

- [ ] **Step 2: Verificar lint**

Run: `pnpm lint`
Expected: PASS (sem erros novos; o arquivo é só constantes/tipos).

- [ ] **Step 3: Commit**

```bash
git add lib/app-env.ts
git commit -m "feat: add app-env single source for version and environment"
```

---

### Task 2: Injetar a versão do `package.json` no build (`next.config.mjs`)

**Files:**
- Modify: `next.config.mjs`

**Contexto:** O arquivo atual usa `export default` de um objeto de config (possivelmente embrulhado por
um plugin PWA). O objetivo é (a) ler `package.json` no topo e (b) adicionar a chave `env` ao objeto de
config. NÃO remover nada existente.

- [ ] **Step 1: Ler o arquivo atual inteiro**

Run: `cat next.config.mjs`
Expected: ver a estrutura atual (import do `next-pwa`, objeto de config, export). Identificar o nome da
const do objeto de config (ex.: `nextConfig`) e se já existe uma chave `env`.

- [ ] **Step 2: Adicionar a leitura do package.json no topo**

Logo abaixo dos imports existentes, adicionar:

```js
import { readFileSync } from "node:fs"

const pkg = JSON.parse(
  readFileSync(new URL("./package.json", import.meta.url), "utf-8")
)
```

- [ ] **Step 3: Adicionar a chave `env` ao objeto de config**

No objeto de config (ex.: `const nextConfig = { ... }`), adicionar a propriedade:

```js
  env: {
    NEXT_PUBLIC_APP_VERSION: pkg.version,
  },
```

> Se já existir uma chave `env`, adicionar `NEXT_PUBLIC_APP_VERSION: pkg.version` dentro dela em vez de
> criar uma nova. Não duplicar a chave.

- [ ] **Step 4: Verificar build**

Run: `pnpm build`
Expected: build conclui sem erro. (Isso valida que o config ainda é válido e o package.json é lido.)

- [ ] **Step 5: Commit**

```bash
git add next.config.mjs
git commit -m "feat: expose package.json version as NEXT_PUBLIC_APP_VERSION at build time"
```

---

### Task 3: Componente `EnvBadge` (`components/env-badge.tsx`)

**Files:**
- Create: `components/env-badge.tsx`

- [ ] **Step 1: Criar o componente**

```tsx
// components/env-badge.tsx
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

- [ ] **Step 2: Verificar lint**

Run: `pnpm lint`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add components/env-badge.tsx
git commit -m "feat: add EnvBadge component for non-production environments"
```

---

### Task 4: Configurar variável de ambiente (`.env.local` + `.env.example`)

**Files:**
- Modify: `.env.local` (não versionado)
- Create: `.env.example` (versionado)

- [ ] **Step 1: Adicionar a variável ao `.env.local`**

Acrescentar ao final do `.env.local`:

```bash

# App environment: development | staging | production
NEXT_PUBLIC_APP_ENV=development
```

- [ ] **Step 2: Criar `.env.example` versionado (sem segredos)**

```bash
# .env.example — variáveis públicas. NÃO coloque segredos aqui.

# Ambiente da aplicação: development | staging | production
# Controla a exibição do badge de ambiente (Development / beta) na UI.
NEXT_PUBLIC_APP_ENV=development

# NEXT_PUBLIC_APP_VERSION é injetada automaticamente no build a partir do package.json.
# Não precisa definir manualmente.
```

- [ ] **Step 3: Confirmar que `.env.example` NÃO está ignorado**

Run: `git check-ignore .env.example; echo "exit=$?"`
Expected: o `.gitignore` tem `.env*`, o que ignoraria `.env.example`. Se `git check-ignore` retornar o
caminho (exit=0), adicionar uma exceção ao `.gitignore`.

- [ ] **Step 4: Adicionar exceção no `.gitignore` (se necessário)**

Abrir `.gitignore`, localizar a linha `.env*` e logo abaixo dela adicionar:

```
!.env.example
```

Run novamente: `git check-ignore .env.example; echo "exit=$?"`
Expected: nenhuma saída e `exit=1` (não mais ignorado).

- [ ] **Step 5: Commit**

```bash
git add .env.example .gitignore
git commit -m "chore: document NEXT_PUBLIC_APP_ENV in .env.example"
```

> `.env.local` não é commitado (continua no `.gitignore`).

---

### Task 5: Inserir o badge no `reader-header.tsx`

**Files:**
- Modify: `components/reader-header.tsx`

**Contexto:** O header tem dois grupos de controles: o bloco de tools do desktop (à direita, com o
`<Popover>` de "Exibição", ~linha 380) e o nav fixo mobile (~linha 406-419, com `ReaderVersionBadge` e
o botão de ajustes). `EnvBadge` retorna `null` em produção, então é seguro inserir nos dois.

- [ ] **Step 1: Importar o componente**

No bloco de imports (após a linha `import { ReaderVersionBadge } from "./reader-version-badge"`),
adicionar:

```tsx
import { EnvBadge } from "./env-badge"
```

- [ ] **Step 2: Inserir no grupo de tools do desktop**

Localizar o bloco (à direita, desktop):

```tsx
        {/* Desktop Mini Reference and Tools (Right-aligned) */}
        <div className="hidden md:flex items-center gap-2">

          <Popover>
```

Inserir `<EnvBadge />` logo após a `<div>` de abertura e antes do `<Popover>`:

```tsx
        {/* Desktop Mini Reference and Tools (Right-aligned) */}
        <div className="hidden md:flex items-center gap-2">
          <EnvBadge />

          <Popover>
```

- [ ] **Step 3: Inserir no nav fixo mobile**

Localizar o grupo de botões do nav mobile:

```tsx
          <Button onClick={() => setSettingsOpen(true)} variant="ghost" className="h-9 rounded-full px-3" title="Ajustes de visualização">
            <IconTextSize className="h-4.5 w-4.5 text-muted-foreground" />
          </Button>
        </div>
      </nav>
```

Inserir `<EnvBadge />` logo após o `</Button>` de ajustes e antes do `</div>`:

```tsx
          <Button onClick={() => setSettingsOpen(true)} variant="ghost" className="h-9 rounded-full px-3" title="Ajustes de visualização">
            <IconTextSize className="h-4.5 w-4.5 text-muted-foreground" />
          </Button>
          <EnvBadge className="mr-1" />
        </div>
      </nav>
```

- [ ] **Step 4: Verificar lint**

Run: `pnpm lint`
Expected: PASS.

- [ ] **Step 5: Verificação manual**

Run: `pnpm dev` e abrir `http://localhost:3000`.
Expected: com `NEXT_PUBLIC_APP_ENV=development`, o badge vermelho **"DEVELOPMENT"** aparece no header
(desktop) e no nav inferior (mobile, via DevTools responsivo).

- [ ] **Step 6: Commit**

```bash
git add components/reader-header.tsx
git commit -m "feat: show environment badge in reader header"
```

---

### Task 6: Seção "Sobre" com versão na `/config`

**Files:**
- Modify: `app/config/page.tsx`

**Contexto:** O fim do JSX da página é:

```tsx
              </div>
            </Tabs>
          </div>
        </div>

        <MobileNav activeNav="config" onNavClick={() => {}} />
      </SidebarInset>
    </SidebarProvider>
  )
}
```

A seção "Sobre" entra dentro do container de conteúdo, antes do `</div>` que fecha o wrapper e do
`<MobileNav>`.

- [ ] **Step 1: Importar versão e badge**

No topo do arquivo, junto aos demais imports, adicionar:

```tsx
import { APP_VERSION } from "@/lib/app-env"
import { EnvBadge } from "@/components/env-badge"
```

- [ ] **Step 2: Adicionar a seção "Sobre"**

Localizar o fechamento `</Tabs>` e inserir a seção logo antes dele (dentro do container que envolve as
Tabs). Resultado:

```tsx
              </div>
            </Tabs>

            <div className="px-1 pt-6 mt-6 border-t border-border/50">
              <h2 className="text-lg font-serif font-medium text-foreground mb-2">Sobre</h2>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Open Bible</span>
                <span className="font-mono text-foreground">v{APP_VERSION}</span>
                <EnvBadge />
              </div>
            </div>
          </div>
        </div>
```

> Se o alinhamento/padding destoar do layout existente, ajustar as classes do wrapper externo
> (`px-1`) para casar com o container das Tabs — sem alterar a estrutura.

- [ ] **Step 3: Verificar lint**

Run: `pnpm lint`
Expected: PASS.

- [ ] **Step 4: Verificação manual**

Run: `pnpm dev` e abrir `http://localhost:3000/config`.
Expected: rodapé mostra "Open Bible v0.2.1" e, em development, o badge **"DEVELOPMENT"** ao lado.

- [ ] **Step 5: Commit**

```bash
git add app/config/page.tsx
git commit -m "feat: add About section with app version on config page"
```

---

### Task 7: Verificação final dos três estados de ambiente

**Files:** nenhum (verificação manual).

- [ ] **Step 1: Estado development**

Garantir `NEXT_PUBLIC_APP_ENV=development` no `.env.local`. Run: `pnpm dev`.
Expected: badge vermelho **"DEVELOPMENT"** no header e na /config; versão `v0.2.1` na /config.

- [ ] **Step 2: Estado staging**

Trocar para `NEXT_PUBLIC_APP_ENV=staging` no `.env.local` e reiniciar `pnpm dev`.
Expected: badge neutro **"BETA"** no header e na /config; versão `v0.2.1` na /config.

- [ ] **Step 3: Estado production**

Trocar para `NEXT_PUBLIC_APP_ENV=production` e reiniciar `pnpm dev`.
Expected: **nenhum** badge em lugar nenhum; versão `v0.2.1` continua visível só na /config.

- [ ] **Step 4: Restaurar development**

Voltar `.env.local` para `NEXT_PUBLIC_APP_ENV=development`.

- [ ] **Step 5: Build final**

Run: `pnpm lint && pnpm build`
Expected: ambos PASS.

---

## Auto-revisão (cobertura da spec)

| Requisito da spec | Tarefa |
|-------------------|--------|
| `lib/app-env.ts` (fonte única tipada) | Task 1 |
| Versão do `package.json` via `next.config.mjs` | Task 2 |
| `components/env-badge.tsx` (null em prod, cores) | Task 3 |
| `NEXT_PUBLIC_APP_ENV` no `.env.local` | Task 4 |
| `.env.example` versionado | Task 4 |
| Badge no `reader-header.tsx` (desktop + mobile) | Task 5 |
| Seção "Sobre" com versão na `/config` | Task 6 |
| Verificação dos 3 estados (dev/staging/prod) | Task 7 |

Sem placeholders. Nomes/símbolos consistentes entre tarefas (`APP_VERSION`, `APP_ENV`, `isPreRelease`,
`ENV_LABEL`, `EnvBadge`). Todos os requisitos da spec têm tarefa correspondente.
