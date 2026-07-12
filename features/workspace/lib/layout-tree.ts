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
 * The `direction` controls how a split is created when the target is a leaf
 * (horizontal → new column, vertical → new row).
 */
export function appendLeaf(
  node: LayoutNode,
  leaf: LayoutLeaf,
  direction: LayoutDirection = "horizontal",
): LayoutNode {
  if (node.type === "leaf") {
    return makeSplit(direction, [node, leaf])
  }
  const lastIdx = node.children.length - 1
  const newChildren = [...node.children]
  newChildren[lastIdx] = appendLeaf(node.children[lastIdx], leaf, direction)
  return { ...node, children: newChildren }
}

/** Collect all pane IDs referenced by a layout tree (depth-first). */
export function collectPaneIds(node: LayoutNode): string[] {
  if (node.type === "leaf") return [node.paneId]
  return node.children.flatMap(collectPaneIds)
}

/**
 * Auto-arrange a flat list of pane IDs into a balanced grid. The `direction`
 * controls the outer orientation:
 *   - "horizontal" (columns): outer split is horizontal, columns hold panes
 *     stacked vertically. Gives side-by-side panes.
 *   - "vertical" (rows): outer split is vertical, rows hold panes side-by-side
 *     horizontally. Gives stacked panes.
 * Examples for horizontal (columns):
 *   1 -> full screen
 *   2 -> 50/50 side by side
 *   3 -> 1 left, 2 stacked right
 *   4 -> 2x2
 */
export function autoArrange(
  paneIds: string[],
  direction: LayoutDirection = "horizontal",
): LayoutNode | null {
  if (paneIds.length === 0) return null
  if (paneIds.length === 1) return makeLeaf(paneIds[0])

  const groups = Math.ceil(Math.sqrt(paneIds.length))
  const perGroup = Math.ceil(paneIds.length / groups)

  const groupNodes: LayoutNode[] = []
  for (let g = 0; g < groups; g++) {
    const start = g * perGroup
    const end = Math.min(start + perGroup, paneIds.length)
    const groupPaneIds = paneIds.slice(start, end)

    if (groupPaneIds.length === 1) {
      groupNodes.push(makeLeaf(groupPaneIds[0]))
    } else {
      const leaves = groupPaneIds.map((id) => makeLeaf(id))
      // Inner split runs opposite to the outer direction.
      const inner = direction === "horizontal" ? "vertical" : "horizontal"
      groupNodes.push(makeSplit(inner, leaves))
    }
  }

  if (groupNodes.length === 1) return groupNodes[0]
  return makeSplit(direction, groupNodes)
}