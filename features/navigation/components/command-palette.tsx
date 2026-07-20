"use client"

import { useState, useEffect } from "react"
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command"
import {
  IconBook,
  IconNotebook,
  IconHighlight,
  IconSearch,
  IconSettings,
  IconSun,
  IconMoon,
  IconPlus,
  IconX,
  IconLayoutGrid,
  IconLayoutRows,
} from "@tabler/icons-react"
import { useAppNavigation } from "../context/app-navigation-context"
import { useAppTheme } from "@/features/theme/components/theme-provider"
import { useBibleVersion } from "@/features/bible-reader/context/bible-version-context"
import { formatShortcutDisplay } from "../hooks/use-global-shortcuts"

interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onOpenBookChapterDialog?: () => void
  workspaceActions?: {
    openPane?: () => void
    closePane?: () => void
    setLayoutMode?: (mode: "tabs" | "grid") => void
  }
}

export function CommandPalette({
  open,
  onOpenChange,
  onOpenBookChapterDialog,
  workspaceActions,
}: CommandPaletteProps) {
  const { navigate } = useAppNavigation()
  const { isDark, setTheme } = useAppTheme()
  const { versionId, setVersionId, installedVersions } = useBibleVersion()
  const [search, setSearch] = useState("")

  useEffect(() => {
    if (!open) setSearch("")
  }, [open])

  const handleSelect = (action: () => void) => {
    action()
    onOpenChange(false)
  }

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder="Digite um comando ou busque..."
        value={search}
        onValueChange={setSearch}
      />
      <CommandList>
        <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>

        <CommandGroup heading="Navegação">
          <CommandItem onSelect={() => handleSelect(() => onOpenBookChapterDialog?.())}>
            <IconSearch className="mr-2 size-4" />
            <span>Ir para livro/capítulo</span>
            <CommandShortcut>{formatShortcutDisplay("mod+k")}</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect(() => navigate("reader"))}>
            <IconBook className="mr-2 size-4" />
            <span>Leitura</span>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect(() => navigate("notes"))}>
            <IconNotebook className="mr-2 size-4" />
            <span>Notas</span>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect(() => navigate("highlights"))}>
            <IconHighlight className="mr-2 size-4" />
            <span>Destaques</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Versão da Bíblia">
          {installedVersions.map((v) => (
            <CommandItem
              key={v.id}
              onSelect={() => handleSelect(() => setVersionId(v.id))}
            >
              <IconBook className="mr-2 size-4" />
              <span>{v.id.toUpperCase()}</span>
              {v.id === versionId && (
                <span className="ml-auto text-xs text-primary">Ativa</span>
              )}
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        {workspaceActions && (
          <>
            <CommandGroup heading="Ações">
              {workspaceActions.openPane && (
                <CommandItem onSelect={() => handleSelect(workspaceActions.openPane!)}>
                  <IconPlus className="mr-2 size-4" />
                  <span>Nova aba</span>
                  <CommandShortcut>{formatShortcutDisplay("alt+t")}</CommandShortcut>
                </CommandItem>
              )}
              {workspaceActions.closePane && (
                <CommandItem onSelect={() => handleSelect(workspaceActions.closePane!)}>
                  <IconX className="mr-2 size-4" />
                  <span>Fechar aba</span>
                  <CommandShortcut>{formatShortcutDisplay("alt+w")}</CommandShortcut>
                </CommandItem>
              )}
              {workspaceActions.setLayoutMode && (
                <>
                  <CommandItem onSelect={() => handleSelect(() => workspaceActions.setLayoutMode!("tabs"))}>
                    <IconLayoutRows className="mr-2 size-4" />
                    <span>Modo Abas</span>
                  </CommandItem>
                  <CommandItem onSelect={() => handleSelect(() => workspaceActions.setLayoutMode!("grid"))}>
                    <IconLayoutGrid className="mr-2 size-4" />
                    <span>Modo Grade</span>
                  </CommandItem>
                </>
              )}
            </CommandGroup>
            <CommandSeparator />
          </>
        )}

        <CommandGroup heading="Aparência">
          <CommandItem onSelect={() => handleSelect(() => setTheme(isDark ? "light" : "dark"))}>
            {isDark ? <IconSun className="mr-2 size-4" /> : <IconMoon className="mr-2 size-4" />}
            <span>{isDark ? "Modo Claro" : "Modo Escuro"}</span>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect(() => navigate("reader"))}>
            <IconSettings className="mr-2 size-4" />
            <span>Configurações</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
