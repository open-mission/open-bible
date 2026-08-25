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
