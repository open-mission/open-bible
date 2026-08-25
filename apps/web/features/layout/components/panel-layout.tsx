"use client"

import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable"

interface PanelLayoutProps {
  left?: React.ReactNode
  leftDefaultSize?: string
  leftMinSize?: string
  leftMaxSize?: string
  leftCollapsible?: boolean
  main: React.ReactNode
  mainMinSize?: string
  right?: React.ReactNode
  rightDefaultSize?: string
  rightMinSize?: string
  rightMaxSize?: string
  rightCollapsible?: boolean
  className?: string
}

export function PanelLayout({
  left,
  leftDefaultSize = "20%",
  leftMinSize = "10%",
  leftMaxSize = "50%",
  leftCollapsible = false,
  main,
  mainMinSize = "20%",
  right,
  rightDefaultSize = "30%",
  rightMinSize = "15%",
  rightMaxSize = "60%",
  rightCollapsible = false,
  className,
}: PanelLayoutProps) {
  function mainDefaultSize() {
    const leftNum = left ? parseFloat(leftDefaultSize) : 0
    const rightNum = right ? parseFloat(rightDefaultSize) : 0
    return `${100 - leftNum - rightNum}%`
  }

  return (
    <ResizablePanelGroup orientation="horizontal" className={`min-h-0 min-w-0 ${className ?? ""}`}>
      {left !== undefined && (
        <>
          <ResizablePanel
            defaultSize={leftDefaultSize}
            minSize={leftMinSize}
            maxSize={leftMaxSize}
            collapsible={leftCollapsible}
          >
            {left}
          </ResizablePanel>
          <ResizableHandle />
        </>
      )}

      <ResizablePanel defaultSize={mainDefaultSize()} minSize={mainMinSize} className="h-full min-h-0">
        {main}
      </ResizablePanel>

      {right !== undefined && (
        <>
          <ResizableHandle withHandle />
          <ResizablePanel
            defaultSize={rightDefaultSize}
            minSize={rightMinSize}
            maxSize={rightMaxSize}
            collapsible={rightCollapsible}
          >
            {right}
          </ResizablePanel>
        </>
      )}
    </ResizablePanelGroup>
  )
}

