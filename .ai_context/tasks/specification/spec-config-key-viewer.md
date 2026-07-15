# Spec — Config Key Viewer

*Created: 2026-07-07*

---

## Objective

- Display the full dot-notation path of a configuration key when the cursor hovers over or is positioned on a key in JSON, YAML, and other structured config files.
- Support both **Tooltip on hover** and **gutter annotations** (left margin) to show the full path.
- Designed to be extensible to other config formats (TOML, INI, XML, etc.) in the future.

---

## Expected behaviour

### 1. Tooltip on hover / caret positioning
- When the user places the caret on (or hovers over) a key in a JSON or YAML file, a tooltip appears showing:
  - The **full dot-notation path** from root to the current key (e.g., `server.database.host`)
  - The **value type** (string, number, boolean, object, array) — optional, shown in parentheses
  - Example: `server.database.host (string)`
- The tooltip does **not** appear on values, only on keys.
- The tooltip disappears when the caret moves away or the mouse leaves the key area.

### 2. Gutter annotation
- Every line containing a key in a JSON or YAML file gets a gutter icon/annotation.
- Hovering over the gutter annotation shows the full dot-notation path for that key.
- The gutter annotation is a small neutral icon (e.g., a key icon or a dot icon).
- Optionally, the short path segment or full path can be rendered as inline text in the gutter.

### 3. Dot notation rules
- Keys are joined with `.` (dot).
- Array indices are represented as `[n]` (e.g., `servers[0].host`).
- No trailing dot; root-level keys have no prefix.
- Keys containing dots are escaped with quotes if needed (e.g., `"my.key".child`).

### 4. Supported formats (MVP)
| Format | Library / API | Status |
|---|---|---|
| JSON | IntelliJ PSI (`JsonProperty`, `JsonObject`) | ✅ MVP |
| YAML | IntelliJ PSI (`YAMLKeyValue`, `YAMLMapping`) | ✅ MVP |
| TOML | IntelliJ PSI (TOML plugin) | 🔜 Future |
| XML | IntelliJ PSI (`XmlTag`) | 🔜 Future |

### 5. Performance
- Path is **computed on demand** (caret event / mouse event).
- Result is **cached per PsiElement** and invalidated on document change.
- Max acceptable latency: **< 150 ms** from caret placement to tooltip display.
- No redundant recalculations during rapid typing.

### 6. Settings / Preferences (UI)
- Enable/disable tooltip (default: enabled)
- Enable/disable gutter annotations (default: enabled)
- Show value type in tooltip (default: enabled)
- Show full path text inline in gutter vs. icon only (default: icon only)

---

> 💡 **Next step**: validate this spec, then ask the AI agent to start **Phase 1 — Project skeleton**.
