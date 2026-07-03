# Seleção de Versículos com Popover de Copiar — Design

- **Data:** 2026-07-02
- **Issue:** #75
- **Branch:** `feat/75-verse-selection-copy` (a partir de `develop`)

## Objetivo

Permitir que o usuário selecione um ou mais versículos no leitor da Bíblia e, ao
selecionar, abra um popover (menu flutuante) com as opções de **copiar a referência**
ou **copiar o texto** dos versículos selecionados.

## UX

### Interação
- **Toque/clique** num versículo → seleciona (destaque visual) e **abre o popover
  imediatamente**, ancorado abaixo do primeiro versículo selecionado.
- **Clicar em outro versículo** → adiciona à seleção; o popover permanece aberto e a
  referência exibida atualiza ao vivo.
- **Clicar num versículo já selecionado** → remove da seleção; se a seleção esvaziar, o
  popover fecha.
- **Clicar fora** (espaço em branco do leitor) ou **Esc** → limpa toda a seleção e fecha
  o popover.
- Trocar de capítulo remonta o `Reader` (`key={book-chapter}`) e reseta a seleção
  naturalmente.

### Conteúdo do popover
- Linha de cabeçalho com a **referência formatada ao vivo** + contador:
  `João 3:16-18 (ARA) · 3 versículos`.
- Botão **"Copiar referência"** → copia só a referência.
- Botão **"Copiar texto"** → copia a referência + os versículos.
- Feedback: o botão clicado mostra **"Copiado!"** por ~2s e um **toast** de confirmação
  é exibido (reaproveitando `useToast` de `features/layout/hooks/use-toast.tsx`).

### Formato do conteúdo copiado
- **Referência**: `{abreviação do livro} {capítulo}:{versículos} ({versão})`.
  - Ex.: `João 3:16 (ARA)`.
  - Versículos contíguos viram intervalo: `João 3:16-18 (ARA)`.
  - Avulsos viram vírgulas: `João 3:16, 18, 20 (ARA)`.
  - Mistos (intervalo + avulso): `João 3:16-18, 20 (ARA)`.
- **Texto**: a referência na primeira linha + os versículos **numerados em uma só
  linha**, separados por espaço:
  ```
  João 3:16-18 (ARA)
  16 Porque Deus amou o mundo... 17 Para que todo aquele que nele crê... 18 ...
  ```

## Arquitetura e estado

### Estado (no `Reader`)
- Fonte de verdade da seleção: `selectedVerseIds: Set<string>` (estado já existente).
  O `multiSelectMode` hardcoded `false` é removido; o set é usado diretamente.
- **`open`** do popover = `selectedVerseIds.size > 0` (controlado, deriva do estado de
  seleção — evita race conditions entre fechar e limpar).
- **Âncora do popover** = primeiro versículo selecionado em ordem de versículo
  (`Math.min(...)`). A âncora é estável enquanto se adicionam versículos posteriores.

### Fechamento robusto (click-away / Esc)
- Listener manual de `pointerdown` no `document`: limpa a seleção **somente** quando o
  clique ocorre **fora** de `[data-verse-row]` e fora de `[data-slot="popover-content"]`.
- Listener de `keydown` trata `Escape` → limpa seleção e fecha.
- Ambos os listeners são registrados apenas enquanto há seleção ativa
  (`open === true`) e removidos no cleanup.

### Fluxo de dados
```
VerseRow.onClick(verseId)
  → Reader.handleVerseClick(verseId)   // toggle no selectedVerseIds
  → open = selectedVerseIds.size > 0
  → Popover re-renderiza com VerseSelectionPopover
       props: { book, chapter, selectedVerses: Verse[], versionAbbr: string }
  → botões chamam formatVerseReference() / formatVerseText()
  → navigator.clipboard.writeText(texto)   // fallback execCommand p/ contextos inseguros
  → toast de confirmação
```

## Arquivos

| Arquivo | Ação | Responsabilidade |
|---|---|---|
| `features/bible-reader/utils/verse-reference.ts` | **Novo** | `formatVerseReference()` e `formatVerseText()` — agrupamento contíguo/avulso de números de versículo + inclusão da versão. |
| `features/bible-reader/components/verse-selection-popover.tsx` | **Novo** | Conteúdo do popover: referência ao vivo + contador + 2 botões (copiar ref / copiar texto) + estado "Copiado!" + toast. |
| `features/bible-reader/components/verse-row.tsx` | **Modificar** | `forwardRef` + espalhar props do host + atributo `data-verse-row` (necessário para âncora do popover e detecção de click-away). |
| `features/bible-reader/components/reader.tsx` | **Modificar** | Gerenciar seleção (`selectedVerseIds`), click-away/Esc, renderizar `Popover` envolvendo o versículo âncora. |

## Casos de borda

- **Clipboard API ausente** (contexto não-secure / Tauri webview): fallback via
  `document.execCommand('copy')` com textarea oculta temporária.
- **Nenhuma versão instalada**: a versão exibida usa `versionId.toUpperCase()` (já é o
  padrão do app — `BookChapterDialog` e `BibleVersionSelector` fazem igual).
- **Versículos fora de ordem no set**: a formatação sempre ordena por número de
  versículo antes de agrupar, então a seleção não depende da ordem de clique.
- **Acessibilidade**: `VerseRow` já é `role="button"` com `tabIndex={0}` e handler de
  teclado; o popover `@base-ui` é acessível por padrão (focus trap, Esc nativo).
- **Renderização do popover**: o `Popover` envolve o `VerseRow` âncora como trigger.
  Versículos não-âncora continuam sendo `VerseRow` puros (sem wrapper de popover) —
  clicar neles atualiza a seleção e, se tornarem-se a nova âncora, o popover é
  remontado com a nova âncora.

## Fora de escopo

- Notas, destaques (highlights) ou qualquer persistência local da seleção — a seleção
  é efêmera (não sobrevive a troca de capítulo).
- Compartilhamento via Web Share API — apenas copiar para área de transferência.
- Seleção por arrastar (drag) ou intervalo com Shift — seleção é por toque/clique
  individual (acumula), conforme decisão de UX aprovada.
