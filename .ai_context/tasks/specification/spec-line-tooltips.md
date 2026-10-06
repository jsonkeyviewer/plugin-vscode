# Spec — Mutually exclusive line tooltips

*Approved in conversation: 2026-10-06*

## Context

Normal gutter decorations attach a `Config key / Config keys` tooltip to the text
of the line, while `ConfigKeyHoverProvider` also supplies `complete key name`.
Dense lines attach the formatting tooltip and currently also receive the key hover.

## Expected behaviour

- On a normal line with `...`, hovering a key shows only the existing
  `Complete key name` content: full path and optional value type.
- On a dense line with `x`, hovering the decorated text shows only the existing
  formatting tooltip and its clickable `Format document` link.
- Suppress the key hover only when the formatting decoration is enabled for that
  line: supported enabled language, gutter enabled, beautify hint enabled, and key
  count strictly greater than `maxKeysPerLine`.
- If the formatting decoration is absent, key hover follows `tooltipEnabled`.
- Keep the HoverProvider registered, and preserve icons, ranges, CodeLens, inline
  hints, formatting command, settings, and existing path resolvers.
- No icon click handler or popup on the icon itself is part of this correction.

## Implementation

1. Remove only the normal key decoration's `hoverMessage` and obsolete tooltip
   builder from `gutterDecorationProvider.ts`.
2. Add `hasBeautifyTooltipAt(document, line)`, using the same density rule and key
   enumeration as the gutter provider.
3. Have `ConfigKeyHoverProvider` return `null` only when this helper confirms the
   formatting tooltip on the hovered line; preserve its existing key content.

## Validation

Inspect TypeScript errors and request the IDE build. The developer runs the webpack
compile and functional acceptance in the Extension Development Host; no automated
tests are requested. Check JSON, JSONC, YAML, XML, several keys on a normal line,
the exact density boundary, the formatting link, settings changes, and preservation
of icons and CodeLens. Other extensions' and VS Code's own hovers are outside scope.
