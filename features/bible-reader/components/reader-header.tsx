"use client";

import { useState, useEffect } from "react";
import { IconTextSize } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
import { BibleVersionSelector } from "./bible-version-selector";

interface ReaderHeaderProps {
  book: { name: string };
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
}: ReaderHeaderProps) {
  const [themeDialogOpen, setThemeDialogOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
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
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur flex items-center justify-center pb-3 pt-3 px-4 border-b border-border min-h-14.25">
        {/* Desktop Book/Chapter/Version/Display Selector (Left-aligned pill) */}
        <div className="flex items-center border-0">
          <div className="flex items-center gap-0.5 bg-muted/60 p-0.5 rounded-full border border-border/60">
            <Button
              onClick={onBookChapterClick}
              variant="ghost"
              className="h-8 rounded-full px-3 text-sm font-semibold hover:bg-background hover:shadow-xs"
            >
              <span className="text-sm font-semibold mx-1">{book.name}</span>
            </Button>
            <Button
              onClick={onBookChapterClick}
              variant="ghost"
              className="h-8 rounded-full px-3 text-sm font-semibold hover:bg-background hover:shadow-xs"
            >
              <span className="text-sm font-semibold mx-1">{chapter}</span>
            </Button>
            <BibleVersionSelector
              variant="ghost"
              className="h-8 rounded-full px-3"
            />
            <Popover>
              <PopoverTrigger
                render={
                  <Button
                    variant="ghost"
                    className="h-8 rounded-full px-3 text-sm font-semibold hover:bg-background hover:shadow-xs"
                    title="Ajustes de visualização"
                  />
                }
              >
                <IconTextSize data-icon="inline-start" />
                <span className="hidden lg:inline">Exibição</span>
              </PopoverTrigger>
              <PopoverContent
                className="w-80 p-5 flex flex-col gap-5"
                align="start"
              >
                <div className="flex flex-col gap-1">
                  <h4 className="font-semibold text-sm leading-none">
                    Ajustes de exibição
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Personalize sua experiência de leitura.
                  </p>
                </div>
                {displaySettings}
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      {/* Mobile Display Settings Drawer/Bottom Sheet */}
      {settingsOpen && !isDesktop && (
        <BottomSheet open={settingsOpen} onClose={() => setSettingsOpen(false)}>
          <div className="px-4 py-3 border-b border-border">
            <p className="text-sm font-semibold text-foreground">
              Ajustes de exibição
            </p>
          </div>
          <div className="p-5">{displaySettings}</div>
        </BottomSheet>
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
    </>
  );
}
