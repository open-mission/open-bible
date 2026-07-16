# Spec: Vertical Tabs in Sidebar

Implement support for vertical tabs in a lateral sidebar within the Advanced Workspace. Users will be able to choose between horizontal tabs (at the top) and vertical tabs (in a sidebar). This choice can be set in Preferences or toggled quickly via a right-click context menu.

## Requirements

1. **Orientation Setting**:
   - A new setting `tabsOrientation` with values `"horizontal"` (default) or `"vertical"`.
   - Persisted in `localStorage` under key `openbible:tabs-orientation`.
   - Exposed via the `useWorkspaceMode` hook.

2. **Sidebar View (`"vertical"`)**:
   - When vertical tabs are selected, render a sidebar on the left side of the workspace.
   - Leverage the shadcn/ui `<Sidebar>` component.
   - Display a vertical list of all open workspace panes (tabs).
   - support vertical drag-and-drop reordering using `@dnd-kit/sortable` and `verticalListSortingStrategy`.
   - Each tab item should display:
     - Drag grip handle (only if multiple tabs are open).
     - Title of the pane.
     - Active/inactive state visual treatment.
     - Close button (X) on hover/focus to close the pane.
   - Sidebar header: App Title ("Open Bible") + add button ("+") to quickly open a new pane.
   - Sidebar footer: Config button + Theme toggle.
   - The sidebar should be collapsible (collapsible="icon" or similar) on desktop to save space.

3. **Desktop Header updates**:
   - If `tabsOrientation === "vertical"`, hide the horizontal `<WorkspaceTabs />` component from the top desktop header.
   - Keep the other header tools (Safari-style overview toggle, plus button/toolbar, config button, header collapse button) or adapt them cleanly.

4. **Settings Panel Integration**:
   - Update `WorkspaceModeSetting` component under the "Leitura" tab in Preferences.
   - Add a configuration section: "Orientação das Abas" with two cards/options:
     - **Horizontal**: "Abas no topo da página (estilo navegador)"
     - **Vertical**: "Abas na lateral esquerda (estilo barra lateral)"

5. **Right-Click Context Menu**:
   - Wrap the tab bar area (both the horizontal tabs container and the vertical tabs container) in a shadcn/ui `<ContextMenu>`.
   - Provide menu options:
     - **Abas no Topo**: sets orientation to `"horizontal"`.
     - **Abas na Lateral**: sets orientation to `"vertical"`.
     - **Visualização**: toggles between "Abas" and "Grade" (optional/nice helper).

6. **Responsive behavior**:
   - On mobile screens, vertical sidebar is hidden. Mobile continues using the `WorkspaceMobileBar` (bottom tab list).

## Architecture & File Map

- `features/workspace/hooks/use-workspace-mode.ts`:
  - Add `tabsOrientation` state and `setTabsOrientation`.
- `features/workspace/components/workspace-sidebar.tsx` (new):
  - Component rendering the vertical tabs sidebar using `@components/ui/sidebar`.
- `features/workspace/components/workspace-view.tsx`:
  - Wrap the main workspace layout in `<SidebarProvider>` when vertical tabs are active.
  - Dynamically pass the reorder strategy (`horizontalListSortingStrategy` vs `verticalListSortingStrategy`) to `<SortableContext>`.
  - Add right-click context menu triggers.
- `features/workspace/components/workspace-mode-setting.tsx`:
  - Add UI controls to choose tabs orientation.
- `features/config/components/config-content.tsx`:
  - Ensure the Settings tab renders the updated setting.
