import * as vscode from 'vscode';
import { getAllJsonKeys } from '../core/jsonKeyPathResolver';
import { getAllYamlKeys } from '../core/yamlKeyPathResolver';
import { getAllXmlKeys  } from '../core/xmlKeyPathResolver';
import { getSettings, isLanguageEnabled } from '../settings/settings';

/**
 * VSCode InlayHintsProvider for optional inline key paths.
 *
 * Shows the full dot-notation key path as an inline annotation at the end
 * of each key line, e.g.:
 *
 *   "host": "localhost"   ← server.database.host (string)
 */
export class ConfigKeyInlayHintProvider implements vscode.InlayHintsProvider {

    // Fired when settings change so VSCode can request a refresh.
    readonly onDidChangeInlayHints: vscode.Event<void>;
    private readonly emitter = new vscode.EventEmitter<void>();

    constructor() {
        this.onDidChangeInlayHints = this.emitter.event;
    }

    /** Call this when the relevant settings change. */
    refresh(): void {
        this.emitter.fire();
    }

    provideInlayHints(
        document: vscode.TextDocument,
        _range: vscode.Range,
    ): vscode.ProviderResult<vscode.InlayHint[]> {
        const settings = getSettings();
        if (!settings.inlinePathEnabled || !isLanguageEnabled(document.languageId)) {
            return [];
        }

        const entries = this.getEntries(document);
        if (!entries) { return []; }

        const hints: vscode.InlayHint[] = [];

        // Detect dense lines for the beautify-hint behaviour.
        const lineKeyCounts = countKeysPerLine(entries, document);

        for (const { path, offset } of entries) {
            const pos  = document.positionAt(offset);
            const line = pos.line;

            const count = lineKeyCounts.get(line) ?? 1;
            if (count > settings.maxKeysPerLine) { continue; }

            const hint = new vscode.InlayHint(
                document.lineAt(line).range.end,
                ` ← ${path}`,
                vscode.InlayHintKind.Type,
            );
            hint.tooltip = `Config key: ${path}`;
            hints.push(hint);
        }

        return hints;
    }

    // ── Internal ───────────────────────────────────────────────────────────

    private getEntries(document: vscode.TextDocument) {
        const text = document.getText();
        const lang = document.languageId;
        if (lang === 'json' || lang === 'jsonc') { return getAllJsonKeys(text); }
        if (lang === 'yaml') { return getAllYamlKeys(text); }
        if (lang === 'xml')  { return getAllXmlKeys(text);  }
        return null;
    }
}

// ── Utilities ──────────────────────────────────────────────────────────────

function countKeysPerLine(
    entries: Array<{ offset: number }>,
    document: vscode.TextDocument,
): Map<number, number> {
    const map = new Map<number, number>();
    for (const e of entries) {
        const line = document.positionAt(e.offset).line;
        map.set(line, (map.get(line) ?? 0) + 1);
    }
    return map;
}


