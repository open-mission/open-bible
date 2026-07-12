"use client"

import { usePathname, useRouter } from "next/navigation"
import { IconBook, IconSettings } from "@tabler/icons-react"

interface MobileNavProps {
  activeNav: string | null
  onNavClick: (navId: string) => void
  /** Hide the settings (Ajustes) tab — used by the workspace, which has its own settings entry. */
  hideConfig?: boolean
}

export function MobileNav({ activeNav, onNavClick, hideConfig }: MobileNavProps) {
  const router = useRouter()
  const pathname = usePathname()

  const navItems = [
    {
      id: "library",
      label: "Bíblia",
      icon: IconBook,
      onClick: () => {
        if (pathname !== "/") {
          router.push("/")
        } else {
          onNavClick("library")
        }
      },
      isActive: pathname === "/" && activeNav === "library",
    },
    ...(hideConfig
      ? []
      : [
          {
            id: "config",
            label: "Ajustes",
            icon: IconSettings,
            onClick: () => router.push("/config"),
            isActive: pathname === "/config",
          },
        ]),
  ]

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background/95 backdrop-blur-md pb-[env(safe-area-inset-bottom)] h-[calc(3.5rem+env(safe-area-inset-bottom))]">
      <nav className="flex h-14 items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.id}
              onClick={item.onClick}
              className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-[10px] font-medium transition-colors ${
                item.isActive
                  ? "text-primary font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-5 w-5 mb-0.5" />
              <span>{item.label}</span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}
