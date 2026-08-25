# Backlog: Melhorar navegação entre livros, capítulos e versículos no TUI

| Metainformação | Valor |
| --- | --- |
| ID | BACKLOG-0005 |
| Status | Promoted |
| Produto | Open Bible |
| Épico | TUI OpenTUI |
| Funcionalidade | Navegação TUI |
| Tipo | melhoria |
| Prioridade | Alta |
| Milestones | |
| Criado em | 2026-08-25 |
| Spec promovida | specs/draft/0005-melhorar-navegacao-entre-livros-capitulos-e-versiculos-no-tui/spec.md |

## Ideia original

melhorar a experiencia de navegacao entre livros, capitulos e versiculos para o tui

## Problema percebido

Navegação atual no TUI é básica (Tab entre painéis livro/capítulo/versículo, sem picker fluido, sem busca rápida, sem histórico), gerando fricção para trocar livro/capítulo/versículo vs web que tem command-palette e dock. Usuários frequentes precisam de picker modal com busca por nome/abreviação e navegação direta por referência.

## Pessoa afetada ou beneficiada

Usuário do TUI que lê e navega frequentemente entre livros e capítulos no terminal (leitor CLI). Benefício: troca de contexto em poucas teclas, parity com experiência web.

## Resultado ou valor esperado

Navegação mais rápida e intuitiva com parity à web: picker modal filtrável (<50ms para 66 livros), fluxo livro → grid capítulos → lista versículos + entrada direta `Gn 1:1` e busca integrada, histórico de 10 posições persistido, reduzindo tempo e teclas para trocar livro/capítulo/versículo.

## Contexto

TUI OpenTUI em `apps/tui` já entrega leitor básico (versões/livros/capítulos/versículos) via `specs/draft/0004...` com `BibleManager`/`InstalledStore` (`better-sqlite3`/`bun:sqlite`) e virtual `pnpm` store. Melhoria foca só em UX de navegação, mantendo driver sqlite nativo, `OPEN_BIBLE_DATA_DIR` XDG e `pnpm` workspaces. Não altera download (já com fallback R2) nem API.

## Referências relacionadas

- `specs/draft/0004-tui-opentui-leitor-e-download-de-versoes-com-sqlite-nativo/spec.md` — backlog relacionado / spec relacionada: base leitor TUI a ser estendida
- `specs/backlog/0004-tui-opentui-leitor-e-download-de-versoes-com-sqlite-nativo.md` — backlog relacionado: fundação leitor+download
- `specs/inbox/2026-08-24-212855-tui-opentui-leitor-e-download-de-versoes-com-sqlite-nativo.md` — documentação relacionada: origem TUI
- `specs/inbox/2026-08-24-221354-melhorar-navegacao-entre-livros-capitulos-e-versiculos-no-tui.md` — origem desta melhoria
- `apps/tui/src/ui/app.tsx` — documentação relacionada: implementação atual de navegação (Tab/books/chapters/verses)
- `docs/frontend.md` / `apps/web` command-palette — documentação relacionada: parity web

## Comportamento esperado

- Picker modal (`d` ou vazio inicial) com input filtrável por nome/abreviação (`jo` → João, `gn` → Gênesis), agrupado OT/NT com `Gn — Gênesis (50 caps)`.
- Fluxo em duas etapas no mesmo modal: livro → grid `1..N` capítulos → lista `1..versículos` para jump direto; também aceita digitação `1:15` como atalho após livro.
- `:` global abre barra de referência completa `Gn 1:1` de qualquer painel.
- Histórico: `Esc` volta nível (versos→caps→livros→picker), `Backspace` volta histórico, `n`/`p` próximo/anterior capítulo, `Tab` troca painel, `h` lista últimas 10 posições persistidas em `DATA_DIR/state.json` (ou `app.db`).
- Busca textual integrada no mesmo picker: se filtro não casa livro, mostra até 10 resultados `LIKE %q%` com `Gn 1:1 — texto`.
- Estados: `Carregando...`, `Nenhum livro encontrado para "xyz"`, `Erro ao carregar` com `r` retry, borda `cyan` foco, `?` ajuda atalhos.

## Regras de negócio

- Filtro case-insensitive, diacríticos opcionais (`joao` casa `João`), abreviação e nome completo.
- OT = livros 1-39, NT = 40-66 (via `BOOK_META` testament), ordenação canônica `Gn`→`Ap`.
- Capítulos `1..N` onde `N = MAX(chapter)` por livro; versículos `1..M` por capítulo via `verse` table.
- Busca textual usa `LIKE %q% COLLATE NOCASE LIMIT 10` parity com `apps/web/lib/api/hono-app.ts` e `BibleManager.search`.
- Histórico persiste `last_book`, `last_chapter`, `last_verse`, `history[10]` com `installedAt`; restaura ao abrir TUI.
- Atalhos não conflitam com `q` quit, `Ctrl+C` exit.

