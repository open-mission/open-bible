# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).









## [0.7.3] - 2026-07-15

### Changed
- Release version 0.7.3 from 0.7.1

[0.7.3]: https://github.com/open-mission/open-bible/compare/0.7.3...0.7.3

## [0.7.1] - 2026-07-14

### Fixed
- Release version 0.7.1 from 0.7.0

[0.7.1]: https://github.com/open-mission/open-bible/compare/0.7.1...0.7.1

## [0.7.0] - 2026-07-14

### Added
- Release version 0.7.0 from 0.6.2

[0.7.0]: https://github.com/open-mission/open-bible/compare/0.7.0...0.7.0

## [0.6.2] - 2026-07-13

### Changed
- Release version 0.6.2 from 0.6.1 (Tauri macOS header alignment and mobile safe area adjustments)

[0.6.2]: https://github.com/open-mission/open-bible/compare/0.6.1...0.6.2

## [0.6.1] - 2026-07-12

### Fixed
- Release version 0.6.1 from 0.6.0

[0.6.1]: https://github.com/open-mission/open-bible/compare/0.6.1...0.6.1

## [0.6.0] - 2026-07-12

### Added
- Release version 0.6.0 from 0.5.0

[0.6.0]: https://github.com/open-mission/open-bible/compare/0.6.0...0.6.0

## [0.5.0] - 2026-07-11

### Added
- Release version 0.5.0 from 0.4.5

[0.5.0]: https://github.com/open-mission/open-bible/compare/0.5.0...0.5.0

## [0.4.5] - 2026-07-09

### Added
- Sistema de destaques (highlights) com categorias, anotações e badges inline (#82, #83, #86)
- Seleção de versículos com popover de copiar texto/referência (#76, #77)
- Navegação entre capítulos com setas do teclado e swipe no mobile
- App desktop via Tauri v2 (Windows/Linux/macOS) (#67, #70)
- Configurações de aparência em drawer dedicado (#113)

### Fixed
- Manter seleção de versículo ao rolar o reader (#117)
- Toasts Sonner no canto inferior direito com largura fixa (#116)
- Dropdown de versão nos diálogos mostra apenas versões baixadas (#115)
- Remoção de chamadas órfãs `setVersionMetaCache` (ReferenceError) (#114)
- Correções de build/CI: `libappindicator3-dev`, lockfile pnpm no Vercel, renderer DMA-BUF no Linux (#97, #94, #92, #88)
- Estabilidade do OPFS/SQLite WASM (handles, pool, retries) (#90, #84, #83)

### Changed
- Redução de re-renders desnecessários em providers, reader e verse-row (#78)
- Open-source readiness (#73)

## [0.4.0] - 2026-07-04

### Added
- Release version 0.4.0 from 0.3.5

[0.4.0]: https://github.com/open-mission/open-bible/compare/0.4.0...0.4.0

## [0.3.5] - 2026-07-02

### Fixed
- Corrigido o release desktop (Windows/Linux/macOS) via Tauri v2:
  - **Windows:** build do CI não falha mais na compilação nativa de `better-sqlite3` (`--ignore-scripts` no install, step MSVC removido)
  - **macOS:** progresso do download de versões da Bíblia não ultrapassa mais 100% (headers CORS expostos + clamp defensivo)
  - **Linux:** o AppImage não abre mais com tela branca (assets SQLite WASM agora são copiados antes do static export; error boundaries globais adicionados)
- Gates de runtime no modo Tauri: Service Worker e Vercel Analytics não executam no desktop


## [0.2.2] - 2026-07-01

### Fixed
- Release version 0.2.2 from 0.2.1

[0.2.2]: https://github.com/open-mission/open-bible/compare/0.2.2...0.2.2

## [0.2.0] - 2025-06-13

### Added
- Added automated release script and GitHub Actions workflow for automated versioning and deployment

## [0.2.1] - 2026-06-25

### Added
- Initial version with automated release system

## [0.3.0] - 2026-06-25

### Added
- Release 0.3.0 with updated release script to maintain CHANGELOG.md

## [0.2.2] - 2026-06-25

### Added
- Release 0.2.2 with updated release script to maintain CHANGELOG.md

[0.2.0]: https://github.com/open-mission/open-bible/compare/v0.1.0...v0.2.0
[0.2.1]: https://github.com/open-mission/open-bible/compare/v0.2.0...v0.2.1
[0.2.2]: https://github.com/open-mission/open-bible/compare/v0.2.1...v0.2.2
[0.3.0]: https://github.com/open-mission/open-bible/compare/v0.2.1...v0.3.0
[0.3.5]: https://github.com/open-mission/open-bible/compare/v0.3.0...v0.3.5
[0.4.0]: https://github.com/open-mission/open-bible/compare/v0.3.5...v0.4.0
[0.4.5]: https://github.com/open-mission/open-bible/compare/v0.4.0...v0.4.5
