"use client";

import { useState, useEffect } from "react";
import { Palette, Check, Sun, Moon, Monitor } from "lucide-react";
import { IconTextSize } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { ReaderVersionBadge } from "./reader-version-badge";
import { EnvBadge } from "@/features/layout/components/env-badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { Toggle } from "@/components/ui/toggle";

import { useAppTheme } from "@/features/theme/components/theme-provider";
import { COLOR_LABELS, COLOR_SWATCHES, type ThemeColor } from "@/features/theme/utils/theme";
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
import { cn } from "@/lib/utils";
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
  const { mode, color, palette, setTheme, setColor, setPalette } =
    useAppTheme();
  const [themeDialogOpen, setThemeDialogOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 768px)");
    setIsDesktop(media.matches);
    const listener = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, []);

  const colorList = Object.keys(COLOR_LABELS) as ThemeColor[];

  const themeConfigContent = (
    <div className="space-y-6 py-4">
      {/* Estilo do Tema */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold leading-none">Estilo do Tema</h3>
        <p className="text-xs text-muted-foreground">
          Escolha a paleta de cores base para o leitor.
        </p>
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: "default" as const, label: "Padrão" },
            { value: "dracula" as const, label: "Dracula" },
            { value: "gruvbox" as const, label: "Gruvbox" },
          ].map((p) => {
            const active = palette === p.value;
            return (
              <button
                key={p.value}
                onClick={() => setPalette(p.value)}
                className={cn(
                  "flex items-center justify-center rounded-lg border-2 px-3 py-3 text-xs font-semibold transition-all cursor-pointer h-10",
                  active
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground",
                )}
              >
                {p.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Aparência */}
      <div className="space-y-3 pt-4 border-t border-border">
        <h3 className="text-sm font-semibold leading-none">Aparência</h3>
        <p className="text-xs text-muted-foreground">
          Escolha o tema visual do leitor.
        </p>
        <div className="grid grid-cols-3 gap-3">
          {[
            {
              value: "light" as const,
              label: "Claro",
              icon: <Sun className="h-4 w-4" />,
            },
            {
              value: "system" as const,
              label: "Sistema",
              icon: <Monitor className="h-4 w-4" />,
            },
            {
              value: "dark" as const,
              label: "Escuro",
              icon: <Moon className="h-4 w-4" />,
            },
          ].map((m) => {
            const active = mode === m.value;
            const disabled = palette === "dracula";
            return (
              <button
                key={m.value}
                disabled={disabled}
                onClick={() => setTheme(m.value)}
                className={cn(
                  "flex flex-col items-center gap-2.5 rounded-lg border-2 px-3 py-4 text-xs font-semibold transition-all cursor-pointer",
                  active && !disabled
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground",
                  disabled && "opacity-50 cursor-not-allowed",
                )}
              >
                <div className="p-1.5 rounded-full bg-secondary/50">
                  {m.icon}
                </div>
                {disabled && m.value === "dark" ? "Escuro (Fixo)" : m.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Cor de Destaque */}
      {palette === "default" && (
        <div className="space-y-3 pt-4 border-t border-border animate-in fade-in-50 duration-200">
          <h3 className="text-sm font-semibold leading-none">
            Cor de destaque
          </h3>
          <p className="text-xs text-muted-foreground">
            Escolha a cor principal dos destaques e botões.
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-[240px] overflow-y-auto pr-1 custom-scrollbar">
            {colorList.map((c) => {
              const active = color === c;
              return (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={cn(
                    "flex items-center gap-2 rounded-lg border px-2.5 py-2 text-xs transition-all cursor-pointer",
                    active
                      ? "border-primary bg-primary/5 text-foreground font-semibold"
                      : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground",
                  )}
                >
                  <span
                    className="h-3.5 w-3.5 rounded-full shrink-0 ring-1 ring-black/10"
                    style={{ backgroundColor: COLOR_SWATCHES[c] }}
                  />
                  <span className="truncate">{COLOR_LABELS[c]}</span>
                  {active && (
                    <Check className="h-3.5 w-3.5 text-primary shrink-0 ml-auto" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );

  const displaySettingsContent = (
    <div className="flex flex-col gap-5">
      {/* Font Size Selector */}
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center text-xs font-medium">
          <span>Tamanho da Fonte</span>
          <span className="text-muted-foreground">{fontSize}px</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground font-semibold">A</span>
          <Slider
            min={16}
            max={24}
            step={2}
            value={[fontSize]}
            onValueChange={(val) =>
              onChangeFontSize(Array.isArray(val) ? val[0] : val)
            }
            className="flex-1"
          />
          <span className="text-lg text-muted-foreground font-semibold leading-none">
            A
          </span>
        </div>
      </div>

      {/* Font Style Selector */}
      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium">Estilo da Fonte</span>
        <div className="grid grid-cols-3 gap-2">
          {[
            { value: "sans" as const, label: "Sans", fontClass: "font-sans" },
            {
              value: "serif" as const,
              label: "Serif",
              fontClass: "font-serif",
            },
            { value: "mono" as const, label: "Mono", fontClass: "font-mono" },
          ].map((item) => {
            const active = readerFont === item.value;
            return (
              <button
                key={item.value}
                onClick={() => onChangeReaderFont(item.value)}
                className={cn(
                  "flex items-center justify-center rounded-lg border-2 py-2 text-xs transition-all cursor-pointer h-9",
                  item.fontClass,
                  active
                    ? "border-primary bg-primary/5 text-primary font-bold shadow-xs"
                    : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground",
                )}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Verse Spacing Selector */}
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center text-xs font-medium">
          <span>Espaçamento entre Versículos</span>
          <span className="text-muted-foreground">
            {verseSpacing === "small"
              ? "Compacto"
              : verseSpacing === "medium"
                ? "Padrão"
                : "Espaçoso"}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-muted-foreground font-medium">
            Compacto
          </span>
          <Slider
            min={1}
            max={3}
            step={1}
            value={[
              verseSpacing === "small" ? 1 : verseSpacing === "medium" ? 2 : 3,
            ]}
            onValueChange={(val) => {
              const numericVal = Array.isArray(val) ? val[0] : val;
              if (numericVal === 1) onChangeVerseSpacing("small");
              else if (numericVal === 2) onChangeVerseSpacing("medium");
              else if (numericVal === 3) onChangeVerseSpacing("large");
            }}
            className="flex-1"
          />
          <span className="text-[10px] text-muted-foreground font-medium">
            Espaçoso
          </span>
        </div>
      </div>

      {/* Readable Mode (Slider for Margins) */}
      <div className="flex flex-col gap-2 border-t border-border pt-4 mt-1">
        <div className="flex justify-between items-center text-xs font-medium">
          <span>Margens do Texto</span>
          <span className="text-muted-foreground">
            {readerMode === "narrow"
              ? "Estreito"
              : readerMode === "medium"
                ? "Padrão"
                : "Largo"}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-muted-foreground font-medium">
            Estreito
          </span>
          <Slider
            min={1}
            max={3}
            step={1}
            value={[
              readerMode === "narrow" ? 1 : readerMode === "medium" ? 2 : 3,
            ]}
            onValueChange={(val) => {
              const numericVal = Array.isArray(val) ? val[0] : val;
              if (numericVal === 1) onChangeReaderMode("narrow");
              else if (numericVal === 2) onChangeReaderMode("medium");
              else if (numericVal === 3) onChangeReaderMode("wide");
            }}
            className="flex-1"
          />
          <span className="text-[10px] text-muted-foreground font-medium">
            Largo
          </span>
        </div>
        <span className="text-[10px] text-muted-foreground leading-normal mt-1">
          Limita a largura máxima das margens do texto para tornar os parágrafos
          mais legíveis.
        </span>
      </div>

      {/* Tema / Aparência com Miniaturas */}
      <div className="flex flex-col gap-2 border-t border-border pt-4">
        <span className="text-xs font-semibold">Tema</span>
        <div className="grid grid-cols-3 gap-2">
          {/* Claro */}
          <button
            onClick={() => setTheme("light")}
            className={cn(
              "relative flex flex-col items-start gap-1 p-2 rounded-lg border-2 text-left transition-all overflow-hidden h-14 cursor-pointer",
              mode === "light"
                ? "border-primary bg-primary/5"
                : "border-border hover:border-foreground/30 bg-card",
            )}
          >
            <div className="absolute inset-0 bg-white" />
            <div className="relative z-10 w-full flex flex-col gap-1">
              <div className="h-1.5 w-8 rounded-sm bg-neutral-200" />
              <div className="h-1 w-12 rounded-sm bg-neutral-300" />
              <div className="h-1 w-10 rounded-sm bg-neutral-300" />
            </div>
            <span className="absolute bottom-1 right-2 z-10 text-[9px] font-bold text-neutral-800">
              Claro
            </span>
          </button>

          {/* Escuro */}
          <button
            onClick={() => setTheme("dark")}
            className={cn(
              "relative flex flex-col items-start gap-1 p-2 rounded-lg border-2 text-left transition-all overflow-hidden h-14 cursor-pointer",
              mode === "dark"
                ? "border-primary bg-primary/5"
                : "border-border hover:border-foreground/30 bg-card",
            )}
          >
            <div className="absolute inset-0 bg-zinc-950" />
            <div className="relative z-10 w-full flex flex-col gap-1">
              <div className="h-1.5 w-8 rounded-sm bg-zinc-700" />
              <div className="h-1 w-12 rounded-sm bg-zinc-800" />
              <div className="h-1 w-10 rounded-sm bg-zinc-800" />
            </div>
            <span className="absolute bottom-1 right-2 z-10 text-[9px] font-bold text-white">
              Escuro
            </span>
          </button>

          {/* Automático */}
          <button
            onClick={() => setTheme("system")}
            className={cn(
              "relative flex flex-col items-start gap-1 p-2 rounded-lg border-2 text-left transition-all overflow-hidden h-14 cursor-pointer",
              mode === "system"
                ? "border-primary bg-primary/5"
                : "border-border hover:border-foreground/30 bg-card",
            )}
          >
            <div className="absolute inset-y-0 left-0 right-1/2 bg-white" />
            <div className="absolute inset-y-0 left-1/2 right-0 bg-zinc-950" />
            <div className="relative z-10 w-full flex flex-col gap-1">
              <div className="h-1.5 w-8 rounded-sm bg-neutral-400" />
              <div className="h-1 w-12 rounded-sm bg-neutral-500" />
              <div className="h-1 w-10 rounded-sm bg-neutral-500" />
            </div>
            <span className="absolute bottom-1 right-2 z-10 text-[9px] font-bold mix-blend-difference text-white">
              Auto
            </span>
          </button>
        </div>
      </div>

      {/* Botão Configurar Tema */}
      <div className="border-t border-border pt-3 mt-1">
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-center gap-2 h-8 text-xs cursor-pointer"
          onClick={() => {
            setSettingsOpen(false);
            setThemeDialogOpen(true);
          }}
        >
          <Palette className="h-3.5 w-3.5 text-primary" />
          Configurar tema...
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Top Header - Sticky on desktop, sliding down on scroll on mobile */}
      <div
        className={`sticky top-0 z-20 bg-background/95 backdrop-blur flex items-center justify-between pb-3 pt-3 px-4 border-b border-border min-h-[57px] transition-all duration-300 ease-in-out md:translate-y-0 md:opacity-100 ${
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
            <ReaderVersionBadge
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
        <EnvBadge />
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
              {displaySettingsContent}
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
          <ReaderVersionBadge
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
          <EnvBadge className="mr-1" />
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
          <div className="p-5">{displaySettingsContent}</div>
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
            {themeConfigContent}
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
            {themeConfigContent}
          </DrawerContent>
        </Drawer>
      )}
    </>
  );
}