## Critérios de aceitação

- **CA-001 — Picker filtra livros:**
  Dado TUI aberto com versão `ara` instalada
  Quando abre picker (`d`) e digita `jo`
  Então lista filtra para `João (Jo)`, `1 João`, `2 João`, `3 João`, ordenada, com destaque, e `Enter` em `Jo` exibe grid `1..21` capítulos

- **CA-002 — Capítulos → versículos:**
  Dado picker com livro `Gn` selecionado
  Quando escolhe capítulo `1`
  Então exibe lista `1..31` versículos de `Gn 1` e `Enter` em `15` navega para `Gn 1:15` com texto correto

- **CA-003 — Busca integrada e referência direta:**
  Dado picker aberto
  Quando digita `amor` (não casa livro) ou `Gn 1:1` via `:` 
  Então mostra até 10 resultados `Gn 1:1 — texto` com `LIKE %amor%` e `Enter` navega direto; histórico adiciona posição e `h` lista contém `Gn 1:1`

- **CA-004 — Histórico e atalhos:**
  Dado navegou `Gn 1 → Jo 3 → Sl 23`
  Quando pressiona `h` e seleciona `Gn 1` ou `Backspace`
  Então volta para posição anterior; `n`/`p` avançam capítulos; `Esc` volta níveis sem perder histórico; `?` mostra ajuda

## Qualidades e operação

- Segurança: sem dados sensíveis; histórico local sem PII.
- Privacidade: tudo em `DATA_DIR` local, sem envio externo.
- Desempenho e volume: filtro <50ms para 66 livros, busca <100ms, sem FTS, limite 10 resultados; sem paginação.
- Auditoria e observabilidade: log de navegação não necessário; erro de picker com mensagem retry.
- Acessibilidade: 100% teclado, foco visível cyan, `?` ajuda, `Esc` fecha sempre, sem mouse obrigatório.

## Dependências

- `apps/tui` existente com `BibleManager`/`InstalledStore`/`BOOK_META` e `sqlite.ts` adaptador (`better-sqlite3`/`bun:sqlite`)
- `@opentui/core`/`@opentui/react` 0.5.8 para modal, input, lista, grid
- `DATA_DIR` (`OPEN_BIBLE_DATA_DIR`/`XDG_DATA_HOME`/`.local/share/open-bible`) gravável

## Situações de erro

- Filtro sem match → `Nenhum livro encontrado para "xyz"` com sugestão limpar filtro, sem crash.
- Livro/capítulo/versículo inexistente → lista vazia ou `Capítulo 999 não existe` com volta.
- Busca sem resultado → `Nenhum resultado para "xyz"`.
- Falha ao ler `app.db`/`state.json` → inicia em `Gn 1`, histórico vazio, mensagem `Erro ao carregar histórico`.
- DB não encontrado → picker ainda abre (lista livros vazia), `d` download ainda funciona.

## Escopo

- Dentro: picker modal filtrável OT/NT, grid capítulos, lista versículos, entrada `Gn 1:1` via `:`, busca integrada `LIKE`, histórico 10 persistido, atalhos `Esc`/`Backspace`/`n`/`p`/`Tab`/`h`/`?`/`d`, estados loading/empty/error.
- Fora: download de versões (já entregue em 0004), edição de notas/destaques, FTS, paginação, sync, autenticação, mudança de driver sqlite.

## Dúvidas, decisões e riscos

- **Decidido via 8 perguntas (todas opção 1):** picker modal com busca (parity web), 2 etapas capítulos→versículos, histórico `Esc`/`h`/`n`/`p`, composição agrupada OT/NT, busca integrada, persistência `DATA_DIR/state.json`, estados com retry, performance <50ms/10 resultados.
- Risco: `OpenTUI` input focus e keybindings complexos → mitigar com isolador `d`/`:` e testes manuais + vitest hook de filtro.
- Risco: filtro com diacríticos → normalizar NFD ao comparar.
- Aberto: confirmar se `state.json` vs `app.db` para histórico (default `state.json` simples).

## Pronto para desenvolvimento

- [x] O problema e a pessoa beneficiada estão claros.
- [x] O evento inicial e o resultado esperado estão claros.
- [x] Permissões, regras e exceções relevantes estão claras.
- [x] O resultado pode ser verificado objetivamente.
- [x] Segurança, privacidade e desempenho foram avaliados conforme o risco.
- [x] Fora de escopo, dependências e decisões pendentes estão registrados.

## Próximo passo

Brief pronto para `$specsfy-03-specify` — promover para `specs/draft/0005-.../spec.md`.
