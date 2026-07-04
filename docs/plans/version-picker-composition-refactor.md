---
source_tool: claude
source_path: .agents/task
imported_at: '2026-07-03T22:00:00Z'
ai_context_version: 1.0.0
---

# VersionPicker Composition Pattern Refactor

## Objetivo

Refatorar `version-picker-dialog.tsx` usando o Composition Pattern, similar aos componentes UI existentes (`Dialog`, `AlertDialog`, `Drawer`), permitindo maior flexibilidade e reuso.

## Estrutura Proposta

```
features/bible-reader/components/version-picker/
├── index.tsx                  # Arquivo principal com exports
├── version-picker-dialog.tsx    # Mantém API simplificada + composition parts
├── version-search-header.tsx    # Mantido (já existe)
├── installed-versions-tab.tsx   # Mantido (já existe)
├── available-versions-tab.tsx     # Mantido (já existe)
├── version-row.tsx             # Mantido (já existe)
├── version-meta.ts             # Mantido (já existe)
└── use-version-install.ts        # Mantido (já existe)
```

## Componentes de Composition

| Componente | Responsabilidade |
|------------|------------------|
| `VersionPickerDialog` | Container raiz - mantiém API atual como entry point |
| `VersionPickerDialog.Root` | Provider de contexto (internal) |
| `VersionPickerDialog.Overlay` | Overlay escuro desktop |
| `VersionPickerDialog.Portal` | Portal createPortal |
| `VersionPickerDialog.Content` | Container branco com layout |
| `VersionPickerDialog.TabsList` | Wrapper estilizado do TabsList |
| `VersionPickerDialog.TabsTrigger` | Wrapper com contagem automática |
| `VersionPickerDialog.TabsContent` | Container com scroll interno |

## API de Uso

### API Simplificada (mantida)

```tsx
// Uso atual - continua funcionando
<VersionPickerDialog open={open} onClose={handleClose} />
```

### API Composition (nova)

```tsx
<VersionPickerDialog open={open} onClose={handleClose}>
  <VersionPickerDialog.Overlay>
    <VersionPickerDialog.Portal>
      <VersionPickerDialog.Content>
        <VersionSearchHeader query={query} onQueryChange={setQuery} onClose={handleClose} />
        <Tabs defaultValue="installed" className="flex-1 min-h-0 flex flex-col">
          <VersionPickerDialog.TabsList>
            <VersionPickerDialog.TabsTrigger value="installed" count={installedCount}>
              Instaladas
            </VersionPickerDialog.TabsTrigger>
            <VersionPickerDialog.TabsTrigger value="available" count={availableCount}>
              Disponíveis
            </VersionPickerDialog.TabsTrigger>
          </VersionPickerDialog.TabsList>
          <VersionPickerDialog.TabsContent value="installed">
            <InstalledVersionsTab query={query} onSelect={handleSelect} />
          </VersionPickerDialog.TabsContent>
          <VersionPickerDialog.TabsContent value="available">
            <AvailableVersionsTab query={query} />
          </VersionPickerDialog.TabsContent>
        </Tabs>
      </VersionPickerDialog.Content>
    </VersionPickerDialog.Portal>
  </VersionPickerDialog.Overlay>
</VersionPickerDialog>
```

## Tasks Concluídas

- [x] Refatorar `version-picker-dialog.tsx` com sub-componentes
- [x] Verificar lint: `pnpm eslint features/bible-reader/components/version-picker/` - sem erros
- [x] Criar `index.tsx` centralizando exports
- [x] Verificar `bible-version-selector.tsx` continua funcionando (importa do caminho correto)