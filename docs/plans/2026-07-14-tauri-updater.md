# Plan: Tauri Updater Integration

**Goal:** Enable automatic software updates for the Open Bible desktop app using Tauri v2's updater plugin.
**Architecture:** 
- Backend: Register `tauri-plugin-updater` crate in `src-tauri/Cargo.toml` and initialize in `lib.rs`.
- Configuration: Set `createUpdaterArtifacts: true` in bundle configurations, set update manifest endpoints, and whitelist permissions in `default.json` capability.
- Frontend: Dynamically load `@tauri-apps/plugin-updater` and `@tauri-apps/api/app` to check for updates, download/install, and relaunch, rendering a dedicated tab in `ConfigContent`.
**Tech Stack:** Next.js 16 (SSG), Tauri v2 (Rust).

## File Map

| File | Change Type | Responsibility |
| --- | --- | --- |
| `src-tauri/Cargo.toml` | Modify | Add `tauri-plugin-updater` dependency. |
| `src-tauri/src/lib.rs` | Modify | Register `tauri-plugin-updater` builder. |
| `src-tauri/tauri.conf.json` | Modify | Configure updater settings and enable artifact generation. |
| `src-tauri/capabilities/default.json` | Modify | Whitelist permissions for checking, installing, and restarting the app. |
| `package.json` | Modify | Add `@tauri-apps/plugin-updater` package. |
| `features/config/components/config-content.tsx` | Modify | Add "Atualizações" vertical settings tab with update checking UI. |

---

## Tasks

### [ ] Task 1: Create Branch from `develop`
- Checkout to `develop` and update it.
- Create new branch `feat/165-tauri-updater`.
- Commands:
  ```bash
  git checkout develop
  git pull origin develop
  git checkout -b feat/165-tauri-updater
  ```

### [ ] Task 2: Install NPM dependency
- Add `@tauri-apps/plugin-updater` package to `package.json` dependencies.
- Command:
  ```bash
  pnpm add @tauri-apps/plugin-updater
  ```

### [ ] Task 3: Cargo dependencies
- Edit `src-tauri/Cargo.toml` to add `tauri-plugin-updater` dependency.
- Code difference:
  ```diff
   [dependencies]
   serde_json = "1.0"
   serde = { version = "1.0", features = ["derive"] }
   log = "0.4"
   tauri = { version = "2.11.3", features = [] }
   tauri-plugin-log = "2"
+  tauri-plugin-updater = "2"
  ```
- Command to check compilation:
  ```bash
  cargo check --manifest-path src-tauri/Cargo.toml
  ```

### [ ] Task 4: Initialize updater plugin in Rust
- Edit `src-tauri/src/lib.rs` to register the updater plugin.
- Code difference:
  ```diff
     tauri::Builder::default()
+      .plugin(tauri_plugin_updater::Builder::new().build())
       .setup(|app| {
         if cfg!(debug_assertions) {
  ```
- Command to verify compilation:
  ```bash
  cargo check --manifest-path src-tauri/Cargo.toml
  ```

### [ ] Task 5: Configure Tauri build & updater settings
- Edit `src-tauri/tauri.conf.json` to enable updater artifacts and configure plugins.
- Code difference:
  ```diff
     "identifier": "app.openbible.desktop",
     "build": {
       "frontendDist": "../out",
  ...
     },
     "app": {
  ...
     },
     "bundle": {
       "active": true,
+      "createUpdaterArtifacts": true,
       "targets": "all",
  ...
-    ]
+    ],
+    "plugins": {
+      "updater": {
+        "pubkey": "dW51c2VkX3B1YmtleV9wbGFjZWhvbGRlcl9mb3JfYnVpbGRzCg==",
+        "endpoints": [
+          "https://github.com/open-mission/open-bible/releases/latest/download/latest.json"
+        ]
+      }
+    }
   }
  ```

### [ ] Task 6: Add capabilities permissions
- Edit `src-tauri/capabilities/default.json` to allow the updater to run checks, download updates, and relaunch the process.
- Code difference:
  ```diff
     "permissions": [
-      "core:default"
+      "core:default",
+      "updater:default",
+      "updater:allow-check",
+      "updater:allow-download-and-install"
     ]
  ```

### [ ] Task 7: Integrate Frontend UI tab in `ConfigContent`
- Edit `features/config/components/config-content.tsx`:
  - Detect if running under Tauri at runtime using the `isTauri` check (imported from `@/lib/is-tauri`).
  - Add an `"updates"` tab in the settings navigation.
  - Create the update status interface. It will dynamically query `@tauri-apps/api/app` for current version and `@tauri-apps/plugin-updater` for updates.
  - Implement a manual check button, status display, and relaunch options.
  - Run linting and build validation.
- Commands:
  ```bash
  pnpm lint
  pnpm build
  ```
