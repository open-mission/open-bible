"use client";

import { Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { useAppTheme } from "@/features/theme/components/theme-provider";

interface ReaderDisplaySettingsProps {
  fontSize: number;
  onChangeFontSize: (size: number) => void;
  verseSpacing: "small" | "medium" | "large";
  onChangeVerseSpacing: (spacing: "small" | "medium" | "large") => void;
  readerMode: "narrow" | "medium" | "wide";
  onChangeReaderMode: (mode: "narrow" | "medium" | "wide") => void;
  readerFont: "sans" | "serif" | "mono";
  onChangeReaderFont: (font: "sans" | "serif" | "mono") => void;
  onConfigureTheme: () => void;
}

export function ReaderDisplaySettings({
  fontSize,
  onChangeFontSize,
  verseSpacing,
  onChangeVerseSpacing,
  readerMode,
  onChangeReaderMode,
  readerFont,
  onChangeReaderFont,
  onConfigureTheme,
}: ReaderDisplaySettingsProps) {
  const { mode, setTheme } = useAppTheme();

  return (
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

      {/* Text Margins (Reader Mode) */}
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

      {/* Theme Preview Thumbnails */}
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

      {/* Configurar Tema Button */}
      <div className="border-t border-border pt-3 mt-1">
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-center gap-2 h-8 text-xs cursor-pointer"
          onClick={onConfigureTheme}
        >
          <Palette className="h-3.5 w-3.5 text-primary" />
          Configurar tema...
        </Button>
      </div>
    </div>
  );
}
