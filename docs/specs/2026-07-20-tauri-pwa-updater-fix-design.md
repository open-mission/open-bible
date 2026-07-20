# Design Spec: Fix Tauri and PWA Updater Flows

## 1. Contexto & Problema
Recentemente, foi adicionada a funcionalidade de canais de atualização (estável vs beta/pré-lançamento). No entanto, o fluxo de atualizações apresenta dois comportamentos problemáticos:

1. **Loop do PWA (Web/Mobile)**:
   - Em dispositivos móveis ou navegadores rodando como PWA, quando há um novo lançamento no GitHub (ex: `v0.8.4-dev` vs `v0.8.2-dev`), o `UpdateDialog` global é exibido dizendo "Nova versão disponível".
   - Ao clicar em "Atualizar agora", se não houver um service worker em estado de `waiting` (`hasPwaUpdate` é falso), o app cai no fallback `window.open(releaseUrl)`, abrindo a página de releases do GitHub no navegador.
   - Isso é confuso e inútil para o usuário de PWA, pois ele não pode baixar e instalar uma versão estática da web. O PWA deve ser atualizado exclusivamente pelo Service Worker recarregando os arquivos servidos pela hospedagem (Vercel).

2. **Tauri não atualiza / Diz que está na última versão**:
   - Para usuários de desktop (Tauri), quando o `UpdateDialog` global aparece e eles clicam em "Atualizar agora", o app também abre o navegador na página do GitHub em vez de realizar o download e instalação nativos. O fluxo nativo de "Baixar e Instalar" só está disponível se eles navegarem manualmente em Configurações > Atualizações.
   - Pior ainda: o endpoint do atualizador nativo do Tauri em `src-tauri/tauri.conf.json` está fixado em `https://github.com/open-mission/open-bible/releases/latest/download/latest.json`. 
   - Como o endpoint `/releases/latest` do GitHub redireciona exclusivamente para a última release **estável**, as releases marcadas como **pre-release** (com sufixo `-dev` ou `-beta`, como `0.8.4-dev`) não expõem seu arquivo `latest.json` por essa URL.
   - Com isso, o atualizador nativo do Tauri compara a versão local (ex: `0.8.2-dev.3`) com a última versão estável (ex: `0.8.1`), detecta que a versão local é mais recente do que a versão retornada por `/releases/latest`, e conclui incorretamente que "Você já está utilizando a versão mais recente!".

## 2. Objetivos
1. **PWA**: Mostrar o diálogo de atualização (`UpdateDialog`) exclusivamente quando houver uma nova versão de fato baixada pelo Service Worker (`hasPwaUpdate === true`) e pronta para ser aplicada.
2. **Tauri (Atualização Dinâmica por Canal)**:
   - Criar uma rota de API dinâmica `/api/updates/tauri` no Next.js/Hono que resolva a última versão baseando-se no canal de atualização configurado pelo cliente (passado via header `X-Update-Channel` ou inferido a partir do semver da versão atual).
   - A rota de API fará fetch na API de lançamentos do GitHub, encontrará o lançamento correto (pre-release ou estável), baixará seu arquivo `latest.json` correspondente e o servirá para o Tauri.
3. **Tauri (UI Unificada)**:
   - Centralizar o estado do atualizador nativo do Tauri no `ReleaseNotesProvider` global.
   - Adaptar o `UpdateDialog` global para exibir o progresso de download e o botão de reinicialização diretamente no diálogo para usuários do Tauri.
   - Simplificar o painel `ConfigContent` de atualizações para consumir o estado global do `ReleaseNotesProvider`.

## 3. Abordagem Proposta

### 3.1. Rota de API Dinâmica no Servidor (`lib/api/hono-app.ts`)
Criar o endpoint GET `/api/updates/tauri` para intermediar as requisições do Tauri:
- **Parâmetros**: `version`, `target`, `arch` (query string).
- **Headers**: `X-Update-Channel` (opcional).
- **Lógica**:
  1. Identificar o canal de atualização: `stable` ou `beta`. Se `X-Update-Channel` estiver presente, usar. Caso contrário, se `version` contiver `-` (pré-lançamento), usar `beta`, senão `stable`.
  2. Obter a tag do último lançamento no GitHub:
     - Se `stable`: buscar `https://api.github.com/repos/open-mission/open-bible/releases/latest`.
     - Se `beta`: buscar `https://api.github.com/repos/open-mission/open-bible/releases`, filtrar releases válidas (ignorar `draft: true`) e pegar a de maior semver.
  3. Com a tag resolvida (ex: `v0.8.4-dev`):
     - Fazer fetch em `https://github.com/open-mission/open-bible/releases/download/${tag}/latest.json` para obter o manifesto original do atualizador daquela versão.
     - Retornar o JSON retornado pelo GitHub.
     - Se não houver atualização ou a tag for igual/anterior à versão atual do cliente, retornar status `204 No Content` (ou delegar a comparação de semver para o próprio cliente Tauri).
  4. Adicionar um cache em memória simples de 5 minutos no servidor Hono para evitar esgotar a taxa de requisições da API do GitHub.

### 3.2. Configuração do Tauri (`src-tauri/tauri.conf.json`)
Substituir o endpoint estático do atualizador em `tauri.conf.json`:
```json
"endpoints": [
  "https://openbible-prod.vercel.app/api/updates/tauri?version={{current_version}}&target={{target}}&arch={{arch}}"
]
```

### 3.3. Refatorar o `ReleaseNotesProvider` (`features/release-notes/components/release-notes-provider.tsx`)
- Detectar se está rodando em ambiente Tauri (`isTauri`).
- Manter estados reativos do atualizador do Tauri:
  - `tauriStatus`: `"idle" | "checking" | "available" | "no-update" | "downloading" | "downloaded" | "error"`
  - `tauriProgress`: `number`
  - `tauriError`: `string`
- Ao executar `checkForUpdates()` no Tauri:
  - Disparar o check nativo do Tauri: `check({ headers: { "X-Update-Channel": channel } })`.
  - Se houver atualização, armazenar o objeto `Update` retornado, configurar `hasAppUpdate = true`, `latestVersion = update.version`, `changelog = update.body`.
- Expor métodos `tauriDownloadInstall` e `tauriRelaunch` para disparar e monitorar a instalação nativa.
- Adaptar o cálculo do `hasUpdate` reativo global que controla a exibição do diálogo:
  - Se for Tauri: `hasUpdate = hasAppUpdate && !isDismissed`
  - Se for PWA: `hasUpdate = hasPwaUpdate && !isDismissed` (só avisa quando o SW já baixou o novo bundle).

### 3.4. Atualizar o Diálogo de Atualizações (`features/release-notes/components/update-dialog.tsx`)
- Se for PWA: o botão de ação sempre chama `updateNow()` (recarrega para aplicar a atualização do Service Worker).
- Se for Tauri:
  - Exibir o progresso do download diretamente no diálogo.
  - O botão de ação principal alternará conforme o status da atualização:
    - `"available"`: "Baixar e Instalar"
    - `"downloading"`: Desabilitado / Mostra barra de progresso
    - `"downloaded"`: "Reiniciar Agora"
    - `"error"`: "Tentar Novamente"

### 3.5. Atualizar Tela de Configurações (`features/config/components/config-content.tsx`)
Substituir os estados locais duplicados de verificação e instalação pelo consumo direto das propriedades do `useReleaseNotes()`. Isso garante que o progresso de atualização iniciado no diálogo principal seja sincronizado caso o usuário navegue até as configurações (e vice-versa).
