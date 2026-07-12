# Botão de Configurações no Leitor do Modo Simples — Design Spec

**Data:** 2026-07-12  
**Tipo:** improve  
**Status:** Em Revisão  

## Goal

Permitir que usuários no desktop acessando o **Modo Simples** (leitor clássico) consigam abrir o modal de configurações gerais (Preferências) do aplicativo para gerenciar versões da Bíblia, tema e alternar para o Modo Avançado.

## Background — estado atual

- O modal de configurações gerais é renderizado pelo componente `ConfigDialog` (localizado em `features/config/components/config-dialog.tsx`).
- No Modo Avançado (`AdvancedHome`), o cabeçalho do workspace renderiza o componente `ConfigButton` (em `features/workspace/components/config-button.tsx`) que aciona o `ConfigDialog`.
- No Modo Simples (`SimpleHome`), em dispositivos móveis, a barra de navegação inferior (`MobileNav`) renderiza um botão "Ajustes" que abre o `ConfigDialog`.
- No Modo Simples (`SimpleHome`) em desktops, a barra de navegação inferior é oculta (`md:hidden`), e não existe nenhum botão para abrir o `ConfigDialog`. O cabeçalho do leitor (`ReaderHeader`) possui apenas o botão "Exibição" que abre as preferências de visualização locais (fonte, espaçamento, margem), mas não as configurações gerais do app.

## Decisões de Design

1. **Botão no topo do leitor (dentro do "pill").** Adicionaremos um novo botão de engrenagem ("Ajustes") no leitor dentro do componente `ReaderHeader` (localizado em `features/bible-reader/components/reader-header.tsx`), logo após o botão "Exibição".
2. **Exibição Condicional (Somente Desktop).** O botão só será renderizado se a prop `showConfigButton` for `true` e se for em tela de desktop (`hidden md:inline-flex`), pois no mobile o acesso já é feito pela barra inferior.
3. **Controle via Prop.** O componente `Reader` aceitará a prop opcional `showConfigButton?: boolean` (padrão `false`), que será repassada ao `ReaderHeader`.
4. **Ativação no SimpleHome.** No arquivo `features/workspace/components/simple-home.tsx`, ao renderizar o `<Reader>`, passaremos `showConfigButton={true}`. Em outros locais (como `BiblePaneView` no Modo Avançado), essa prop não será passada, mantendo o comportamento padrão para evitar duplicidade de botões de configurações.

## Componentes Afetados

### `features/bible-reader/components/reader-header.tsx`
- Adicionar a prop `showConfigButton?: boolean` à interface `ReaderHeaderProps`.
- Importar `IconSettings` de `@tabler/icons-react` e `ConfigDialog` de `@/features/config/components/config-dialog`.
- Adicionar o estado `configOpen` para controlar a visibilidade do `ConfigDialog`.
- Renderizar o botão condicionalmente dentro do pill de controle se `showConfigButton` for `true`.
- Renderizar o `<ConfigDialog open={configOpen} onOpenChange={setConfigOpen} />` no final do componente.

### `features/bible-reader/components/reader.tsx`
- Adicionar `showConfigButton?: boolean` na interface `ReaderProps`.
- Passar a prop do container `Reader` para `ReaderContent` e dele para `ReaderHeader`.

### `features/workspace/components/simple-home.tsx`
- Passar `showConfigButton={true}` na instanciação de `<Reader>`.
