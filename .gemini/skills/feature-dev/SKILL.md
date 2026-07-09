---
name: feature-dev
description: Orquestra o ciclo completo de uma nova feature, fix ou melhoria (improve) no Open Bible — do brainstorming/spec ao plano de implementação, em uma branch isolada (worktree) a partir de develop. Use SEMPRE que o usuário pedir para começar uma feature/fix/melhoria, "implementar X", "criar uma spec", "planejar uma implementação", ou mencionar /feature-dev. Funciona com qualquer agente (Claude, Cursor, codex, opencode).
---

# Feature Dev — Spec → Plano → Branch isolada → Implementação

Ponto de entrada único para **qualquer trabalho de feature, fix ou melhoria** no Open Bible.
Garante que **antes de escrever código** exista uma spec aprovada e um plano de implementação, e que
o trabalho aconteça numa **branch isolada (git worktree) a partir de `develop`**.

A mecânica de git (branch a partir de `develop`, commits semânticos, PR, merge) está na skill
[`dev-workflow`](../dev-workflow/SKILL.md) — esta skill a chama no momento certo. A metodologia de
spec/plano vem do **superpowers**; esta skill usa as skills do superpowers quando elas existem e cai
num processo equivalente embutido quando não existem.

## Detecção de ambiente (primeiro passo, sempre)

Descubra se as skills do superpowers estão disponíveis neste agente:

- **Claude Code com superpowers**: existem as skills `superpowers:brainstorming`,
  `superpowers:writing-plans`, `superpowers:using-git-worktrees`. **Invoque-as** nos passos abaixo.
- **Qualquer outro agente** (Cursor, codex, opencode, ou Claude sem o plugin): siga o
  **processo embutido** descrito em cada passo (Modo portátil). O resultado é o mesmo: uma spec e um
  plano em arquivos versionados.

> Como saber: se você (agente) tem um mecanismo de "skills" e consegue listar `superpowers:*`, use o
> modo nativo. Caso contrário, modo portátil. Na dúvida, use o modo portátil — ele nunca depende de
> ferramentas externas.

## Visão geral do fluxo

```
1. Brainstorming → spec aprovada     (docs/specs/YYYY-MM-DD-<topico>-design.md)
2. Plano de implementação            (docs/plans/YYYY-MM-DD-<feature>.md)
3. Branch isolada (worktree)         (.worktrees/<tipo>/<nr>-desc, a partir de develop)
4. Implementação + commits semânticos
5. PR para develop                   (via skill dev-workflow)
```

NÃO pule etapas. NÃO escreva código de implementação antes do passo 3.

---

## Passo 1 — Brainstorming & Spec

**Objetivo:** transformar a ideia numa spec aprovada pelo usuário antes de qualquer código.

**Modo nativo (superpowers):** invoque `superpowers:brainstorming`. Ela cuida de explorar contexto,
perguntar uma coisa de cada vez, propor 2-3 abordagens, apresentar o design e salvar a spec.

**Modo portátil (qualquer agente):** execute manualmente:
1. **Explore o contexto** — leia `AGENTS.md`, arquivos relevantes e os commits recentes
   (`git log --oneline -15`). Entenda os padrões existentes antes de propor mudanças.
2. **Pergunte uma de cada vez** — propósito, restrições, critérios de sucesso. Prefira múltipla
   escolha. Não despeje várias perguntas juntas.
3. **Proponha 2-3 abordagens** com trade-offs e a sua recomendação (lidere pela recomendada).
4. **Apresente o design** em seções proporcionais à complexidade (arquitetura, componentes, fluxo de
   dados, tratamento de erro, testes). Peça aprovação a cada seção.
5. **Escreva a spec** em `docs/specs/YYYY-MM-DD-<topico>-design.md`. Use a data real (rode
   `date +%F`).
6. **Auto-revisão da spec:** sem "TODO/TBD", sem contradições, escopo focado, sem ambiguidades.
   Corrija inline.
7. **Gate do usuário:** peça para o usuário revisar o arquivo da spec antes de seguir.

**Não comece o plano enquanto a spec não for aprovada.**

> Decomposição: se o pedido abrange vários subsistemas independentes, sinalize isso e quebre em
> sub-projetos — cada um com seu próprio ciclo spec → plano → implementação.

---

## Passo 2 — Plano de Implementação

