"use client"

import { PanelLayout } from "@/features/layout/components/panel-layout"

export default function TestPanelPage() {
  return (
    <div className="h-dvh w-full">
      <PanelLayout
        left={
          <div className="h-full bg-red-100 p-4 flex flex-col gap-2">
            <h2 className="text-sm font-bold text-red-700">LEFT PANEL</h2>
            <p className="text-xs text-red-600">
              Arraste o handle para redimensionar. Max 50%.
            </p>
            <div className="flex-1 bg-red-200/50 rounded p-2 text-xs text-red-500">
              Conteúdo de teste aqui
            </div>
          </div>
        }
        main={
          <div className="h-full bg-blue-100 p-4 flex flex-col gap-2">
            <h2 className="text-sm font-bold text-blue-700">MAIN PANEL</h2>
            <p className="text-xs text-blue-600">
              Conteúdo principal. Min 30%.
            </p>
            <div className="flex-1 bg-blue-200/50 rounded p-2 text-xs text-blue-500">
              Área de leitura
            </div>
          </div>
        }
        right={
          <div className="h-full bg-green-100 p-4 flex flex-col gap-2">
            <h2 className="text-sm font-bold text-green-700">RIGHT PANEL</h2>
            <p className="text-xs text-green-600">
              Inspector. Max 60%.
            </p>
            <div className="flex-1 bg-green-200/50 rounded p-2 text-xs text-green-500">
              Notas e referências
            </div>
          </div>
        }
      />
    </div>
  )
}
