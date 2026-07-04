# Plano — Seleção de Versículos com Popover de Copiar

- **Issue:** #75
- **Branch:** `feat/75-verse-selection-copy` (worktree: `.worktrees/feat/75-verse-selection-copy`)
- **Spec:** `docs/specs/2026-07-02-verse-selection-copy-design.md`

## Goal

Permitir selecionar um ou mais versículos no leitor e, via popover, copiar a referência
ou o texto (referência + versículos) para a área de transferência.

## Architecture

A seleção vive no estado do `Reader` (`selectedVerseIds: Set<string>`). Um `Popover`
(`@base-ui`) envolve o versículo âncora (primeiro selecionado) como trigger; seu
conteúdo (`VerseSelectionPopover`) deriva a referência/texto dos versículos
selecionados via utilitários novos em `verse-reference.ts`. Click-away e Esc limpam a
seleção. O projeto não tem suíte de testes — verificação por tarefa é `pnpm lint` +
`pnpm build` + checagem manual no `pnpm dev`.

## Tech Stack

Next.js 16, React 19, `@base-ui/react` (Popover via `components/ui/popover.tsx`),
`navigator.clipboard` (fallback `execCommand`), `useToast`
(`features/layout/hooks/use-toast.tsx`), Tailwind v4, `lucide-react`/`@tabler/icons-react`
(ícones, já em uso).

## Mapa de arquivos

| Arquivo | Responsabilidade |
|---|---|
| `features/bible-reader/utils/verse-reference.ts` | `formatVerseReference()`, `formatVerseText()`, helper `groupVerseNumbers()`. |
| `features/bible-reader/components/verse-selection-popover.tsx` | UI do popover: cabeçalho (ref + contador), botões copiar ref/texto, estado "Copiado!", toast. |
| `features/bible-reader/components/verse-row.tsx` | `forwardRef`, espalhar props, `data-verse-row`. |
| `features/bible-reader/components/reader.tsx` | Estado de seleção, `handleVerseClick`, click-away/Esc, renderizar `Popover` no versículo âncora. |

## Tarefas

- [ ] **T1: Criar `features/bible-reader/utils/verse-reference.ts`**
- [ ] **T2: Criar `features/bible-reader/components/verse-selection-popover.tsx`**
- [ ] **T3: Modificar `features/bible-reader/components/verse-row.tsx`** (forwardRef + data-verse-row)
- [ ] **T4: Modificar `features/bible-reader/components/reader.tsx`** (seleção, click-away, popover)
- [ ] **T5: Lint + build + checagem manual no dev**

---

## T1: Criar `features/bible-reader/utils/verse-reference.ts`

**Arquivo:** `features/bible-reader/utils/verse-reference.ts` (novo)

```ts
import type { Book, Verse } from "@/lib/types"

/**
 * Agrupa números de versículo (ordenados) em segmentos: contíguos viram
 * "start-end", avulsos viram "n". Ex.: [16,17,18,20] -> ["16-18","20"].
 */
function groupVerseNumbers(verseNumbers: number[]): string[] {
  if (verseNumbers.length === 0) return []
  const sorted = [...verseNumbers].sort((a, b) => a - b)
  const segments: string[] = []
  let start = sorted[0]
  let prev = sorted[0]
  for (let i = 1; i < sorted.length; i++) {
    const n = sorted[i]
    if (n === prev + 1) {
      prev = n
      continue
    }
    segments.push(start === prev ? `${start}` : `${start}-${prev}`)
    start = n
    prev = n
  }
  segments.push(start === prev ? `${start}` : `${start}-${prev}`)
  return segments
}

/** Referência: "{abreviação} {capítulo}:{versículos} ({versão})". */
export function formatVerseReference(
  book: Book,
  chapter: number,
  verses: Verse[],
  versionAbbr: string,
): string {
  const segments = groupVerseNumbers(verses.map((v) => v.verse))
  return `${book.abbreviation} ${chapter}:${segments.join(", ")} (${versionAbbr})`
}

/** Texto copiável: referência na 1ª linha + versículos numerados numa só linha. */
export function formatVerseText(
  book: Book,
  chapter: number,
  verses: Verse[],
  versionAbbr: string,
): string {
  const reference = formatVerseReference(book, chapter, verses, versionAbbr)
  const ordered = [...verses].sort((a, b) => a.verse - b.verse)
  const body = ordered.map((v) => `${v.verse} ${v.text}`).join(" ")
  return `${reference}\n${body}`
}
```

