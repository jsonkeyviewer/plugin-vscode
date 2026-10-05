import * as vscode from 'vscode';

/** Mirror of IntelliJ ConfigKeyViewerSettings – read from VSCode workspace configuration. */
export interface ConfigKeyViewerSettings {
    enabledLanguages: string[];
    tooltipEnabled: boolean;
    showValueType: boolean;
    gutterEnabled: boolean;
    inlinePathEnabled: boolean;
    beautifyHintEnabled: boolean;
    maxKeysPerLine: number;
}

export function getSettings(): ConfigKeyViewerSettings {
    const cfg = vscode.workspace.getConfiguration('configKeyViewer');
    return {
        enabledLanguages:     cfg.get<string[]>('enabledLanguages',    ['json', 'jsonc', 'yaml', 'xml']),
        tooltipEnabled:       cfg.get<boolean>('tooltipEnabled',      true),
        showValueType:        cfg.get<boolean>('showValueType',        true),
        gutterEnabled:        cfg.get<boolean>('gutterEnabled',        true),
        inlinePathEnabled:    cfg.get<boolean>('inlinePathEnabled',    false),
        beautifyHintEnabled:  cfg.get<boolean>('beautifyHintEnabled',  true),
        maxKeysPerLine:       cfg.get<number> ('maxKeysPerLine',       3),
    };
}

export function isLanguageEnabled(languageId: string): boolean {
    return getSettings().enabledLanguages.includes(languageId);
}

