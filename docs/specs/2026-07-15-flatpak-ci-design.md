# Spec: Linux Flatpak Build Configuration in CI/CD

**Issue:** #169
**Date:** 2026-07-15
**Status:** Under Review

## Problem

The desktop version of Open Bible currently builds packages for Windows (`.msi`, `.nsis`), macOS (`.dmg`), and Linux (`.deb`, `.AppImage`). However, Flatpak has become a standard format for packaging and distributing Linux desktop applications due to its runtime sandboxing and compatibility across different distributions (such as Fedora Silverblue, SteamOS, and Ubuntu). We need to configure a CI pipeline to generate a `.flatpak` bundle and attach it to our GitHub Releases automatically when a release is triggered.

## Goals

1. Define a Flatpak builder manifest (`flatpak/app.openbible.desktop.yml`) with appropriate sandboxing rules.
2. Provide standard Linux desktop integration files:
   - A `.desktop` launcher configuration (`flatpak/app.openbible.desktop.desktop`).
   - An AppStream metadata descriptor (`flatpak/app.openbible.desktop.metainfo.xml`).
3. Update `.github/workflows/desktop-release.yml` to build the Flatpak bundle and attach it to the GitHub Release on the Linux runner.
4. Minimize CI build overhead by packaging the precompiled binary produced by the standard `tauri-action` build step.

## Non-Goals

- Publishing the app to the official Flathub registry automatically. Flathub submissions require their own dedicated repository and PR process. We will compile the `.flatpak` file and make it available as a download on the GitHub release.
- Supporting architectures other than x86_64 initially.

## Approach

### 1. Flatpak Assets (`flatpak/`)

We will create a `flatpak/` folder in the project root containing:
* **`app.openbible.desktop.yml`**: The builder manifest. We will use the Gnome 46 Platform and SDK (`org.gnome.Platform` and `org.gnome.Sdk`) since they bundle GTK3 and `webkit2gtk-4.1` (the exact dependencies Tauri needs).
* **`app.openbible.desktop.desktop`**: The standard freedesktop entry file.
* **`app.openbible.desktop.metainfo.xml`**: The AppData spec file containing descriptions, metadata, and screenshots (recommended/required by Flatpak packaging tools).

### 2. Sandbox Permissions (finish-args)

Tauri runs in a Webview. The sandbox permissions needed include:
- `socket=wayland` and `socket=fallback-x11`: To display the graphical user interface.
- `device=dri`: For hardware graphics acceleration inside the webview.
- `share=ipc`: Inter-process communication.
- `share=network`: The application needs internet access to check for updates, sign in, and download Bible translations from remote TursoDB/R2 databases.
- `talk-name=org.freedesktop.Notifications`: To show desktop notifications if needed.

### 3. CI Pipeline Integration

We will append Flatpak packaging steps to the `ubuntu-24.04` runner inside the existing `Desktop Release` workflow (`.github/workflows/desktop-release.yml`).
After the `Build and release desktop app` step completes, the runner will:
1. Install `flatpak` and `flatpak-builder`.
2. Add the Flathub repository and install the Gnome 46 Platform and SDK.
3. Prepare a packaging directory `flatpak/build/` containing:
   - The compiled binary: `src-tauri/target/release/open-bible`.
   - The `.desktop` and `.xml` files.
   - Icons from `src-tauri/icons/`.
4. Build the Flatpak app via `flatpak-builder`.
5. Export the Flatpak into a single `.flatpak` bundle.
6. Upload the `.flatpak` file to the GitHub Release via `gh release upload`.

## Proposed Code Changes

### `flatpak/app.openbible.desktop.yml`
```yaml
id: app.openbible.desktop
runtime: org.gnome.Platform
runtime-version: '46'
sdk: org.gnome.Sdk
command: open-bible
finish-args:
  - --socket=wayland
  - --socket=fallback-x11
  - --device=dri
  - --share=ipc
  - --share=network
  - --talk-name=org.freedesktop.Notifications
modules:
  - name: open-bible
    buildsystem: simple
    build-commands:
      - install -D open-bible /app/bin/open-bible
      - install -D app.openbible.desktop.desktop /app/share/applications/app.openbible.desktop.desktop
      - install -D icon_128.png /app/share/icons/hicolor/128x128/apps/app.openbible.desktop.png
      - install -D icon_512.png /app/share/icons/hicolor/512x512/apps/app.openbible.desktop.png
      - install -D app.openbible.desktop.metainfo.xml /app/share/metainfo/app.openbible.desktop.metainfo.xml
    sources:
      - type: dir
        path: build
```

### `flatpak/app.openbible.desktop.desktop`
```ini
[Desktop Entry]
Type=Application
Name=Open Bible
Comment=Leitor bíblico offline-first com suporte a múltiplas versões
Exec=open-bible
Icon=app.openbible.desktop
Terminal=false
Categories=Utility;Religion;
```

### `flatpak/app.openbible.desktop.metainfo.xml`
```xml
<?xml version="1.0" encoding="UTF-8"?>
<component type="desktop-application">
  <id>app.openbible.desktop</id>
  <metadata_license>CC0-1.0</metadata_license>
  <project_license>MIT</project_license>
  <name>Open Bible</name>
  <summary>Leitor bíblico offline-first</summary>
  <description>
    <p>
      Open Bible é um leitor bíblico offline-first para desktop. Permite carregar e estudar diferentes traduções da Bíblia sem necessidade de conexão contínua com a internet.
    </p>
  </description>
  <launchable type="desktop-id">app.openbible.desktop.desktop</launchable>
  <developer_name>Open Mission</developer_name>
  <url type="homepage">https://github.com/open-mission/open-bible</url>
</component>
```

### `.github/workflows/desktop-release.yml`
Add steps to install tools, run `flatpak-builder`, and upload the `.flatpak` asset.

## Risks & Mitigations

- **Dynamic Linker Errors**: If the precompiled binary references system libraries not present in the Gnome 46 runtime, it will crash on startup. Since the binary is built on Ubuntu 24.04 and Gnome 46 runs on a comparable base (Debian/Ubuntu packages of libraries), typical GTK/WebKit dependencies are 100% compatible. We will verify compile and linking dynamically.
- **Large Download Size**: Downloading the Gnome Platform/Sdk on the runner takes time. We will cache the Flatpak runtimes if possible, or accept the ~1-2 min pull time which is very small compared to the total Tauri compilation time (~10-15 min).
