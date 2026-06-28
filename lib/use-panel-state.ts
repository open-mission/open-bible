"use client"

import { useState, useCallback } from "react"

export function usePanelState() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [inspectorOpen, setInspectorOpen] = useState(false)
  const [secondarySidebarOpen, setSecondarySidebarOpen] = useState(false)
  const [secondarySidebarTab, setSecondarySidebarTab] = useState<"highlights" | "notes">("highlights")
  const [activeNav, setActiveNav] = useState<string | null>("library")

  const handleNavClick = useCallback((navId: string) => {
    setActiveNav(navId)
    if (navId === "highlights") {
      setSecondarySidebarTab("highlights")
      setSecondarySidebarOpen(true)
    } else if (navId === "notes") {
      setSecondarySidebarTab("notes")
      setSecondarySidebarOpen(true)
    } else {
      setSecondarySidebarOpen(false)
    }
  }, [])

  const handleSecondaryClose = useCallback(() => {
    setSecondarySidebarOpen(false)
    setActiveNav(null)
  }, [])

  return {
    sidebarOpen, setSidebarOpen,
    sidebarCollapsed, setSidebarCollapsed,
    inspectorOpen, setInspectorOpen,
    secondarySidebarOpen, setSecondarySidebarOpen,
    secondarySidebarTab, setSecondarySidebarTab,
    activeNav, setActiveNav,
    handleNavClick, handleSecondaryClose,
  }
}
