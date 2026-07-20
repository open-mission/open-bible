# Plano de Implementação: Support dev/beta pre-release update channels

- **Data**: 2026-07-20
- **Status**: Proposta
- **Issue**: [improve: support dev/beta pre-release update channels #219](https://github.com/open-mission/open-bible/issues/219)

---

## 🏗️ Estrutura de Arquivos e Responsabilidades

1. **`lib/release-notes/version.ts`**
   - Implementar `isPrerelease()`, `getUpdateChannel()`, `setUpdateChannel()`.
   - Reescrever `compareSemver()` para estender e dar suporte à comparação completa de pré-releases segundo o padrão SemVer 2.0.0.

2. **`features/release-notes/components/release-notes-provider.tsx`**
   - Atualizar `ReleaseNotesProvider` para expor o canal atual e a função `checkForUpdates(force?: boolean)`.
   - Adaptar o fluxo de fetch: se o canal for `"beta"`, buscar de `/releases` e filtrar/ordenar para obter a versão mais recente. Se for `"stable"`, continuar buscando de `/releases/latest`.

3. **`features/config/components/config-content.tsx`**
   - Disponibilizar a aba "Atualizações" para PWA/Web (antes restrita a `isTauri`).
   - Adicionar o seletor de Canal de Atualização ("Estável" vs "Beta/Pré-lançamento").
   - Adicionar o fluxo de verificação manual para PWA via botão "Verificar Atualizações".

4. **`scripts/release.mjs`**
   - Detectar se a versão criada é pré-release (se contém `-`) e passar a flag `--prerelease` no comando `gh release create`.

5. **`.github/workflows/desktop-release.yml`**
   - Substituir a flag `prerelease: false` no step `tauri-apps/tauri-action` por `prerelease: ${{ contains(github.ref_name, '-') }}` para marcar pré-releases automaticamente no GitHub.

6. **`tests/semver.test.ts`** [NEW]
   - Criar arquivo de testes unitários para a nova lógica do `compareSemver`.

---

## 🛠️ Passo a Passo da Implementação

### Passo 1: Atualização dos Utilitários de Versão (`lib/release-notes/version.ts`)
- Implementar as funções de canal e detecção de pré-releases.
- Atualizar a função `compareSemver`.

### Passo 2: Testes Unitários de Semver (`tests/semver.test.ts`)
- Criar a suíte de testes unitários rodando com Vitest (`pnpm test`).

### Passo 3: Atualizar o Provider (`features/release-notes/components/release-notes-provider.tsx`)
- Adaptar chamadas e endpoints com base no canal configurado.
- Expor `checkForUpdates` com suporte a bypass do cache de 1 hora.

### Passo 4: Atualizar UI de Configurações (`features/config/components/config-content.tsx`)
- Liberar a aba de atualizações para todas as plataformas.
- Adicionar o switch de canal e botão de busca manual para PWA.

### Passo 5: Atualizar Script de Release (`scripts/release.mjs`)
- Adicionar a detecção de pré-release para injetar `--prerelease` no comando `gh release create`.

### Passo 6: Atualizar Workflow GitHub Actions (`.github/workflows/desktop-release.yml`)
- Alterar o parâmetro `prerelease` para dinamicamente ler a tag empurrada.

### Passo 7: Validação e Deslop
- Executar `pnpm lint` e `pnpm build` para assegurar build correto.
- Executar a limpeza de AI slop (`deslop`).
