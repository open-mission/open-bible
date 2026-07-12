import type {
  LayoutNode,
  LayoutLeaf,
  LayoutSplit,
  LayoutDirection,
} from "../types"

/**
 * Pure helper functions for manipulating the layout tree (tiling grid).
 * These are framework-agnostic — the React context layer calls them and
 * manages state. The tree is a binary-ish structure: leaves hold pane IDs,
 * splits hold children with relative sizes.
 */

let splitIdCounter = 0
function nextSplitId(): string {
  return `split-${Date.now()}-${splitIdCounter++}`
}

export function makeLeaf(paneId: string): LayoutLeaf {
  return { type: "leaf", paneId }
}

export function makeSplit(
  direction: LayoutDirection,
  children: LayoutNode[],
): LayoutSplit {
  const n = children.length
  const base = Math.floor(100 / n)
  const sizes = Array(n).fill(base)
  // Adjust last element so the sum is exactly 100.
  sizes[n - 1] = 100 - base * (n - 1)
  return { type: "split", id: nextSplitId(), direction, children, sizes }
}

/** Replace a leaf identified by paneId with `replacement`. Returns a new tree. */
export function replaceLeaf(
  node: LayoutNode,
  paneId: string,
  replacement: LayoutNode,
): LayoutNode {
  if (node.type === "leaf") {
    return node.paneId === paneId ? replacement : node
  }
  return {
    ...node,
    children: node.children.map((c) => replaceLeaf(c, paneId, replacement)),
  }
}

/**
 * Remove a leaf by paneId. Collapses splits that end up with a single child
 * (so the tree stays tidy, like tmux). Returns null if the tree becomes empty.
 */
export function removeLeaf(
  node: LayoutNode,
  paneId: string,
): LayoutNode | null {
  if (node.type === "leaf") {
    return node.paneId === paneId ? null : node
  }
  const newChildren = node.children
    .map((c) => removeLeaf(c, paneId))
    .filter((c): c is LayoutNode => c !== null)

  if (newChildren.length === 0) return null
  // Collapse: a split with one child is just that child.
  if (newChildren.length === 1) return newChildren[0]
  return { ...node, children: newChildren }
}

/**
 * Append a leaf to the deepest-rightmost position in the tree. Used when adding
 * a pane in tabs mode so the layout tree stays in sync for a future grid switch.
 */
export function appendLeaf(
  node: LayoutNode,
  leaf: LayoutLeaf,
): LayoutNode {
  if (node.type === "leaf") {
    return makeSplit("horizontal", [node, leaf])
  }
  const lastIdx = node.children.length - 1
  const newChildren = [...node.children]
  newChildren[lastIdx] = appendLeaf(node.children[lastIdx], leaf)
  return { ...node, children: newChildren }
}

/** Collect all pane IDs referenced by a layout tree (depth-first). */
export function collectPaneIds(node: LayoutNode): string[] {
  if (node.type === "leaf") return [node.paneId]
  return node.children.flatMap(collectPaneIds)
}

/**
 * Auto-arrange a flat list of pane IDs into a balanced grid. Columns are
 * ceil(sqrt(n)); each column is a vertical split of its panes. This gives:
 *   1 -> full screen
 *   2 -> 50/50 side by side
 *   3 -> 1 left, 2 stacked right
 *   4 -> 2x2
 */
export function autoArrange(paneIds: string[]): LayoutNode | null {
  if (paneIds.length === 0) return null
  if (paneIds.length === 1) return makeLeaf(paneIds[0])

  const columns = Math.ceil(Math.sqrt(paneIds.length))
  const perColumn = Math.ceil(paneIds.length / columns)

  const columnNodes: LayoutNode[] = []
  for (let c = 0; c < columns; c++) {
    const start = c * perColumn
    const end = Math.min(start + perColumn, paneIds.length)
    const colPaneIds = paneIds.slice(start, end)

    if (colPaneIds.length === 1) {
      columnNodes.push(makeLeaf(colPaneIds[0]))
    } else {
      const leaves = colPaneIds.map((id) => makeLeaf(id))
      columnNodes.push(makeSplit("vertical", leaves))
    }
  }

  if (columnNodes.length === 1) return columnNodes[0]
  return makeSplit("horizontal", columnNodes)
}