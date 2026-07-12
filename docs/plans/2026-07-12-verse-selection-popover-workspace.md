# Implementation Plan: Fix VerseSelectionPopover Visibility in Workspace Panes

Goal: Fix the verse selection popover visibility inside workspace panes (Advanced Workspace).

## Proposed Changes

### Workspace Feature

#### [MODIFY] [bible-pane-view.tsx](file:///Users/claudio/Projects/open-bible/features/workspace/components/bible-pane-view.tsx)

- Update `SidebarProvider` className:
```diff
-        <SidebarProvider open={false} className="h-full">
+        <SidebarProvider open={false} className="h-full min-h-0">
```

## Tasks

- [ ] Create git branch `fix/136-popover-visibility` from `develop`
- [ ] Modify `bible-pane-view.tsx` to add `min-h-0` to the `SidebarProvider` wrapper
- [ ] Run `pnpm lint` and `pnpm build` to verify correctness
- [ ] Create a semantic commit `fix: resolve verse selection popover visibility in workspace panes`
- [ ] Open PR to `develop` referencing the issue
