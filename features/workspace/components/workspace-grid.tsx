"use client"

import { Fragment } from "react"
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable"
import { useWorkspace } from "../context/workspace-context"
import { SortableGridPane } from "./grid-pane"
import type { LayoutNode } from "../types"

/**
 * Renders the layout tree as a nestable grid of resizable panels. Leaf nodes
 * become GridPanes; split nodes become ResizablePanelGroups with drag handles
 * between children. This is the tiling-window-manager view (tmux/i3wm style).
 */
export function WorkspaceGrid() {
  const { layout, panes } = useWorkspace()

  if (!layout || panes.length === 0) return null

  return (
    <div className="h-full w-full p-1">
      <LayoutRenderer node={layout} />
    </div>
  )
}

function LayoutRenderer({ node }: { node: LayoutNode }) {
  const { panes, activePaneId, activatePane } = useWorkspace()

  if (node.type === "leaf") {
    const pane = panes.find((p) => p.id === node.paneId)
    if (!pane) return null
    return (
      <SortableGridPane
        pane={pane}
        isActive={pane.id === activePaneId}
        onActivate={() => activatePane(pane.id)}
      />
    )
  }

  // Split node → ResizablePanelGroup with handles between children.
  return (
    <ResizablePanelGroup
      key={node.id}
      orientation={node.direction}
      className="h-full w-full"
    >
      {node.children.map((child, i) => (
        <Fragment key={i}>
          {i > 0 && <ResizableHandle withHandle />}
          <ResizablePanel
            defaultSize={node.sizes[i]}
            minSize={15}
            className="min-h-0"
          >
            <LayoutRenderer node={child} />
          </ResizablePanel>
        </Fragment>
      ))}
    </ResizablePanelGroup>
  )
}