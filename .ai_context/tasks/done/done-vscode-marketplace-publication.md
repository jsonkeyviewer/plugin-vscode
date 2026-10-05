# Done — VS Code Marketplace Preparation

*Updated: 2026-10-05*

## Summary

Config Key Viewer 1.0.0 is prepared for packaging under the existing
`DocumentationFirst` publisher. The public manifest, settings, documentation, legal
files, and VSIX exclusions now match the implemented VS Code extension.

## Changes

| Problem | Solution |
|---|---|
| The manifest still used the provisional publisher and incomplete metadata | Set the publisher to `DocumentationFirst`, added the Documentation First author, MIT license, GitHub links, free pricing, gallery banner, and Marketplace PNG path |
| The old inline setting name described gutter text | Replaced it with `configKeyViewer.inlinePathEnabled`; retained `configKeyViewer.gutterEnabled` for the core per-key gutter icons |
| The README documented obsolete gutter icons and omitted recent behaviour | Rewrote features, usage, settings, format command, installation, project structure, links, and release information |
| Release and legal documents were missing | Added root-level `LICENSE` and `CHANGELOG.md` |
| Dense-line controls had lost their intended separation | Normal lines use `...`; dense lines use the cross plus CodeLens when beautify is enabled, never render `...` or inline hints, and keep CodeLens independent from gutter visibility |
| Development files would be included in the VSIX | Added `.vscodeignore` for sources, tests, IDE files, agent context, dependencies, source maps, generated packages, and the SVG logo source |
| No Marketplace logo source was available locally | Added the official IntelliJ logo as `resources/icons/icon.svg`; it is the source for the required square PNG |
| Packaging depended on a globally installed executable | Declared `@vscode/vsce` 4.x as a development dependency |

## Remaining verification

The official logo has been rendered to `resources/icons/icon.png`, and
`@vscode/vsce` is installed with the lockfile updated. The repository contract forbids
the agent from executing terminal commands, so the developer must complete the final
packaging verification:

1. Run `npm run package` to create `config-key-viewer-1.0.0.vsix`.
2. Inspect and install the VSIX, then complete the functional acceptance pass.

No automated tests are required for this release preparation.