**Verificação:** `pnpm lint`.

**Commit:** `feat: adicionar formatadores de referência e texto de versículos`

---

## T2: Criar `features/bible-reader/components/verse-selection-popover.tsx`

**Arquivo:** `features/bible-reader/components/verse-selection-popover.tsx` (novo)

Depende de T1. Usa `PopoverContent` de `@/components/ui/popover`, ícones
`@tabler/icons-react` (`Copy`, `ClipboardText`, `Check`), `Button` de
`@/components/ui/button`, e `useToast` de `@/features/layout/hooks/use-toast`. Inclui
helper `copyToClipboard` com fallback `execCommand` para contextos não-secure (Tauri).

```tsx
"use client"

import { useState } from "react"
import { Copy, ClipboardText, Check } from "@tabler/icons-react"
import type { Book, Verse } from "@/lib/types"
import { PopoverContent } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { useToast } from "@/features/layout/hooks/use-toast"
import {
  formatVerseReference,
  formatVerseText,
} from "@/features/bible-reader/utils/verse-reference"

interface VerseSelectionPopoverProps {
  book: Book
  chapter: number
  selectedVerses: Verse[]
  versionAbbr: string
}

type CopiedKind = "reference" | "text" | null

async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch { /* cai no fallback */ }
  try {
    const ta = document.createElement("textarea")
    ta.value = text
    ta.style.position = "fixed"
    ta.style.opacity = "0"
    document.body.appendChild(ta)
    ta.focus()
    ta.select()
    const ok = document.execCommand("copy")
    document.body.removeChild(ta)
    return ok
  } catch { return false }
}
```

O componente `VerseSelectionPopover` calcula `reference` + `count`, mantém estado
`copied`, e em `handleCopy(kind)` monta o texto, chama `copyToClipboard`, e em sucesso
faz `setCopied(kind)` + toast de sucesso (2s); em falha, toast de erro (3s).

Layout do `PopoverContent` (`align="start"`, `side="bottom"`, `sideOffset={6}`,
`className="w-64 p-2 gap-1"`, `onOpenAutoFocus={(e) => e.preventDefault()}`):

1. Cabeçalho: `<p>` referência ao vivo (font-semibold) + `<p>`
   `{count} versículo(s) selecionado(s)`.
2. Separador `<div className="h-px bg-border my-1" />`.
3. `<Button variant="ghost" size="sm" className="w-full justify-start gap-2 font-normal">`
   — **Copiar referência** (ícone `Copy` / `Check` quando copiado).
4. `<Button>` idem — **Copiar texto** (ícone `ClipboardText` / `Check`).

**Verificação:** `pnpm lint`.

**Commit:** `feat: adicionar popover de seleção de versículos com copiar`

---

## T3: Modificar `features/bible-reader/components/verse-row.tsx`

**Arquivo:** `features/bible-reader/components/verse-row.tsx`

Transformar em `forwardRef` (para o `Reader` passar `ref` ao versículo âncora usado pelo
`PopoverTrigger render={...}`) e adicionar `data-verse-row=""` (detecção de click-away).

Mudanças cirúrgicas no arquivo atual:

1. `import { forwardRef } from "react"` no topo.
2. `export const VerseRow = forwardRef<HTMLDivElement, VerseRowProps>(function VerseRow(
   { verse, isActive, isSelected, onClick, verseSpacing = "medium" }, ref) { ... })`.
3. No `<div>` raiz: adicionar `ref={ref}` e `data-verse-row=""`.

O restante (spacingClasses, style, className, aria-pressed, número do versículo, texto)
permanece **idêntico** ao original.

**Verificação:** `pnpm lint` + `pnpm build` (garante que `VerseRow` compila com o caller
atual que não passa `ref`).

**Commit:** `refactor: tornar VerseRow em forwardRef e marcar com data-verse-row`

---

## T4: Modificar `features/bible-reader/components/reader.tsx`

