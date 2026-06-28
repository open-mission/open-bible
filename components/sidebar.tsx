"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  Settings,
  FileText,
  X,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { useAppTheme } from "@/components/theme-provider";

interface NavItem {
  id: string
  icon: any
  label: string
}

const NAV_ITEMS: NavItem[] = [
  { id: "library", icon: BookOpen, label: "Bible" },
  { id: "notes", icon: FileText, label: "Notas" },
]

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
  onNavClick: (navId: string) => void
  activeNav: string | null
  sidebarCollapsed?: boolean
  onToggleSidebar?: () => void
}

export function Sidebar({
  isOpen,
  onClose,
  onNavClick,
  activeNav,
  sidebarCollapsed,
  onToggleSidebar,
}: SidebarProps) {
  const { isDark, setTheme } = useAppTheme();
  const router = useRouter();

  const [sidebarWidth, setSidebarWidth] = useState(240);
  const isResizing = useRef(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("openbible:sidebar-width");
      if (saved) setSidebarWidth(Number(saved));
    } catch { /* ignore */ }
  }, []);

  function handleMouseDown(e: React.MouseEvent) {
    e.preventDefault();
    isResizing.current = true;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  }

  useEffect(() => {
    const sidebarWidthRef = { current: sidebarWidth };
    function handleMouseMove(e: MouseEvent) {
      if (!isResizing.current) return;
      const newWidth = Math.min(420, Math.max(200, e.clientX));
      setSidebarWidth(newWidth);
      sidebarWidthRef.current = newWidth;
    }
    function handleMouseUp() {
      if (isResizing.current) {
        isResizing.current = false;
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
        try { localStorage.setItem("openbible:sidebar-width", String(sidebarWidthRef.current)); } catch { /* ignore */ }
      }
    }
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [sidebarWidth]);

  const content = (
    <div className="flex h-full w-full flex-col bg-sidebar">
      {/* Header */}
      <div className="px-3 py-4 flex items-center justify-between border-b border-sidebar-border">
        <h1 className="text-sm font-semibold tracking-tight">Open Bible</h1>
        <div className="flex items-center gap-1">
          <button
            onClick={onClose}
            aria-label="Fechar menu"
            className="md:hidden flex items-center justify-center w-6 h-6 rounded-md text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              aria-label={sidebarCollapsed ? "Expandir sidebar" : "Recolher sidebar"}
              className="hidden md:flex items-center justify-center w-6 h-6 rounded-md text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors"
            >
              {sidebarCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-2 space-y-0.5">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavClick(item.id)}
            className={`flex items-center gap-2.5 px-2.5 py-1.5 text-sm rounded-md transition-colors w-full ${
              activeNav === item.id
                ? "bg-accent text-accent-foreground font-medium"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            }`}
          >
            <item.icon className="h-4 w-4 shrink-0" />
            <span className="truncate">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-sidebar-border">
        <div className="px-2 py-2">
          <div className="flex items-center gap-2 rounded-md px-2 py-1.5 mb-1">
            <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-[8px] font-bold text-primary-foreground shrink-0">
              OB
            </div>
            <span className="text-xs font-medium truncate">Open Bible</span>
          </div>
          <div className="flex items-center justify-between gap-1">
            <button
              onClick={() => setTheme(isDark ? "light" : "dark")}
              className="flex-1 rounded-md px-2 py-1 text-[11px] text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors"
            >
              {isDark ? "☀️ Claro" : "🌙 Escuro"}
            </button>
            <button
              onClick={() => router.push("/config")}
              className="rounded-md px-2 py-1 text-[11px] text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors"
            >
              <Settings className="h-3.5 w-3.5 inline-block" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <aside
        className={`hidden md:flex shrink-0 border-r border-border h-full flex-col overflow-hidden relative transition-[width] duration-200 ${sidebarCollapsed ? "w-0 border-0 overflow-hidden" : ""}`}
        style={sidebarCollapsed ? undefined : { width: sidebarWidth }}
      >
        {content}
        {!sidebarCollapsed && (
          <div
            className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-primary/30 active:bg-primary/50 transition-colors z-10 hidden md:block"
            onMouseDown={handleMouseDown}
          />
        )}
      </aside>

      {isOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <div
            className="absolute inset-0 bg-foreground/20 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />
          <div className="relative z-50 w-full max-w-sm h-full flex flex-col shadow-xl bg-sidebar">
            {content}
          </div>
        </div>
      )}
    </>
  );
}
