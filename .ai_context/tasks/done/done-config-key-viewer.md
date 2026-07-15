# Done — Config Key Viewer for VS Code

*Updated: 2026-10-05*

---

## Summary

The VS Code extension implementation is functionally complete for the current scope.
It resolves and displays dot-notation key paths for JSON, JSONC, YAML, and XML through
hover tooltips and optional inline hints. Dense or minified lines expose a beautify
marker and a clickable format action.

The implementation has been reviewed statically. Automated tests are not part of the
acceptance process for this iteration; final validation is performed functionally in
the VS Code Extension Development Host.

---

## Current implementation

| Area | Current behaviour | Main files |
|---|---|---|
| Path resolution | Resolves nested keys, array indices, quoted dot-containing keys, and repeated XML siblings | `src/core/*KeyPathResolver.ts` |
| Supported formats | JSON, JSONC, YAML, and XML, configurable through `configKeyViewer.enabledLanguages` | `package.json`, `src/settings/settings.ts` |
| Hover | Shows the full key path and, when enabled, the detected value type | `src/providers/hoverProvider.ts` |
| Inline path | Shows the full path as an Inlay Hint at the end of key lines | `src/providers/inlayHintProvider.ts` |
| Dense-line handling | Detects lines containing more than the configured number of keys and shows a beautify gutter marker | `src/providers/gutterDecorationProvider.ts` |
| Format action | Exposes a CodeLens backed by `configKeyViewer.formatDocument` | `src/providers/beautifyCodeLensProvider.ts`, `src/extension.ts` |
| Development setup | Provides VS Code launch and build tasks for the Extension Development Host | `.vscode/launch.json`, `.vscode/tasks.json` |

Self-closing XML elements are included as addressable configuration keys. Provider
refresh and decoration updates react to document and configuration changes.

---

## Current contradictions

The implementation and its public documentation are not fully aligned yet:

- This DONE previously described the IntelliJ/Kotlin implementation, including Gradle,
  PSI APIs, and IntelliJ Marketplace work. That content did not describe this repository.
- `README.md` says that a key icon appears in the gutter on every key line. The current
  implementation uses the gutter for the dense-line beautify marker instead.
- `configKeyViewer.showFullPathInGutter` is a historical setting name. The path is
  rendered as an Inlay Hint at the end of the line, not as gutter text.
- `configKeyViewer.gutterEnabled` also has a broader historical name than its current
  editor-annotation and beautify-marker behaviour.
- `configKeyViewer.enabledLanguages`, the clickable formatting CodeLens, and support for
  self-closing XML keys are absent from the README feature/configuration description.
- The README project tree omits `beautifyCodeLensProvider.ts` and names `key.svg`, while
  the actual gutter assets use the `configKey*.svg` and `beautify*.svg` names.
- The current implementation changes are still uncommitted, so the repository's initial
  commit does not represent the working-tree behaviour documented here.

These are documentation, naming, and delivery inconsistencies. They do not identify a
known functional blocker in the implemented editor behaviour.

---

## Remaining work — VS Code Marketplace

Marketplace readiness is now the main remaining work:

- Confirm that the `jsonkeyviewer` publisher exists and is controlled by the project.
- Finalize public manifest metadata: license, repository, homepage, issue tracker,
  category, and optional gallery banner.
- Decide whether to remove the npm-oriented `private: true` field before publication.
- Add a Marketplace icon as a PNG of at least 128×128 pixels.
- Add root-level `LICENSE` and `CHANGELOG.md` files.
- Rewrite the README so its feature descriptions, settings, screenshots, installation
  instructions, and project structure match the current VS Code behaviour.
- Add `@vscode/vsce` as a development dependency so `npm run package` does not depend on
  a globally installed executable.
- Generate the VSIX, inspect its packaged contents, install it locally, and complete the
  functional acceptance pass before publishing.

No automated test work is required for this iteration.

