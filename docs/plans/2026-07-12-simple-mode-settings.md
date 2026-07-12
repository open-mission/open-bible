# Botão de Configurações no Modo Simples — Plano de Implementação

**Goal:** Adicionar um botão de configurações gerais (Ajustes) no leitor do Modo Simples no desktop.

**Architecture:** Adicionar uma nova prop opcional `showConfigButton?: boolean` que flui do `<Reader>` para o `<ReaderHeader>`. Quando ativada, o `<ReaderHeader>` renderiza um botão adicional com o ícone de engrenagem (`IconSettings`) e o texto "Ajustes" (visível no desktop: `hidden md:inline-flex`), que ao ser clicado abre o `ConfigDialog`. A prop será ativada apenas no `SimpleHome`.

**Tech Stack:** React, Next.js, @tabler/icons-react, Tailwind v4.

## Mapa de Arquivos

| Arquivo | Ação | Responsabilidade |
| --- | --- | --- |
| [reader-header.tsx](file:///Users/claudio/Projects/open-bible/features/bible-reader/components/reader-header.tsx) | **Modificar** | Adicionar prop `showConfigButton`, importar/renderizar botão e `<ConfigDialog>` correspondente. |
| [reader.tsx](file:///Users/claudio/Projects/open-bible/features/bible-reader/components/reader.tsx) | **Modificar** | Propagar a prop `showConfigButton` do componente pai para `ReaderContent` e então para `ReaderHeader`. |
| [simple-home.tsx](file:///Users/claudio/Projects/open-bible/features/workspace/components/simple-home.tsx) | **Modificar** | Passar `showConfigButton={true}` para o leitor `<Reader>`. |

## Tarefas de Implementação

### [ ] T1 — Modificar `reader-header.tsx`
Adicionar a prop `showConfigButton` ao `ReaderHeaderProps`. Importar e configurar o botão.

**Mudanças esperadas:**
```diff
import { useState, useEffect } from "react";
-import { IconTextSize, IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
+import { IconTextSize, IconChevronLeft, IconChevronRight, IconSettings } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
+import { ConfigDialog } from "@/features/config/components/config-dialog";
...
interface ReaderHeaderProps {
  book: { name: string; chapters: number };
  chapter: number;
  readerMode: "narrow" | "medium" | "wide";
  onBookChapterClick: () => void;
  onChangeReaderMode: (mode: "narrow" | "medium" | "wide") => void;
  fontSize: number;
  onChangeFontSize: (size: number) => void;
  verseSpacing: "small" | "medium" | "large";
  onChangeVerseSpacing: (spacing: "small" | "medium" | "large") => void;
  readerFont: "sans" | "serif" | "mono";
  onChangeReaderFont: (font: "sans" | "serif" | "mono") => void;
  onPrevChapter?: () => void;
  onNextChapter?: () => void;
+  showConfigButton?: boolean;
}

export function ReaderHeader({
  book,
  chapter,
  readerMode,
  onBookChapterClick,
  onChangeReaderMode,
  fontSize,
  onChangeFontSize,
  verseSpacing,
  onChangeVerseSpacing,
  readerFont,
  onChangeReaderFont,
  onPrevChapter,
  onNextChapter,
+  showConfigButton = false,
}: ReaderHeaderProps) {
  const isTauriMacOS = useIsTauriMacOS();
  const [themeDialogOpen, setThemeDialogOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
+  const [configOpen, setConfigOpen] = useState(false);
...
```

Adicionar o botão de configurações no JSX após o botão de Exibição, no final do container do pill:
```diff
            <Button
              onClick={() => setSettingsOpen(true)}
              variant="ghost"
              className="h-8 rounded-full px-3 text-sm font-semibold hover:bg-background hover:shadow-xs"
              title="Ajustes de visualização"
            >
              <IconTextSize data-icon="inline-start" />
              <span className="hidden lg:inline">Exibição</span>
            </Button>
+            {showConfigButton && (
+              <Button
+                onClick={() => setConfigOpen(true)}
+                variant="ghost"
+                className="h-8 rounded-full px-3 text-sm font-semibold hover:bg-background hover:shadow-xs hidden md:inline-flex"
+                title="Configurações"
+              >
+                <IconSettings data-icon="inline-start" />
+                <span className="hidden lg:inline">Ajustes</span>
+              </Button>
+            )}
          </div>
        </div>
      </div>
```

E renderizar o modal no final do JSX do component (próximo aos outros dialogs):
```diff
      {/* Modal/Drawer de configuração de tema */}
      {isDesktop ? (
...
      ) : (
...
      )}
+
+      {showConfigButton && (
+        <ConfigDialog open={configOpen} onOpenChange={setConfigOpen} />
+      )}
    </>
  );
```

### [ ] T2 — Modificar `reader.tsx`
Modificar as assinaturas de `ReaderProps`, `ReaderContent` e do próprio `Reader` para propagar a prop `showConfigButton`.

**Mudanças esperadas:**
```diff
interface ReaderProps {
  bookId: string;
  chapter: number;
  onChapterChange: (chapter: number) => void;
  onBookChapterClick: () => void;
  readerMode: "narrow" | "medium" | "wide";
  onChangeReaderMode: (mode: "narrow" | "medium" | "wide") => void;
  fontSize: number;
  onChangeFontSize: (size: number) => void;
  verseSpacing: "small" | "medium" | "large";
  onChangeVerseSpacing: (spacing: "small" | "medium" | "large") => void;
  readerFont: "sans" | "serif" | "mono";
  onChangeReaderFont: (font: "sans" | "serif" | "mono") => void;
  isActive?: boolean;
+  showConfigButton?: boolean;
}

function ReaderContent({
  bookId,
  chapter,
  onChapterChange,
  onBookChapterClick,
  readerMode,
  onChangeReaderMode,
  fontSize,
  onChangeFontSize,
  verseSpacing,
  onChangeVerseSpacing,
  readerFont,
  onChangeReaderFont,
  versionId,
  isActive = true,
+  showConfigButton = false,
}: ReaderProps & { versionId: string }) {
...
  return (
    <div className="relative flex flex-col min-w-0 h-full">
      <ReaderHeader
        book={book}
        chapter={chapter}
        readerMode={readerMode}
        onBookChapterClick={onBookChapterClick}
        onChangeReaderMode={onChangeReaderMode}
        fontSize={fontSize}
        onChangeFontSize={onChangeFontSize}
        verseSpacing={verseSpacing}
        onChangeVerseSpacing={onChangeVerseSpacing}
        readerFont={readerFont}
        onChangeReaderFont={onChangeReaderFont}
        onPrevChapter={prevChapter}
        onNextChapter={nextChapter}
+        showConfigButton={showConfigButton}
      />
...
```

E no wrapper `Reader`:
```diff
export function Reader(props: ReaderProps) {
  const { bookId, chapter } = props;
  const { versionId } = useBibleVersion();

  return (
    <HighlightsProvider bookId={bookId} chapter={chapter} versionId={versionId}>
      <ReaderContent {...props} versionId={versionId} />
    </HighlightsProvider>
  );
}
```

### [ ] T3 — Modificar `simple-home.tsx`
Passar `showConfigButton={true}` no render do `<Reader>` no componente `SimpleHome`.

**Mudanças esperadas:**
```diff
                {selectedBookId && selectedChapter ? (
                  <Reader
                    key={`${selectedBookId}-${selectedChapter}`}
                    bookId={selectedBookId}
                    chapter={selectedChapter}
                    onChapterChange={setSelectedChapter}
                    onBookChapterClick={() => setBookChapterDialogOpen(true)}
                    readerMode={readerMode}
                    onChangeReaderMode={setReaderMode}
                    fontSize={fontSize}
                    onChangeFontSize={setFontSize}
                    verseSpacing={verseSpacing}
                    onChangeVerseSpacing={setVerseSpacing}
                    readerFont={readerFont}
                    onChangeReaderFont={setReaderFont}
+                    showConfigButton={true}
                  />
                ) : (
```

## Verificação Manual
1. Abrir o aplicativo local em `http://localhost:3000`.
2. Caso o app esteja no Modo Avançado, ir nas Configurações/Preferências (ícone de engrenagem no cabeçalho do workspace), aba "Leitura", e mudar o Modo de Leitura para **Simples**.
3. No Modo Simples no Desktop, validar que o botão "Ajustes" com ícone de engrenagem aparece no final do pill no topo do leitor.
4. Clicar no botão e validar se o modal `ConfigDialog` (Preferências) é aberto com sucesso.
5. Fechar o modal, redimensionar a tela para o modo mobile e validar que o botão "Ajustes" some do pill do topo (pois no mobile ele já está presente no rodapé).
6. Rodar `pnpm lint` e `pnpm build` para garantir que não há erros de tipagem/compilação.
