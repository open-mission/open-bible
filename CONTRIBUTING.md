# Contribuindo com o Open Bible

Obrigado por querer contribuir! Este guia explica como manter o repositório organizado e profissional.

---

## 📦 Setup do Ambiente

```bash
# Clone o repositório
git clone git@github.com:open-mission/open-bible.git
cd open-bible

# Instale as dependências (inclui husky e commitlint)
pnpm install

# Configure as variáveis de ambiente
cp .env.local.example .env.local   # edite com suas chaves

# Inicie o servidor de desenvolvimento
pnpm dev
```

> **Nota**: O `pnpm install` executa automaticamente o script `prepare`, que instala os git hooks do Husky.

---

## 🌿 Padrão de Branches

Use o formato `<tipo>/<descricao-curta>` com letras minúsculas e hífens:

| Prefixo | Quando usar | Exemplo |
|---------|-------------|---------|
| `feat/` | Nova funcionalidade | `feat/offline-sync` |
| `fix/` | Correção de bug | `fix/ios-scroll-crash` |
| `docs/` | Documentação | `docs/api-reference` |
| `refactor/` | Refatoração | `refactor/bible-database` |
| `perf/` | Performance | `perf/verse-loading` |
| `chore/` | Manutenção | `chore/update-deps` |
| `ci/` | CI/CD | `ci/add-lint-workflow` |

### Fluxo de Branches

```
main          ← produção (protegida, deploy automático via Vercel)
 └── develop  ← integração (base para PRs)
       └── feat/minha-feature   ← branches de trabalho
       └── fix/bug-critico
```

- Crie suas branches sempre a partir de `develop`
- PRs devem ser abertos para `develop`, não para `main`
- O merge de `develop` → `main` gera um release

---

## 💬 Padrão de Commits (Conventional Commits)

Este projeto usa **[Conventional Commits](https://www.conventionalcommits.org/)** validado automaticamente via `commitlint` no hook `commit-msg`.

### Formato

```
<tipo>(<escopo opcional>): <descrição curta>

[corpo opcional]

[rodapé opcional — ex: BREAKING CHANGE, Closes #123]
```

### Tipos Permitidos

| Tipo | Quando usar | Impacto na versão |
|------|-------------|-------------------|
| `feat` | Nova funcionalidade | `minor` (0.X.0) |
| `fix` | Correção de bug | `patch` (0.0.X) |
| `docs` | Apenas documentação | nenhum |
| `style` | Formatação sem lógica | nenhum |
| `refactor` | Refatoração sem feat/fix | nenhum |
| `perf` | Melhoria de performance | `patch` |
| `test` | Adição ou correção de testes | nenhum |
| `chore` | Manutenção, CI, deps | nenhum |
| `ci` | Mudanças de pipeline CI/CD | nenhum |
| `revert` | Reverter commit anterior | depende |
| `wip` | Work in progress (apenas local) | nenhum |

### Exemplos de Commits Válidos

```bash
feat(reader): add font size adjustment slider
fix(install): prevent duplicate bible download on retry
docs: update contributing guide with branch conventions
chore(deps): upgrade next to 16.3.0
perf(search): cache verse lookup results in memory
refactor(database): extract BibleDatabase class to own module

# Breaking change (incrementa MAJOR):
feat!: redesign Bible version selection API

# Com escopo e corpo:
fix(ios): prevent keyboard from hiding verse input

Fixes an issue where the soft keyboard would obscure
the active input field on iOS Safari due to missing
viewport meta adjustments.

Closes #42
```

### Usando o CLI Interativo

```bash
pnpm commit   # abre o Commitizen — guia você pelo formato correto
```

### Commits Inválidos (rejeitados pelo hook)

```bash
git commit -m "fix bug"          # ❌ sem tipo convencional
git commit -m "Fix: something"   # ❌ maiúscula no tipo
git commit -m "feat(SCOPE): x"   # ❌ escopo em maiúscula
```

---

## 🚀 Criando um Release

```bash
pnpm release           # interativo — escolhe patch/minor/major
pnpm release patch     # bump direto de patch
pnpm release minor     # bump de minor
pnpm release major     # bump de major
pnpm release --dry-run # simula sem fazer nada
```

O script automaticamente:
1. Valida que o diretório está limpo
2. Faz bump da versão no `package.json`
3. Cria commit `chore(release): vX.Y.Z`
4. Cria tag anotada `vX.Y.Z`
5. Faz push do branch e da tag
6. Cria GitHub Release com notas geradas automaticamente

---

## 🔍 Revisão de Código

- PRs devem ter descrição clara do que muda e por quê
- Use o template de PR disponível em `.github/pull_request_template.md`
- Prefira PRs pequenos e focados a PRs grandes
- Adicione screenshots para mudanças de UI

---

## 📂 Estrutura do Projeto

```
open-bible/
├── app/                    # Next.js App Router (server components)
│   ├── api/                # Hono API routes
│   ├── layout.tsx          # Root layout com providers
│   └── page.tsx            # Página principal (reader)
├── components/             # Componentes React
│   └── ui/                 # shadcn/ui base-nova
├── hooks/                  # Custom React hooks
├── lib/                    # Utilitários e lógica de negócio
│   ├── database/           # SQLite WASM + Drizzle ORM
│   └── auth.ts             # Better Auth config
├── public/                 # Assets estáticos (wasm, service worker)
├── scripts/                # Scripts de manutenção
└── resources/              # Bíblias em SQLite (não commitadas)
```
