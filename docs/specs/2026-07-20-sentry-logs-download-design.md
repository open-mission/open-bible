# Design Spec: Configuração e Instrumentação de Logs do Sentry no Download de Bíblias

## Current Problem
O Sentry (`@sentry/nextjs`) está adicionado ao projeto, mas:
1. Está habilitado exclusivamente em ambientes de produção (`enabled: process.env.NODE_ENV === "production"`), o que dificulta testes locais da integração.
2. Não há telemetria activa para rastrear o fluxo crítico de download e instalação local de Bíblias. Se um usuário enfrentar problemas ao baixar ou instalar uma versão da Bíblia (seja por falha de rede no proxy ou erro ao gravar no SQLite WASM local/OPFS), não teremos logs de breadcrumbs ou erros detalhados no Sentry.

## Proposed Solution
Deseja-se instrumentar o Sentry para rastrear as etapas do ciclo de vida de download de Bíblias, tanto no lado do servidor (Hono API Proxy) quanto no lado do cliente (Web Worker / Contexto React).

### 1. Ajuste de Habilitação do Sentry em Desenvolvimento
Permitir que o Sentry seja habilitado em modo de desenvolvimento se as credenciais estiverem explícitas nas variáveis de ambiente.
Arquivos de configuração do Sentry:
- `sentry.client.config.ts`
- `sentry.server.config.ts`
- `sentry.edge.config.ts`

Serão alterados de:
`enabled: process.env.NODE_ENV === "production"`
Para:
`enabled: process.env.NODE_ENV === "production" || !!(process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN)`

### 2. Instrumentação no Server-side (API Proxy de Download)
No endpoint `app.get("/api/bibles/download/:version", ...)` em [hono-app.ts](file:///Users/claudio/Projects/open-bible/lib/api/hono-app.ts):
- Adicionar breadcrumb no Sentry ao iniciar a requisição de download de uma versão.
- Enviar mensagem informativa com `Sentry.captureMessage` quando o download do upstream (Turso/R2) e a compressão gzip forem concluídos com sucesso.
- Capturar exceções com `Sentry.captureException` em caso de erro (com tags e contexto adicionais como a versão).

### 3. Instrumentação no Client-side (Instalação e Download Local)
No método `installVersion` em [bible-version-context.tsx](file:///Users/claudio/Projects/open-bible/features/bible-reader/context/bible-version-context.tsx):
- Adicionar breadcrumbs ao Sentry relatando o início da operação, recepção de cabeçalhos de download, progresso, e o buffer do banco de dados gerado.
- Adicionar `Sentry.captureMessage` de sucesso ao concluir `database.installBible` e o refresh local.
- Adicionar `Sentry.captureException` no bloco `catch` para reportar erros ocorridos na rede, leitura de stream ou gravação no banco de dados local via worker OPFS.

## Verification
- Rodar o linter (`pnpm lint`) e build (`pnpm build`) para garantir a conformidade dos tipos e imports.
- Testar a gravação de logs localmente simulando DSN no `.env.local` e baixando uma versão de Bíblia.
