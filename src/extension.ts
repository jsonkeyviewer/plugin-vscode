import * as vscode from 'vscode';
import { ConfigKeyHoverProvider } from './providers/hoverProvider';
import { ConfigKeyInlayHintProvider } from './providers/inlayHintProvider';
import { BeautifyCodeLensProvider } from './providers/beautifyCodeLensProvider';
import {
    applyGutterDecorations,
    clearGutterDecorations,
    disposeDecorationTypes,
} from './providers/gutterDecorationProvider';
import { isLanguageEnabled } from './settings/settings';

/** Language IDs handled by the extension. */
const SUPPORTED_LANGUAGES = ['json', 'jsonc', 'yaml', 'xml'];

/** Selector that matches all supported languages. */
const LANGUAGE_SELECTOR: vscode.DocumentSelector = SUPPORTED_LANGUAGES.map(language => ({ language }));

export function activate(context: vscode.ExtensionContext): void {
    const { extensionUri } = context;

    context.subscriptions.push(
        vscode.commands.registerCommand('configKeyViewer.formatDocument', async () => {
            await vscode.commands.executeCommand('editor.action.formatDocument');
        }),
    );

    // ── Hover provider (tooltip – equivalent to Ctrl+Q in IntelliJ) ───────
    context.subscriptions.push(
        vscode.languages.registerHoverProvider(
            LANGUAGE_SELECTOR,
            new ConfigKeyHoverProvider(),
        ),
    );

    // ── Inlay hints provider (full-path gutter text mode) ─────────────────
    const inlayProvider = new ConfigKeyInlayHintProvider();
    context.subscriptions.push(
        vscode.languages.registerInlayHintsProvider(
            LANGUAGE_SELECTOR,
            inlayProvider,
        ),
    );

    // ── Clickable beautify action for dense/minified lines ────────────────
    const beautifyCodeLensProvider = new BeautifyCodeLensProvider();
    context.subscriptions.push(
        vscode.languages.registerCodeLensProvider(
            LANGUAGE_SELECTOR,
            beautifyCodeLensProvider,
        ),
    );

    // ── Beautify gutter marker for dense/minified lines ───────────────────
    for (const editor of vscode.window.visibleTextEditors) {
        if (isSupported(editor.document)) {
            applyGutterDecorations(editor, extensionUri);
        }
    }

    context.subscriptions.push(
        vscode.window.onDidChangeActiveTextEditor(editor => {
            if (editor && isSupported(editor.document)) {
                applyGutterDecorations(editor, extensionUri);
            }
        }),
    );

    let debounceTimer: ReturnType<typeof setTimeout> | undefined;
    context.subscriptions.push(
        vscode.workspace.onDidChangeTextDocument(event => {
            if (!isSupported(event.document)) { return; }
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                const editor = vscode.window.visibleTextEditors.find(
                    e => e.document === event.document,
                );
                if (editor) { applyGutterDecorations(editor, extensionUri); }
            }, 300);
        }),
    );

    context.subscriptions.push(
        vscode.workspace.onDidCloseTextDocument(doc => {
            const editor = vscode.window.visibleTextEditors.find(e => e.document === doc);
            if (editor) { clearGutterDecorations(editor, extensionUri); }
        }),
    );

    // Re-apply and refresh inlay hints when settings change.
    context.subscriptions.push(
        vscode.workspace.onDidChangeConfiguration(event => {
            if (!event.affectsConfiguration('configKeyViewer')) { return; }
            inlayProvider.refresh();
            beautifyCodeLensProvider.refresh();
            for (const editor of vscode.window.visibleTextEditors) {
                if (isSupportedLanguage(editor.document.languageId)) {
                    applyGutterDecorations(editor, extensionUri);
                }
            }
        }),
    );
}

export function deactivate(): void {
    disposeDecorationTypes();
}

// ── Helpers ────────────────────────────────────────────────────────────────

function isSupported(document: vscode.TextDocument): boolean {
    return isSupportedLanguage(document.languageId) && isLanguageEnabled(document.languageId);
}

function isSupportedLanguage(languageId: string): boolean {
    return SUPPORTED_LANGUAGES.includes(languageId);
}
