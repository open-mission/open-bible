# Design Spec: Support dev/beta pre-release update channels

## 1. Contexto & Problema
Atualmente, o sistema de verificação de nova versão do aplicativo consulta o endpoint `/releases/latest` da API do GitHub. Esse endpoint retorna apenas a última versão estável de produção, ignorando pré-lançamentos (pre-releases).

Para desenvolvedores e testadores que rodam builds com sufixos como `-dev`, `-beta`, ou `-rc` (ex: `0.8.2-dev`), o aplicativo nunca detectará atualizações de desenvolvimento. Além disso, a comparação de semver atual ignora sufixos de pré-lançamento, tratando `0.8.2-beta.2` e `0.8.2-beta.1` como a mesma versão (`0.8.2`).

Por fim, no lado de automação de releases:
1. O workflow `.github/workflows/desktop-release.yml` tem o campo `prerelease: false` fixado.
2. O script `scripts/release.mjs` não passa a flag `--prerelease` ao criar a release pela CLI do GitHub (`gh`).

## 2. Objetivos
1. **Detecção Automática**: Identificar se a versão local instalada é uma pré-release (contém hífen `-` no semver).
2. **Canal de Atualização Configurável**: Adicionar uma opção nas Configurações para escolher entre os canais "Estável" (Stable) e "Beta/Pré-lançamento" (Pre-release).
3. **Endpoint Alternativo**: Se o canal ativo for o Beta, consultar `/releases` (que lista todas as releases, incluindo pré-lançamentos) em vez de `/releases/latest`.
4. **Comparação Semântica Robusta**: Estender a função `compareSemver` para suportar ordenação de pré-lançamentos segundo a especificação SemVer 2.0.0.
5. **UI nas Configurações**: Tornar a aba "Atualizações" disponível para todas as plataformas (PWA e Tauri) para permitir a escolha do canal de atualizações e verificação manual.
6. **Automação de Release**: Configurar o workflow de CI do GitHub Actions e o script de release para marcar releases prévias como pré-lançamentos automaticamente com base no nome do tag/versão.

---

## 3. Abordagem Proposta

### 3.1. Versão e Canal de Atualizações (`lib/release-notes/version.ts`)
- Implementar `isPrerelease(version: string): boolean` para verificar se a versão contém hífen (`-`).
- Implementar `getUpdateChannel(): UpdateChannel` e `setUpdateChannel(channel: UpdateChannel): void`.
- Salvar a preferência do usuário no localStorage sob a chave `openbible:update-channel`.
- Caso nenhuma preferência esteja salva, o padrão será `"beta"` se a versão atual for pré-release, e `"stable"` caso contrário.

### 3.2. Comparação de Semver Robusta (`lib/release-notes/version.ts`)
Substituir a função `compareSemver` atual para comparar o núcleo da versão (`major.minor.patch`) e, em caso de empate, comparar os identificadores de pré-lançamento de forma ordenada:
- Números são comparados numericamente.
- Strings/letras são comparadas lexicamente.
- Identificadores numéricos têm menor precedência que não-numéricos.
- Uma versão estável (sem pré-lançamento) tem precedência maior que uma versão de pré-lançamento correspondente (ex: `0.8.2` > `0.8.2-beta`).

### 3.3. Adaptação do `ReleaseNotesProvider` (`features/release-notes/components/release-notes-provider.tsx`)
- Obter o canal ativo chamando `getUpdateChannel()`.
- Se o canal for `"beta"`:
  - Fazer fetch em `https://api.github.com/repos/open-mission/open-bible/releases` (retorna uma lista de releases).
  - Filtrar releases que não sejam rascunhos (`draft === false`).
  - Ordenar pelo semver decrescente usando o novo `compareSemver` e pegar a maior versão.
- Se o canal for `"stable"`:
  - Fazer fetch em `https://api.github.com/repos/open-mission/open-bible/releases/latest`.
- Expor uma função `checkForUpdates(force?: boolean)` para permitir que a tela de configurações dispare uma nova busca ignorando o cache de 1 hora.

### 3.4. Interface Gráfica de Configurações (`features/config/components/config-content.tsx`)
- Tornar a aba "Atualizações" visível para todos (removendo a restrição de `isTauri`).
- Renderizar:
  - **Identificação da Versão**: Versão atual instalada (ex: `v0.8.2-dev`).
  - **Seleção de Canal**: Um grupo de botões (toggle) para alternar entre "Estável" e "Beta/Pré-lançamento".
  - **Mensagem Contextual**: Explicar por que o canal atual está ativo (ex: informando se foi ativado por padrão devido à versão do app ser pré-lançamento).
  - **Verificação Manual**:
    - Para Tauri: Manter o fluxo atual com o plugin local de atualização (Tauri auto-updater).
    - Para PWA (Web): Adicionar um botão de busca manual que invoca `checkForUpdates(true)` do provider e exibe um feedback visual.

### 3.5. Ajustes de Automação de CI e Release
- **GitHub Actions Workflow (`.github/workflows/desktop-release.yml`)**:
  Alterar a linha `prerelease: false` no passo `tauri-apps/tauri-action` para:
  `prerelease: ${{ contains(github.ref_name, '-') }}`
  Isso garantirá que, se a tag empurrada contiver um hífen (ex: `v0.8.2-beta.1`), o GitHub marcará automaticamente a release como pré-lançamento.
- **Script de Release (`scripts/release.mjs`)**:
  No passo de criação de release via CLI:
  ```javascript
  const isPrerelease = nextVersion.includes('-');
  const prereleaseFlag = isPrerelease ? ' --prerelease' : '';
  runCmd(`gh release create ${tag} --generate-notes${prereleaseFlag}`, dryRun);
  ```

---

## 4. Plano de Testes / Verificação
- **Testes Unitários**: Criar casos de teste no Vitest para validar a comparação de semver com pré-releases:
  - `0.8.2-beta.2` > `0.8.2-beta.1`
  - `0.8.2` > `0.8.2-rc.1`
  - `0.8.2-dev` < `0.8.2-beta`
  - `0.8.2` === `0.8.2`
- **Verificação de UI**:
  - Testar alternância do switch/toggle de canais e confirmar persistência no localStorage.
  - Verificar se a aba de atualizações aparece no navegador (PWA).
