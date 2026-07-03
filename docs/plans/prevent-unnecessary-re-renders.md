# Plano: Eliminar Re-renderizações Desnecessárias

## Resumo
Otimizar 7 pontos de re-renderização identificados, abrangendo context providers, callbacks, memoização de componentes e estabilidade de dependências.

---

## Fix 1: `BibleVersionContext` — Memoizar value + separar `downloadProgress`
**Arquivo:** `features/bible-reader/context/bible-version-context.tsx`

- Adicionar `useMemo` no `value` do Provider (linha 344), listando todas as state vars e callbacks como deps.
- Mover `downloadProgress` para um contexto separado (`DownloadProgressContext`) isolado, para que updates de progresso durante download NÃO re-renderizem os 10+ consumers do BibleVersionContext. Somente componentes que precisam de `downloadProgress` vão consumir o contexto isolado (como `AvailableVersionsTab`).

**Detalhes:**
```tsx
// Criar DownloadProgressContext separado
const DownloadProgressContext = createContext<{...} | null>(null)

// No Provider, envolver children com dois providers:
<DownloadProgressContext.Provider value={memoizedProgressValue}>
  <BibleVersionContext.Provider value={memoizedBibleValue}>
    {children}
  </BibleVersionContext.Provider>
</DownloadProgressContext.Provider>
```

---

## Fix 2: `ToastProvider` — Memoizar value + extrair UI do children
**Arquivo:** `features/layout/hooks/use-toast.tsx`

- Adicionar `useMemo` no `value` do Provider.
- Criar componente `ToastContainer` separado e renderizá-lo via `createPortal` para que mudanças de estado de toast não re-renderizem o subtree dos children.
- Exportar `useToastAction()` que retorna apenas `{ addToast, removeToast, updateToast }` (sem o array `toasts`), e `useToastState()` que retorna apenas `{ toasts }`. Assim consumers que só disparam toasts não re-renderizam quando o array muda.

**Detalhes:**
```tsx
// ToastContainer usa createPortal(target, document.body)
// Provider só expõe value memoizado, children não incluem a UI de toasts
```

---

## Fix 3: `ThemeModeProvider` + `PaletteColorProvider` — Memoizar values
**Arquivo:** `features/theme/components/theme-provider.tsx`

- Envolver `value` de `ThemeModeContext.Provider` (linha 228) com `useMemo`.
- Envolver `value` de `PaletteContext.Provider` (linha 347) com `useMemo`.
- Envolver `value` de `ColorContext.Provider` (linha 348) com `useMemo`.

---

## Fix 4: `Home (page.tsx)` — Memoizar callbacks
**Arquivo:** `app/page.tsx`

- Envolver `handleSelectBook`, `handleSelectChapter` em `useCallback`.
- Nota: os `setSelectedBookId`, `setFontSize`, etc. do React `useState` já são estáveis (React garante). Props primitivas (`fontSize`, `readerMode`, etc.) são estáveis por valor. Portanto, o foco é apenas nos handlers compostos.

---

## Fix 5: `Reader` — Event delegation para versos + memoizar nav callbacks
**Arquivo:** `features/bible-reader/components/reader.tsx`

- Substituir `onClick={() => handleVerseClick(verse.id)}` por **event delegation** no container `<article>`: ouvir `click` no parent, extrair `verse-id` via `data-verse-id` no `VerseRow`, e chamar `handleVerseClick` diretamente. Elimina 30-40 closures por render.
- Envolver `prevChapter` e `nextChapter` em `useCallback`.
- Atualizar `VerseRow` para incluir `data-verse-id={verse.id}` e remover prop `onClick`.

---

## Fix 6: `VerseRow` — Envolver em `React.memo`
**Arquivo:** `features/bible-reader/components/verse-row.tsx`

- Trocar `forwardRef` por `React.memo(forwardRef(...))` (ou memo + forwardRef na ordem correta).
- Com event delegation (Fix 5), a prop `onClick` é removida, e `memo` só precisa comparar `verse`, `isActive`, `isSelected`, `verseSpacing`.

---

## Fix 7: `getVerses` — Usar ref para `installedVersions`
**Arquivo:** `features/bible-reader/context/bible-version-context.tsx`

- Criar um `useRef` para manter uma cópia atualizada de `installedVersions`.
- No `useCallback` de `getVerses`, usar `installedVersionsRef.current` ao invés de `installedVersions` direto, e remover `installedVersions` da dependency array.
- Manter o `useEffect` de sync do ref atualizado.

---

## Ordem de implementação:
1. Fix 7 (dependência `getVerses`) + Fix 1 (BibleVersionContext memo) + separar download progress
2. Fix 3 (Theme providers memo)
3. Fix 2 (Toast provider memo + portal)
4. Fix 4 (Home callbacks)
5. Fix 5 (Reader event delegation) + Fix 6 (VerseRow memo)

## Teste manual:
- Verificar que a navegação entre capítulos funciona
- Verificar que download de versão mostra progress bar sem travar a leitura
- Verificar que a troca de tema/accent não causa flicker
- Verificar que a seleção de versos funciona normalmente
- Verificar que o painel de ajustes de exibição funciona
- `pnpm build` deve passar sem erros novos
