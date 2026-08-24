# Inbox: Arquitetura multiplataforma com monorepo

| Metadado | Valor |
| --- | --- |
| Status | Capturada |
| Capturada em | 2026-08-23T17:33:01Z |
| Slug | arquitetura-multiplataforma-com-monorepo |
| Origem | Input do usuário |
| Processamento | Análise inicial sem perguntas |
| Sessão de descoberta | Captura avulsa. |
| Turno da conversa | Não se aplica. |
| Integridade do original | SHA-256 `f6b65d7f8efd13b8cc335f9fd49e6fa63eb462c218659c821d784a76192b7739` |
| Backlog derivado | Nenhum |
| Spec derivada | Nenhuma |

## Texto original

eu quero organizar o projeto para que possamos ter variacoes do projeto por exemplo uma versao tui, ou nativa desktop. mas mantendo o projeto organizado. e mantendo a regra de negocio corretamente.\nsim vamos seguir isso, e vamos mudar de tauri para eletron acho qe vai dar menos erro, depois teremos a versao nativa, o tui temos o projeto opentui que será usado para construir

## Contexto consultado

Nenhuma fonte contextual consultada.

## Resumo processado

**Inferência:** Organizar o Open Bible como monorepo para suportar Web, desktop com Electron, TUI com OpenTUI e futura versão desktop com UI nativa, preservando uma única regra de negócio.

## Análise inicial

### Problema ou oportunidade

**Declaração ou inferência identificada:** A aplicação atual é um único projeto Next.js, com Tauri como shell desktop, e precisa suportar novas superfícies sem duplicar ou acoplar as regras de negócio.

### Pessoas afetadas ou beneficiadas

**Declaração ou inferência identificada:** Pessoas que usam o Open Bible pela Web, desktop e terminal; equipe mantenedora.

### Resultado ou valor esperado

**Declaração ou inferência identificada:** Permitir evolução independente de cada interface com comportamento de domínio consistente e armazenamento offline adequado a cada plataforma.

### Sinais de escopo, regras ou solução

**Sinais extraídos, não decisões:** Monorepo; substituir Tauri por Electron; criar TUI baseada em OpenTUI; manter posteriormente uma versão desktop de UI nativa; centralizar regras de negócio e contratos.

### Informações que talvez precisem ser guardadas

**Sinais para conversar depois, não confirmação:** Notas, destaques, versões bíblicas instaladas e configurações precisam manter semântica consistente entre plataformas; a estratégia de sincronização e armazenamento ainda não foi definida.

### Riscos e dependências

**Análise preliminar:** Migração do shell desktop; compatibilidade offline; distribuição de bancos SQLite; segurança do processo principal do Electron; limites de compartilhamento entre TypeScript e uma futura UI realmente nativa.

## Possíveis direções futuras

**Hipóteses para backlog ou spec, não requisitos:** Criar workspaces de aplicações e pacotes de domínio, contratos, casos de uso e adaptadores por plataforma; migrar a PWA primeiro; introduzir Electron e TUI incrementalmente.

## Pontos a revisar no futuro

**A revisar:** Definir quais capacidades entram na primeira entrega, como dados locais e sincronização funcionam entre plataformas, e se a futura versão nativa deve reutilizar o núcleo TypeScript via WASM ou adotar outro núcleo.

## Rastreabilidade

- Formulação original preservada integralmente nesta captura.
- Análises não substituem decisões do usuário.
- Backlogs e specs derivados devem referenciar este arquivo.

## Próximo passo

Manter em `specs/inbox/` ou refinar com `$specsfy-02-backlog`.
