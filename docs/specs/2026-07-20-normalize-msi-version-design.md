# Design Spec: Normalize MSI version for Windows targets

## Current Problem
During the Desktop Release GitHub Action workflow, when building a pre-release version of the app (e.g. `0.8.3-dev`), the MSI bundler on Windows fails with:
`optional pre-release identifier in app version must be numeric-only and cannot be greater than 65535 for msi target`
This is because MSI installers strictly require numeric version components.

## Proposed Solution
We will add a step in `.github/workflows/desktop-release.yml` immediately before the Tauri build action.
This step will dynamically modify `package.json`, `src-tauri/tauri.conf.json`, and `src-tauri/Cargo.toml` on the runner workspace to remove any alphanumeric pre-release tags (e.g., `0.8.3-dev` -> `0.8.3`).

Since this modification is done in-place on the runner, it does not affect the Git tag or git history, but it ensures that the generated MSI installer has a valid, strictly numeric version.

## Verification
- Validate the schema changes in `.github/workflows/desktop-release.yml`.
