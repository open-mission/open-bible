"use client";

import { useState, useEffect } from "react";
import { IconTextSize, IconChevronLeft, IconChevronRight, IconSettings } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { ReaderDisplaySettings } from "./reader-display-settings";
import { ReaderThemeConfig } from "./reader-theme-config";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { BibleVersionSelector } from "./bible-version-selector";
import { useIsTauriMacOS } from "@/features/layout/hooks/use-is-tauri-macos";
import { ConfigDialog } from "@/features/config/components/config-dialog";

interface ReaderHeaderProps {
  book: { name: string; chapters: number };
  chapter: number;
  readerMode: "narrow" | "medium" | "wide";
  onBookChapterClick: () => void;
  /** Called when the chapter number is clicked specifically (opens chapter grid). */
  onChapterClick?: () => void;
  onChangeReaderMode: (mode: "narrow" | "medium" | "wide") => void;
  fontSize: number;
  onChangeFontSize: (size: number) => void;
  verseSpacing: "small" | "medium" | "large";
  onChangeVerseSpacing: (spacing: "small" | "medium" | "large") => void;
  readerFont: "sans" | "serif" | "mono";
  onChangeReaderFont: (font: "sans" | "serif" | "mono") => void;
  /** Per-pane chapter navigation (optional). Rendered as desktop-only arrows
   *  flanking the book/chapter pill so each tab/grid item navigates
   *  independently. */
  onPrevChapter?: () => void;
  onNextChapter?: () => void;
  showConfigButton?: boolean;
}

