# Spec — VS Code Marketplace Publication

*Created: 2026-10-05*

## Objective

Prepare Config Key Viewer 1.0.0 as a clean, installable VSIX under the existing
`DocumentationFirst` publisher. Publishing and authentication are outside this task.

## Public identity

- Extension ID: `DocumentationFirst.config-key-viewer`
- Display name: `JSON YAML XML Key Viewer`
- Author: `Documentation First <contact@documentationfirst.ai>`
- License: MIT, Copyright 2026 Documentation First
- Supported host: VS Code Desktop 1.85.0 or newer

## Configuration changes

- Keep `configKeyViewer.gutterEnabled` as the default-enabled switch for gutter icons.
- Replace `configKeyViewer.showFullPathInGutter` with
  `configKeyViewer.inlinePathEnabled`.
- Keep gutter icons, inline paths, and the dense-line beautify CodeLens independently
  configurable.
- Normal lines use the `...` key icon. Dense lines never use that icon: they use the
  beautify cross only when gutter and beautify are both enabled.
- The CodeLens depends only on the beautify setting and remains available when gutter
  icons are disabled.
- Dense lines never render inline path hints; their paths remain available through key
  hover and the CodeLens tooltip.
- Do not provide aliases for the old names because no Marketplace version has been
  released yet.

## Marketplace package

- Add complete public metadata, a PNG icon, MIT license, changelog, and repository links.
- Keep the webpack production bundle and runtime resources in the VSIX.
- Exclude source, tests, IDE configuration, agent context, dependencies, source maps,
  and generated VSIX files through `.vscodeignore`.
- Make `@vscode/vsce` a local development dependency and package through the existing
  `npm run package` script.

## Acceptance

- `vsce` produces `config-key-viewer-1.0.0.vsix` without blocking warnings.
- The VSIX contains `dist/extension.js`, Marketplace documents, and runtime icons only.
- A manual Extension Development Host or installed-VSIX pass confirms hover, value type,
  inline paths, language selection, and dense-line formatting for JSON, JSONC, YAML,
  and XML.
- No automated test work is required for this task.
