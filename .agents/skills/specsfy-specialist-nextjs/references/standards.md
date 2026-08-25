# Padrões e referências Next.js

## Fronteiras Server/Client

- Toda página e layout no App Router é Server Component por padrão: pode ler
  banco, arquivo, segredo e não envia JS ao navegador por si só.
- `"use client"` marca a raiz de uma subárvore Client — coloque-o no
  componente folha mais específico possível (um botão interativo, um
  formulário), nunca em `layout.tsx` ou `page.tsx` inteiros.
- Um Server Component pode importar e renderizar um Client Component
  passando props serializáveis; o inverso (Client importando Server
  diretamente) não é permitido — passe o Server Component como `children`.
- Nenhum módulo que toque segredo, driver de banco ou SDK server-only pode
  ser importado, direta ou transitivamente, por um arquivo `"use client"`.

## Data fetching e cache

- Declare por rota/fonte de dado se ela é: estática (cacheada, gerada no
  build ou na primeira requisição), revalidada por tempo (`revalidate`),
  revalidada por tag (`revalidateTag` após mutation) ou dinâmica (sem cache,
  renderizada por requisição).
- Após qualquer mutation que afete um dado listado/exibido em outra rota,
  chame `revalidatePath` ou `revalidateTag` correspondente antes de
  considerar a mutation concluída — sem isso a UI serve cache obsoleto.
- Nunca escopar uma chave de cache global (ex.: `"user-profile"`) para um
  dado por-usuário; a chave precisa incluir o identificador do usuário/tenant
  ou o cache vaza dado entre sessões.
- Prefira colocar o fetch próximo do componente que consome o dado (paralelo,
  não em cascata); um componente pai não deve esperar seu próprio fetch
  terminar antes de disparar o fetch do filho quando os dois são
  independentes.

## Server Actions e Route Handlers

- Trate toda Server Action como uma rota HTTP pública: ela pode ser invocada
  diretamente por qualquer cliente que conheça seu endpoint gerado, não só
  pela UI que a declarou.
- Autentique, autorize por objeto (não só "usuário logado") e valide o
  payload no início de cada Server Action/Route Handler, antes de qualquer
  efeito colateral.
- Retorne erros estruturados e não vaze detalhe interno (stack trace, query
  SQL) no corpo da resposta ao cliente.

## Streaming e recuperação de erro

- Use `loading.js`/`<Suspense>` para segmentos que dependem de dado lento,
  permitindo que o resto da página renderize primeiro (streaming SSR).
- `error.js` captura erro do segmento e deve oferecer caminho de
  recuperação (retry, voltar); não deve derrubar a aplicação inteira.
- `not-found.js` cobre tanto rota inexistente quanto `notFound()` chamado
  explicitamente por um Server Component que não achou o recurso.

## Middleware e runtime

- Middleware roda antes da rota resolver e, tipicamente, no runtime Edge —
  APIs de Node completo podem não estar disponíveis; mantenha a lógica curta
  (redirect, header, cookie, feature flag) e mova regra de negócio pesada
  para o route handler.
- Runtime Edge e Node têm limites diferentes de tempo de execução e de APIs;
  confirme qual runtime a rota usa antes de assumir compatibilidade com uma
  biblioteca.

## Metadata e SEO

- Prefira a Metadata API (`generateMetadata`, `metadata` estático) a tags
  manuais no `<head>`; ela lida com merge entre layout e página e com
  Open Graph/Twitter automaticamente.
- Dado dinâmico usado em `generateMetadata` deve vir da mesma fonte
  cacheada/revalidada que o conteúdo da página, para não divergir dela.

## Checklist de produção

- Rodar build de produção e revisar o relatório de rotas (estático vs
  dinâmico) contra a intenção declarada no passo 4 do Fluxo.
- Validar variáveis de ambiente exigidas em runtime, imagens/fontes
  otimizadas e headers de segurança (CSP, HSTS) configurados no host.
- Confirmar que o adapter/host alvo suporta os recursos usados (streaming,
  Edge runtime, ISR) antes do deploy.

## Fontes oficiais

- App Router: https://nextjs.org/docs/app
- Server e Client Components: https://nextjs.org/docs/app/getting-started/server-and-client-components
- Data fetching: https://nextjs.org/docs/app/getting-started/fetching-data
- Cache Components: https://nextjs.org/docs/app/getting-started/cache-components
- Server Functions (`"use server"`): https://nextjs.org/docs/app/api-reference/directives/use-server
- Error handling: https://nextjs.org/docs/app/getting-started/error-handling
- Metadata API: https://nextjs.org/docs/app/api-reference/functions/generate-metadata
- Middleware: https://nextjs.org/docs/app/building-your-application/routing/middleware
- Authentication: https://nextjs.org/docs/app/guides/authentication
- Production checklist: https://nextjs.org/docs/app/guides/production-checklist

Leia a documentação correspondente à versão travada no lockfile do projeto;
cache e defaults mudam entre versões majors do Next.js.