export function ReaderHeader({
  book,
  chapter,
  readerMode,
  onBookChapterClick,
  onChapterClick,
  onChangeReaderMode,
  fontSize,
  onChangeFontSize,
  verseSpacing,
  onChangeVerseSpacing,
  readerFont,
  onChangeReaderFont,
  onPrevChapter,
  onNextChapter,
  showConfigButton = false,
}: ReaderHeaderProps) {
  const isTauriMacOS = useIsTauriMacOS();
  const [themeDialogOpen, setThemeDialogOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [configOpen, setConfigOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(min-width: 768px)").matches;
  });

  useEffect(() => {
    const media = window.matchMedia("(min-width: 768px)");
    const listener = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, []);

  const handleConfigureTheme = () => {
    setSettingsOpen(false);
    setThemeDialogOpen(true);
  };

  const displaySettings = (
    <ReaderDisplaySettings
      fontSize={fontSize}
      onChangeFontSize={onChangeFontSize}
      verseSpacing={verseSpacing}
      onChangeVerseSpacing={onChangeVerseSpacing}
      readerMode={readerMode}
      onChangeReaderMode={onChangeReaderMode}
      readerFont={readerFont}
      onChangeReaderFont={onChangeReaderFont}
      onConfigureTheme={handleConfigureTheme}
    />
  );

  return (
    <>
      {/* Top Header - Sticky, always visible */}
      <div
        data-tauri-drag-region={isTauriMacOS ? "" : undefined}
        className={cn(
          "sticky top-0 z-20 bg-gradient-to-b from-background via-background/95 to-transparent backdrop-blur flex items-center justify-center pb-3 pt-3 px-4 min-h-14.25",
          isTauriMacOS && "pl-[70px]",
        )}
      >
        {/* Desktop Book/Chapter/Version/Display Selector (Left-aligned pill) */}
        <div className="flex items-center border-0">
          <div className="flex items-center gap-0.5 bg-muted/60 p-0.5 rounded-full border border-border/60">
            {onPrevChapter && (
              <Button
                onClick={onPrevChapter}
                disabled={chapter <= 1}
                variant="ghost"
                size="icon-xs"
                className="h-8 w-8 rounded-full hover:bg-background hover:shadow-xs hidden md:inline-flex"
                title="Capítulo anterior"
                aria-label="Capítulo anterior"
              >
                <IconChevronLeft />
              </Button>
            )}
            <Button
              onClick={onBookChapterClick}
              variant="ghost"
              className="h-8 rounded-full px-3 text-sm font-semibold hover:bg-background hover:shadow-xs"
            >
              <span className="text-sm font-semibold mx-1">{book.name}</span>
            </Button>
            <Button
              onClick={onChapterClick ?? onBookChapterClick}
              variant="ghost"
              className="h-8 rounded-full px-3 text-sm font-semibold hover:bg-background hover:shadow-xs"
            >
              <span className="text-sm font-semibold mx-1">{chapter}</span>
            </Button>
            {onNextChapter && (
              <Button
                onClick={onNextChapter}
                disabled={chapter >= book.chapters}
                variant="ghost"
                size="icon-xs"
                className="h-8 w-8 rounded-full hover:bg-background hover:shadow-xs hidden md:inline-flex"
                title="Próximo capítulo"
                aria-label="Próximo capítulo"
              >
                <IconChevronRight />
              </Button>
            )}
            <BibleVersionSelector
              variant="ghost"
              className="h-8 rounded-full px-3"
            />
            <Button
              onClick={() => setSettingsOpen(true)}
              variant="ghost"
              className="h-8 rounded-full px-3 text-sm font-semibold hover:bg-background hover:shadow-xs"
              title="Ajustes de visualização"
            >
              <IconTextSize data-icon="inline-start" />
              <span className="hidden lg:inline">Exibição</span>
            </Button>
            {showConfigButton && (
              <Button
                onClick={() => setConfigOpen(true)}
                variant="ghost"
                className="h-8 rounded-full px-3 text-sm font-semibold hover:bg-background hover:shadow-xs inline-flex"
                title="Configurações"
              >
                <IconSettings data-icon="inline-start" />
                <span className="hidden lg:inline">Ajustes</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Display Settings Bottom Sheet */}
      {settingsOpen && !isDesktop && (
        <BottomSheet open={settingsOpen} onClose={() => setSettingsOpen(false)}>
          <div className="px-4 py-3 border-b border-border">
            <p className="text-sm font-semibold text-foreground">
              Ajustes de exibição
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Personalize sua experiência de leitura.
            </p>
          </div>
          <div className="p-5">{displaySettings}</div>
        </BottomSheet>
      )}

      {/* Desktop Display Settings Side Drawer */}
      {settingsOpen && isDesktop && (
        <Sheet open={settingsOpen} onOpenChange={setSettingsOpen}>
          <SheetContent side="right" className="p-0">
            <SheetHeader className="border-b border-border">
              <SheetTitle>Ajustes de exibição</SheetTitle>
              <SheetDescription>
                Personalize sua experiência de leitura.
              </SheetDescription>
            </SheetHeader>
            <div className="p-5">{displaySettings}</div>
          </SheetContent>
        </Sheet>
      )}

      {/* Modal/Drawer de configuração de tema */}
      {isDesktop ? (
        <Dialog open={themeDialogOpen} onOpenChange={setThemeDialogOpen}>
          <DialogContent className="sm:max-w-120">
            <DialogHeader>
              <DialogTitle>Personalizar Tema</DialogTitle>
              <DialogDescription>
                Ajuste o estilo visual e a cor de destaque do aplicativo.
              </DialogDescription>
            </DialogHeader>
            <ReaderThemeConfig />
          </DialogContent>
        </Dialog>
      ) : (
        <Drawer open={themeDialogOpen} onOpenChange={setThemeDialogOpen}>
          <DrawerContent className="px-4 pb-6">
            <DrawerHeader className="text-left px-0 pb-2">
              <DrawerTitle>Personalizar Tema</DrawerTitle>
              <DrawerDescription>
                Ajuste o estilo visual e a cor de destaque do aplicativo.
              </DrawerDescription>
            </DrawerHeader>
            <ReaderThemeConfig />
          </DrawerContent>
        </Drawer>
      )}

      {showConfigButton && (
        <ConfigDialog open={configOpen} onOpenChange={setConfigOpen} />
      )}
    </>
  );
}
