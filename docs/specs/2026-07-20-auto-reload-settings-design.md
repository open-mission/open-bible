# Design Spec: Auto-Reload UI when Settings Change

## Contexto & Problema
Quando o usuário altera configurações no aplicativo (como versão bíblica padrão, modo de leitura/workspace, layout do workspace, orientação de abas ou comportamento visual dos destaques), essas configurações são persistidas imediatamente no `localStorage`. No entanto, elas só entram em vigor após uma recarga completa da página (Cmd+R / Ctrl+R ou reinicialização do app).

Em modo PWA instalado ou no desktop via Tauri, não há barra de navegação/botão de atualizar visível, e os atalhos de teclado nem sempre funcionam ou são intuitivos, impossibilitando que usuários comuns vejam as configurações aplicadas.

## Abordagens Consideradas

### Abordagem 1: Auto-Reload Automático (Imediato)
Recarregar a página automaticamente via JS (`window.location.reload()`) após um pequeno delay (ex: 500ms) toda vez que uma configuração persistente for alterada.
* **Prós**: Zero cliques para o usuário aplicar as mudanças.
* **Contras**: Se o usuário estiver alterando múltiplas configurações de uma vez (ex: mudando a versão padrão e em seguida mudando a orientação das abas), a primeira alteração vai disparar o reload e interromper o fluxo do usuário antes que ele termine de ajustar as outras preferências.

### Abordagem 2: Notificação Toast com Ação ("Recarregar") (Recomendada)
Exibir um toast via `sonner` com a mensagem *"Configuração alterada. Recarregar para aplicar?"* contendo um botão de ação *"Recarregar"*. O toast persiste até o usuário interagir ou fechar a janela de configurações. Usando um `id` único no toast (`settings-reload-toast`), múltiplos cliques em configurações apenas atualizam ou mantém o mesmo toast sem duplicar alertas na tela.
* **Prós**: Extremamente elegante, não-intrusivo, permite que o usuário faça múltiplos ajustes e depois clique uma única vez para recarregar tudo, funciona perfeitamente em dispositivos móveis e desktop.
* **Contras**: Requer um clique extra (mas opcional/informativo).

## Design Proposto (Abordagem 2)

### 1. Novo utilitário em `lib/settings-toast.ts`
Criar uma função helper simples que dispara o toast do `sonner` usando um ID fixo para prevenir duplicações:

```typescript
import { toast } from "sonner"

export function triggerReloadToast() {
  toast("Configurações salvas. Deseja recarregar o aplicativo para aplicar as mudanças?", {
    id: "settings-reload-toast",
    duration: Infinity,
    action: {
      label: "Recarregar",
      onClick: () => {
        if (typeof window !== "undefined") {
          window.location.reload()
        }
      },
    },
  })
}
```

### 2. Integração nos pontos de mutação
Importar e chamar `triggerReloadToast()` sempre que as seguintes configurações forem modificadas:
1. **Default Bible Version**: `setDefaultVersionId` em `features/bible-reader/context/bible-version-context.tsx`.
2. **Workspace Mode / Layout / Tabs Orientation**: `setMode`, `setLayout` e `setTabsOrientation` em `features/workspace/hooks/use-workspace-mode.ts`.
3. **Highlights Visual Configs**: `updateGutterPosition`, `updateMobileInteraction` e `updateDesktopInteraction` em `features/config/components/config-content.tsx`.

## Plano de Testes
1. **Manual**:
   - Abrir o painel de configurações.
   - Alterar a versão bíblica padrão. Verificar se o toast "Configurações salvas..." aparece com o botão "Recarregar".
   - Clicar em outras configurações (ex: Modo de leitura). Verificar que o toast não se multiplica (continua apenas um ativo).
   - Clicar em "Recarregar". Verificar se a página recarrega e aplica as configurações corretas.
2. **Automatizado**:
   - Rodar `pnpm lint` e `pnpm build` para validar compilação.
