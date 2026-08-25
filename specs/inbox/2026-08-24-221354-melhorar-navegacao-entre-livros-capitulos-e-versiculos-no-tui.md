# Inbox: Melhorar navegação entre livros, capítulos e versículos no TUI

| Metadado | Valor |
| --- | --- |
| Status | Capturada |
| Capturada em | 2026-08-25T01:13:54Z |
| Slug | melhorar-navegacao-entre-livros-capitulos-e-versiculos-no-tui |
| Origem | Input do usuário |
| Processamento | Análise inicial sem perguntas |
| Sessão de descoberta | Captura avulsa. |
| Turno da conversa | Não se aplica. |
| Integridade do original | SHA-256 `da3a49a01476bdcc33a81f515c0b7d84d65f5dc7216471c2f71d8e34d424810d` |
| Backlog derivado | Nenhum |
| Spec derivada | Nenhuma |

## Texto original

melhorar a experiencia de navegacao entre livros, capitulos e versiculos para o tui

## Contexto consultado

Nenhuma fonte contextual consultada.

## Resumo processado

**Inferência:** Melhorar UX de navegação no TUI para transitar entre livros, capítulos e versículos de forma fluida, com parity à web

## Análise inicial

### Problema ou oportunidade

**Declaração ou inferência identificada:** Navegação atual no TUI é básica (Tab entre painéis e listas), sem picker fluido, busca rápida, histórico ou atalhos como na versão web

### Pessoas afetadas ou beneficiadas

**Declaração ou inferência identificada:** Usuários do TUI que leem e navegam frequentemente entre livros e capítulos

### Resultado ou valor esperado

**Declaração ou inferência identificada:** Navegação mais rápida e intuitiva, reduzindo fricção para trocar livro, capítulo e versículo no terminal

### Sinais de escopo, regras ou solução

**Sinais extraídos, não decisões:** TUI OpenTUI, livros, capítulos, versículos, navegação, picker, atalhos de teclado, parity com web, filtros, referência bíblica

### Informações que talvez precisem ser guardadas

**Sinais para conversar depois, não confirmação:** Última posição de leitura (livro, capítulo, versículo), histórico de navegação, possíveis favoritos ou recentes

### Riscos e dependências

**Análise preliminar:** Complexidade de keybindings no OpenTUI, manter consistência com web, performance ao listar 66 livros, definir atalhos sem conflito

## Possíveis direções futuras

**Hipóteses para backlog ou spec, não requisitos:** Backlog: refinar navegação TUI com picker e atalhos; Spec: picker de livros com busca/filtro, grid de capítulos aprimorado, entrada direta de referência (ex: Gn 1:1), histórico de navegação

## Pontos a revisar no futuro

**A revisar:** Quais pickers e atalhos são prioritários; se deve espelhar exatamente a web (command-palette, dock) ou otimizar para terminal; necessidade de busca por nome/abreviação de livro

## Rastreabilidade

- Formulação original preservada integralmente nesta captura.
- Análises não substituem decisões do usuário.
- Backlogs e specs derivados devem referenciar este arquivo.

## Próximo passo

Manter em `specs/inbox/` ou refinar com `$specsfy-02-backlog`.
