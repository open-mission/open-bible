# Spec: Tauri Updater Plugin for Desktop Application

**Issue:** #165
**Date:** 2026-07-14
**Status:** Under Review

## Problem

The desktop version of Open Bible currently has no support for checking and installing updates. Users have to check the GitHub releases page manually, download the latest package, and install it. We want to automate this process by integrating the official Tauri v2 updater plugin, providing an in-app check and update workflow.

## Goals

1. Integrate the `@tauri-apps/plugin-updater` and `tauri-plugin-updater` plugins into the Tauri project.
2. Enable updater artifact creation in the Tauri build process.
3. Configure appropriate capabilities (permissions) to allow checking, downloading, installing updates, and restarting the application.
4. Expose an "Atualizações" (Updates) section in the settings tab layout (`ConfigContent`) that only displays on Tauri desktop environments.
5. Provide a check-for-updates trigger and progress UI in the settings page.

## Non-Goals

- Setting up the CI/CD pipeline secrets (`TAURI_SIGNING_PRIVATE_KEY` / `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`). The repository maintainers will handle this step inside the repository settings on GitHub.
- Automatically running update checks on application start. We will start with a manual check button in settings to give the user control, but set up the architecture to allow background checks in the future.

## Approach

### 1. Backend Integration (Rust)

* **Dependencies (`src-tauri/Cargo.toml`)**: Add `tauri-plugin-updater`.
* **Registration (`src-tauri/src/lib.rs`)**: Initialize the plugin using `.plugin(tauri_plugin_updater::Builder::new().build())` on the Tauri Builder.

### 2. Configuration (`src-tauri/tauri.conf.json`)

* Enable updater artifact generation during build:
  ```json
  "bundle": {
    "createUpdaterArtifacts": true
  }
  ```
* Configure the updater plugin under `plugins.updater`:
  * Define `pubkey` containing the public key for verifying updates (a placeholder base64 string will be used initially, to be replaced by the maintainer).
  * Configure `endpoints` to point to a remote server manifest, e.g. the standard GitHub releases endpoint for the repository:
    `https://github.com/open-mission/open-bible/releases/latest/download/latest.json`

### 3. Capabilities / Permissions (`src-tauri/capabilities/default.json`)

Tauri v2 uses an Access Control List (ACL). We must add the following permissions to the `default.json` capability:
- `updater:default`
- `updater:allow-check`
- `updater:allow-download-and-install`

*(Note: We already have `core:default`. If we need process restart permission for relaunching the app, we can use `process:allow-restart` or check if the updater's internal relaunch command handles it under `updater` permissions.)*

### 4. Frontend Integration

* **Dependency (`package.json`)**: Add `@tauri-apps/plugin-updater` package to frontend dependencies.
* **Update Interface (`features/config/components/config-content.tsx`)**:
  * Add a new tab `updates` ("Atualizações") to the vertical settings tabs list, which is conditionally rendered only if `isTauri` is true.
  * Within the Updates tab, render:
    * The current application version (retrieved via `@tauri-apps/api/app` using `getVersion()`).
    * A button to check for updates.
    * Display of checking state, update availability details (new version, release notes), download progress, and a "Relaunch / Restart" button.

## Proposed Code Changes

### Cargo.toml
Add to `[dependencies]`:
```toml
tauri-plugin-updater = "2"
```

### src-tauri/src/lib.rs
```rust
  tauri::Builder::default()
    .plugin(tauri_plugin_updater::Builder::new().build())
    .setup(|app| {
      // ...
    })
```

### src-tauri/tauri.conf.json
```json
  "bundle": {
    "createUpdaterArtifacts": true,
    ...
  },
  "plugins": {
    "updater": {
      "pubkey": "dW51c2VkX3B1YmtleV9wbGFjZWhvbGRlcl9mb3JfYnVpbGRzCg==",
      "endpoints": [
        "https://github.com/open-mission/open-bible/releases/latest/download/latest.json"
      ]
    }
  }
```

### src-tauri/capabilities/default.json
```json
  "permissions": [
    "core:default",
    "updater:default",
    "updater:allow-check",
    "updater:allow-download-and-install"
  ]
```

### UI settings addition (config-content.tsx)
Add an updater status card using Tauri's `@tauri-apps/plugin-updater` API dynamically to check for updates and update progress, wrapping calls in a check for Tauri execution.

## Risks & Mitigations

* **Build/Release Failures without Signing Key**: Local development builds do not require code signing unless the user tries to install an update. We will use a valid placeholder base64 string for `pubkey` so the build compiles correctly without blocking local development.
* **Next.js SSR Errors**: Using Tauri plugins in Next.js pages can cause SSR runtime issues because `@tauri-apps` packages expect a browser environment and specific Tauri variables. We will dynamically import the updater plugin packages or guard them with `typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window`.
