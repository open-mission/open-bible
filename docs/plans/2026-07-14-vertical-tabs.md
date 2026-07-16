# Plan: Vertical Tabs in Sidebar

Enable vertical tabs in a sidebar layout for the advanced workspace, with right-click context menu and settings configurations.

## Architecture

- **State Management**: Extends `useWorkspaceMode` hook with `tabsOrientation` state and `setTabsOrientation`.
- **Layout Management**: Wraps `WorkspaceView` in `<SidebarProvider>` from shadcn UI in vertical tabs mode, rendering a new `WorkspaceSidebar` component on the left side of the workspace.
- **Drag & Drop**: Automatically switches `@dnd-kit/sortable` strategy to `verticalListSortingStrategy` if `tabsOrientation` is `"vertical"`.
- **Context Menu**: Wraps tab containers in shadcn's `<ContextMenu>` to allow right-click toggling between top and side tab orientations.

## File Changes

- `features/workspace/hooks/use-workspace-mode.ts` (Modify):
  - Add `TabsOrientation` type and state hook logic.
- `features/workspace/components/workspace-sidebar.tsx` (Create):
  - Sidebar container component rendering vertical sortable tabs.
- `features/workspace/components/workspace-view.tsx` (Modify):
  - Handle conditional layout wrapping with `<SidebarProvider>` and dynamic DnD strategy.
  - Implement context menu wrapper.
- `features/workspace/components/workspace-mode-setting.tsx` (Modify):
  - Add settings inputs for tabs orientation.

## Implementation Tasks

### 1. Hook Extension
- [ ] Edit [use-workspace-mode.ts](file:///Users/claudio/Projects/open-bible/features/workspace/hooks/use-workspace-mode.ts):
  - Add `TabsOrientation = "horizontal" | "vertical"` type.
  - Define `TABS_ORIENTATION_KEY = "openbible:tabs-orientation"`.
  - Add `tabsOrientation` state and `setTabsOrientation` callback. Load/save from `localStorage`.
  - Expose `tabsOrientation` and `setTabsOrientation` in return object.

### 2. Workspace Mode Setting UI
- [ ] Edit [workspace-mode-setting.tsx](file:///Users/claudio/Projects/open-bible/features/workspace/components/workspace-mode-setting.tsx):
  - Import `tabsOrientation` and `setTabsOrientation` from `useWorkspaceMode`.
  - Render orientation selection card if `mode === "advanced"`. Use icons from `lucide-react` (e.g. `LayoutHeader` or `Columns2` vs `LayoutSidebar` or `Rows3`).

### 3. Create Workspace Sidebar
- [ ] Create [workspace-sidebar.tsx](file:///Users/claudio/Projects/open-bible/features/workspace/components/workspace-sidebar.tsx):
  - Import necessary shadcn sidebar primitives, icons (`IconGripVertical`, `X`, etc.), and `@dnd-kit/sortable` hooks (`useSortable`).
  - Implement `<WorkspaceSidebar>` rendering the list of panes as vertical tabs.
  - Implement `<SortableSidebarTab>` to render each tab item with custom drag grip, pane title, close button, and active/inactive styling.
  - Wrap the tab list container in a `<ContextMenu>` to allow orientation toggles.

### 4. Integration in Workspace View & DnD Strategy
- [ ] Edit [workspace-view.tsx](file:///Users/claudio/Projects/open-bible/features/workspace/components/workspace-view.tsx):
  - Import `useWorkspaceMode`, `<SidebarProvider>`, `<SidebarInset>` and `<WorkspaceSidebar>`.
  - Import `verticalListSortingStrategy` from `@dnd-kit/sortable`.
  - Conditionally wrap the workspace UI in `<SidebarProvider>` if `tabsOrientation === "vertical"`.
  - Feed the correct `strategy` to `SortableContext` depending on `tabsOrientation`.
  - Hide `<WorkspaceTabs />` from the top desktop header if `tabsOrientation === "vertical"`.
  - Wrap the horizontal tabs area in a `<ContextMenu>` for top-to-side switching.

### 5. Verification & Cleanup
- [ ] Run `pnpm lint` and `pnpm build` to check for compilation or lint errors.
- [ ] Test reordering tabs vertically and horizontally.
- [ ] Verify right-click toggle updates the layout seamlessly.
- [ ] Verify Preferences pane correctly updates the option.
