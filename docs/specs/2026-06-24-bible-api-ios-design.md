# Design: API Open Bible para iOS

**Data:** 2026-06-24
**Status:** Aprovado

---

## Objetivo

Fornecer endpoints de API otimizados para consumo por um app iOS nativo, com dados compactos e CORS habilitado. A API existente será estendida com parâmetros `?compact=true` para suportar mobile sem quebrar o app web.

---

## Decisões de Design

| Decisão | Escolha | Justificativa |
|---------|---------|---------------|
| Estratégia de download | Capítulo por capítulo | Menos dados iniciais, mais flexível |
| Autenticação | Nenhuma (API pública) | Conteúdo bíblico é público |
| Formato de dados | Compacto via query param | Retrocompatível com web |
| CORS | Aberto (`*`) | App iOS nativo precisa de acesso |
| Namespace | Extensão da API existente | Menos código, reutiliza infra |

---

## Schemas Compactos (Novos)

Adicionar em `lib/api/schemas.ts`:

```typescript
// Versão compacta (sem totalBooks)
CompactVersionSchema = z.object({
  id: z.string(),
  name: z.string(),
})

// Detalhe compacto (livros sem chapters)
CompactVersionDetailSchema = z.object({
  id: z.string(),
  name: z.string(),
  books: z.array(CompactBookSchema),
})

CompactBookSchema = z.object({
  id: z.string(),
  name: z.string(),
  abbreviation: z.string(),
  testament: z.enum(["old", "new"]),
})

// Resposta de capítulo compacta (sem bookName, totalVerses)
CompactChapterResponseSchema = z.object({
  version: z.string(),
  bookId: z.string(),
  chapter: z.number(),
  verses: z.array(VerseSchema),
})

// Resultado de busca compacto (sem totalResults, limit)
CompactSearchResultSchema = z.object({
  version: z.string(),
  query: z.string(),
  results: z.array(VerseSchema),
})
```

---

## Endpoints

### Endpoints Existentes (modificados com `?compact=true`)

#### `GET /api/bibles?compact=true`

**Response (compact):**
```json
[
  { "id": "acf", "name": "Almeida Corrigida e Fiel" },
  { "id": "nvi", "name": "Nova Versão Internacional" }
]
```

#### `GET /api/bibles/{version}?compact=true`

**Response (compact):**
```json
{
  "id": "acf",
  "name": "Almeida Corrigida e Fiel",
  "books": [
    { "id": "gen", "name": "Gênesis", "abbreviation": "Gn", "testament": "old" }
  ]
}
```

#### `GET /api/bibles/{version}/books/{bookId}/chapters/{chapter}?compact=true`

**Response (compact):**
```json
{
  "version": "acf",
  "bookId": "gen",
  "chapter": 1,
  "verses": [
    { "bookId": "gen", "chapter": 1, "verse": 1, "text": "No princípio criou Deus os céus e a terra." }
  ]
}
```

#### `GET /api/bibles/{version}/search?q=amor&limit=20&compact=true`

**Response (compact):**
```json
{
  "version": "acf",
  "query": "amor",
  "results": [
    { "bookId": "gen", "chapter": 1, "verse": 1, "text": "..." }
  ]
}
```

### Novo Endpoint

#### `GET /api/bibles/{version}/books`

Lista os livros de uma versão (sem metadata de chapters).

**Tags:** Versões
**Response:**
```json
{
  "version": "acf",
  "books": [
    { "id": "gen", "name": "Gênesis", "abbreviation": "Gn", "testament": "old", "chapters": 50 }
  ]
}
```

---

## CORS

Middleware CORS no `lib/api/hono-app.ts`:

```typescript
app.use("*", async (c, next) => {
  c.header("Access-Control-Allow-Origin", "*")
  c.header("Access-Control-Allow-Methods", "GET, OPTIONS")
  c.header("Access-Control-Allow-Headers", "Content-Type")
  if (c.req.method === "OPTIONS") {
    return c.text("", 204)
  }
  return next()
})
```

---

## Arquivos a Modificar

| Arquivo | Mudança |
|---------|---------|
| `lib/api/schemas.ts` | Adicionar 4 schemas compactos + tipos |
| `lib/api/hono-app.ts` | CORS middleware, query param `compact`, novo endpoint `/books` |
| `lib/api/bible-service.ts` | Funções `listVersionsCompact`, `getVersionDetailCompact`, `getChapterVersesCompact`, `searchVersesCompact`, `listBooksForVersion` |
| `lib/api-client.ts` | Adicionar parâmetro `compact` em funções fetch |
| `app/api/[[...route]]/route.ts` | Exportar handler OPTIONS para preflight CORS |

---

## Fluxo iOS (Exemplo)

```
1. GET /api/bibles?compact=true
   → Lista versões disponíveis

2. GET /api/bibles/nvi?compact=true
   → Obtém lista de livros

3. GET /api/bibles/nvi/books/jhn/chapters/3?compact=true
   → Obtém versículos do João 3

4. GET /api/bibles/nvi/search?q=amor&compact=true
   → Busca versículos
```

---

## Compatibilidade

- App web continua usando endpoints sem `?compact=true`
- Formato completo preservado para clientes existentes
- iOS usa `?compact=true` em todos os endpoints
- Nenhum breaking change

---

## Scalar Docs

- Tags reorganizadas: "Versões", "Texto Bíblico", "Mobile"
- Parâmetro `compact` documentado em todos os endpoints
- Exemplos de request/response para mobile
- Descrição atualizada mencionando suporte a iOS
