# Backlog: Funcionalidade de notas com editor Notion com blocos e referencias biblicas

| Metainformação | Valor |
| --- | --- |
| ID | BACKLOG-0007 |
| Status | Captured |
| Produto | Open Bible |
| Épico | Estudo e anotações |
| Funcionalidade | Notas |
| Tipo | história |
| Prioridade | Alta |
| Milestones | |
| Criado em | 2026-08-25 |
| Spec promovida | Nenhuma |

## Ideia original

implementar a funcionalidade de notas a ideia é usar um editor estilo notion com blocks ou markdown imagino algo como obsidian mais com blocos estilo do notion aonde podemos add por exemplo teferencias biblicas.

## Problema percebido

Editor de notas atual nao oferece blocos estruturados, Markdown rico nem bloco dedicado para inserir referencias biblicas navegaveis

## Pessoa afetada ou beneficiada

Estudante biblico que cria notas vinculadas a versiculos e precisa de edicao rica

## Resultado ou valor esperado

Editor estilo Notion/Obsidian com blocos (paragrafo, lista, heading, quote, code, referencia biblica) e Markdown, persistindo em app.db

## Contexto

Notas ja em app.db (notes, note_references) com Tiptap StarterKit; highlight extension ja disponivel; precisa estender schema/editor para blocos e bloco custom de referencia

## Referências relacionadas

- `specs/inbox/2026-08-25-003743-funcionalidade-de-notas-com-editor-notion-com-blocos-e-referencias-biblicas.md` + `2026-08-25-003634-*` — capturas (consolidadas, duplicata resolvida)
- `apps/web/features/notes/components/note-editor.tsx`, `note-detail.tsx`, `notes-browser.tsx` — editor atual
- `apps/web/lib/database/user/schema.ts` — `notes` (content:text), `note_references`
- `package.json` — `@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-highlight`, `@tiptap/pm`

## Comportamento esperado

- Rota `/notes` com lista à esquerda e editor à direita; mantém `NotesContext` e OPFS; editor ocupa canvas em branco estilo Notion — sem borda de formulário/WYSIWYG, começa a escrever direto (placeholder "Escreva / para comandos").
- Editor Tiptap JSON blocks primário (StarterKit + highlight extension + bloco custom `bibleReference`); Markdown como export secundário; UI minimalista sem chrome, foco no conteúdo.
- Blocos V1: parágrafo, heading, bullet/ordered list, blockquote, code block, horizontal rule, e bloco `bibleReference` (picker inline `/biblia` → versão/livro/cap/vers com preview do texto via `BibleDatabase` e link navegável ao leitor).
- Conteúdo persiste em `notes.content` como JSON stringificado (Tiptap JSON); `note_references` continua para vínculos formais (opcional, extraído de blocos bibleReference ao salvar).
- Slash menu (`/`) e bubble menu contextual para inserir blocos; sem toolbar fixa pesada; autocomplete de referências.

## Regras de negócio

- Nota é local-first em `app.db`; sem sync; `deletedAt` soft-delete preservado.
- Bloco `bibleReference` referencia `bible/book/chapter/verseStart/verseEnd`; preview resolve `text` via Bíblia instalada; sem Bíblia, mostra referência sem texto.
- `note_references` mantém ordem (`order`) e é reconstruído a partir dos blocos ao salvar (fonte da verdade = JSON).
- Highlight de texto dentro do editor usa `Tiptap highlight extension` sem criar `highlights` (separado).

## Critérios de aceitação

- Dado `/notes` Quando crio nota Então editor abre com blocos V1 e slash menu funciona.
- Dado editor com conteúdo Quando insiro `/biblia` e seleciono Jo 3:16 ARA Então bloco mostra preview "Porque Deus amou..." e link navega ao leitor.
- Dado nota com blocos Quando salvo Então `notes.content` JSON persiste e `note_references` reflete blocos bibleReference.
- Dado nota existente Quando recarrego Então JSON renderiza idêntico, incluindo referências.
- Dado export Markdown Quando solicito Então JSON converte para Markdown com `[Jo 3:16](bible://ara/jhn/3/16)`.

## Qualidades e operação

- Segurança: sem XSS (Tiptap sanitiza); dados locais.
- Privacidade: permanece em OPFS; sem envio servidor.
- Desempenho e volume: editor suporta notas <50KB JSON sem lag; debounce save 500ms.
- Auditoria: não aplicável.

## Dependências

- Tiptap já instalado; criar extensão custom `bibleReference`.
- `BibleDatabase` + `installed_bibles` para preview; fallback sem texto.

## Situações de erro

- OPFS indisponível → gate bloqueia `/notes`.
- Bíblia do bloco não instalada → bloco mostra referência + aviso "instale ARA".
- JSON corrompido → fallback para conteúdo vazio com aviso e recuperação.

## Escopo

- Dentro: rota `/notes` lista+editor, JSON Tiptap primário, blocos V1 + bibleReference picker com preview/link, persistência `notes`+`note_references`, debounce save, Markdown export.
- Fora: colaboração realtime, imagens/tabelas, embed expansível de texto completo, sync nuvem, FTS em notas, migração de notas antigas Markdown→JSON automática (manual se necessário).

## Dúvidas, decisões e riscos

- Decisão: JSON Tiptap primário confirmado (recomendação aceita).
- Decisão: blocos essenciais + referência bíblica (V1).
- Decisão: picker inline com preview.
- Decisão: rota `/notes` com lista+editor.
- Decisão: experiência Notion — canvas em branco sem borda de formulário/WYSIWYG, escrita imediata com placeholder e slash menu (req. usuário 2026-08-25).
- Risco: extensão custom requer testes de serialização; mitigar com TDD.

## Pronto para desenvolvimento

- [x] O problema e a pessoa beneficiada estão claros.
- [x] O evento inicial e o resultado esperado estão claros.
- [x] Permissões, regras e exceções relevantes estão claras.
- [x] O resultado pode ser verificado objetivamente.
- [x] Segurança, privacidade e desempenho foram avaliados conforme o risco.
- [x] Fora de escopo, dependências e decisões pendentes estão registrados.

## Próximo passo

Promover para `$specsfy-03-specify` — brief pronto.