**Objetivo:** um plano em tarefas pequenas (2-5 min cada), com caminhos de arquivo exatos, código
real e comandos de teste — sem placeholders.

**Modo nativo (superpowers):** invoque `superpowers:writing-plans`.

**Modo portátil (qualquer agente):** escreva o plano em `docs/plans/YYYY-MM-DD-<feature>.md`:
- **Cabeçalho:** Goal (1 frase), Architecture (2-3 frases), Tech Stack.
- **Mapa de arquivos:** quais arquivos criar/modificar e a responsabilidade de cada um.
- **Tarefas em passos pequenos** com checkbox `- [ ]`. Para projetos com testes, siga TDD
  (escrever teste que falha → rodar e ver falhar → implementar mínimo → rodar e ver passar →
  commitar). O Open Bible **não tem suíte de testes** hoje, então a verificação por tarefa costuma
  ser `pnpm lint` + `pnpm build` + checagem manual no `pnpm dev`.
- **Sem placeholders:** mostre o código real de cada passo; nada de "TODO", "handle edge cases",
  "similar à Task N".
- **Auto-revisão:** cada requisito da spec tem uma tarefa? Nomes/assinaturas consistentes entre
  tarefas? Corrija inline.

Princípios: DRY, YAGNI, commits frequentes, tarefas auto-contidas.

---

## Passo 3 — Branch isolada (git worktree) a partir de `develop`

**Objetivo:** isolar a implementação em branch separada, sem mexer no diretório de trabalho atual.

**Modo nativo (superpowers):** invoque `superpowers:using-git-worktrees`.

**Modo portátil / mecânica concreta neste repo:**

```bash
# 1. Garantir develop atualizado como base
git fetch origin
git checkout develop
git pull origin develop

# 2. Nome da branch: <tipo>/<nr>-descricao  (feat|fix|improve|docs|refactor|perf|chore|ci)
BRANCH="feat/42-highlight-verses"

# 3. Criar worktree a partir de develop (.worktrees/ já está no .gitignore)
git worktree add ".worktrees/${BRANCH}" -b "$BRANCH" develop
cd ".worktrees/${BRANCH}"

# 4. Setup do projeto na worktree
pnpm install

# 5. Baseline limpo (não há testes; valide lint + build)
pnpm lint && pnpm build
```

Verificações:
- `.worktrees/` **deve** estar no `.gitignore` (já está). Se um dia não estiver, adicione e commite
  antes de criar a worktree.
- A branch sai **de `develop`**, nunca de `main`.
- Se `pnpm lint`/`pnpm build` falharem no baseline, **reporte e pergunte** antes de prosseguir — para
  não confundir dívida preexistente com regressão sua.

> Por que worktree e não `git checkout -b`: permite implementar a feature isolada enquanto o diretório
> principal continua na branch atual. Se preferir trabalhar sem worktree (branch simples), está ok —
> mas mantenha branch a partir de `develop`.

---

## Passo 4 — Implementação

Execute o plano tarefa a tarefa, na worktree:
- Um commit semântico por unidade lógica (use os tipos validados pelo `commitlint`:
  `feat`, `fix`, `improve`, etc.). `pnpm commit` dá o prompt guiado.
- O hook `pre-commit` roda `lint-staged`; o `commit-msg` valida a mensagem. **Nunca** use
  `--no-verify`.
- Marque os checkboxes do plano conforme conclui.

**Modo nativo (superpowers):** para execução assistida, considere
`superpowers:subagent-driven-development` (um subagente por tarefa) ou `superpowers:executing-plans`.

---

## Passo 5 — PR e fechamento

Use a skill [`dev-workflow`](../dev-workflow/SKILL.md) (passos 4-5): push da branch, `gh pr create
--base develop` referenciando a issue com `Closes #nr`, CI verde, squash merge.

Limpeza da worktree depois do merge:
```bash
cd <repo-principal>
git worktree remove ".worktrees/feat/42-highlight-verses"
```

---

## Regras inegociáveis

- **Nunca** escreva código de implementação antes de spec aprovada + plano escrito.
- **Sempre** ramifique de `develop`. Nunca de `main`. Nunca force-push para `main`/`develop`.
- **Nunca** use `--no-verify` nem pule hooks/CI.
- Commits semânticos (Conventional Commits) em tudo.
- Sem placeholders na spec nem no plano.
- Se um hook falhar, corrija e crie um **novo** commit (não use `--amend`).
