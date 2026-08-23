---
name: specsfy-setup
description: Preparar e monitorar os contextos do projeto, incluindo a constituição e as specs preservadas de projetos com GitHub Spec Kit.
---

# Preparar contexto do projeto

## Modo de interação

Modo de interação: `perguntas`.
Antes de formular qualquer pergunta, leia e aplique o
`Contrato de perguntas numeradas` de `.specsfy/Spec.md`.

1. Antes de ler ou escrever, confirme o diretório do projeto. Na primeira
   execução da conversa, se a pessoa já informou um caminho, resolva-o para um
   caminho absoluto e repita-o. Quando ela não informou, ofereça exatamente
   estas opções numeradas e aguarde a resposta: `1. Usar o diretório atual.`,
   `2. Usar um subdiretório do Hub.` e `3. Informar outro caminho.`. Não deduza
   o destino pela raiz Git. Nas execuções obrigatórias seguintes da mesma
   conversa, reutilize a raiz confirmada sem repetir a pergunta.
2. Use a raiz confirmada em cada comando posterior. Ao trabalhar em um Hub,
   execute no subdiretório escolhido ou passe `--project <raiz>` e
   `--root <raiz>` para scripts de contexto e specs. Não crie contexto, specs,
   testes ou código no diretório pai.
3. Ler `AGENTS.md`, `CLAUDE.md` e instruções locais da raiz confirmada antes de
   escrever. Em seguida, executar `node scripts/inspect_project.mjs --project
   <raiz>`. Ler as fontes listadas, na ordem retornada: instruções, manifests,
   configuração, aplicação, rotas, persistência, integrações, interface, testes
   e documentação. Não comece descoberta, sugestão de stack ou escrita até
   entender o sistema atual e registrar o que será preservado.
4. Ler [as diretrizes publicáveis](references/framework-instructions.md) quando
   precisar auditar o bloco reservado em arquivos de agentes.
   Quando `.specify/memory/constitution.md` existir, ler também
   [a compatibilidade com GitHub Spec Kit](references/github-spec-kit.md).
5. Executar `specsfy doctor --project <raiz>` e corrigir cada requisito
   ausente antes de preparar o contexto. O diagnóstico confere Node.js, Git,
   npm, acesso ao projeto e o `npx`.
6. Executar `node scripts/setup_context.mjs --project <raiz>`.
   Renderizar `PROJECT.md`, `STACK.md`, `RULES.md`, `DATABASE.md` e
   `INTERFACE.md` a partir de
   `.specsfy/templates/custom/<Nome>.md` quando existir ou dos arquivos
   gerenciados `.specsfy/templates/Project.md`, `Stack.md`, `Rules.md` e
   `Database.md` e `Interface.md` caso contrário; não manter modelos paralelos embutidos no
   script. O mesmo comando deve ler a constituição e todos os arquivos
   regulares em `specs/` quando detectar GitHub Spec Kit, depois atualizar o
   bloco gerenciado de `.specsfy/SPECKIT.md`.
7. No início e no fim de cada mudança, executar:

   ```bash
   node scripts/monitor_context.mjs --project <raiz> --check
   ```

8. Inspecionar os cinco arquivos iniciais, `.specsfy/PACKAGES.md` quando
   gerado e a fonte de stack usada pelo script. Quando `.specsfy/SPECKIT.md`
   existir, abrir a constituição e cada fonte original listada na projeção.
   Antes de qualquer descoberta de interface, executar também
   `node scripts/inspect_interface.mjs --project <raiz>` e abrir as rotas,
   componentes e telas atuais relacionados ao pedido. A saída orienta a
   análise, mas não substitui a leitura das fontes do sistema. A leitura geral
   do projeto inclui regras de autorização, papéis, dados, integrações, rotas,
   telas, componentes, estados, testes e documentos existentes que apareçam no
   relatório. Quando a base for grande, prossiga por grupos e informe quais
   fontes foram lidas antes de propor qualquer alteração; não trate a ausência
   de leitura como permissão para substituir convenções.
9. Nunca substituir um arquivo de contexto existente, mesmo com conteúdo
   incompleto. Em `AGENTS.md`, `CLAUDE.md` e `.specsfy/SPECKIT.md`, atualizar
   somente o bloco delimitado do framework e preservar tudo fora dele. Nunca
   escrever, mover, renomear ou remover arquivos em `.specify/` e `specs/`.
