# JSON YAML XML Key Viewer

Display the full dot-notation path of configuration keys directly in VS Code.
The extension supports JSON, JSONC, YAML, and XML without requiring a language server
or external service.

---

## Features

| Feature | Description |
|---|---|
| **Hover tooltip** | Hover over any key to see its full path, e.g. `server.database.host (string)` |
| **Key gutter icon** | Normal key lines show `...`; hover it to see the full path or every path found on that line. |
| **Inline path** | Optionally show the full path as an Inlay Hint at the end of each key line. |
| **Dense-line helper** | Replace `...` with a cross on dense lines and add a clickable document-format CodeLens. |
| **Array support** | Array indices are included automatically, e.g. `servers[0].host` |
| **Dot-key escaping** | Keys that contain a literal dot are quoted, e.g. `"my.key".child` |
| **XML sibling support** | Repeated sibling tags receive indices, and self-closing elements are addressable. |
| **Formats** | JSON ✅ · JSONC ✅ · YAML ✅ · XML ✅ |

---

## Install

### VS Code Marketplace

Open the Extensions view in VS Code and search for **JSON YAML XML Key Viewer**.

### From a VSIX

Open `Extensions → … → Install from VSIX…` and select the packaged extension.

## Usage

Open a JSON, JSONC, YAML, or XML document, then hover a key to see its complete path.
Enable inline paths from `Settings → Extensions → Config Key Viewer` when you want paths
to remain visible in the editor.

When a line contains more keys than the configured threshold, the extension replaces
`...` with a cross and displays a **Format document** CodeLens above it. Hovering the
cross also exposes the format action. Full paths remain available by hovering individual
keys and from the CodeLens tooltip. The action delegates formatting to the formatter
currently configured in VS Code.

## Configuration

| Option | Default | Description |
|---|---:|---|
| `configKeyViewer.enabledLanguages` | JSON, JSONC, YAML, XML | Languages where the extension is enabled |
| `configKeyViewer.tooltipEnabled` | `true` | Show the full path in a hover tooltip |
| `configKeyViewer.showValueType` | `true` | Append the detected value type to the tooltip |
| `configKeyViewer.gutterEnabled` | `true` | Show `...` on normal key lines and allow the dense-line cross |
| `configKeyViewer.inlinePathEnabled` | `false` | Show the full path as an Inlay Hint at the end of each key line |
| `configKeyViewer.beautifyHintEnabled` | `true` | Show the dense-line cross and clickable format CodeLens |
| `configKeyViewer.maxKeysPerLine` | `3` | Number of keys allowed on one line before showing the format helper |

Dense lines never show `...` or inline path hints. If beautify hints are disabled, they
show no gutter icon or CodeLens. Disabling gutter icons alone hides the cross but keeps
the CodeLens available.

## Command

`Config Key Viewer: Format Document` runs the standard VS Code document-format command.
A formatter must be available for the active language.

## Development

```bash
npm install
npm run compile
```

Press `F5` in VS Code to open the Extension Development Host.

Create the production VSIX with:

```bash
npm run package
```

## Project structure

```
src/
  extension.ts                        ← activation entry point
  core/
    jsonKeyPathResolver.ts            ← jsonc-parser based resolver + key enumerator
    yamlKeyPathResolver.ts            ← yaml AST based resolver + key enumerator
    xmlKeyPathResolver.ts             ← text/regex based XML resolver + key enumerator
  providers/
    hoverProvider.ts                  ← Hover tooltip
    inlayHintProvider.ts              ← Optional inline path annotations
    gutterDecorationProvider.ts       ← Per-key gutter icons and path tooltips
    beautifyCodeLensProvider.ts       ← Clickable document-format action
  settings/
    settings.ts                       ← VSCode settings wrapper
resources/
  icons/
    configKey.svg                     ← key-path icon for light themes
    configKey_dark.svg                ← key-path icon for dark themes
    beautify.svg                      ← format marker for light themes
    beautify_dark.svg                 ← format marker for dark themes
```

## Release notes

See [CHANGELOG.md](CHANGELOG.md).

## Links

- [Source code](https://github.com/jsonkeyviewer/plugin-vscode)
- [Report an issue](https://github.com/jsonkeyviewer/plugin-vscode/issues)
- [Documentation First](https://documentationfirst.ai)

## License

[MIT](LICENSE) © 2026 Documentation First

