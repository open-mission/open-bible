"use client"

import { useState, useCallback } from "react"

export function usePanelState() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [inspectorOpen, setInspectorOpen] = useState(false)
  const [activeNav, setActiveNav] = useState<string | null>("library")

  const handleNavClick = useCallback((navId: string) => {
    setActiveNav(navId)
  }, [])

  return {
    sidebarOpen, setSidebarOpen,
    sidebarCollapsed, setSidebarCollapsed,
    inspectorOpen, setInspectorOpen,
    activeNav, setActiveNav,
    handleNavClick,
  }
}
