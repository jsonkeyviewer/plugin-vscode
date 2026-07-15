// Manual functional tests for the gutter beautify (dense-line) feature.
// Open each file below in the Extension Development Host (F5) to verify the expected behaviour.
//
// ── JSON ──────────────────────────────────────────────────────────────────
// src/test/resources/gutter/pretty.json
//   Expected: 3 key icons (one per line: server, host, port)
//
// src/test/resources/gutter/minified.json
//   Expected: 1 beautify icon on line 1 (6 keys on a single line > threshold 3)
//
// src/test/resources/gutter/inline.json
//   Expected: 1 beautify icon on line 1 (many keys on a single line > threshold 3)
//
// ── YAML ──────────────────────────────────────────────────────────────────
// src/test/resources/gutter/pretty.yaml
//   Expected: 3 key icons (server, host, port on separate lines)
//
// src/test/resources/gutter/flow.yaml   (root: {alpha: 1, beta: 2, gamma: 3, delta: 4})
//   Expected: 1 beautify icon on line 1 (5 keys on a single line > threshold 3)
//
// ── XML ───────────────────────────────────────────────────────────────────
// src/test/resources/gutter/pretty.xml
//   Expected: 3 key icons (server, host, port on separate lines)
//
// src/test/resources/gutter/inline.xml   (<root><a/><b/><c/><d/></root>)
//   Expected: 1 beautify icon on line 1 (5 tags on a single line > threshold 3)


