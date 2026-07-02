"use client";

import { useState, useEffect } from "react";
import { IconTextSize } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { BibleVersionSelector } from "./bible-version-selector";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Toggle } from "@/components/ui/toggle";
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

interface ReaderHeaderProps {
  book: { name: string };
  chapter: number;
  readerMode: "narrow" | "medium" | "wide";
  onBookChapterClick: () => void;
  onChangeReaderMode: (mode: "narrow" | "medium" | "wide") => void;
  showMiniReference?: boolean;
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
  showMiniReference = false,
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
      {/* Top Header - Sticky on desktop, sliding down on scroll on mobile */}
      <div
        className={`sticky top-0 z-20 bg-background/95 backdrop-blur flex items-center justify-between pb-3 pt-3 px-4 border-b border-border min-h-14.25 transition-all duration-300 ease-in-out md:translate-y-0 md:opacity-100 ${
          showMiniReference
            ? "translate-y-0 opacity-100"
            : "max-md:-translate-y-full max-md:opacity-0 max-md:pointer-events-none"
        }`}
      >
        {/* Desktop Book/Chapter Selector (Left-aligned) */}
        <div className="hidden md:flex items-center border-0">
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
          </div>
        </div>

        {/* Mobile Mini Reference (Centered when visible) */}
        <div
          className={`absolute left-1/2 -translate-x-1/2 transition-all duration-300 md:hidden font-serif text-sm font-semibold text-foreground ${
            showMiniReference
              ? "opacity-100 translate-y-0"
              : "opacity-0 -translate-y-1 pointer-events-none"
          }`}
        >
          {book.name} {chapter}
        </div>
        {/* Desktop Mini Reference and Tools (Right-aligned) */}
        <div className="hidden md:flex items-center gap-2">
          <Popover>
            <PopoverTrigger
              render={
                <Toggle
                  variant="outline"
                  size="sm"
                  className="hidden md:inline-flex items-center justify-center gap-2 rounded-md h-8 px-3 text-xs font-medium data-open:bg-muted data-open:text-foreground transition-colors"
                  title="Ajustes de visualização"
                />
              }
            >
              <IconTextSize className="h-4 w-4" />
              <span className="hidden lg:inline">Exibição</span>
            </PopoverTrigger>
            <PopoverContent
              className="w-80 p-5 flex flex-col gap-5"
              align="end"
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

      {/* Mobile Selector Group - Always visible and fixed at the bottom */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 flex justify-center pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-8 bg-linear-to-t from-background via-background/95 to-transparent text-sm font-medium w-full px-4 pointer-events-none">
        <div className="flex items-center gap-0.5 bg-background/95 backdrop-blur-md p-1 rounded-full shadow-lg border border-border/80 pointer-events-auto">
          <Button
            onClick={onBookChapterClick}
            variant="ghost"
            className="h-9 rounded-full px-3 text-sm font-semibold hover:bg-muted"
          >
            <span className="text-sm font-semibold mx-1">{book.name}</span>
          </Button>
          <Button
            onClick={onBookChapterClick}
            variant="ghost"
            className="h-9 rounded-full px-3 text-sm font-semibold hover:bg-muted"
          >
            <span className="text-sm font-semibold mx-1">{chapter}</span>
          </Button>
          <BibleVersionSelector
            variant="ghost"
            className="h-9 rounded-full px-3"
          />
          <Button
            onClick={() => setSettingsOpen(true)}
            variant="ghost"
            className="h-9 rounded-full px-3"
            title="Ajustes de visualização"
          >
            <IconTextSize className="h-4.5 w-4.5 text-muted-foreground" />
          </Button>
        </div>
      </nav>

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
