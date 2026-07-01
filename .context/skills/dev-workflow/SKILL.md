---
name: dev-workflow
description: Fluxo de desenvolvimento do Open Bible — issue, branch a partir de develop, commits semânticos, PR e merge. Use SEMPRE que for iniciar uma feature, fix ou melhoria (improve) no projeto, ou quando o usuário pedir para "começar uma tarefa", "criar uma branch", "abrir um PR" ou mencionar /dev-workflow.
license: MIT
allowed-tools: Bash, Read
source_tool: antigravity
source_path: .agents/skills/dev-workflow/SKILL.md
imported_at: 2026-07-01T03:50:56.977Z
ai_context_version: 1.1.1
---

# Fluxo de Desenvolvimento — Open Bible

Padroniza como **pessoas e agentes** (Claude, Cursor, Copilot, codex, opencode) trabalham neste
repositório. A fonte de verdade é `AGENTS.md` e `CONTRIBUTING.md`; esta skill é o passo a passo
executável.

## Quando usar

Toda nova **feature**, **fix** ou **melhoria (improve)** DEVE seguir este fluxo. Antes de tocar em
código, siga os passos abaixo.

## Passo 1 — Issue

Garanta que existe uma issue. Se não houver, crie com o template adequado:

```bash
gh issue create --template bug_report.md       # bug   -> fix:
gh issue create --template feature_request.md   # feature -> feat:
gh issue create --template improvement.md        # melhoria -> improve:
```

Anote o número da issue (`{nr}`).

## Passo 2 — Branch a partir de `develop`

**Sempre** ramifique de `develop` (NÃO de `main`). Nome: `<tipo>/{nr}-descricao-curta`.

```bash
git checkout develop
git pull origin develop
git checkout -b feat/42-highlight-verses      # ou fix/15-... ou improve/38-...
```

Prefixos: `feat/`, `fix/`, `improve/`, `docs/`, `refactor/`, `perf/`, `chore/`, `ci/`.

## Passo 3 — Desenvolver com commits semânticos

Conventional Commits, validados pelo hook `commit-msg` (`commitlint`). Tipos válidos:
`feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `improve`, `test`, `chore`, `ci`, `revert`, `wip`.

Formato: `<tipo>(<escopo opcional>): <descrição>` — tipo, escopo e descrição em minúsculas,
cabeçalho de até 100 caracteres.

```bash
git add <arquivos>
git commit -m "feat(reader): add verse highlighting"
# ou use o prompt guiado:
pnpm commit
```

O hook `pre-commit` roda `lint-staged` (eslint --fix nos arquivos staged) automaticamente.

## Passo 4 — Abrir PR para `develop`

```bash
git push -u origin feat/42-highlight-verses
gh pr create --base develop --title "feat: add verse highlighting" --body "Closes #42"
```

- O PR vai **para `develop`**, nunca direto para `main`.
- Referencie a issue com `Closes #{nr}` para fechá-la no merge.
- O CI (`.github/workflows/pr-validation.yml`) valida commits, título do PR, lint e build.

## Passo 5 — Merge

Após review e CI verde: **squash merge** (preferencial). A issue fecha automaticamente e vai para
"Done" no GitHub Project. O merge de `develop` → `main` gera release (deploy via Vercel).

## Estrutura de branches

```
main          ← produção (protegida, deploy automático)
 └── develop  ← integração (base de TODOS os PRs)
       └── feat/42-...   fix/15-...   improve/38-...
```

## Segurança git (não negociável)

- **Nunca** use `--no-verify` para pular hooks.
- **Nunca** force-push para `main` ou `develop`.
- Sem comandos destrutivos (`reset --hard`, `--force`) sem pedido explícito do usuário.
- Se um hook falhar, corrija o problema e crie um **novo** commit (não use `--amend`).
- Nunca commite segredos (`.env.local`, tokens, credenciais).

## Release (apenas mantenedores)

```bash
pnpm release            # interativo: patch/minor/major
pnpm release --minor    # bump direto
pnpm release --dry-run  # simula
```
