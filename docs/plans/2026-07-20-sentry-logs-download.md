# Implementation Plan: Configuração e Instrumentação de Logs do Sentry no Download de Bíblias

Adicionar logs de rastreamento do Sentry no fluxo de download e instalação de Bíblias, habilitando a execução local se as credenciais do Sentry estiverem definidas.

## Proposed Changes

### Sentry Configuration

#### [MODIFY] [sentry.client.config.ts](file:///Users/claudio/Projects/open-bible/sentry.client.config.ts)
- Alterar a propriedade `enabled` para:
  `enabled: process.env.NODE_ENV === "production" || !!process.env.NEXT_PUBLIC_SENTRY_DSN`

#### [MODIFY] [sentry.server.config.ts](file:///Users/claudio/Projects/open-bible/sentry.server.config.ts)
- Alterar a propriedade `enabled` para:
  `enabled: process.env.NODE_ENV === "production" || !!(process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN)`

#### [MODIFY] [sentry.edge.config.ts](file:///Users/claudio/Projects/open-bible/sentry.edge.config.ts)
- Alterar a propriedade `enabled` para:
  `enabled: process.env.NODE_ENV === "production" || !!(process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN)`

### Backend API Proxy

#### [MODIFY] [hono-app.ts](file:///Users/claudio/Projects/open-bible/lib/api/hono-app.ts)
- Importar `* as Sentry` de `@sentry/nextjs`.
- Rastrear a rota `/api/bibles/download/:version`:
  - Registrar breadcrumb ao receber requisição:
    ```typescript
    Sentry.addBreadcrumb({
      category: "bible-download",
      message: `Iniciando proxy de download no servidor para versão: ${version}`,
      level: "info",
    });
    ```
  - Registrar mensagem de sucesso após compilar gzip:
    ```typescript
    Sentry.captureMessage(
      `Download e compressão da bíblia ${version} concluídos no servidor. Tamanho comprimido: ${compressed.length} bytes`,
      "info"
    );
    ```
  - Capturar erro no bloco catch:
    ```typescript
    Sentry.captureException(e, {
      tags: { version, context: "server_proxy_download" },
    });
    ```

### Frontend Client-side

#### [MODIFY] [bible-version-context.tsx](file:///Users/claudio/Projects/open-bible/features/bible-reader/context/bible-version-context.tsx)
- Importar `* as Sentry` de `@sentry/nextjs`.
- Rastrear a função `installVersion`:
  - Registrar breadcrumb ao iniciar o processo:
    ```typescript
    Sentry.addBreadcrumb({
      category: "bible-install",
      message: `Iniciando download e instalação da bíblia no cliente: ${id}`,
      level: "info",
    });
    ```
  - Registrar breadcrumb ao receber os cabeçalhos de resposta:
    ```typescript
    Sentry.addBreadcrumb({
      category: "bible-install",
      message: `Resposta de download recebida para ${id}. Tamanho total: ${totalBytes} bytes. Encoding: ${contentEncoding}`,
      level: "info",
    });
    ```
  - Registrar mensagem de sucesso ao final do fluxo (depois de `refreshInstalled()`):
    ```typescript
    Sentry.captureMessage(
      `Bíblia ${id} baixada e instalada com sucesso no cliente. Bytes totais: ${receivedBytes}`,
      "info"
    );
    ```
  - Capturar erro no bloco catch:
    ```typescript
    Sentry.captureException(err, {
      tags: { action: "client_install_bible", bible_id: id },
    });
    ```

## Verification Plan

### Automated Tests
- Executar `pnpm lint` e `pnpm build` para verificar conformidade estática e tipos.

### Manual Verification
- Inserir uma DSN de teste no `.env.local` e testar no navegador o download de uma versão de Bíblia na aba de versões.
- Monitorar a console local para checar a mensagem de inicialização e comunicação do Sentry.
