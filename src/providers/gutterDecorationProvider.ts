import * as vscode from 'vscode';
import { getAllJsonKeys } from '../core/jsonKeyPathResolver';
import { getAllYamlKeys } from '../core/yamlKeyPathResolver';
import { getAllXmlKeys  } from '../core/xmlKeyPathResolver';
import { getSettings, isLanguageEnabled } from '../settings/settings';

let beautifyDecorationType: vscode.TextEditorDecorationType | undefined;

function getBeautifyDecoration(extensionUri: vscode.Uri): vscode.TextEditorDecorationType {
    if (!beautifyDecorationType) {
        beautifyDecorationType = vscode.window.createTextEditorDecorationType({
            isWholeLine: true,
            light: {
                gutterIconPath: vscode.Uri.joinPath(extensionUri, 'resources', 'icons', 'beautify.svg'),
                gutterIconSize: 'contain',
            },
            dark: {
                gutterIconPath: vscode.Uri.joinPath(extensionUri, 'resources', 'icons', 'beautify_dark.svg'),
                gutterIconSize: 'contain',
            },
        });
    }
    return beautifyDecorationType;
}

export function applyGutterDecorations(
    editor: vscode.TextEditor,
    extensionUri: vscode.Uri,
): void {
    const settings = getSettings();

    clearGutterDecorations(editor, extensionUri);

    if (!settings.gutterEnabled || !settings.beautifyHintEnabled || !isLanguageEnabled(editor.document.languageId)) {
        return;
    }

    const entries = getEntries(editor.document);
    if (!entries || entries.length === 0) { return; }

    const document = editor.document;
    const byLine = new Map<number, number>();
    for (const entry of entries) {
        const line = document.positionAt(entry.offset).line;
        byLine.set(line, (byLine.get(line) ?? 0) + 1);
    }

    const beautifyDecorations: vscode.DecorationOptions[] = [];
    for (const [line, count] of byLine) {
        if (count <= settings.maxKeysPerLine) { continue; }

        const message = new vscode.MarkdownString(
            `⚠ This line contains **${count}** config keys.\n\n` +
            `Click the text above this line to format the document and see each key path individually.`,
        );
        message.isTrusted = true;

        beautifyDecorations.push({
            range: getHoverRange(document, line),
            hoverMessage: message,
        });
    }

    editor.setDecorations(getBeautifyDecoration(extensionUri), beautifyDecorations);
}

export function clearGutterDecorations(
    editor: vscode.TextEditor,
    extensionUri: vscode.Uri,
): void {
    editor.setDecorations(getBeautifyDecoration(extensionUri), []);
}

export function disposeDecorationTypes(): void {
    beautifyDecorationType?.dispose();
    beautifyDecorationType = undefined;
}

function getEntries(document: vscode.TextDocument) {
    const text = document.getText();
    const lang = document.languageId;
    if (lang === 'json' || lang === 'jsonc') { return getAllJsonKeys(text); }
    if (lang === 'yaml') { return getAllYamlKeys(text); }
    if (lang === 'xml')  { return getAllXmlKeys(text);  }
    return null;
}

function getHoverRange(document: vscode.TextDocument, line: number): vscode.Range {
    const textLine = document.lineAt(line);
    const firstColumn = textLine.firstNonWhitespaceCharacterIndex;
    const endColumn = textLine.range.end.character;

    if (endColumn > firstColumn) {
        return new vscode.Range(line, firstColumn, line, endColumn);
    }

    return textLine.range;
}
