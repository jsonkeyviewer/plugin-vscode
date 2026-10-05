import * as vscode from 'vscode';
import { getAllJsonKeys } from '../core/jsonKeyPathResolver';
import { getAllYamlKeys } from '../core/yamlKeyPathResolver';
import { getAllXmlKeys  } from '../core/xmlKeyPathResolver';
import { getSettings, isLanguageEnabled } from '../settings/settings';

let keyDecorationType: vscode.TextEditorDecorationType | undefined;
let beautifyDecorationType: vscode.TextEditorDecorationType | undefined;

function getKeyDecoration(extensionUri: vscode.Uri): vscode.TextEditorDecorationType {
    if (!keyDecorationType) {
        keyDecorationType = vscode.window.createTextEditorDecorationType({
            light: {
                gutterIconPath: vscode.Uri.joinPath(extensionUri, 'resources', 'icons', 'configKey.svg'),
                gutterIconSize: 'contain',
            },
            dark: {
                gutterIconPath: vscode.Uri.joinPath(extensionUri, 'resources', 'icons', 'configKey_dark.svg'),
                gutterIconSize: 'contain',
            },
        });
    }
    return keyDecorationType;
}

function getBeautifyDecoration(extensionUri: vscode.Uri): vscode.TextEditorDecorationType {
    if (!beautifyDecorationType) {
        beautifyDecorationType = vscode.window.createTextEditorDecorationType({
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

    if (!settings.gutterEnabled || !isLanguageEnabled(editor.document.languageId)) {
        return;
    }

    const entries = getEntries(editor.document);
    if (!entries || entries.length === 0) { return; }

    const document = editor.document;
    const byLine = new Map<number, Array<{ path: string; offset: number }>>();
    for (const entry of entries) {
        const line = document.positionAt(entry.offset).line;
        const lineEntries = byLine.get(line) ?? [];
        lineEntries.push(entry);
        byLine.set(line, lineEntries);
    }

    const keyDecorations: vscode.DecorationOptions[] = [];
    const beautifyDecorations: vscode.DecorationOptions[] = [];
    for (const [line, lineEntries] of byLine) {
        const isDense = lineEntries.length > settings.maxKeysPerLine;
        if (isDense) {
            if (settings.beautifyHintEnabled) {
                beautifyDecorations.push({
                    range: getHoverRange(document, line),
                    hoverMessage: createBeautifyTooltip(lineEntries.length),
                });
            }
            continue;
        }

        keyDecorations.push({
            range: getHoverRange(document, line),
            hoverMessage: createPathTooltip(lineEntries.map(entry => entry.path)),
        });
    }

    editor.setDecorations(getKeyDecoration(extensionUri), keyDecorations);
    editor.setDecorations(getBeautifyDecoration(extensionUri), beautifyDecorations);
}

export function clearGutterDecorations(
    editor: vscode.TextEditor,
    extensionUri: vscode.Uri,
): void {
    editor.setDecorations(getKeyDecoration(extensionUri), []);
    editor.setDecorations(getBeautifyDecoration(extensionUri), []);
}

export function disposeDecorationTypes(): void {
    keyDecorationType?.dispose();
    keyDecorationType = undefined;
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

function createPathTooltip(paths: string[]): vscode.MarkdownString {
    const message = new vscode.MarkdownString();

    if (paths.length === 1) {
        message.appendMarkdown('**Config key**\n\n');
        message.appendText(paths[0]);
        return message;
    }

    message.appendMarkdown(`**Config keys (${paths.length})**\n\n`);
    for (const path of paths) {
        message.appendMarkdown('- ');
        message.appendText(path);
        message.appendMarkdown('\n');
    }
    return message;
}

function createBeautifyTooltip(keyCount: number): vscode.MarkdownString {
    const message = new vscode.MarkdownString();
    message.appendMarkdown(`**${keyCount} config keys on this line**\n\n`);
    message.appendMarkdown('[Format document](command:configKeyViewer.formatDocument)');
    message.isTrusted = true;
    return message;
}
