# Inbox: TUI OpenTUI leitor e download de versões com sqlite nativo

| Metadado | Valor |
| --- | --- |
| Status | Capturada |
| Capturada em | 2026-08-25T00:28:55Z |
| Slug | tui-opentui-leitor-e-download-de-versoes-com-sqlite-nativo |
| Origem | Input do usuário |
| Processamento | Análise inicial sem perguntas |
| Sessão de descoberta | Captura avulsa. |
| Turno da conversa | Não se aplica. |
| Integridade do original | SHA-256 `de7a2232a25b44627fa576eacc16a5de2c44a6e2107b95fb18cecc1d4202ee9b` |
| Backlog derivado | Nenhum |
| Spec derivada | Nenhuma |

## Texto original

criando um nova worktree e usando virtual node_modules do pnpm vamos começar o tui criando apps/tui vamos começar com o leitor e download das versoes, iremos usar o sqlite nativo driver para isso. iremos usar o opentui

## Contexto consultado

Nenhuma fonte contextual consultada.

## Resumo processado

**Inferência:** Criar apps/tui com OpenTUI, iniciar com leitor bíblico e download de versões, usando driver sqlite nativo e worktree isolada com pnpm virtual node_modules

## Análise inicial

### Problema ou oportunidade

**Declaração ou inferência identificada:** Necessidade de app TUI nativo para leitura bíblica offline e gerenciamento de versões

### Pessoas afetadas ou beneficiadas

**Declaração ou inferência identificada:** Usuários CLI / desktop que preferem terminal; desenvolvedores do Open Bible

### Resultado ou valor esperado

**Declaração ou inferência identificada:** Leitor no terminal com navegação de livros/capítulos/versículos e download/instalação de versões bíblicas via sqlite nativo

### Sinais de escopo, regras ou solução

**Sinais extraídos, não decisões:** apps/tui, OpenTUI, leitor, download de versões, sqlite nativo driver (better-sqlite3), worktree isolada, pnpm virtual node_modules

### Informações que talvez precisem ser guardadas

**Sinais para conversar depois, não confirmação:** Versões bíblicas instaladas, metadados de livros/capítulos/versículos, cache local de SQLite em disco; reutilizar schema de bíblias e installed_bibles

### Riscos e dependências

**Análise preliminar:** Compatibilidade OpenTUI + Node 22 + better-sqlite3 nativo; compartilhamento de DBs com apps/web; download de SQLite via API; pnpm workspace com apps/tui

## Possíveis direções futuras

**Hipóteses para backlog ou spec, não requisitos:** Backlog: TUI leitor + download versões; Spec: apps/tui com OpenTUI, sqlite via better-sqlite3, comandos de navegação e instalação de versões

## Pontos a revisar no futuro

**A revisar:** Definir lista exata de versões suportadas; confirmar URL fonte download (Turso/R2); decidir path de storage do TUI; confirmar parity de schema SQLite; avaliar se TUI compartilha código de packages/*

## Rastreabilidade

- Formulação original preservada integralmente nesta captura.
- Análises não substituem decisões do usuário.
- Backlogs e specs derivados devem referenciar este arquivo.

## Próximo passo

Manter em `specs/inbox/` ou refinar com `$specsfy-02-backlog`.
