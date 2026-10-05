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
        if (!settings.beautifyHintEnabled || !isLanguageEnabled(document.languageId)) {
            return [];
        }

        const entries = getEntries(document);
        if (!entries || entries.length === 0) { return []; }

        const byLine = new Map<number, Array<{ path: string; offset: number }>>();
        for (const entry of entries) {
            const line = document.positionAt(entry.offset).line;
            const lineEntries = byLine.get(line) ?? [];
            lineEntries.push(entry);
            byLine.set(line, lineEntries);
        }

        const lenses: vscode.CodeLens[] = [];
        for (const [line, lineEntries] of byLine) {
            const count = lineEntries.length;
            if (count <= settings.maxKeysPerLine) { continue; }

            lenses.push(new vscode.CodeLens(
                new vscode.Range(line, 0, line, 0),
                {
                    title: `Click here to format document (${count} config keys on this line)`,
                    tooltip: lineEntries.map(entry => entry.path).join('\n'),
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
