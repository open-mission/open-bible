# Implementation Plan: Normalize MSI version for Windows targets

Ensure that Windows MSI bundles compile successfully for pre-releases by stripping the alphanumeric pre-release identifier from the version strings in `package.json`, `tauri.conf.json`, and `Cargo.toml` before the Tauri build action runs.

## Proposed Changes

### GitHub Workflows

#### [MODIFY] [desktop-release.yml](file:///Users/claudio/Projects/open-bible/.github/workflows/desktop-release.yml)
- Add a new build step `Normalize version for MSI/Windows` right before `Build and release desktop app` (around line 87).
- The new step will use node script shell execution to:
  1. Parse `package.json` version, split by `-` and take the first part as `cleanVersion`.
  2. Write `cleanVersion` back to `package.json`.
  3. Parse `src-tauri/tauri.conf.json`, set `version` property to `cleanVersion`, and write back.
  4. Parse `src-tauri/Cargo.toml`, replace `version = "..."` with `version = "${cleanVersion}"`, and write back.

## Verification Plan

### Automated Tests
- Validate GitHub Actions workflow file syntax.
