# JSON YAML XML Key Viewer — VSCode Extension

> VSCode extension – displays the full dot-notation path of any configuration key in JSON, YAML and XML files.
> Adapted from the [IntelliJ plugin](../IntellijConfigKeyViewer) of the same project.

---

## Features

| Feature | Description |
|---|---|
| **Hover tooltip** | Hover over any key to see its full path, e.g. `server.database.host (string)` |
| **Gutter icon** | A key icon appears in the left margin on every key line. Hover it to see the path. |
| **Inline path** | Optionally show the full path as an inline annotation at the end of each key line. |
| **Array support** | Array indices are included automatically, e.g. `servers[0].host` |
| **Dot-key escaping** | Keys that contain a literal dot are quoted, e.g. `"my.key".child` |
| **Formats** | JSON ✅ · JSONC ✅ · YAML ✅ · XML ✅ |

---

## Installation

### From VSIX (local build)

```bash
npm install
npm run package   # requires @vscode/vsce: npm i -g @vscode/vsce
```

Install the generated `.vsix` via `Extensions → … → Install from VSIX…`.

### Development

```bash
npm install
npm run compile   # or: npm run watch
# then press F5 in VSCode to open the Extension Development Host
```

---

## Configuration

`Settings → Extensions → Config Key Viewer`

| Option | Default | Description |
|---|---|---|
| `configKeyViewer.tooltipEnabled` | `true` | Show path in hover tooltip |
| `configKeyViewer.showValueType` | `true` | Append the type (string, object, array…) |
| `configKeyViewer.gutterEnabled` | `true` | Show key icon in the gutter |
| `configKeyViewer.showFullPathInGutter` | `false` | Show full path as inline annotation instead of icon |
| `configKeyViewer.beautifyHintEnabled` | `true` | Collapse to reformat hint on dense lines |
| `configKeyViewer.maxKeysPerLine` | `3` | Max keys per line before showing the reformat hint |

---

## Project structure

```
src/
  extension.ts                        ← activation entry point
  core/
    jsonKeyPathResolver.ts            ← jsonc-parser based resolver + key enumerator
    yamlKeyPathResolver.ts            ← yaml AST based resolver + key enumerator
    xmlKeyPathResolver.ts             ← text/regex based XML resolver + key enumerator
  providers/
    hoverProvider.ts                  ← Hover tooltip (equivalent to IntelliJ Quick Doc)
    inlayHintProvider.ts              ← Inline path annotations (showFullPathInGutter)
    gutterDecorationProvider.ts       ← Gutter icon decorations
  settings/
    settings.ts                       ← VSCode settings wrapper
resources/
  icons/
    key.svg                           ← key gutter icon
    beautify.svg                      ← dense-line reformat hint icon
```

---

## Changelog

### 1.0.0 — 2026-07-07
- Initial release – adapted from the IntelliJ plugin
- JSON, JSONC, YAML and XML support (hover tooltip + gutter annotations)
- Array index support (`servers[0].host`)
- Inline-path mode (InlayHints) and gutter icon mode
- Dense-line beautify hint
- Configurable via VSCode settings

