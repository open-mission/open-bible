# Backlog: TUI OpenTUI leitor e download de versões com sqlite nativo

| Metainformação | Valor |
| --- | --- |
| ID | BACKLOG-0004 |
| Status | Captured |
| Produto | A esclarecer |
| Épico | A esclarecer |
| Funcionalidade | A esclarecer |
| Tipo | A esclarecer |
| Prioridade | Não priorizado |
| Milestones | |
| Criado em | 2026-08-25 |
| Spec promovida | Nenhuma |

## Ideia original

criando um nova worktree e usando virtual node_modules do pnpm vamos começar o tui criando apps/tui vamos começar com o leitor e download das versoes, iremos usar o sqlite nativo driver para isso. iremos usar o opentui

## Problema percebido

Falta de interface terminal nativa para leitura bíblica offline e gestão de versões; apps/web depende de WASM/OPFS mas TUI precisa de sqlite nativo em filesystem local

## Pessoa afetada ou beneficiada

Usuário CLI que prefere terminal; desenvolvedor que testa offline; mantenedor do Open Bible

## Resultado ou valor esperado

apps/tui funcional com OpenTUI, leitor (navegação livro/capítulo/versículo) e download/instalação de versões bíblicas via better-sqlite3, rodando em worktree isolada com pnpm virtual node_modules

## Contexto

Monorepo pnpm workspaces apps/*; TUI em apps/tui isolado; reutiliza dados de bíblias SQLite (schema: bible_books, verses) e API /api/bibles/download/{version}; storage local em disco (XDG/data ou .open-bible)

## Referências relacionadas

- Nenhuma referência relevante encontrada.

## Comportamento esperado

A esclarecer.

## Regras de negócio

- A esclarecer conforme risco e complexidade.

## Critérios de aceitação

- A esclarecer antes de considerar o item refinado.

## Qualidades e operação

- Segurança: a avaliar.
- Privacidade: a avaliar.
- Desempenho e volume: a avaliar.
- Auditoria e observabilidade: a avaliar.

## Dependências

- Nenhuma registrada.

## Situações de erro

- A esclarecer.

## Escopo

- Dentro: a esclarecer.
- Fora: a esclarecer.

## Dúvidas, decisões e riscos

- Nenhum registrado.

## Pronto para desenvolvimento

- [ ] O problema e a pessoa beneficiada estão claros.
- [ ] O evento inicial e o resultado esperado estão claros.
- [ ] Permissões, regras e exceções relevantes estão claras.
- [ ] O resultado pode ser verificado objetivamente.
- [ ] Segurança, privacidade e desempenho foram avaliados conforme o risco.
- [ ] Fora de escopo, dependências e decisões pendentes estão registrados.

## Próximo passo

Aprofundar nesta etapa até o item ficar pronto para `$specsfy-03-specify`.
