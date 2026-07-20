# Plano de Implementação: Fix Tauri and PWA Updater Flows

- **Data**: 2026-07-20
- **Status**: Proposta
- **Issue**: [improve: fix updater flow in tauri and pwa #235](https://github.com/open-mission/open-bible/issues/235)

---

## 🏗️ Estrutura de Arquivos e Responsabilidades

1. **`lib/api/hono-app.ts`**
   - Adicionar rota GET `/api/updates/tauri` que resolve o último release correspondente ao canal, busca o arquivo `latest.json` correspondente no GitHub e o envia de volta ao Tauri.
   - Implementar um cache local simples de 5 minutos para os downloads de `latest.json` para evitar atingir limites de taxa de API do GitHub.

2. **`src-tauri/tauri.conf.json`**
   - Apontar o endpoint do atualizador nativo do Tauri para a nova rota `/api/updates/tauri` no servidor de produção.

3. **`features/release-notes/components/release-notes-provider.tsx`**
   - Centralizar estados e lógica do atualizador nativo do Tauri.
   - Fornecer `tauriStatus`, `tauriProgress`, `tauriError`, `tauriDownloadInstall` e `tauriRelaunch` no contexto.
   - Alterar `hasUpdate` reativo para depender de `hasAppUpdate` em ambientes Tauri e de `hasPwaUpdate` no PWA.

4. **`features/release-notes/components/update-dialog.tsx`**
   - Exibir barra de progresso e botões adequados no Tauri ("Baixar e Instalar", "Reiniciar Agora").
   - Chamar `updatePwa` no PWA e a lógica do Tauri updater no Tauri.

5. **`features/config/components/config-content.tsx`**
   - Limpar estados locais duplicados do atualizador do Tauri e consumir o contexto do `useReleaseNotes()`.

---

## 🛠️ Passo a Passo da Implementação

### Passo 1: Implementar a Rota de Atualizações Tauri na API (`lib/api/hono-app.ts`)
- Adicionar o endpoint `/api/updates/tauri`.
- Ler e validar query strings (`version`, `target`, `arch`) e o cabeçalho `X-Update-Channel`.
- Resolver a tag da release correta.
- Fazer download do manifesto `latest.json` da release correta e retornar ao cliente.
- Adicionar cache em memória de 5 minutos.

### Passo 2: Atualizar Endpoint do Atualizador no Tauri (`src-tauri/tauri.conf.json`)
- Mudar `"endpoints"` em `"plugins" > "updater"` para `https://openbible-prod.vercel.app/api/updates/tauri?version={{current_version}}&target={{target}}&arch={{arch}}`.

### Passo 3: Refatorar o ReleaseNotesProvider (`features/release-notes/components/release-notes-provider.tsx`)
- Importar as dependências e tipos do Tauri updater condicionalmente se `isTauri` for verdadeiro.
- Gerenciar os estados de download e relaunch do Tauri no contexto global.
- Ajustar lógica do `hasUpdate` para PWA e Tauri de forma separada.

### Passo 4: Atualizar UI do UpdateDialog (`features/release-notes/components/update-dialog.tsx`)
- Adaptar o componente de diálogo para ler o estado de progresso de download e status do atualizador do Tauri.
- Renderizar a UI reativa (barra de progresso e botões) para Tauri.

### Passo 5: Atualizar Tela de Configurações (`features/config/components/config-content.tsx`)
- Substituir o código local do atualizador Tauri para utilizar as propriedades globais expostas pelo `useReleaseNotes()`.

---

## 🧪 Verificação / Plano de Testes

### Verificação do Servidor (API)
- Testar localmente a chamada ao endpoint:
  `curl "http://localhost:3000/api/updates/tauri?version=0.8.2-dev.3&target=darwin&arch=aarch64" -H "X-Update-Channel: beta"`
  - Validar se retorna o JSON correto referente à release `v0.8.4-dev` ou a última pré-release disponível.
  - Testar com `X-Update-Channel: stable` e validar se retorna a estável mais recente.

### Verificação no PWA
- Rodar `pnpm dev`.
- Forçar uma atualização simulada no service worker ou validar no console que o `UpdateDialog` não se abre a menos que `hasPwaUpdate` esteja marcado como verdadeiro.

### Verificação de Compilação
- Rodar `pnpm lint` e `pnpm build` para garantir que o TypeScript e o empacotamento estão em conformidade e não há erros de tipagem introduzidos.
