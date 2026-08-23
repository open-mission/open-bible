# Interface do projeto

Este arquivo é a fonte canônica para construir e reaproveitar a interface.
Atualize-o antes e depois de cada tarefa que criar ou mudar uma tela React.

## Base observada

- Stack: Next.js
- Política: toda interface React é composta por componentes React.
- Primitives: shadcn/ui.
- Composições gratuitas: ReUI.

Para Next.js, explicite App Router, Server Components, Client Components e fronteiras entre servidor e navegador.

## Design system

| Item | Localização ou valor | Uso no projeto |
| --- | --- | --- |
| Tokens e tema | A mapear | Cores, tipografia, espaçamento, raio e tema |
| Configuração shadcn/ui | A mapear | `components.json`, aliases e registry |
| Registry ReUI | A mapear | Itens gratuitos `@reui/c-*` |
| Primitives compartilhadas | A mapear | Componentes em `ui/` ou diretório equivalente |
| Composições de domínio | A mapear | Componentes em `features/` ou diretório equivalente |

## Blocos criados e reaproveitáveis

Registre todos os blocos criados no projeto, inclusive os internos de uma
feature. Um bloco é um componente React com responsabilidade própria, como
grade, formulário, filtro, cabeçalho, cartão, diálogo, painel lateral, estado
vazio, upload ou ação em lote.

| Bloco | Tipo | Arquivo | Origem | Finalidade e API pública | Estados e acessibilidade | Consumidores | Reaproveitar ou estender |
| --- | --- | --- | --- | --- | --- | --- | --- |
| A mapear | Primitive, composição ou domínio | A mapear | shadcn/ui, ReUI ou próprio | Props, eventos e dados esperados | Foco, teclado, loading, vazio, erro e sucesso | Telas e outros blocos | Quando usar; qual bloco estender antes de criar outro |

## Telas e composição

| Tela ou rota | Arquivo | Componentes React usados | Dados e ações | Estados |
| --- | --- | --- | --- | --- |
| A mapear | A mapear | A mapear | A mapear | Carregando, vazio, erro e sucesso |

## Regras de composição

1. Páginas e rotas coordenam dados e compõem componentes; não concentram a
   grade, formulário, filtros, overlays ou cartões reutilizáveis.
2. Antes de criar um componente, consulte esta tabela e reaproveite o item
   existente quando ele atender à mesma intenção.
3. Todo item instalado de shadcn/ui ou ReUI entra na tabela com seu arquivo,
   origem, explicação, API, estados e consumidores reais.
4. ReUI usa somente itens gratuitos `@reui/c-*`; use shadcn/ui para
   primitives e ReUI para composições de produto.
5. Ao criar um bloco, registre-o nesta tabela na mesma tarefa. Ao alterar ou
   remover um bloco, atualize seus consumidores e a orientação de reuso.
