"use client"

import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable"

interface PanelLayoutProps {
  left?: React.ReactNode
  leftDefaultSize?: number
  leftMinSize?: number
  leftMaxSize?: number
  leftCollapsible?: boolean
  main: React.ReactNode
  mainMinSize?: number
  right?: React.ReactNode
  rightDefaultSize?: number
  rightMinSize?: number
  rightMaxSize?: number
  rightCollapsible?: boolean
  className?: string
}

export function PanelLayout({
  left,
  leftDefaultSize = 20,
  leftMinSize = 15,
  leftMaxSize = 25,
  leftCollapsible = false,
  main,
  mainMinSize = 30,
  right,
  rightDefaultSize = 30,
  rightMinSize = 20,
  rightMaxSize = 40,
  rightCollapsible = false,
  className,
}: PanelLayoutProps) {
  function mainDefaultSize() {
    if (left && right) return 100 - leftDefaultSize - rightDefaultSize
    if (left) return 100 - leftDefaultSize
    if (right) return 100 - rightDefaultSize
    return 100
  }

  return (
    <ResizablePanelGroup orientation="horizontal" className={`min-h-0 ${className ?? ""}`}>
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

      <ResizablePanel defaultSize={mainDefaultSize()} minSize={mainMinSize}>
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
