# Plan: Linux Flatpak Build Configuration in CI/CD

We will configure GitHub Actions to build and release a Flatpak bundle of our desktop app for Linux x86_64, attaching it to our releases.

## User Review Required

We are modifying `.github/workflows/desktop-release.yml`. Runtimes (Gnome 46 Platform and Sdk) will be downloaded on-the-fly during release builds on the Linux runner. This adds about 1-2 minutes to release workflows, but ensures we build the Flatpak correctly without sandboxing issues.

## Proposed Changes

### [Flatpak Assets]

We will create a new directory `flatpak/` to store Flatpak manifest and Linux desktop metadata.

#### [NEW] [app.openbible.desktop.yml](file:///Users/claudio/Projects/open-bible/flatpak/app.openbible.desktop.yml)
Flatpak build manifest.

#### [NEW] [app.openbible.desktop.desktop](file:///Users/claudio/Projects/open-bible/flatpak/app.openbible.desktop.desktop)
Linux Desktop entry launcher.

#### [NEW] [app.openbible.desktop.metainfo.xml](file:///Users/claudio/Projects/open-bible/flatpak/app.openbible.desktop.metainfo.xml)
AppStream component metadata.

---

### [CI Release Workflow]

#### [MODIFY] [desktop-release.yml](file:///Users/claudio/Projects/open-bible/.github/workflows/desktop-release.yml)
Append Flatpak installation, flatpak-builder packaging, and upload steps to the `ubuntu-24.04` matrix run.

## Verification Plan

### Automated / Manual Verification
1. Review the workflow file changes with `pnpm lint`.
2. Inspect the created Flatpak manifest and configuration files.
3. Test building the flatpak package locally if Flatpak is installed (using flatpak-builder).
4. Run a simulation of the CI release or review it in a pull request.