**Arquivo:** `features/bible-reader/components/reader.tsx`

### Novos imports
- `useEffect` (adicionar ao import de `react` — hoje só `useState, useRef`).
- `Popover, PopoverTrigger` de `@/components/ui/popover`.
- `useBibleVersion` de `@/features/bible-reader/context/bible-version-context`.
- `VerseSelectionPopover` de `./verse-selection-popover`.

### Mudanças de estado/lógica
1. Remover `const [multiSelectMode] = useState(false)` (morto).
2. Adicionar `const { versionId } = useBibleVersion()`.
3. Derivar (antes do `if (!book) return null` para segurança, ou após — como hoje):

```tsx
const open = selectedVerseIds.size > 0
const selectedVerses = verses.filter((v) => selectedVerseIds.has(v.id))
const anchorVerse = selectedVerses.length
  ? selectedVerses.reduce((min, v) => (v.verse < min.verse ? v : min), selectedVerses[0])
  : null
const versionAbbr = versionId.toUpperCase()
```

4. `handleVerseClick` simplificado (toggle no set, sem branch `multiSelectMode`):

```tsx
function handleVerseClick(verseId: string) {
  setActiveVerseId(verseId)
  setSelectedVerseIds((prev) => {
    const next = new Set(prev)
    if (next.has(verseId)) next.delete(verseId)
    else next.add(verseId)
    return next
  })
}
```

5. `useEffect` de click-away + Esc (ativo só quando `open`):

```tsx
useEffect(() => {
  if (!open) return
  function handlePointerDown(e: PointerEvent) {
    const target = e.target as HTMLElement | null
    if (!target) return
    if (target.closest("[data-verse-row]") || target.closest("[data-slot='popover-content']")) return
    setSelectedVerseIds(new Set())
  }
  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === "Escape") setSelectedVerseIds(new Set())
  }
  document.addEventListener("pointerdown", handlePointerDown)
  document.addEventListener("keydown", handleKeyDown)
  return () => {
    document.removeEventListener("pointerdown", handlePointerDown)
    document.removeEventListener("keydown", handleKeyDown)
  }
}, [open])
```

### Renderização dos versículos (no `.map`)
Cada versículo vira `VerseRow`. Apenas o **âncora** é envolvido por `<Popover open={open}>`
com `<PopoverTrigger render={<VerseRow .../>} />`; os demais são `VerseRow` puros. O
conteúdo `VerseSelectionPopover` é renderizado **dentro** do `<Popover>` (não precisa de
`PopoverContent` wrapper — o próprio `VerseSelectionPopover` renderiza `PopoverContent`):

```tsx
verses.map((verse) => {
  const row = (
    <VerseRow
      key={verse.id}
      verse={verse}
      isActive={verse.id === activeVerseId}
      isSelected={selectedVerseIds.has(verse.id)}
      onClick={() => handleVerseClick(verse.id)}
      verseSpacing={verseSpacing}
    />
  )
  if (anchorVerse?.id !== verse.id) return row
  return (
    <Popover key={verse.id} open={open}>
      <PopoverTrigger render={row} />
      {open && (
        <VerseSelectionPopover
          book={book}
          chapter={chapter}
          selectedVerses={selectedVerses}
          versionAbbr={versionAbbr}
        />
      )}
    </Popover>
  )
})
```

**Atenção:** o `<header>` do leitor (`{book.name} {chapter}`) e toda a navegação
flutuante (ChevronLeft/Right mobile/desktop) permanecem **idênticos** ao original — só
a seção de versículos e os imports/estado mudam.

**Verificação:** `pnpm lint` + `pnpm build`.

**Commit:** `feat: integrar seleção de versículos e popover de copiar no leitor`

---

## T5: Lint + build + checagem manual no dev

- `pnpm lint` — sem erros.
- `pnpm build` — deve passar (ignora erros de TS, mas pega erros de import/sintaxe).
- `pnpm dev` (manual): clicar num versículo → popover abre; clicar em outro → referência
  vira intervalo; clicar fora → limpa; Esc → limpa; copiar ref e copiar texto geram toast
  e "Copiado!".

**Commit (se ajustes):** `fix: ajustes da validação manual da seleção de versículos`

