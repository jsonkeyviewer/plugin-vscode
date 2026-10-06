# Done — Mutually exclusive line tooltips

*Implemented: 2026-10-06*

## Summary

Normal `...` lines now use only the existing `complete key name` hover, including
the full path and optional value type. Dense `x` lines expose only the existing
formatting tooltip with its clickable `Format document` link.

## Problems, causes, and corrections

- **Normal-line duplicate:** the normal gutter decoration attached `Config key / Config keys`
  to the line text while the HoverProvider also supplied the complete path.
  Removed only that decoration's `hoverMessage` and its obsolete builder.
- **Dense-line duplicate:** the HoverProvider supplied a key path alongside the
  formatting decoration's tooltip. Added `hasBeautifyTooltipAt(document, line)`
  and used it to suppress the key hover only when the formatting decoration is
  enabled for the hovered line. Both detection paths share the strict density
  predicate `keyCount > maxKeysPerLine` and existing key enumeration.
- When gutter or beautify hints are disabled, key hover remains governed by
  `tooltipEnabled`. The existing formatting tooltip remains independent from
  `tooltipEnabled`, as before.

Modified production files:

- `src/providers/gutterDecorationProvider.ts`
- `src/providers/hoverProvider.ts`

HoverProvider registration, gutter icons and ranges, CodeLens, inline hints,
formatting command, parsers, and settings were preserved. No icon click behaviour
was added. The pre-existing untracked `src/providers/keyPathTooltip.ts` was left
untouched and is not used by this correction.

This report supersedes older statements implying hover/click support on the gutter
icons themselves: this correction concerns tooltips over the document text.

## Verification

- IntelliJ error inspections: no errors in either modified TypeScript file.
- IDE build request for the modified files: successful, no reported problems.
- Static review: no `Config key / Config keys` tooltip builder remains in source;
  the complete-path tooltip and formatting tooltip contents are preserved.
- No automated tests were added or run, per the agreed functional acceptance.
- The IDE build result does not establish that webpack regenerated
  `dist/extension.js` or that Extension Development Host behaviour was tested.

## Remaining functional acceptance

The project contract prohibits terminal execution by the agent. The developer runs
`npm run compile` and restarts the Extension Development Host before testing:

1. JSON, JSONC, YAML, XML normal lines: only complete key name with optional type.
2. Several keys below or at the threshold: hover resolves the selected key.
3. Above the threshold with an active cross: formatting tooltip only, including
   when hovering a key; `Format document` executes the existing formatter.
4. Changing gutter/beautify options restores key hover when the cross is absent.
5. Icons, CodeLens, and inline hints retain their existing behaviour.

VS Code's native hovers and other extensions' hovers are outside this correction.