10. Depois de ler a stack, instale primeiro o núcleo essencial do Specsfy:
   `specsfy-specialist-data-modeling`,
   `specsfy-specialist-domain-modeling` e
   `specsfy-specialist-software-architecture`, `specsfy-specialist-shadcn-ui`
   e `specsfy-specialist-reui`.
   Em seguida, executar
   `specsfy skills detect --project <raiz>`. Apresente a tabela de
   correspondência abaixo com o núcleo e os especialistas detectados, avisando
   quais serão instalados. A pessoa já autorizou este comportamento ao iniciar
   o setup; instale o núcleo e cada especialista detectado no projeto
   consumidor, sem incluir outros especialistas genéricos, sempre por:

   ```bash
   npx skills add https://github.com/promovaweb/specsfy \
     --skill <especialista-detectado> --agent universal --copy -y --full-depth
   ```

   Depois da instalação, carregue os especialistas instalados que forem
   necessários à etapa atual. Se o comando falhar, informe o nome, a saída e a
   continuação possível; não substitua a instalação por cópia manual.
   Especialistas instalados manualmente continuam válidos: não os remova nem
   tente reinstalá-los sem necessidade.
11. Para completar ou corrigir stack, regras ou dados, anunciar o handoff e
   carregar respectivamente `$specsfy-aux-stack`, `$specsfy-aux-rules` ou
   `$specsfy-aux-database`.
12. Quando aplicação, persistência ou dependências mudar, carregar
   `$specsfy-documentator` depois das auxiliares e reconstruir `docs/` e
   `.specsfy/PACKAGES.md` a partir de todo o projeto.
13. Somente quando a pessoa solicitar ou indicar explicitamente o uso de
   Gitflow para o projeto (ver [references/gitflow.md](references/gitflow.md)),
   anunciar o handoff, carregar `$specsfy-specialist-gitflow` e registrar a
   convenção de branches confirmada em `RULES.md` via `$specsfy-aux-rules`.
   Nunca propor, presumir ou aplicar Gitflow a partir da estrutura de
   branches do repositório, da presença de uma branch `develop` ou de
   qualquer outro sinal implícito.

Não contornar um resultado `PENDING`. Atualizar o documento indicado e executar
o monitor novamente. Para mudança de aplicação sem impacto material na história
ou finalidade, registrar essa avaliação nas fontes da tarefa e repetir com
`--acknowledge-project-no-change`. Aplicar a mesma disciplina a regras com
`--acknowledge-rules-no-change`; nunca usar o reconhecimento para ocultar uma
mudança documental real.

Manter `PROJECT.md` e `INTERFACE.md` na raiz. Manter `STACK.md`, `RULES.md`, `DATABASE.md`,
`PACKAGES.md` e a projeção opcional `SPECKIT.md` em `.specsfy/`. Tratar esses
documentos como contexto derivado do projeto, não como spec, gate ou
autorização de implementação.

Em projeto com mais de um framework, registrar todas as fontes observadas;
não escolher silenciosamente um único stack. Se nenhum framework for
identificado, criar o modelo genérico e declarar que a confirmação está
pendente.

## Stack e especialistas instalados pelo setup

| Stack observada | Especialista instalado |
| --- | --- |
| Laravel | `specsfy-specialist-laravel` |
| Supabase | `specsfy-specialist-supabase` |
| PostgreSQL | `specsfy-specialist-postgres` |
| Redis | `specsfy-specialist-redis` |
| React | `specsfy-specialist-react` |
| Astro | `specsfy-specialist-astro` |
| Next.js | `specsfy-specialist-nextjs` |
| TypeScript | `specsfy-specialist-typescript` |
| Tailwind CSS | `specsfy-specialist-tailwind-css` |
| shadcn/ui | `specsfy-specialist-shadcn-ui` |
| Docker ou Compose | `specsfy-specialist-docker` |
| Docker Swarm | `specsfy-specialist-docker-swarm` |
| Ansible | `specsfy-specialist-ansible` |
| OpenAPI | `specsfy-specialist-web-api-design` |
| OpenTelemetry ou Prometheus | `specsfy-specialist-observability` |
| CI/CD | `specsfy-specialist-delivery-engineering` |

| Núcleo instalado em todo setup | Finalidade |
| --- | --- |
| `specsfy-specialist-data-modeling` | dados, entidades, relações e ciclo de vida |
| `specsfy-specialist-domain-modeling` | linguagem, regras e limites de domínio |
| `specsfy-specialist-software-architecture` | módulos, dependências e estrutura técnica |
| `specsfy-specialist-reui` | base ReUI para interfaces e CRUDs React/Tailwind |
| `specsfy-specialist-shadcn-ui` | primitives, tema e registry para o ReUI |

Para todo projeto Laravel com React, o setup instala shadcn/ui e ReUI juntos.
Não trate essa dupla como opcional: shadcn/ui prepara a base e ReUI cria CRUDs
e interfaces sobre ela.

Depois de instalar a dupla, o setup registra em `INTERFACE.md` que telas React
são compostas por componentes. Cada nova tela deve consultar o mapa, reutilizar
o que já existe e registrar componentes próprios, primitives shadcn/ui e
composições ReUI com arquivos e consumidores reais.
