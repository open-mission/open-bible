# Backlog: Pagina de highlights exibir highlights

| Metainformação | Valor |
| --- | --- |
| ID | BACKLOG-0006 |
| Status | Promoted |
| Produto | Open Bible |
| Épico | Estudo e marcações |
| Funcionalidade | Highlights |
| Tipo | história |
| Prioridade | Alta |
| Milestones | |
| Criado em | 2026-08-25 |
| Spec promovida | specs/draft/0006-pagina-de-highlights-exibir-highlights/spec.md |

## Ideia original

inplementar a feature da pagina de highlights exibir os highlights

## Problema percebido

Usuario nao possui pagina para visualizar, filtrar e gerenciar highlights salvos

## Pessoa afetada ou beneficiada

Leitor que usa destaques coloridos vinculados a versiculos

## Resultado ou valor esperado

Pagina dedicada que lista highlights com cor, categoria, versiculos e acoes de edicao/exclusao

## Contexto

Highlights ja persistem em app.db (highlights, highlight_verses, highlight_categories) via migrations 0002/0003; UI atual exibe apenas no leitor/gutter

## Referências relacionadas

- `specs/inbox/2026-08-25-003455-pagina-de-highlights-exibir-highlights.md` — captura original (duplicata consolidada)
- `apps/web/lib/database/user/schema.ts` — tabelas `highlights`, `highlight_verses`, `highlight_categories`
- `apps/web/lib/database/user/migrations/index.ts` — migrations 0002_highlights, 0003_highlight_content
- `apps/web/features/highlights/components/` — `highlight-sidebar.tsx`, `highlight-card.tsx`, `all-highlights-browser.tsx` (referência)
- `apps/web/lib/database/user/repositories/highlightsRepository.ts` — acesso atual

## Comportamento esperado

- Rota dedicada `/highlights` acessível via sidebar (`AppSidebar`/`MobileTabBar`) e `CommandPalette`; preserva `PanelLayout` e `ThemeProvider`.
- Lista em cards por highlight: cor, categoria, conteúdo opcional, lista de versículos (bible/book/chapter:verse) com texto resolvido via `BibleDatabase`, `createdAt/updatedAt`.
- Filtros: cor, categoria, livro, versão bíblica, intervalo de data + busca textual no `content` e versículo (LIKE COLLATE NOCASE).
- Ações por card: navegar ao versículo no leitor (`/ ?book=&chapter=`), editar cor/categoria/conteúdo (Dialog/Sheet), excluir com confirmação, copiar referência (`book capítulo:versículo`).
- Ordenação padrão por `updatedAt` desc (recentes primeiro); skeletons no loading, vazio com CTA "Crie seu primeiro destaque no leitor".

## Regras de negócio

- Highlight pertence a 1..N versículos (`highlight_verses`); exclusão do highlight cascadeia versículos.
- Categoria é global, criada on-demand via autocomplete (`highlightCategoriesRepository`); `category_id` SET NULL ao excluir categoria.
- `highlights` pode vincular `note_id` opcional; não cria nota automaticamente.
- Operação é local-first (app.db OPFS); sem sync; filtros são client-side.

## Critérios de aceitação

- Dado highlights existentes Quando acesso `/highlights` Então vejo cards com cor/categoria/versículos ordenados por recência.
- Dado filtros por cor/categoria/livro/bíblia/data Quando aplico Então lista reflete interseção e busca textual funciona.
- Dado um card Quando clico no versículo Então navego ao leitor no livro/capítulo/versículo correto.
- Dado um card Quando edito cor/categoria/conteúdo e salvo Então `highlights` e `highlight_categories` atualizam e card reflete.
- Dado um card Quando excluo com confirmação Então `highlights` e `highlight_verses` são removidos.
- Dado um card Quando copio referência Então texto `Livro capítulo:versículo(s) - conteúdo` vai ao clipboard.

## Qualidades e operação

- Segurança: sem auth para dados locais; respeitar `Better Auth` apenas se sync futuro.
- Privacidade: dados permanecem em `app.db` OPFS, não enviados ao servidor.
- Desempenho e volume: listar <5k highlights sem paginação virtualizada; filtros em memória; `idx_highlight_verses_lookup` usado para resolução.
- Auditoria e observabilidade: não aplicável nesta fatia.

## Dependências

- Drizzle schema e migrations 0002/0003 aplicados; `DatabaseManager` + OPFS worker.
- `BibleDatabase` para resolver texto de versículos filtrados.

## Situações de erro

- OPFS indisponível → `OpfsStatusGate` bloqueia página com orientação.
- Nenhum highlight → estado vazio com CTA.
- `BibleDatabase` sem versão instalada → mostra referência sem texto + aviso.

## Escopo

- Dentro: rota `/highlights`, listagem cards, filtros cor/categoria/livro/bíblia/data+busca, ordenação recência, navegação, edição/exclusão/cópia, estados loading/vazio/erro.
- Fora: criação de highlight (fica no leitor/verse popover), FTS, paginação server, sync, export, agrupamento por livro na V1, edição de versículos do highlight.

## Dúvidas, decisões e riscos

- Decisão: rota dedicada `/highlights` confirmada (Pergunta 1).
- Decisão: cards por highlight com versículos (Pergunta 1).
- Decisão: filtros completos cor/categoria/livro/bíblia/data + busca (Pergunta 1).
- Decisão: ações navegar/editar/excluir/copiar (Pergunta 1).
- Decisão: ordenação recência + vazio com CTA (Pergunta 1).
- Risco: volume grande exige virtualização futura; não bloquear V1.

## Pronto para desenvolvimento

- [x] O problema e a pessoa beneficiada estão claros.
- [x] O evento inicial e o resultado esperado estão claros.
- [x] Permissões, regras e exceções relevantes estão claras.
- [x] O resultado pode ser verificado objetivamente.
- [x] Segurança, privacidade e desempenho foram avaliados conforme o risco.
- [x] Fora de escopo, dependências e decisões pendentes estão registrados.

## Próximo passo

Promover para `$specsfy-03-specify` — brief pronto.
