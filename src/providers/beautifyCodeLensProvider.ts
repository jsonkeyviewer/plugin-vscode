import * as vscode from 'vscode';
import { getAllJsonKeys } from '../core/jsonKeyPathResolver';
import { getAllYamlKeys } from '../core/yamlKeyPathResolver';
import { getAllXmlKeys  } from '../core/xmlKeyPathResolver';
import { getSettings, isLanguageEnabled } from '../settings/settings';

export class BeautifyCodeLensProvider implements vscode.CodeLensProvider {
    readonly onDidChangeCodeLenses: vscode.Event<void>;
    private readonly emitter = new vscode.EventEmitter<void>();

    constructor() {
        this.onDidChangeCodeLenses = this.emitter.event;
    }

    refresh(): void {
        this.emitter.fire();
    }

    provideCodeLenses(document: vscode.TextDocument): vscode.ProviderResult<vscode.CodeLens[]> {
        const settings = getSettings();
        if (!settings.gutterEnabled || !settings.beautifyHintEnabled || !isLanguageEnabled(document.languageId)) {
            return [];
        }

        const entries = getEntries(document);
        if (!entries || entries.length === 0) { return []; }

        const byLine = new Map<number, number>();
        for (const entry of entries) {
            const line = document.positionAt(entry.offset).line;
            byLine.set(line, (byLine.get(line) ?? 0) + 1);
        }

        const lenses: vscode.CodeLens[] = [];
        for (const [line, count] of byLine) {
            if (count <= settings.maxKeysPerLine) { continue; }

            lenses.push(new vscode.CodeLens(
                new vscode.Range(line, 0, line, 0),
                {
                    title: `Click here to format document (${count} config keys on this line)`,
                    command: 'configKeyViewer.formatDocument',
                },
            ));
        }

        return lenses;
    }
}

function getEntries(document: vscode.TextDocument) {
    const text = document.getText();
    const lang = document.languageId;
    if (lang === 'json' || lang === 'jsonc') { return getAllJsonKeys(text); }
    if (lang === 'yaml') { return getAllYamlKeys(text); }
    if (lang === 'xml')  { return getAllXmlKeys(text);  }
    return null;
}
